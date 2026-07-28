import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { ProjectSettingsForm } from "@/components/project/project-settings-form";

export default async function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  
  

  let user = await safeDbQuery(
    () => prisma.user.findUnique({ where: { id: userId } }),
    null
  );

  if (!user) {
    user = await safeDbQuery(
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

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Database not available.</p>
      </div>
    );
  }

  const project = await safeDbQuery(
    () =>
      prisma.project.findUnique({
        where: { id: projectId },
        include: { team: { include: { user: true } } },
      }),
    null
  );

  if (!project) notFound();

  const isOwner = project.ownerId === user.id;
  if (!isOwner) notFound();

  const [allSkills, allDomains] = await Promise.all([
    safeDbQuery(() => prisma.skill.findMany({ orderBy: { name: "asc" } }), []),
    safeDbQuery(() => prisma.domain.findMany({ orderBy: { name: "asc" } }), []),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Project Settings</h1>
          <p className="text-sm text-muted-foreground">{project.title}</p>
        </div>
      </div>

      <ProjectSettingsForm
        project={project}
        allSkills={allSkills.map((s) => s.name)}
        allDomains={allDomains.map((d) => d.name)}
        userId={user.id}
      />
    </div>
  );
}