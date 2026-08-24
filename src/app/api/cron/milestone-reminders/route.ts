import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Milestone, Project, TeamMember, Notification } from "@/lib/models";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    await connectDB();
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Find in-progress milestones that have not been reminded in the last 48 hours
    const activeMilestones = await Milestone.find({
      status: "IN_PROGRESS",
      $or: [
        { lastRemindedAt: { $exists: false } },
        { lastRemindedAt: null },
        { lastRemindedAt: { $lte: twoDaysAgo } },
      ],
    }).limit(20);

    let remindersSent = 0;

    for (const milestone of activeMilestones) {
      const project = await Project.findById(milestone.projectId).select("title ownerId status");
      if (!project || project.status !== "OPEN") continue;

      const teamMembers = await TeamMember.find({ projectId: project._id }).select("userId");
      const userIds = new Set<string>();
      userIds.add(project.ownerId.toString());
      teamMembers.forEach((t) => userIds.add(t.userId.toString()));

      const msg = `⏳ Milestone Reminder: "${milestone.title}" for "${project.title}" is currently active (${milestone.progress}% completed). Keep the momentum going!`;

      const notifs = Array.from(userIds).map((uid) => ({
        userId: uid,
        type: "milestone_reminder",
        message: msg,
        link: `/projects/${project._id}`,
      }));

      await Notification.insertMany(notifs);
      milestone.lastRemindedAt = now;
      await milestone.save();
      remindersSent += notifs.length;
    }

    return NextResponse.json({
      milestonesProcessed: activeMilestones.length,
      remindersSent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to dispatch milestone reminders", detail: error?.message },
      { status: 500 }
    );
  }
}
