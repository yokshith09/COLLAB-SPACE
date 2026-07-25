import { Link } from "@tanstack/react-router";
import { useCurrentProfile, useProjects, useMyApplications, useNotifications, timeAgo } from "@/lib/api";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function DashboardPage() {
  const { data: me } = useCurrentProfile();
  const { data: projects } = useProjects();
  const myProjects = projects?.filter((p) => p.owner_id === me?.id) ?? [];
  const { data: myApps } = useMyApplications();
  const { data: notifs } = useNotifications();
  const pendingCount = myApps?.filter((a) => a.status === "PENDING").length ?? 0;
  const unread = notifs?.filter((n) => !n.is_read).length ?? 0;
  const recentNotifs = notifs?.slice(0, 5) ?? [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hi {me?.name?.split(" ")[0] ?? "there"} 👋</h1>
        <p className="mt-1 text-muted-foreground">Here's what's happening with your projects.</p>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <Stat label="Projects owned" value={myProjects.length} />
          <Stat label="Pending applications" value={pendingCount} />
          <Stat label="Unread notifications" value={unread} />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your projects</h2>
          <Button asChild size="sm" variant="outline"><Link to="/projects/new">+ New project</Link></Button>
        </div>
        {myProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">You haven't started any projects yet.</p>
            <Button asChild className="mt-4"><Link to="/projects/new">Start one</Link></Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{myProjects.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your applications</h2>
        {!myApps || myApps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No applications sent yet. <Link to="/projects" className="text-primary hover:underline">Discover projects →</Link></div>
        ) : (
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {myApps.map((a) => {
              const project = projects?.find((p) => p.id === a.project_id);
              return (
                <Link key={a.id} to="/projects/$id" params={{ id: a.project_id }} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{project?.title ?? "Project"}</p>
                    <p className="text-xs text-muted-foreground">Applied {timeAgo(a.created_at)}</p>
                  </div>
                  <Badge variant={a.status === "ACCEPTED" ? "default" : a.status === "REJECTED" || a.status === "EXPIRED" ? "destructive" : "secondary"}>{a.status}</Badge>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent notifications</h2>
          <Link to="/notifications" className="text-sm text-primary hover:underline inline-flex items-center gap-1">All <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {recentNotifs.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">You're all caught up.</p>
          ) : recentNotifs.map((n) => (
            <div key={n.id} className="p-4 flex items-center gap-3">
              {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
              <p className={`text-sm flex-1 ${n.is_read ? "text-muted-foreground" : ""}`}>{n.message}</p>
              <span className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
