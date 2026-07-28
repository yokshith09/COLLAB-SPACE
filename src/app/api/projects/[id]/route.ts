import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ProjectRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, { params }: ProjectRouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id: projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const isOwner = project.ownerId === user.id;
  if (!isOwner) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await req.json();
  const {
    title,
    description,
    problemStatement,
    domain,
    teamSizeMax,
    requiredSkills,
    deadline,
    isPrivate,
  } = body;

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      title: title?.trim() || project.title,
      description: description?.trim() || project.description,
      problemStatement: problemStatement?.trim() || project.problemStatement,
      domain: domain?.trim() || project.domain,
      teamSizeMax: teamSizeMax || project.teamSizeMax,
      requiredSkills: requiredSkills || project.requiredSkills,
      deadline: deadline || project.deadline,
      isPrivate: isPrivate !== undefined ? isPrivate : project.isPrivate,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: ProjectRouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id: projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const isOwner = project.ownerId === user.id;
  if (!isOwner) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  await prisma.project.delete({ where: { id: projectId } });

  return NextResponse.json({ success: true });
}
