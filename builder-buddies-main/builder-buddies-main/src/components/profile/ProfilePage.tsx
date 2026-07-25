import { useProfile, useProjects, useSession } from "@/lib/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Github, Linkedin, Loader2 } from "lucide-react";

export function ProfilePage({ userId }: { userId: string }) {
  const { data: user, isLoading } = useProfile(userId);
  const session = useSession();
  const { data: projects } = useProjects();
  const userProjects = projects?.filter((p) => p.owner_id === userId && !p.is_private) ?? [];

  if (isLoading) return <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!user) return <p className="text-muted-foreground">User not found.</p>;
  const isMe = session?.user.id === userId;

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Avatar className="h-24 w-24"><AvatarImage src={user.avatar ?? undefined} /><AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback></Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
          {user.email && <p className="text-muted-foreground">{user.email}</p>}
          <p className="text-xs text-muted-foreground mt-1">Joined {new Date(user.created_at).toLocaleDateString()}</p>
          {user.bio && <p className="mt-4 text-sm max-w-2xl">{user.bio}</p>}
          <div className="mt-4 flex items-center gap-3">
            {user.github_url && <a href={user.github_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><Github className="h-4 w-4" /></a>}
            {user.linkedin_url && <a href={user.linkedin_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-4 w-4" /></a>}
            {isMe && <Button size="sm" variant="outline" disabled>Edit profile</Button>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.length === 0 ? <p className="text-sm text-muted-foreground">No skills added.</p> : user.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Domains</h2>
          <div className="flex flex-wrap gap-2">
            {user.domains.length === 0 ? <p className="text-sm text-muted-foreground">No domains added.</p> : user.domains.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        {userProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No public projects yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{userProjects.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        )}
      </section>
    </div>
  );
}
