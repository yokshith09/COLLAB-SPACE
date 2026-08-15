import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User, Notification } from "@/lib/models";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ count: 0 });
  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ count: 0 });
  const count = await Notification.countDocuments({ userId: user._id, isRead: false });
  return NextResponse.json({ count });
}
