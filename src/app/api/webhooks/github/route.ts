import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Project, Task, Message } from "@/lib/models";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const payloadString = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const event = req.headers.get("x-github-event");

    await connectDB();
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify webhook signature if a secret is configured
    if (project.githubWebhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 401 });
      }
      const hmac = crypto.createHmac("sha256", project.githubWebhookSecret);
      const digest = "sha256=" + hmac.update(payloadString).digest("hex");
      if (signature !== digest) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(payloadString);
    let textsToScan: string[] = [];
    let sourceUrl = "";
    let actorName = "";

    if (event === "pull_request" && payload.action === "closed" && payload.pull_request.merged) {
      textsToScan.push(payload.pull_request.body || "");
      textsToScan.push(payload.pull_request.title || "");
      sourceUrl = payload.pull_request.html_url;
      actorName = payload.pull_request.user.login;
    } else if (event === "push") {
      payload.commits?.forEach((commit: any) => {
        textsToScan.push(commit.message);
      });
      sourceUrl = payload.compare;
      actorName = payload.pusher.name;
    } else {
      return NextResponse.json({ message: "Ignored event type" });
    }

    const combinedText = textsToScan.join("\n");
    // Regex matches e.g. "Fixes #64b3c92f1a2c3d4e5f6g7h8i"
    const regex = /(?:fix(?:es|ed)?|close(?:s|d)?|resolve(?:s|d)?)\s+#([a-f0-9]{24})/gi;
    const matches = Array.from(combinedText.matchAll(regex));

    if (matches.length > 0) {
      const taskIds = matches.map((m) => m[1]);
      
      for (const taskId of taskIds) {
        const task = await Task.findOneAndUpdate(
          { _id: taskId, projectId: project._id },
          { status: "DONE" },
          { new: true }
        );

        if (task) {
          // Send an automated message in the team chat
          await Message.create({
            projectId: project._id,
            content: `🤖 GitHub Integration: Task "${task.title}" was completed by ${actorName}.\n\n[View on GitHub](${sourceUrl})`,
            senderId: project.ownerId // Bot messages could be assigned to owner or a specific bot ID, we'll just use owner for now
          });
        }
      }
    }

    return NextResponse.json({ success: true, tasksProcessed: matches.length });
  } catch (error: any) {
    console.error("GitHub Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
