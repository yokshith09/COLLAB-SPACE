import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { Globe, Link as LinkIcon, Edit } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { userId } = await auth();
  const clerkUser = await currentUser();

  let dbUser = null;
  if (userId && clerkUser) {
    dbUser = await safeDbQuery(
      () => prisma.user.findUnique({ where: { clerkId: userId } }),
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

  const isOwnProfile = dbUser?.id === id;

  const user = await safeDbQuery(
    () =>
      prisma.user.findUnique({
        where: { id },
        include: {
          skills: true,
          domains: true,
          projectsOwned: {
            include: { team: true },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          teams: {
            include: { project: { select: { title: true, id: true } } },
            orderBy: { joinedAt: "desc" },
          },
        },
      }),
    null
  );

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">User not found or database unavailable.</p>
        <Link href="/" className="text-primary text-sm hover:underline mt-2 inline-block">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <Avatar className="h-20 w-20 border-2 border-border">
          <AvatarImage src={user.avatar || ""} />
          <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="space-y-3 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {user.bio && <p className="text-muted-foreground mt-1">{user.bio}</p>}
            </div>
            {isOwnProfile && (
              <Link href="/profile/edit">
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user.githubUrl && (
              <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            )}
            {user.linkedinUrl && (
              <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <LinkIcon className="h-5 w-5" />
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((s) => (
              <Badge key={s.id} variant="secondary" className="font-normal">{s.name}</Badge>
            ))}
            {user.domains.map((d) => (
              <Badge key={d.id} variant="outline" className="font-normal">{d.name}</Badge>
            ))}
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">Projects ({user.projectsOwned.length})</h2>
        {user.projectsOwned.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {user.projectsOwned.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-all group">
                  <p className="font-semibold group-hover:text-primary transition-colors">{p.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{p.team.length}/{p.teamSizeMax} members</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Team Memberships ({user.teams.length})</h2>
        {user.teams.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not on any teams.</p>
        ) : (
          <div className="space-y-2">
            {user.teams.map((t) => (
              <Link key={t.id} href={`/projects/${t.project.id}`}>
                <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-all group">
                  <p className="font-medium group-hover:text-primary transition-colors">{t.project.title}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}