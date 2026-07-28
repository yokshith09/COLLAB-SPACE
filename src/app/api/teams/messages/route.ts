import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { projectId, content } = await req.json();

  const membership = await prisma.teamMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const message = await prisma.message.create({
    data: { content, senderId: user.id, projectId },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}

