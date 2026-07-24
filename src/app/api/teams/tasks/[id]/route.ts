import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();

  const task = await prisma.task.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(task);
}
