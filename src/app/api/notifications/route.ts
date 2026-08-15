import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User, Notification } from "@/lib/models";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json((notifications as any[]).map((n) => ({ ...n, id: n._id.toString() })));
}
