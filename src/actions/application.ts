"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function respondToApplication(applicationId: string, status: "ACCEPTED" | "REJECTED") {
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

    // Send email notification
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: app.user.email,
          subject: `Your application to "${app.project.title}" was ${status.toLowerCase()}`,          html: `
            <h2>Your application status has been updated</h2>
            <p>Your application to <strong>${app.project.title}</strong> was <strong>${status.toLowerCase()}</strong>.</p>
            <p>Project: ${app.project.title}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/projects/${app.projectId}">View Project</a></p>
          `,
        }),
      });
    } catch {
      // Silently fail if email sending fails
    }

    await prisma.notification.create({
      data: {
        userId: app.userId,
        type: `application_${status.toLowerCase()}`,
        message: `Your application to "${app.project.title}" was ${status.toLowerCase()}`,
        link: `/projects/${app.projectId}`,
      },
    });

    revalidatePath(`/projects/${app.projectId}`);
    return { success: true };
}

