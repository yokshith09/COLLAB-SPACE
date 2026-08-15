import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;
  if (type === "avatar") {
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (user) { user.avatar = dataUrl; await user.save(); }
  } else if (type === "resume") {
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (user) { user.resumeUrl = dataUrl; await user.save(); }
  }
  return NextResponse.json({ url: dataUrl });
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
