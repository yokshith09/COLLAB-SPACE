import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const expiredApps = await prisma.application.findMany({
      where: { status: "PENDING", expiresAt: { lte: new Date() } },
      include: { project: { select: { id: true, title: true } } },
    });

    if (expiredApps.length > 0) {
      await prisma.$transaction([
        prisma.application.updateMany({
          where: { id: { in: expiredApps.map((a) => a.id) } },
          data: { status: "EXPIRED" },
        }),
        ...expiredApps.map((app) =>
          prisma.notification.create({
            data: {
              userId: app.userId,
              type: "application_expired",
              message: `Your application to "${app.project.title}" expired (no response in 7 days)`,
              link: `/projects/${app.project.id}`,
            },
          })
        ),
      ]);
    }

    return NextResponse.json({ expired: expiredApps.length, notified: expiredApps.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to expire applications", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
