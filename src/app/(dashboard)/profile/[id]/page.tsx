import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User, Project, TeamMember } from "@/lib/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Globe, Link as LinkIcon, Edit, Award } from "lucide-react";
import Link from "next/link";
import { ActivityHeatmap } from "@/components/profile/activity-heatmap";
import { ProfileSkills } from "@/components/profile/profile-skills";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  await connectDB();

  let sessionUser: any = null;
  if (session?.user?.email) {
    sessionUser = await User.findOne({ email: session.user.email }).lean();
  }

  const user = await User.findById(id).lean();
  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">User not found.</p>
        <Link href="/" className="text-primary text-sm hover:underline mt-2 inline-block">Back to Home</Link>
      </div>
    );
  }
  const u = user as any;
  const isOwnProfile = sessionUser?._id?.toString() === id;

  const [ownedProjects, membershipsRaw] = await Promise.all([
    Project.find({ ownerId: u._id }).sort({ createdAt: -1 }).lean(),
    TeamMember.find({ userId: u._id }).lean(),
  ]);

  const memberProjectIds = membershipsRaw.map((m: any) => m.projectId);
  
  const allInvolvedProjects = await Project.find({
    $or: [{ ownerId: u._id }, { _id: { $in: memberProjectIds } }]
  }).sort({ createdAt: -1 }).lean();

  const portfolioProjects = allInvolvedProjects.filter((p: any) => p.status === "COMPLETED");
  const activeOwned = allInvolvedProjects.filter((p: any) => p.status !== "COMPLETED" && p.ownerId.toString() === u._id.toString());
  const activeMemberships = allInvolvedProjects.filter((p: any) => p.status !== "COMPLETED" && p.ownerId.toString() !== u._id.toString());

  let canEndorse = false;
  if (!isOwnProfile && sessionUser) {
    const sessionUserTeams = await TeamMember.find({ userId: sessionUser._id }).lean();
    const sessionProjectIds = new Set(sessionUserTeams.map((t: any) => t.projectId.toString()));
    const sessionOwned = await Project.find({ ownerId: sessionUser._id }).select("_id").lean();
    sessionOwned.forEach((p: any) => sessionProjectIds.add(p._id.toString()));
    
    canEndorse = allInvolvedProjects.some((p: any) => sessionProjectIds.has(p._id.toString()));
  }

  const teamCounts: Record<string, number> = {};
  for (const p of activeOwned) {
    teamCounts[(p as any)._id.toString()] = await TeamMember.countDocuments({ projectId: (p as any)._id });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Profile Header */}
      <div className="relative pt-12 pb-6 px-8 rounded-3xl border bg-card overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent -z-10" />
        <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={u.avatar || ""} />
            <AvatarFallback className="text-3xl bg-primary/10 text-primary">{u.name[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-4 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{u.name}</h1>
                  {u.points > 0 && (
                    <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-500/20 shadow-sm">
                      <Award className="w-4 h-4" />
                      {u.points} pts
                    </div>
                  )}
                </div>
                {u.bio && <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">{u.bio}</p>}
              </div>
              {isOwnProfile && (
                <Link href="/profile/edit">
                  <button className="flex items-center gap-2 text-sm font-medium bg-primary/10 text-primary px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
                    <Edit className="h-4 w-4" /> Edit Profile
                  </button>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              {u.githubUrl && (
                <a href={u.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="h-4 w-4" /> GitHub
                </a>
              )}
              {u.linkedinUrl && (
                <a href={u.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <LinkIcon className="h-4 w-4" /> LinkedIn
                </a>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <ProfileSkills 
                userId={id} 
                skills={u.skills ?? []} 
                endorsements={u.endorsements ?? []} 
                currentUserId={sessionUser?._id?.toString()} 
                canEndorse={canEndorse} 
              />
              {(u.domains ?? []).map((d: string) => <Badge key={d} variant="outline" className="px-3 py-1 font-medium border-primary/20 text-primary/80">{d}</Badge>)}
              {(u.badges ?? []).map((b: string) => (
                <Badge key={b} variant="default" className="px-3 py-1 font-medium bg-primary text-primary-foreground shadow-sm">
                  <Award className="w-3 h-3 mr-1" />
                  {b}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ActivityHeatmap userId={u._id.toString()} />

      {portfolioProjects.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span className="bg-primary/10 text-primary p-2 rounded-lg">✨</span>
            Portfolio Showcase
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioProjects.map((p: any) => (
              <Link key={p._id.toString()} href={`/projects/${p._id}`}>
                <div className="rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                  {p.gallery?.length > 0 ? (
                    <img src={p.gallery[0]} alt={p.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-muted/50 flex items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                       <span className="font-semibold text-xl text-muted-foreground/50">{p.title[0]}</span>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">{p.description}</p>
                    <div className="mt-4 flex items-center gap-3">
                      {p.githubUrl && <Badge variant="secondary" className="text-xs"><Globe className="w-3 h-3 mr-1"/> Code</Badge>}
                      {p.demoUrl && <Badge variant="secondary" className="text-xs"><LinkIcon className="w-3 h-3 mr-1"/> Demo</Badge>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Active Projects</h2>
          {activeOwned.length === 0 ? <p className="text-sm text-muted-foreground italic">No active projects being led.</p> : (
            <div className="space-y-3">
              {(activeOwned as any[]).map((p) => (
                <Link key={p._id.toString()} href={`/projects/${p._id}`}>
                  <div className="p-4 rounded-xl border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group flex justify-between items-center">
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{teamCounts[p._id.toString()] ?? 0}/{p.teamSizeMax} members</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Team Memberships</h2>
          {activeMemberships.length === 0 ? <p className="text-sm text-muted-foreground italic">Not currently on any teams.</p> : (
            <div className="space-y-3">
              {(activeMemberships as any[]).map((p) => (
                <Link key={p._id.toString()} href={`/projects/${p._id}`}>
                  <div className="p-4 rounded-xl border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group flex justify-between items-center">
                    <p className="font-medium group-hover:text-primary transition-colors">{p.title}</p>
                    <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
