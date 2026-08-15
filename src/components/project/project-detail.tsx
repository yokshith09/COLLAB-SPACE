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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/shared/file-upload";
import { getHealthStatus, daysLeft, timeAgo } from "@/lib/utils";
import { applyToProject } from "@/actions/project";
import { respondToApplication, sendApplicationMessage } from "@/actions/application";
import { updateProjectShowcase } from "@/actions/project";
import Link from "next/link";
import { Users, Calendar, Clock, MessageSquare, ExternalLink, Share2, Code, LayoutTemplate, Pencil, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ProjectDetailProps {
  project: any;
  isOwner: boolean;
  isMember: boolean;
  userApplication: any;
  allApplications: any[];
  currentUser: any;
  recommendedUsers?: any[];
}

export function ProjectDetail({ project, isOwner, isMember, userApplication, allApplications, currentUser, recommendedUsers = [] }: ProjectDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [roleRequested, setRoleRequested] = useState("");
  const [availability, setAvailability] = useState("");
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [msgContent, setMsgContent] = useState<Record<string, string>>({});
  const [sendingMsg, setSendingMsg] = useState<Record<string, boolean>>({});

  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState(project.githubUrl || "");
  const [demoUrl, setDemoUrl] = useState(project.demoUrl || "");
  const [updatingShowcase, setUpdatingShowcase] = useState(false);

  const health = getHealthStatus(project.owner.lastLoginAt);

  async function handleUpdateShowcase() {
    setUpdatingShowcase(true);
    const res = await updateProjectShowcase(project.id, { githubUrl, demoUrl });
    setUpdatingShowcase(false);
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    } else {
      toast({ title: "Showcase updated!" });
      setShowcaseOpen(false);
      router.refresh();
    }
  }

  async function handleSendMsg(appId: string) {
    const content = msgContent[appId];
    if (!content?.trim()) return;

    setSendingMsg((prev) => ({ ...prev, [appId]: true }));
    const result = await sendApplicationMessage(appId, content);
    setSendingMsg((prev) => ({ ...prev, [appId]: false }));

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      setMsgContent((prev) => ({ ...prev, [appId]: "" }));
      router.refresh();
    }
  }

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
    const result = await applyToProject(project.id, applyMessage, roleRequested, availability, resumePreview || undefined);
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
          {project.status === "COMPLETED" && isOwner && (
            <Dialog open={showcaseOpen} onOpenChange={setShowcaseOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-1.5 border-primary text-primary hover:bg-primary/10">
                  <Pencil className="h-4 w-4" /> Edit Showcase
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Project Showcase</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input placeholder="https://github.com/..." value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Live Demo URL</Label>
                    <Input placeholder="https://..." value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
                  </div>
                  <Button onClick={handleUpdateShowcase} disabled={updatingShowcase} className="w-full">
                    {updatingShowcase ? "Saving..." : "Save Showcase"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button
            variant="outline"
              className="gap-1.5"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Link copied to clipboard!" });
                }
              }}
            >
              <Share2 className="h-4 w-4" /> Share
            </Button>
            {canApply && (
              !currentUser ? (
                <Button onClick={() => router.push("/sign-in")}>Apply to Join</Button>
              ) : (
                <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                  <DialogTrigger asChild>
                    <Button>Apply to Join</Button>
                  </DialogTrigger>
                  <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply to {project.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input type="text" placeholder="Role (e.g. Frontend Dev)" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={roleRequested} onChange={(e) => setRoleRequested(e.target.value)} />
                      <input type="text" placeholder="Availability (e.g. 10 hrs/wk)" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={availability} onChange={(e) => setAvailability(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Optional Resume</Label>
                      {resumePreview ? (
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <a href={resumePreview} target="_blank" rel="noopener noreferrer">View attached</a>
                          </Button>
                          <Button type="button" variant="destructive" size="sm" onClick={() => setResumePreview(null)}>Remove</Button>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <FileUpload
                            projectId="temp"
                            onUploadComplete={(url) => { setResumePreview(url); toast({ title: "Resume attached" }); }}
                            accept=".pdf,.doc,.docx,image/*"
                            maxSize={2 * 1024 * 1024}
                            buttonText="Upload Resume"
                          />
                        </div>
                      )}
                    </div>
                    <Textarea
                      placeholder="Tell the admin about your relevant experience and why you're a good fit..."
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Applications expire in 14 days if not reviewed. Max 5 applications per day.
                    </p>
                    <Button onClick={handleApply} disabled={applying} className="w-full">
                      {applying ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </DialogContent>
                </Dialog>
              )
            )}

            {isMember && (
              <Link href={`/team/${project.id}`}>
                <Button variant="secondary" className="gap-1.5">
                  <MessageSquare className="h-4 w-4" /> Team Workspace
                </Button>
              </Link>
            )}

            {isOwner && (
              <Link href={`/projects/${project.id}/settings`}>
                <Button variant="outline" className="gap-1.5">
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
        <div className="p-4 rounded-xl border bg-muted/30 space-y-4">
          <div>
            <p className="text-sm font-medium">
              Your application: <span className="text-primary">{userApplication.status}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Expires {daysLeft(userApplication.expiresAt)}
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-sm font-semibold">Messages</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {userApplication.messages?.map((m: any, i: number) => (
                <div key={i} className={`p-2 rounded-lg text-sm ${m.senderId === currentUser?.id ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                  <p>{m.content}</p>
                </div>
              ))}
              {!userApplication.messages?.length && <p className="text-xs text-muted-foreground">No messages yet.</p>}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Message admin..."
                value={msgContent[userApplication.id] || ""}
                onChange={(e) => setMsgContent({ ...msgContent, [userApplication.id]: e.target.value })}
                className="h-8 text-sm"
              />
              <Button size="sm" onClick={() => handleSendMsg(userApplication.id)} disabled={sendingMsg[userApplication.id]}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {project.status === "COMPLETED" && (project.githubUrl || project.demoUrl || project.gallery?.length > 0) && (
        <div className="p-6 rounded-xl border bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            Project Showcase
          </h2>
          <div className="flex flex-wrap gap-4">
            {project.githubUrl && (
              <Button asChild variant="outline" className="gap-2">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Code className="h-4 w-4" /> Source Code
                </a>
              </Button>
            )}
            {project.demoUrl && (
              <Button asChild className="gap-2">
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" /> Live Demo
                </a>
              </Button>
            )}
          </div>
          {project.gallery && project.gallery.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.gallery.map((img: string, idx: number) => (
                <img key={idx} src={img} alt="Showcase" className="w-full aspect-video object-cover rounded-lg border" />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-6">
          <section className="space-y-2">
            <h2 className="font-semibold">Description</h2>
            <div className="text-muted-foreground leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_a]:text-primary [&_a]:underline [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_p]:mb-2 [&_h3]:font-semibold space-y-1">
              <ReactMarkdown>{project.description}</ReactMarkdown>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">Problem Statement</h2>
            <div className="text-muted-foreground leading-relaxed [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_a]:text-primary [&_a]:underline [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_p]:mb-2 [&_h3]:font-semibold space-y-1">
              <ReactMarkdown>{project.problemStatement}</ReactMarkdown>
            </div>
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
                  {(app.roleRequested || app.availability) && (
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {app.roleRequested && <p><span className="font-semibold text-foreground">Role:</span> {app.roleRequested}</p>}
                      {app.availability && <p><span className="font-semibold text-foreground">Availability:</span> {app.availability}</p>}
                    </div>
                  )}
                  {app.resumeUrl && (
                    <div className="pt-1">
                      <Button variant="outline" size="sm" asChild>
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-2" /> View Resume
                        </a>
                      </Button>
                    </div>
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

                  <div className="pt-3 border-t mt-3 space-y-3">
                    <h4 className="text-sm font-semibold">Chat with Applicant</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {app.messages?.map((m: any, i: number) => (
                        <div key={i} className={`p-2 rounded-lg text-sm ${m.senderId === currentUser?.id ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                          <p className="text-xs font-medium mb-1 opacity-70">{m.senderName || (m.senderId === currentUser?.id ? "You" : "Them")}</p>
                          <p>{m.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={msgContent[app.id] || ""}
                        onChange={(e) => setMsgContent({ ...msgContent, [app.id]: e.target.value })}
                        className="h-8 text-sm"
                      />
                      <Button size="sm" onClick={() => handleSendMsg(app.id)} disabled={sendingMsg[app.id]}>
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}
          
          {isOwner && recommendedUsers && recommendedUsers.length > 0 && (
            <section className="space-y-3 mt-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">AI Recommended Candidates</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Users who match this project's required skills.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedUsers.map((user: any) => (
                  <div key={user.id} className="p-4 rounded-xl border bg-primary/5 hover:bg-primary/10 transition-colors flex items-start gap-3 relative overflow-hidden">
                    {user.matchScore && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" /> {user.matchScore} Match
                      </div>
                    )}
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarImage src={user.avatar || ""} />
                      <AvatarFallback className="bg-background text-primary">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 pr-8">
                      <Link href={`/profile/${user.id}`} className="font-semibold text-sm hover:underline hover:text-primary transition-colors">
                        {user.name}
                      </Link>
                      {user.bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{user.bio}</p>}
                      {user.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.skills.slice(0, 3).map((s: string) => (
                            <Badge key={s} variant="secondary" className="text-[9px] h-4 px-1.5">{s}</Badge>
                          ))}
                          {user.skills.length > 3 && <span className="text-[10px] text-muted-foreground pl-1">+{user.skills.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
