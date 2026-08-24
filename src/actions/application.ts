"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User, Project, Application, TeamMember, Notification, type IProject, type IUser } from "@/lib/models";
import { revalidatePath } from "next/cache";

export async function respondToApplication(applicationId: string, status: "ACCEPTED" | "REJECTED") {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  await connectDB();

  const app = await Application.findById(applicationId)
    .populate<{ projectId: IProject }>("projectId")
    .populate<{ userId: IUser }>("userId");
  if (!app) return { error: "Application not found" };

  const owner = await User.findOne({ email: session?.user?.email });
  if (!owner || app.projectId.ownerId.toString() !== owner._id.toString()) {
    return { error: "Not authorized" };
  }
  if (app.status !== "PENDING") return { error: "Application already processed" };

  app.status = status;
  await app.save();

  if (status === "ACCEPTED") {
    const existingMember = await TeamMember.findOne({
      userId: app.userId._id,
      projectId: app.projectId._id,
    });
    if (!existingMember) {
      await TeamMember.create({
        userId: app.userId._id,
        projectId: app.projectId._id,
        role: "member",
      });
    }
    const teamCount = await TeamMember.countDocuments({ projectId: app.projectId._id });
    if (teamCount >= app.projectId.teamSizeMax) {
      await Project.findByIdAndUpdate(app.projectId._id, { status: "FULL" });
    }

    const { awardPoints, ACTION_POINTS } = await import("@/lib/gamification");
    await awardPoints(app.userId._id.toString(), ACTION_POINTS.APPLICATION_ACCEPTED);
  }

  await Notification.create({
    userId: app.userId._id,
    type: `application_${status.toLowerCase()}`,
    message: `Your application to "${app.projectId.title}" was ${status.toLowerCase()}`,
    link: `/projects/${app.projectId._id}`,
  });

  revalidatePath(`/projects/${app.projectId._id}`);
  return { success: true };
}

export async function sendApplicationMessage(applicationId: string, content: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };
  if (!content?.trim()) return { error: "Message cannot be empty" };

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return { error: "User not found" };

  const app = await Application.findById(applicationId).populate<{ projectId: IProject }>("projectId");
  if (!app) return { error: "Application not found" };

  const isOwner = app.projectId.ownerId.toString() === user._id.toString();
  const isApplicant = app.userId.toString() === user._id.toString();

  if (!isOwner && !isApplicant) {
    return { error: "Not authorized to message on this application" };
  }

  app.messages.push({
    senderId: user._id,
    content: content.trim(),
    createdAt: new Date(),
  });

  await app.save();
  revalidatePath(`/projects/${app.projectId._id}`);
  return { success: true };
}

export async function sendCollaborationInvite(
  projectId: string,
  targetUserId: string,
  message: string,
  roleRequested?: string
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  await connectDB();
  const owner = await User.findOne({ email: session.user?.email });
  if (!owner) return { error: "User not found" };

  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found" };
  if (project.ownerId.toString() !== owner._id.toString()) {
    return { error: "Only the project owner can send collaboration invites" };
  }
  if (project.status !== "OPEN") {
    return { error: "Project is not accepting new members" };
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) return { error: "Target candidate not found" };

  // Check if target is already a team member
  const existingMember = await TeamMember.findOne({
    userId: targetUser._id,
    projectId: project._id,
  });
  if (existingMember) return { error: "Candidate is already on the team" };

  // Check if an application/invite already exists
  const existingApp = await Application.findOne({
    userId: targetUser._id,
    projectId: project._id,
  });
  if (existingApp && existingApp.status === "PENDING") {
    return { error: "An active invitation or application is already pending for this user" };
  }

  const inviteMessage = message.trim() || `Hey ${targetUser.name}! I saw your profile and would love to collaborate with you on "${project.title}".`;

  const application = await Application.create({
    userId: targetUser._id,
    projectId: project._id,
    type: "INVITATION",
    invitedBy: owner._id,
    message: inviteMessage,
    roleRequested: roleRequested || "Collaborator",
    status: "PENDING",
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });

  await Notification.create({
    userId: targetUser._id,
    type: "collaboration_invite",
    message: `${owner.name} invited you to join "${project.title}"!`,
    link: `/projects/${projectId}`,
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true, id: application._id.toString() };
}

export async function respondToCollaborationInvite(inviteId: string, accept: boolean) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  await connectDB();
  const user = await User.findOne({ email: session.user?.email });
  if (!user) return { error: "User not found" };

  const app = await Application.findById(inviteId)
    .populate<{ projectId: IProject }>("projectId")
    .populate<{ invitedBy: IUser }>("invitedBy");

  if (!app) return { error: "Invitation not found" };
  if (app.userId.toString() !== user._id.toString()) {
    return { error: "Not authorized to respond to this invitation" };
  }
  if (app.status !== "PENDING") {
    return { error: "Invitation has already been responded to" };
  }

  if (!accept) {
    app.status = "REJECTED";
    await app.save();

    await Notification.create({
      userId: app.projectId.ownerId,
      type: "invite_declined",
      message: `${user.name} declined your invitation to "${app.projectId.title}"`,
      link: `/projects/${app.projectId._id}`,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/projects/${app.projectId._id}`);
    return { success: true, status: "REJECTED" };
  }

  app.status = "ACCEPTED";
  await app.save();

  const existingMember = await TeamMember.findOne({
    userId: user._id,
    projectId: app.projectId._id,
  });

  if (!existingMember) {
    await TeamMember.create({
      userId: user._id,
      projectId: app.projectId._id,
      role: app.roleRequested || "member",
    });
  }

  const teamCount = await TeamMember.countDocuments({ projectId: app.projectId._id });
  if (teamCount >= app.projectId.teamSizeMax) {
    await Project.findByIdAndUpdate(app.projectId._id, { status: "FULL" });
  }

  const { awardPoints, ACTION_POINTS } = await import("@/lib/gamification");
  await awardPoints(user._id.toString(), ACTION_POINTS.APPLICATION_ACCEPTED);

  await Notification.create({
    userId: app.projectId.ownerId,
    type: "invite_accepted",
    message: `${user.name} accepted your invitation to join "${app.projectId.title}"! 🎉`,
    link: `/projects/${app.projectId._id}`,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/projects/${app.projectId._id}`);
  return { success: true, status: "ACCEPTED" };
}

