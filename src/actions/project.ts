"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  const activeCount = await prisma.project.count({
    where: { ownerId: user.id, status: { in: ["OPEN", "FULL", "ACTIVE"] } },
  });

  if (activeCount >= 3) return { error: "Max 3 active projects reached" };

  const inviteCode = data.isPrivate ? crypto.randomUUID() : null;

  const project = await prisma.project.create({
    data: {
      title: data.title,
      description: data.description,
      problemStatement: data.problemStatement,
      domain: data.domain,
      teamSizeMax: data.teamSizeMax,
      requiredSkills: data.requiredSkills,
      deadline: data.deadline,
      isPrivate: data.isPrivate,
      inviteCode,
      ownerId: user.id,
      team: { create: { userId: user.id, role: "admin" } },
    },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { id: project.id };
}

export async function applyToProject(projectId: string, message: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: "Project not found" };
  if (project.status !== "OPEN") return { error: "Project is not accepting applications" };

  const existing = await prisma.application.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (existing) return { error: "You already have an application for this project" };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayApps = await prisma.application.count({
    where: { userId: user.id, createdAt: { gte: todayStart } },
  });
  if (todayApps >= 5) return { error: "Daily application limit reached (max 5/day)" };

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      projectId,
      message,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: project.ownerId,
      type: "new_application",
      message: `${user.name} applied to "${project.title}"`,
      link: `/projects/${projectId}`,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { id: application.id, status: application.status, expiresAt: application.expiresAt };
}

