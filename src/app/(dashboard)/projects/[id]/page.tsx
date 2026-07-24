import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { notFound, redirect } from "next/navigation";
import { ProjectDetail } from "@/components/project/project-detail";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { id: projectId } = await params;
  const { code } = await searchParams;
  const { userId } = await auth();
  const clerkUser = await currentUser();
  let dbUser = null;

  if (userId && clerkUser) {
    dbUser = await safeDbQuery(
      () =>
        prisma.user.findUnique({ where: { clerkId: userId } }),
      null
    );
    if (!dbUser) {
      dbUser = await safeDbQuery(
        () =>
          prisma.user.create({
            data: {
              clerkId: userId,
              email: clerkUser.emailAddresses[0]?.emailAddress || "",
              name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Anonymous",
              avatar: clerkUser.imageUrl || null,
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

  if (!project) notFound();

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

  if (project.isPrivate) {
    const hasValidInvite = code && project.inviteCode === code;
    const isAuthorized = isOwner || isMember || userApplication !== null || hasValidInvite;
    if (!isAuthorized) notFound();
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
