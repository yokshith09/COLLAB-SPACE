import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User, TeamMember, Task, Notification } from "@/lib/models";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { projectId, title, description, assignedTo, dueDate, bountyAmount } = await req.json();
  const membership = await TeamMember.findOne({ userId: user._id, projectId });
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  const task = await Task.create({
    title,
    description: description || undefined,
    projectId,
    assignedTo: assignedTo || undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    bountyAmount: bountyAmount ? Number(bountyAmount) : undefined,
  });
  if (assignedTo && assignedTo !== user._id.toString()) {
    await Notification.create({
      userId: assignedTo,
      type: "task_assigned",
      message: `New task assigned: "${title}"`,
      link: `/team/${projectId}`,
    });
  }
  return NextResponse.json({ ...task.toObject(), id: task._id.toString() }, { status: 201 });
}
