import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { name, bio, githubUrl, linkedinUrl, avatar, resumeUrl, skills, domains } = await req.json();
  if (name?.trim()) user.name = name.trim();
  user.bio = bio?.trim() || undefined;
  user.githubUrl = githubUrl?.trim() || undefined;
  user.linkedinUrl = linkedinUrl?.trim() || undefined;
  if (avatar) user.avatar = avatar;
  if (resumeUrl !== undefined) user.resumeUrl = resumeUrl || undefined;
  if (Array.isArray(skills)) user.skills = skills;
  if (Array.isArray(domains)) user.domains = domains;
  await user.save();
  return NextResponse.json({ ...user.toObject(), id: user._id.toString() });
}
