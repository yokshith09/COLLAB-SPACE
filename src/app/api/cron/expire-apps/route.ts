import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Application, Notification, Project } from "@/lib/models";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    await connectDB();
    const now = new Date();

    const expiredApps = await Application.find({
      status: "PENDING",
      expiresAt: { $lte: now },
    }).select("_id userId projectId");

    if (expiredApps.length === 0) {
      return NextResponse.json({ expired: 0, notified: 0 });
    }

    const result = await Application.updateMany(
      { _id: { $in: expiredApps.map(a => a._id) } },
      { $set: { status: "EXPIRED" } }
    );

    let notified = 0;
    for (const app of expiredApps) {
      const project = await Project.findById(app.projectId).select("title");
      if (project) {
        await Notification.create({
          userId: app.userId,
          type: "application_expired",
          message: `Your application to "${project.title}" expired (no response in 14 days)`,
          link: `/projects/${app.projectId}`,
        });
        notified++;
      }
    }

    return NextResponse.json({ expired: result.modifiedCount, notified });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to expire applications", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
