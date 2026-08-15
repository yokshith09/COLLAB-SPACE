import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Project, Message } from "@/lib/models";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    await connectDB();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const candidateProjects = await Project.find({
      status: { $in: ["OPEN", "FULL", "ACTIVE"] },
      updatedAt: { $lte: thirtyDaysAgo },
    }).select("_id title");

    const candidateIds = candidateProjects.map(p => p._id);

    const recentMessages = await Message.find({
      projectId: { $in: candidateIds },
      createdAt: { $gte: thirtyDaysAgo },
    }).select("projectId").lean();

    const activeProjectIds = new Set(recentMessages.map(m => m.projectId.toString()));
    const inactiveProjects = candidateProjects.filter(p => !activeProjectIds.has(p._id.toString()));

    if (inactiveProjects.length > 0) {
      await Project.updateMany(
        { _id: { $in: inactiveProjects.map(p => p._id) } },
        { $set: { status: "CANCELLED" } }
      );
    }

    return NextResponse.json({ archived: inactiveProjects.length, projects: inactiveProjects.map(p => p.title) });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to archive inactive projects", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
