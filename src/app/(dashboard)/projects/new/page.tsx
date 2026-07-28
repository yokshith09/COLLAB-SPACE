import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { CreateProjectForm } from "@/components/project/create-project-form";

export default async function NewProjectPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  
  

  let user = await safeDbQuery(
    () =>
      prisma.user.findUnique({
        where: { id: userId },
        include: { projectsOwned: { where: { status: { in: ["OPEN", "FULL", "ACTIVE"] } } } },
      }),
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
          include: { projectsOwned: { where: { status: { in: ["OPEN", "FULL", "ACTIVE"] } } } },
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

  const activeCount = user.projectsOwned.length;
  const [skills, domains] = await Promise.all([
    safeDbQuery(() => prisma.skill.findMany({ orderBy: { name: "asc" } }), []),
    safeDbQuery(() => prisma.domain.findMany({ orderBy: { name: "asc" } }), []),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Project</h1>
        <p className="text-sm text-muted-foreground">
          {activeCount} of 3 active projects used
          {activeCount >= 3 && <span className="text-red-500 ml-1">(max reached)</span>}
        </p>
      </div>

      {activeCount >= 3 ? (
        <div className="p-4 rounded-xl border bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-sm">
          You have 3 active projects. Complete or close one before starting another.
        </div>
      ) : (
        <CreateProjectForm
          skills={skills.map((s) => s.name)}
          domains={domains.map((d) => d.name)}
          activeCount={activeCount}
          maxActive={3}
          userId={user.id}
        />
      )}
    </div>
  );
}
