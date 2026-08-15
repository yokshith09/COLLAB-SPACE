import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User, TeamMember, Note } from "@/lib/models";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { projectId, title, content } = await req.json();
  const membership = await TeamMember.findOne({ userId: user._id, projectId });
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  const note = await Note.create({ title, content, projectId, createdBy: user._id });
  return NextResponse.json({
    ...note.toObject(),
    id: note._id.toString(),
    author: { id: user._id.toString(), name: user.name },
  }, { status: 201 });
}
