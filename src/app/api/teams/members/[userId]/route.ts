import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User, Project, TeamMember } from "@/lib/models";

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { projectId, removalReason } = await req.json();
  const project = await Project.findById(projectId);
  if (!project || project.ownerId.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  await TeamMember.findOneAndUpdate(
    { userId, projectId },
    { removedAt: new Date(), removalReason }
  );
  return NextResponse.json({ success: true });
}
