import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User, Project } from "@/lib/models";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { id } = await params;
  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (project.ownerId.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const { title, description, problemStatement, domain, teamSizeMax, requiredSkills, deadline, isPrivate, githubWebhookSecret } = await req.json();
  if (title) project.title = title.trim();
  if (description) project.description = description.trim();
  if (problemStatement) project.problemStatement = problemStatement.trim();
  if (domain) project.domain = domain.trim();
  if (teamSizeMax) project.teamSizeMax = teamSizeMax;
  if (requiredSkills) project.requiredSkills = requiredSkills;
  if (deadline !== undefined) project.deadline = deadline ? new Date(deadline) : undefined;
  if (isPrivate !== undefined) project.isPrivate = isPrivate;
  if (githubWebhookSecret !== undefined) project.githubWebhookSecret = githubWebhookSecret;
  await project.save();
  return NextResponse.json({ ...project.toObject(), id: project._id.toString() });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { id } = await params;
  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (project.ownerId.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  await Project.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
