import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  
  

  let user = await safeDbQuery(
    () =>
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          projectsOwned: { include: { team: true }, orderBy: { createdAt: "desc" } },
          applications: {
            include: { project: { select: { title: true, id: true } } },
            orderBy: { createdAt: "desc" },
          },
          teams: {
            include: { project: { include: { owner: { select: { name: true } } } } },
          },
        },
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
          include: {
            projectsOwned: { include: { team: true }, orderBy: { createdAt: "desc" } },
            applications: {
              include: { project: { select: { title: true, id: true } } },
              orderBy: { createdAt: "desc" },
            },
            teams: {
              include: { project: { include: { owner: { select: { name: true } } } } },
            },
          },
        }),
      null
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Database not available. Set up a PostgreSQL database to continue.</p>
        <Link href="/"><Button variant="outline">Back to Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/projects/new"><Button size="sm">+ New Project</Button></Link>
          <Link href={`/profile/${user.id}`}><Button variant="outline" size="sm">View Profile</Button></Link>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">Your Projects ({user.projectsOwned.length})</h2>
        {user.projectsOwned.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed text-center">
            <p className="text-muted-foreground mb-2">No projects yet.</p>
            <Link href="/projects/new"><Button variant="outline" size="sm">Create your first project</Button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {user.projectsOwned.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className="p-5 rounded-xl border bg-card hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{p.title}</h3>
                    <span className="text-xs text-muted-foreground">{p.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.team.length}/{p.teamSizeMax} members</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Team Memberships ({user.teams.length})</h2>
        {user.teams.length === 0 ? (
          <p className="text-muted-foreground text-sm">Not part of any team yet. Browse projects to apply.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {user.teams.map((t) => (
              <Link key={t.id} href={`/projects/${t.projectId}`}>
                <div className="p-5 rounded-xl border bg-card hover:shadow-md transition-all group">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{t.project.title}</h3>
                  <p className="text-sm text-muted-foreground">Role: {t.role} · by {t.project.owner.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Applications ({user.applications.length})</h2>
        {user.applications.length === 0 ? (
          <p className="text-muted-foreground text-sm">No applications yet.</p>
        ) : (
          <div className="space-y-2">
            {user.applications.map((a) => (
              <Link key={a.id} href={`/projects/${a.projectId}`}>
                <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-all flex items-center justify-between">
                  <span className="font-medium">{a.project.title}</span>
                  <span className="text-sm text-muted-foreground">{a.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
