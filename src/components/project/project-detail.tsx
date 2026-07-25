"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHealthStatus, daysLeft, timeAgo } from "@/lib/utils";
import { applyToProject } from "@/actions/project";
import { respondToApplication } from "@/actions/application";
import Link from "next/link";
import { Users, Calendar, Clock, MessageSquare, ExternalLink } from "lucide-react";

interface ProjectDetailProps {
  project: any;
  isOwner: boolean;
  isMember: boolean;
  userApplication: any;
  allApplications: any[];
  currentUser: any;
}

export function ProjectDetail({ project, isOwner, isMember, userApplication, allApplications, currentUser }: ProjectDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applying, setApplying] = useState(false);

  const health = getHealthStatus(project.owner.lastLoginAt);

  const statusStyles: Record<string, string> = {
    OPEN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    FULL: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    ACTIVE: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    COMPLETED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  };

  const canApply = project.status === "OPEN" && !isOwner && !isMember && !userApplication;

  async function handleApply() {
    if (!currentUser) { router.push("/sign-in"); return; }
    if (!applyMessage.trim()) { toast({ title: "Please write a message", variant: "destructive" }); return; }

    setApplying(true);
    const result = await applyToProject(project.id, applyMessage);
    setApplying(false);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Application submitted!", description: "The admin will review your application." });
      setApplyOpen(false);
      router.refresh();
    }
  }

  async function handleRespond(appId: string, status: "ACCEPTED" | "REJECTED") {
    const result = await respondToApplication(appId, status);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: status === "ACCEPTED" ? "Applicant accepted!" : "Application rejected" });
      router.refresh();
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[project.status] || ""}`}>
              {project.status}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${health.textColor}`}>
              {health.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Badge variant="secondary" className="font-normal">{project.domain}</Badge>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {project.team.length}/{project.teamSizeMax}</span>
            {project.deadline && (
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {daysLeft(project.deadline)}</span>
            )}
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {timeAgo(project.createdAt)}</span>
            <Link href={`/profile/${project.owner.id}`} className="flex items-center gap-1 hover:text-foreground">
              by {project.owner.name}
            </Link>
          </div>
        </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {canApply && (
              <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                <DialogTrigger asChild>
                  <Button>Apply to Join</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply to {project.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Tell the admin about your relevant experience and why you're a good fit..."
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Applications expire in 7 days if not reviewed. Max 5 applications per day.
                    </p>
                    <Button onClick={handleApply} disabled={applying} className="w-full">
                      {applying ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {isMember && (
              <Link href={`/team/${project.id}`}>
                <Button variant="secondary" className="gap-1.5">
                  <MessageSquare className="h-4 w-4" /> Team Workspace
                </Button>
              </Link>
            )}

            {isOwner && (
              <Link href={`/projects/${project.id}/settings`}>                <Button variant="outline" className="gap-1.5">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 15a4 4 0 100-8 4 4 0 000 8z" />
                    <path d="M12 15v2m-6-4h12m-6-8v2m-6 4h12" />
                  </svg>
                  Settings
                </Button>
              </Link>
            )}
          </div>
      </div>

      {userApplication && !isMember && (
        <div className="p-4 rounded-xl border bg-muted/30">
          <p className="text-sm font-medium">
            Your application: <span className="text-primary">{userApplication.status}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Expires {daysLeft(userApplication.expiresAt)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-6">
          <section className="space-y-2">
            <h2 className="font-semibold">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{project.description}</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">Problem Statement</h2>
            <p className="text-muted-foreground leading-relaxed">{project.problemStatement}</p>
          </section>

          {project.requiredSkills?.length > 0 && (
            <section className="space-y-2">
              <h2 className="font-semibold">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map((s: string) => (
                  <Badge key={s} variant="outline" className="font-normal">{s}</Badge>
                ))}
              </div>
            </section>
          )}

          {isOwner && allApplications.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold">Applications ({allApplications.length})</h2>
              {allApplications.map((app: any) => (
                <div key={app.id} className="p-4 rounded-xl border space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={app.user.avatar || ""} />
                      <AvatarFallback>{app.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{app.user.name}</p>
                        {app.user.githubUrl && (
                          <a href={app.user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{timeAgo(app.createdAt)}</p>
                    </div>
                    <Badge variant={app.status === "PENDING" ? "secondary" : app.status === "ACCEPTED" ? "default" : "destructive"}>
                      {app.status}
                    </Badge>
                  </div>
                  {app.message && (
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{app.message}</p>
                  )}
                  {app.user.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {app.user.skills.map((s: any) => (
                        <Badge key={s.name} variant="outline" className="text-xs font-normal">{s.name}</Badge>
                      ))}
                    </div>
                  )}
                  {app.status === "PENDING" && (
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={() => handleRespond(app.id, "ACCEPTED")}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => handleRespond(app.id, "REJECTED")}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border space-y-3">
            <h3 className="font-semibold text-sm">Team ({project.team.length}/{project.teamSizeMax})</h3>
            {project.team.map((m: any) => (
              <div key={m.id} className="flex items-center gap-2.5">
                <Link href={`/profile/${m.user.id}`}>
                  <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity">
                    <AvatarImage src={m.user.avatar || ""} />
                    <AvatarFallback className="text-xs">{m.user.name[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.user.name}</p>
                  <p className="text-xs text-muted-foreground">{m.role === "admin" ? "Admin" : "Member"}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border space-y-2">
            <h3 className="font-semibold text-sm">Admin Health</h3>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${health.color}`} />
              <span className="text-sm font-medium">{health.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last active {timeAgo(project.owner.lastLoginAt)}
            </p>
          </div>

          {project.inviteCode && isOwner && (
            <div className="p-4 rounded-xl border space-y-2">
              <h3 className="font-semibold text-sm">Invite Link</h3>
              <p className="text-xs text-muted-foreground break-all select-all">
                {typeof window !== "undefined" && `${window.location.origin}/invite/${project.inviteCode}`}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(`${window.location.origin}/invite/${project.inviteCode}`);
                    toast({ title: "Copied to clipboard!" });
                  }
                }}
              >
                Copy Invite Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
