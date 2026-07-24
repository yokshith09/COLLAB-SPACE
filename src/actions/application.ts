"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function respondToApplication(applicationId: string, status: "ACCEPTED" | "REJECTED", responseMessage?: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { project: true, user: true },
  });

  if (!app) return { error: "Application not found" };

  const owner = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!owner || app.project.ownerId !== owner.id) return { error: "Not authorized" };

  if (app.status !== "PENDING") return { error: "Application already processed" };

  if (status === "ACCEPTED") {
    const teamCount = await prisma.teamMember.count({ where: { projectId: app.projectId } });
    if (teamCount >= app.project.teamSizeMax) {
      return { error: "Team has reached its maximum size limit" };
    }
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  if (status === "ACCEPTED") {
    const existingMember = await prisma.teamMember.findUnique({
      where: { userId_projectId: { userId: app.userId, projectId: app.projectId } },
    });

    if (!existingMember) {
      await prisma.teamMember.create({
        data: { userId: app.userId, projectId: app.projectId, role: "member" },
      });
    }

    const teamCount = await prisma.teamMember.count({ where: { projectId: app.projectId } });
    if (teamCount >= app.project.teamSizeMax) {
      await prisma.project.update({
        where: { id: app.projectId },
        data: { status: "FULL" },
      });
    }
  }

  await prisma.notification.create({
    data: {
      userId: app.userId,
      type: `application_${status.toLowerCase()}`,
      message: `Your application to "${app.project.title}" was ${status.toLowerCase()}.${responseMessage ? ` Message: ${responseMessage}` : ''}`,
      link: `/projects/${app.projectId}`,
    },
  });

  revalidatePath(`/projects/${app.projectId}`);
  return { success: true };
}

