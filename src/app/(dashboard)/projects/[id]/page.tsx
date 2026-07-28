import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { notFound, redirect } from "next/navigation";
import { ProjectDetail } from "@/components/project/project-detail";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  
  let dbUser = null;

  if (userId ) {
    dbUser = await safeDbQuery(
      () =>
        prisma.user.findUnique({ where: { id: userId } }),
      null
    );
    if (!dbUser) {
      dbUser = await safeDbQuery(
        () =>
          prisma.user.create({
            data: {
              id: userId,
              email: session?.user?.email || "",
              name: `${session?.user?.name} ${""}`.trim() || "Anonymous",
              avatar: session?.user?.image || null,
            },
          }),
        null
      );
    }
  }

  const project = await safeDbQuery(
    () =>
      prisma.project.findUnique({
        where: { id: projectId },
        include: {
          owner: true,
          team: {
            include: {
              user: { select: { id: true, name: true, avatar: true, skills: true } },
            },
          },
          _count: { select: { applications: true } },
        },
      }),
    null
  );

  if (!project || (project.isPrivate && !userId)) notFound();

  const isOwner = dbUser?.id === project.ownerId;
  const isMember = project.team.some((t) => t.userId === dbUser?.id);

  let userApplication = null;
  if (dbUser) {
    userApplication = await safeDbQuery(
      () =>
        prisma.application.findUnique({
          where: { userId_projectId: { userId: dbUser.id, projectId } },
        }),
      null
    );
  }

  let allApplications: any[] = [];
  if (isOwner) {
    allApplications = await safeDbQuery(
      () =>
        prisma.application.findMany({
          where: { projectId },
          include: {
            user: {
              select: { id: true, name: true, avatar: true, bio: true, skills: true, githubUrl: true, linkedinUrl: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      []
    );
  }

  const messages = isMember
    ? await safeDbQuery(
        () =>
          prisma.message.findMany({
            where: { projectId },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true },
          }),
        []
      )
    : [];

  const projectWithMessages = { ...project, messages };

  return (
    <ProjectDetail
      project={projectWithMessages}
      isOwner={isOwner}
      isMember={isMember}
      userApplication={userApplication}
      allApplications={allApplications}
      currentUser={dbUser}
    />
  );
}
