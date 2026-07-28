import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { projectId, title, description, assignedTo, dueDate } = await req.json();

  const membership = await prisma.teamMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      projectId,
      assignedTo: assignedTo || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  if (assignedTo && assignedTo !== user.id) {
    await prisma.notification.create({
      data: {
        userId: assignedTo,
        type: "task_assigned",
        message: `New task assigned: "${title}"`,
        link: `/team/${projectId}`,
      },
    });
  }

  return NextResponse.json(task, { status: 201 });
}

