import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { notFound, redirect } from "next/navigation";
import { TeamWorkspace } from "@/components/team/team-workspace";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  let user = await safeDbQuery(
    () => prisma.user.findUnique({ where: { clerkId: userId } }),
    null
  );

  if (!user) {
    user = await safeDbQuery(
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

  if (!user) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Database not available.</p></div>;
  }

  const project = await safeDbQuery(
    () =>
      prisma.project.findUnique({
        where: { id: projectId },
        include: {
          team: { include: { user: true } },
          messages: {
            include: { sender: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: "asc" },
          },
          notes: {
            include: { author: { select: { id: true, name: true } } },
            orderBy: { updatedAt: "desc" },
          },
          tasks: { orderBy: { createdAt: "desc" } },
          owner: { select: { id: true } },
        },
      }),
    null
  );

  if (!project) notFound();

  const isMember = project.team.some((t) => t.userId === user.id);
  if (!isMember) redirect(`/projects/${projectId}`);

  return <TeamWorkspace project={project as any} currentUser={user} />;
}
