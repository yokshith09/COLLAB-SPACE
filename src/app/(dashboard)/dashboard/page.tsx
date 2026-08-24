import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongoose";
import { User, Project, TeamMember, Application } from "@/lib/models";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, MailOpen, Flag, Clock, CheckCircle2, ArrowRight, Crown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InvitationCard } from "@/components/notifications/invitation-card";
import { getUserActiveMilestones } from "@/actions/milestone";
import { getUserQuotaSummary } from "@/lib/ai/rate-limiter";

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

  const [ownedProjects, memberships, receivedInvitations, submittedApplications, activeMilestones, quotaSummary] = await Promise.all([
    Project.find({ ownerId: uid }).sort({ createdAt: -1 }).lean(),
    TeamMember.find({ userId: uid }).populate("projectId", "title ownerId").lean(),
    Application.find({ userId: uid, type: "INVITATION" })
      .populate("projectId", "title ownerId")
      .populate("invitedBy", "name avatar")
      .sort({ createdAt: -1 })
      .lean(),
    Application.find({ userId: uid, type: { $ne: "INVITATION" } })
      .populate("projectId", "title")
      .sort({ createdAt: -1 })
      .lean(),
    getUserActiveMilestones(uid.toString()),
    getUserQuotaSummary(uid.toString()),
  ]);

  const teamCounts: Record<string, number> = {};
  for (const p of ownedProjects) {
    teamCounts[(p as any)._id.toString()] = await TeamMember.countDocuments({ projectId: (p as any)._id });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {quotaSummary.isTrialActive ? (
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold gap-1 text-xs py-0.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> 30-Day Free Trial ({quotaSummary.trialDaysRemaining}d left)
              </Badge>
            ) : quotaSummary.isPro ? (
              <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold gap-1 text-xs py-0.5 shadow-sm">
                <Crown className="w-3.5 h-3.5" /> Pro Plan
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground font-medium">
                Community Tier
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">Welcome back, {user.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pricing">
            <Button size="sm" variant={quotaSummary.isTrialActive ? "outline" : "default"} className="gap-1.5 font-semibold text-xs shadow-sm">
              <Crown className="w-3.5 h-3.5 text-amber-500" /> View Plans & Pricing
            </Button>
          </Link>
          <Link href="/projects/new"><Button size="sm" variant="outline">+ New Project</Button></Link>
          <Link href={`/profile/${uid}`}><Button variant="ghost" size="sm">Profile</Button></Link>
        </div>
      </div>

      {/* Monthly Quota & Limits Meter */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-card/60 backdrop-blur-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              {quotaSummary.isTrialActive ? "30-Day All-Access Free Trial (All Pro Features Unlocked)" : "Monthly AI Quota & Account Limits"}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {quotaSummary.isTrialActive ? `${quotaSummary.trialDaysRemaining} days remaining in trial (paid plans activate after trial)` : `Quota resets on ${new Date(quotaSummary.resetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Active Projects */}
          <div className="p-3 rounded-xl border bg-background/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Active Projects</span>
              <span className="font-bold text-foreground">{quotaSummary.activeProjects.current}/{quotaSummary.activeProjects.limit}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${quotaSummary.activeProjects.percentage}%` }} />
            </div>
          </div>

          {/* AI Validations */}
          <div className="p-3 rounded-xl border bg-background/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>AI Validations</span>
              <span className="font-bold text-foreground">{quotaSummary.ideaValidations.current}/{quotaSummary.ideaValidations.limit}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${quotaSummary.ideaValidations.percentage}%` }} />
            </div>
          </div>

          {/* PRD Generations */}
          <div className="p-3 rounded-xl border bg-background/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Living PRDs</span>
              <span className="font-bold text-foreground">{quotaSummary.prdGenerations.current}/{quotaSummary.prdGenerations.limit}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${quotaSummary.prdGenerations.percentage}%` }} />
            </div>
          </div>

          {/* Sprint Milestones */}
          <div className="p-3 rounded-xl border bg-background/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Sprint Milestones</span>
              <span className="font-bold text-foreground">{quotaSummary.milestoneGenerations.current}/{quotaSummary.milestoneGenerations.limit}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${quotaSummary.milestoneGenerations.percentage}%` }} />
            </div>
          </div>
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

      {activeMilestones.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Active Project Sprints & Milestones ({activeMilestones.length})</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {(activeMilestones as any[]).map((m) => (
              <Link key={m._id.toString()} href={`/projects/${m.projectId._id}`}>
                <div className="p-4 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-primary truncate max-w-[200px]">
                      {m.projectId.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      Sprint {m.order} · {m.progress}%
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">{m.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{m.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{m.deliverables?.filter((d: any) => d.completed).length || 0}/{m.deliverables?.length || 0} Deliverables Done</span>
                      <span className="text-primary font-medium flex items-center gap-0.5">
                        Track Roadmap <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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

      {receivedInvitations.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MailOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Team Invitations ({receivedInvitations.length})</h2>
          </div>
          <div className="space-y-3">
            {(receivedInvitations as any[]).map((inv) => (
              <InvitationCard
                key={inv._id.toString()}
                invite={{
                  id: inv._id.toString(),
                  projectId: inv.projectId._id.toString(),
                  projectTitle: inv.projectId.title,
                  message: inv.message,
                  roleRequested: inv.roleRequested,
                  status: inv.status,
                  invitedByName: inv.invitedBy?.name || "Project Owner",
                  invitedByAvatar: inv.invitedBy?.avatar,
                  createdAt: inv.createdAt,
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Submitted Applications ({submittedApplications.length})</h2>
        {submittedApplications.length === 0 ? (
          <p className="text-muted-foreground text-sm">No applications submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {(submittedApplications as any[]).map((a) => (
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
