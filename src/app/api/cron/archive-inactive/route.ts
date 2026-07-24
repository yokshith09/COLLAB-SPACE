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
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const inactive = await prisma.project.findMany({
      where: {
        status: { in: ["OPEN", "FULL", "ACTIVE"] },
        updatedAt: { lte: thirtyDaysAgo },
        messages: { none: { createdAt: { gte: thirtyDaysAgo } } },
      },
      select: { id: true, title: true },
    });

    if (inactive.length > 0) {
      await prisma.project.updateMany({
        where: { id: { in: inactive.map((p) => p.id) } },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ archived: inactive.length, projects: inactive.map((p) => p.title) });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to archive inactive projects", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
