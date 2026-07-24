import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const session = await auth();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: session.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { projectId, removalReason } = await req.json();

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await prisma.teamMember.update({
    where: { userId_projectId: { userId, projectId } },
    data: { removedAt: new Date(), removalReason },
  });

  return NextResponse.json({ success: true });
}
