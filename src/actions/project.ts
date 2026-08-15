"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User, Project, Application, TeamMember, Notification } from "@/lib/models";
import { revalidatePath } from "next/cache";

export async function createProject(data: {
  title: string;
  description: string;
  problemStatement: string;
  domain: string;
  teamSizeMax: number;
  requiredSkills: string[];
  deadline: Date | null;
  isPrivate: boolean;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  await connectDB();
  const user = await User.findOne({ email: session?.user?.email });
  if (!user) return { error: "User not found" };

  const activeCount = await Project.countDocuments({
    ownerId: user._id,
    status: { $in: ["OPEN", "FULL", "ACTIVE"] },
  });
  if (activeCount >= 3) return { error: "Max 3 active projects reached" };

  const inviteCode = data.isPrivate ? crypto.randomUUID() : undefined;

  const project = await Project.create({
    title: data.title,
    description: data.description,
    problemStatement: data.problemStatement,
    domain: data.domain,
    teamSizeMax: data.teamSizeMax,
    requiredSkills: data.requiredSkills,
    deadline: data.deadline || undefined,
    isPrivate: data.isPrivate,
    inviteCode,
    ownerId: user._id,
  });

  await TeamMember.create({ userId: user._id, projectId: project._id, role: "admin" });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { id: project._id.toString() };
}

export async function applyToProject(projectId: string, message: string, roleRequested?: string, availability?: string, resumeUrl?: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  await connectDB();
  const user = await User.findOne({ email: session?.user?.email });
  if (!user) return { error: "User not found" };

  const finalResumeUrl = resumeUrl || user.resumeUrl;

  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found" };
  if (project.status !== "OPEN") return { error: "Project is not accepting applications" };

  const existing = await Application.findOne({ userId: user._id, projectId: project._id });
  if (existing) return { error: "You already have an application for this project" };

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayApps = await Application.countDocuments({
    userId: user._id,
    createdAt: { $gte: todayStart },
  });
  if (todayApps >= 5) return { error: "Daily application limit reached (max 5/day)" };

  const application = await Application.create({
    userId: user._id,
    projectId: project._id,
    message,
    roleRequested,
    availability,
    resumeUrl: finalResumeUrl,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });

  await Notification.create({
    userId: project.ownerId,
    type: "new_application",
    message: `${user.name} applied to "${project.title}"`,
    link: `/projects/${projectId}`,
  });

  revalidatePath(`/projects/${projectId}`);
  return {
    id: application._id.toString(),
    status: application.status,
    expiresAt: application.expiresAt,
  };
}

export async function updateProjectShowcase(
  projectId: string,
  data: {
    githubUrl?: string;
    demoUrl?: string;
    gallery?: string[];
  }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  await connectDB();
  const user = await User.findOne({ email: session?.user?.email });
  if (!user) return { error: "User not found" };

  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found" };
  if (project.ownerId.toString() !== user._id.toString()) {
    return { error: "Only the project owner can update the showcase" };
  }
  
  if (data.githubUrl !== undefined) project.githubUrl = data.githubUrl;
  if (data.demoUrl !== undefined) project.demoUrl = data.demoUrl;
  if (data.gallery !== undefined) project.gallery = data.gallery;

  await project.save();
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function updateProjectStatus(projectId: string, status: "OPEN" | "FULL" | "ACTIVE" | "COMPLETED" | "CANCELLED") {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  await connectDB();
  const user = await User.findOne({ email: session?.user?.email });
  if (!user) return { error: "User not found" };

  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found" };
  if (project.ownerId.toString() !== user._id.toString()) {
    return { error: "Only the project owner can update status" };
  }

  const oldStatus = project.status;
  project.status = status;
  await project.save();

  if (status === "COMPLETED" && oldStatus !== "COMPLETED") {
    const { awardPoints, ACTION_POINTS } = await import("@/lib/gamification");
    
    // Award owner
    await awardPoints(project.ownerId.toString(), ACTION_POINTS.PROJECT_COMPLETED);
    
    // Award team members
    const team = await TeamMember.find({ projectId: project._id, role: { $ne: "admin" } });
    for (const member of team) {
      await awardPoints(member.userId.toString(), ACTION_POINTS.PROJECT_COMPLETED);
    }
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
