import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User, TeamMember, Message } from "@/lib/models";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json([]);
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json([]);
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json([]);
  const membership = await TeamMember.findOne({ userId: user._id, projectId });
  if (!membership) return NextResponse.json([]);
  const messages = await Message.find({ projectId })
    .populate("senderId", "id name avatar")
    .sort({ createdAt: "asc" })
    .lean();
  return NextResponse.json((messages as any[]).map((m) => ({
    id: m._id.toString(),
    content: m.content,
    senderId: (m.senderId as any)._id.toString(),
    createdAt: m.createdAt,
    sender: { id: (m.senderId as any)._id.toString(), name: (m.senderId as any).name, avatar: (m.senderId as any).avatar },
  })));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { projectId, content } = await req.json();
  const membership = await TeamMember.findOne({ userId: user._id, projectId });
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  const message = await Message.create({ content, senderId: user._id, projectId });
  return NextResponse.json({
    ...message.toObject(),
    id: message._id.toString(),
    sender: { id: user._id.toString(), name: user.name, avatar: user.avatar },
  }, { status: 201 });
}
