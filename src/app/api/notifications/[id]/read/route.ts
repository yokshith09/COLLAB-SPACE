import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  if (notification.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
