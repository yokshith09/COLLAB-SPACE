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
