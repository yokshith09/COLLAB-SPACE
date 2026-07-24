"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function reportProjectInactive(projectId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true }
  });

  if (!project) return { error: "Project not found" };

  // Send a notification to the owner
  await prisma.notification.create({
    data: {
      userId: project.ownerId,
      type: "project_reported_inactive",
      message: `Your project "${project.title}" has been reported as inactive. If you are inactive for 30 days and not responding to Collab requests, your project will be deleted.`,
      link: `/projects/${projectId}`,
    }
  });

  // Mock email to user
  console.log(`[EMAIL MOCK] To: ${project.owner.email} | Subject: Project Inactivity Warning | Body: Your project "${project.title}" has been reported as inactive. If you are inactive for 30 days and not responding to Collab requests, your project will be deleted.`);

  return { success: true };
}
