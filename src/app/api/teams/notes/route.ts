import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { projectId, title, content } = await req.json();

  const membership = await prisma.teamMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const note = await prisma.note.create({
    data: { title, content, projectId, createdBy: user.id },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json(note, { status: 201 });
}

