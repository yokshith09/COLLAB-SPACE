import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ count: 0 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ count: 0 });

  const count = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return NextResponse.json({ count });
}

