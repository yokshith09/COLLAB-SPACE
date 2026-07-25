import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const result = await prisma.application.updateMany({
      where: { status: "PENDING", expiresAt: { lte: new Date() } },
      data: { status: "EXPIRED" },
    });

    const apps = await prisma.application.findMany({
      where: { status: "EXPIRED", expiresAt: { lte: new Date() } },
      select: { userId: true, projectId: true },
    });

    let notified = 0;
    for (const app of apps) {
      const project = await prisma.project.findUnique({
        where: { id: app.projectId },
        select: { title: true },
      });
      if (project) {
        await prisma.notification.create({
          data: {
            userId: app.userId,
            type: "application_expired",
            message: `Your application to "${project.title}" expired (no response in 7 days)`,
            link: `/projects/${app.projectId}`,
          },
        });
        notified++;
      }
    }

    return NextResponse.json({ expired: result.count, notified });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to expire applications", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
