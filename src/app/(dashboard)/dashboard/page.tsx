import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongoose";
import { User, Project, TeamMember, Application } from "@/lib/models";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function toId(doc: any) {
  return { ...doc.toObject(), id: doc._id.toString() };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  await connectDB();
  let user = await User.findOne({ email: session.user.email });
  if (!user) {
    user = await User.create({
      name: session.user.name || "Anonymous",
      email: session.user.email,
      avatar: session.user.image || undefined,
    });
  }

  const uid = user._id;
  const { getRecommendedProjects } = await import("@/lib/matching");
  let recommendedProjects = await getRecommendedProjects(uid.toString());

  if (recommendedProjects.length === 0) {
    recommendedProjects = await Project.find({
      status: "OPEN",
      ownerId: { $ne: uid }
    }).sort({ createdAt: -1 }).limit(6).lean() as any;
  }

  const [ownedProjects, memberships, applications] = await Promise.all([
    Project.find({ ownerId: uid }).sort({ createdAt: -1 }).lean(),
    TeamMember.find({ userId: uid }).populate("projectId", "title ownerId").lean(),
    Application.find({ userId: uid }).populate("projectId", "title").sort({ createdAt: -1 }).lean(),
  ]);

  const teamCounts: Record<string, number> = {};
  for (const p of ownedProjects) {
    teamCounts[(p as any)._id.toString()] = await TeamMember.countDocuments({ projectId: (p as any)._id });
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
          <Link href={`/profile/${uid}`}><Button variant="outline" size="sm">View Profile</Button></Link>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Recommended for You</h2>
        </div>
        {recommendedProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations available right now.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {(recommendedProjects as any[]).map((p) => (
              <Link key={p._id.toString()} href={`/projects/${p._id}`}>
                <div className="p-5 rounded-xl border bg-primary/5 hover:bg-primary/10 hover:border-primary/20 transition-all group h-full flex flex-col relative">
                  {p.matchScore && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      {p.matchScore} Match
                    </div>
                  )}
                  <h3 className="font-semibold text-primary pr-20">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">{p.problemStatement}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(p.requiredSkills || []).slice(0, 3).map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-[10px] h-5">{s}</Badge>
                    ))}
                    {(p.requiredSkills?.length > 3) && <Badge variant="outline" className="text-[10px] h-5">+{p.requiredSkills.length - 3}</Badge>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Your Projects ({ownedProjects.length})</h2>
        {ownedProjects.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed text-center">
            <p className="text-muted-foreground mb-2">No projects yet.</p>
            <Link href="/projects/new"><Button variant="outline" size="sm">Create your first project</Button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {(ownedProjects as any[]).map((p) => (
              <Link key={p._id.toString()} href={`/projects/${p._id}`}>
                <div className="p-5 rounded-xl border bg-card hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{p.title}</h3>
                    <span className="text-xs text-muted-foreground">{p.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{teamCounts[p._id.toString()] ?? 0}/{p.teamSizeMax} members</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Team Memberships ({memberships.length})</h2>
        {memberships.length === 0 ? (
          <p className="text-muted-foreground text-sm">Not part of any team yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {(memberships as any[]).map((t) => (
              <Link key={t._id.toString()} href={`/projects/${t.projectId._id}`}>
                <div className="p-5 rounded-xl border bg-card hover:shadow-md transition-all group">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{t.projectId.title}</h3>
                  <p className="text-sm text-muted-foreground">Role: {t.role}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Applications ({applications.length})</h2>
        {applications.length === 0 ? (
          <p className="text-muted-foreground text-sm">No applications yet.</p>
        ) : (
          <div className="space-y-2">
            {(applications as any[]).map((a) => (
              <Link key={a._id.toString()} href={`/projects/${a.projectId._id}`}>
                <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-all flex items-center justify-between">
                  <span className="font-medium">{a.projectId.title}</span>
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
