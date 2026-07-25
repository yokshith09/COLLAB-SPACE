import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  useProject, useProfile, useTeam, useApplications, useProfiles,
  useSession, useCurrentProfile, useIsTeamMember,
  useApply, useUpdateApplicationStatus, timeAgo,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Check, Copy, Lock, Users, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useProject(projectId);
  const session = useSession();
  const { data: currentProfile } = useCurrentProfile();
  const { data: owner } = useProfile(project?.owner_id);
  const { data: team } = useTeam(projectId);
  const { data: apps } = useApplications(projectId);
  const { data: isMember } = useIsTeamMember(projectId, currentProfile?.id);

  const applicantIds = apps?.filter((a) => a.status === "PENDING").map((a) => a.user_id) ?? [];
  const { data: applicants } = useProfiles(applicantIds);
  const teamMemberIds = team?.map((t) => t.user_id) ?? [];
  const { data: teamProfiles } = useProfiles(teamMemberIds);

  const apply = useApply();
  const updateApp = useUpdateApplicationStatus();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  if (isLoading) return <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!project) return <p className="text-muted-foreground">Project not found.</p>;

  const isOwner = currentProfile?.id === project.owner_id;
  const myApp = apps?.find((a) => a.user_id === currentProfile?.id);
  const pendingApps = apps?.filter((a) => a.status === "PENDING") ?? [];
  const teamCount = team?.length ?? 0;

  const handleApply = async () => {
    if (!currentProfile) return;
    try {
      await apply.mutateAsync({ projectId, userId: currentProfile.id, message: msg });
      toast.success("Application sent!");
      setOpen(false); setMsg("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to apply");
    }
  };

  const handleDecision = async (id: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      await updateApp.mutateAsync({ id, status, projectId });
      toast.success(status === "ACCEPTED" ? "Accepted" : "Declined");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      <div className="space-y-8 min-w-0">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline">{project.domain}</Badge>
            <Badge>{project.status}</Badge>
            {project.is_private && <Badge variant="secondary"><Lock className="h-3 w-3" /> Private</Badge>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{project.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {owner && (
              <Link to="/profile/$id" params={{ id: owner.id }} className="flex items-center gap-2 hover:text-foreground">
                <Avatar className="h-6 w-6"><AvatarImage src={owner.avatar ?? undefined} /><AvatarFallback>{owner.name.charAt(0)}</AvatarFallback></Avatar>
                {owner.name}
              </Link>
            )}
            <span>· Posted {timeAgo(project.created_at)}</span>
            {project.deadline && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {new Date(project.deadline).toLocaleDateString()}</span>}
          </div>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{project.description}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">The problem</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{project.problem_statement}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Required skills</h2>
          <div className="flex flex-wrap gap-2">
            {project.required_skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
          </div>
        </section>

        {isOwner && pendingApps.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Applications ({pendingApps.length})</h2>
            <div className="space-y-3">
              {pendingApps.map((a) => {
                const u = applicants?.find((p) => p.id === a.user_id);
                return (
                  <div key={a.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <Avatar><AvatarImage src={u?.avatar ?? undefined} /><AvatarFallback>{u?.name?.charAt(0) ?? "?"}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          {u && <Link to="/profile/$id" params={{ id: u.id }} className="font-medium hover:text-primary">{u.name}</Link>}
                          <span className="text-xs text-muted-foreground">{timeAgo(a.created_at)}</span>
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground">{a.message}</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" onClick={() => handleDecision(a.id, "ACCEPTED")}><Check className="h-3.5 w-3.5" /> Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => handleDecision(a.id, "REJECTED")}><X className="h-3.5 w-3.5" /> Decline</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-5">
          {!session ? (
            <Button className="w-full" onClick={() => navigate({ to: "/auth" })}>Sign in to apply</Button>
          ) : isMember ? (
            <Button asChild className="w-full"><Link to="/team/$id" params={{ id: project.id }}>Open team workspace</Link></Button>
          ) : myApp ? (
            <div className="text-center">
              <Badge variant={myApp.status === "PENDING" ? "secondary" : myApp.status === "ACCEPTED" ? "default" : "destructive"}>
                Application {myApp.status.toLowerCase()}
              </Badge>
              <p className="mt-2 text-xs text-muted-foreground">Sent {timeAgo(myApp.created_at)}</p>
            </div>
          ) : project.status === "OPEN" ? (
            <Button className="w-full" onClick={() => setOpen(true)}>Apply to join</Button>
          ) : (
            <Button className="w-full" disabled>Not accepting</Button>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold flex items-center justify-between">
            Team <span className="text-xs text-muted-foreground">{teamCount}/{project.team_size_max}</span>
          </h3>
          <div className="mt-3 space-y-2">
            {team?.map((t) => {
              const u = teamProfiles?.find((p) => p.id === t.user_id);
              return u ? (
                <Link key={t.id} to="/profile/$id" params={{ id: u.id }} className="flex items-center gap-2 text-sm hover:text-primary">
                  <Avatar className="h-7 w-7"><AvatarImage src={u.avatar ?? undefined} /><AvatarFallback>{u.name.charAt(0)}</AvatarFallback></Avatar>
                  <span className="flex-1 truncate">{u.name}</span>
                  <span className="text-xs text-muted-foreground">{t.role}</span>
                </Link>
              ) : null;
            })}
            {Array.from({ length: Math.max(0, project.team_size_max - teamCount) }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-7 w-7 rounded-full border border-dashed border-border grid place-items-center"><Users className="h-3 w-3" /></div>
                <span className="italic">Open seat</span>
              </div>
            ))}
          </div>
        </div>

        {project.is_private && project.invite_code && isOwner && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Invite link</h3>
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/invite/${project.invite_code}`); toast.success("Copied!"); }}
              className="mt-2 w-full flex items-center gap-2 text-xs font-mono bg-muted px-3 py-2 rounded-md hover:bg-accent"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
        )}
      </aside>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply to {project.title}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="msg">Why are you a great fit? (50–500 chars)</Label>
            <Textarea id="msg" rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Tell the owner why you'd be a great teammate…" />
            <p className="text-xs text-muted-foreground">{msg.length}/500</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={msg.length < 50 || msg.length > 500 || apply.isPending} onClick={handleApply}>
              {apply.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Send application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
