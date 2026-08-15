import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Task } from "@/lib/models";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { status, bountyStatus } = await req.json();
  const updateData: any = { status };
  if (bountyStatus) updateData.bountyStatus = bountyStatus;
  const task = await Task.findByIdAndUpdate(id, updateData, { new: true });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json({ ...task.toObject(), id: task._id.toString() });
}
