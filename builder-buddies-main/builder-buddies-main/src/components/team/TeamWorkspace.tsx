import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  useProject, useCurrentProfile, useIsTeamMember, useMessages, useNotes,
  useTasks, useProfiles, useSendMessage, useCreateNote, useUpdateNote,
  useCreateTask, useUpdateTaskStatus, useLeaveTeam, timeAgo, formatBytes,
} from "@/lib/api";
import type { TaskStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Plus, Paperclip, X, FileText, Image as ImageIcon, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TABS = ["Chat", "Notes", "Tasks"] as const;
type Tab = (typeof TABS)[number];

export function TeamWorkspace({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);
  const { data: me } = useCurrentProfile();
  const { data: allowed, isLoading } = useIsTeamMember(projectId, me?.id);
  const leave = useLeaveTeam();
  const [tab, setTab] = useState<Tab>("Chat");

  if (!project) return null;
  if (isLoading) return <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!allowed) return (
    <div className="rounded-xl border border-dashed border-border p-12 text-center">
      <p className="text-muted-foreground">You're not a member of this team yet.</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/projects/$id" params={{ id: projectId }}>Back to project</Link></Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link to="/projects/$id" params={{ id: projectId }} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to project</Link>
          <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
          <p className="text-sm text-muted-foreground">Team workspace</p>
        </div>
        <Button variant="outline" size="sm" onClick={async () => {
          if (!me || !confirm("Leave team?")) return;
          await leave.mutateAsync({ projectId, userId: me.id });
          toast.success("Left team");
        }}>Leave team</Button>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "Chat" && <TeamChat projectId={projectId} />}
      {tab === "Notes" && <TeamNotes projectId={projectId} />}
      {tab === "Tasks" && <TeamTasks projectId={projectId} />}
    </div>
  );
}

function TeamChat({ projectId }: { projectId: string }) {
  const { data: me } = useCurrentProfile();
  const { data: messages } = useMessages(projectId);
  const senderIds = messages?.map((m) => m.sender_id) ?? [];
  const { data: senders } = useProfiles(senderIds);
  const send = useSendMessage();

  const [val, setVal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages?.length]);

  const onSend = async () => {
    if (!me || (!val.trim() && !file)) return;
    try {
      await send.mutateAsync({ projectId, senderId: me.id, content: val.trim(), file });
      setVal(""); setFile(null);
      if (fileInput.current) fileInput.current.value = "";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(!messages || messages.length === 0) && (
          <p className="text-center text-sm text-muted-foreground py-12">No messages yet. Say hi 👋</p>
        )}
        {messages?.map((m) => {
          const u = senders?.find((x) => x.id === m.sender_id);
          const isImage = m.attachment_type?.startsWith("image/");
          return (
            <div key={m.id} className="flex gap-3">
              <Avatar className="h-8 w-8"><AvatarImage src={u?.avatar ?? undefined} /><AvatarFallback>{u?.name?.charAt(0) ?? "?"}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm">{u?.name ?? "…"}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(m.created_at)}</span>
                </div>
                {m.content && <p className="text-sm mt-0.5 text-foreground/90 whitespace-pre-wrap break-words">{m.content}</p>}
                {m.attachment_url && (
                  <div className="mt-2 max-w-sm">
                    {isImage ? (
                      <a href={m.attachment_url} target="_blank" rel="noreferrer" className="block">
                        <img src={m.attachment_url} alt={m.attachment_name ?? ""} className="rounded-lg border border-border max-h-64 object-cover" />
                      </a>
                    ) : (
                      <a href={m.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:bg-accent transition-colors">
                        <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary"><FileText className="h-4 w-4" /></span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{m.attachment_name}</p>
                          <p className="text-xs text-muted-foreground">{m.attachment_size ? formatBytes(m.attachment_size) : ""}</p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {file && (
        <div className="border-t border-border px-3 py-2 flex items-center gap-2 text-sm bg-accent/30">
          {file.type.startsWith("image/") ? <ImageIcon className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
          <span className="flex-1 truncate">{file.name}</span>
          <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
          <button onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ""; }} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="border-t border-border p-3 flex gap-2 items-center">
        <input ref={fileInput} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size > 20 * 1024 * 1024) { toast.error("Max 20MB"); return; } setFile(f ?? null); }} />
        <Button variant="ghost" size="icon" onClick={() => fileInput.current?.click()} disabled={send.isPending}><Paperclip className="h-4 w-4" /></Button>
        <Input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }} placeholder="Message your team…" disabled={send.isPending} />
        <Button onClick={onSend} size="icon" disabled={send.isPending || (!val.trim() && !file)}>
          {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function TeamNotes({ projectId }: { projectId: string }) {
  const { data: me } = useCurrentProfile();
  const { data: notes } = useNotes(projectId);
  const authorIds = notes?.map((n) => n.created_by) ?? [];
  const { data: authors } = useProfiles(authorIds);
  const create = useCreateNote();
  const update = useUpdateNote();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", content: "" });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" disabled={!me || create.isPending} onClick={() => create.mutate({ projectId, createdBy: me!.id })}>
          <Plus className="h-3.5 w-3.5" /> New note
        </Button>
      </div>
      {(!notes || notes.length === 0) && <p className="text-center text-sm text-muted-foreground py-12">No notes yet.</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {notes?.map((n) => {
          const u = authors?.find((x) => x.id === n.created_by);
          const isEditing = editing === n.id;
          return (
            <div key={n.id} className="rounded-xl border border-border bg-card p-5">
              {isEditing ? (
                <div className="space-y-3">
                  <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                  <Textarea rows={6} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={async () => { await update.mutateAsync({ id: n.id, projectId, title: draft.title, content: draft.content }); setEditing(null); }}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button className="text-left w-full" onClick={() => { setEditing(n.id); setDraft({ title: n.title, content: n.content }); }}>
                  <h3 className="font-semibold">{n.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-4 whitespace-pre-line">{n.content || "Empty note — click to edit"}</p>
                  <p className="mt-3 text-xs text-muted-foreground">By {u?.name ?? "…"} · edited {timeAgo(n.updated_at)}</p>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamTasks({ projectId }: { projectId: string }) {
  const { data: tasks } = useTasks(projectId);
  const create = useCreateTask();
  const update = useUpdateTaskStatus();
  const [val, setVal] = useState("");
  const columns: { key: TaskStatus; label: string }[] = [
    { key: "TODO", label: "To do" },
    { key: "IN_PROGRESS", label: "In progress" },
    { key: "DONE", label: "Done" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { create.mutate({ projectId, title: val.trim() }); setVal(""); } }} placeholder="Add a task and press Enter…" />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.key} className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold flex items-center justify-between mb-3">{col.label} <span className="text-xs text-muted-foreground font-normal">{tasks?.filter((t) => t.status === col.key).length ?? 0}</span></h3>
            <div className="space-y-2">
              {tasks?.filter((t) => t.status === col.key).map((t) => (
                <div key={t.id} className="rounded-lg border border-border bg-background p-3 text-sm">
                  <p>{t.title}</p>
                  <div className="mt-2 flex items-center justify-end gap-1">
                    {col.key !== "TODO" && <button onClick={() => update.mutate({ id: t.id, projectId, status: col.key === "DONE" ? "IN_PROGRESS" : "TODO" })} className="text-xs text-muted-foreground hover:text-foreground px-1">←</button>}
                    {col.key !== "DONE" && <button onClick={() => update.mutate({ id: t.id, projectId, status: col.key === "TODO" ? "IN_PROGRESS" : "DONE" })} className="text-xs text-muted-foreground hover:text-foreground px-1">→</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
