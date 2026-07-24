"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { timeAgo, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-client";
import { MessageSquare, FileText, CheckSquare, Send, Plus, Trash2, UserX } from "lucide-react";

export function TeamWorkspace({ project, currentUser }: { project: any; currentUser: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState(project.messages || []);
  const [newMessage, setNewMessage] = useState("");
  const [notes, setNotes] = useState(project.notes || []);
  const [tasks, setTasks] = useState(project.tasks || []);
  const [noteOpen, setNoteOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const chatEnd = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.id === project.owner?.id;

  useEffect(() => {
    const channel = supabase
      .channel(`project-${project.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "Message", filter: `projectId=eq.${project.id}` },
        (payload) => {
          const msg = payload.new as any;
          setMessages((prev: any[]) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [project.id]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage() {
    if (!newMessage.trim()) return;
    const res = await fetch("/api/teams/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, content: newMessage }),
    });
    if (res.ok) {
      setNewMessage("");
    } else {
      const data = await res.json();
      toast({ title: "Failed to send", description: data.error, variant: "destructive" });
    }
  }

  async function createNote() {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    const res = await fetch("/api/teams/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, title: noteTitle, content: noteContent }),
    });
    if (res.ok) {
      const note = await res.json();
      setNotes((prev: any[]) => [note, ...prev]);
      setNoteOpen(false);
      setNoteTitle("");
      setNoteContent("");
      toast({ title: "Note created" });
    }
  }

  async function createTask() {
    if (!taskTitle.trim()) return;
    const res = await fetch("/api/teams/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        title: taskTitle,
        description: taskDesc || null,
        assignedTo: taskAssignee || null,
        dueDate: taskDue || null,
      }),
    });
    if (res.ok) {
      const task = await res.json();
      setTasks((prev: any[]) => [task, ...prev]);
      setTaskOpen(false);
      setTaskTitle("");
      setTaskDesc("");
      setTaskAssignee("");
      setTaskDue("");
      toast({ title: "Task created" });
    }
  }

  async function updateTaskStatus(taskId: string, status: string) {
    const res = await fetch(`/api/teams/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setTasks((prev: any[]) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
    }
  }

  async function removeMember(userId: string) {
    const reason = prompt("Reason for removing this member:");
    if (!reason) return;
    const res = await fetch(`/api/teams/members/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, removalReason: reason }),
    });
    if (res.ok) {
      toast({ title: "Member removed" });
      router.refresh();
    }
  }

  const statusColumns = ["TODO", "IN_PROGRESS", "DONE"];

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{project.title}</h1>
          <span className="text-sm text-muted-foreground">Workspace</span>
        </div>
        <div className="flex items-center gap-1.5">
          {project.team.map((m: any) => (
            <div key={m.id} className="group relative">
              <Avatar className="h-7 w-7 border-2 border-background">
                <AvatarImage src={m.user.avatar || ""} />
                <AvatarFallback className="text-[10px]">{m.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {m.user.name} {m.role === "admin" ? "(Admin)" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="chat" className="gap-1.5"><MessageSquare className="h-4 w-4" /> Chat</TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5"><FileText className="h-4 w-4" /> Notes</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5"><CheckSquare className="h-4 w-4" /> Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 p-4 border rounded-xl bg-card mb-3">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground text-sm">No messages yet. Say hello!</p>
              </div>
            )}
            {messages.map((m: any) => {
              const sender = m.sender || project.team.find((t: any) => t.userId === m.senderId)?.user || { name: "Unknown", avatar: null };
              const isOwn = m.senderId === currentUser.id;
              return (
                <div key={m.id} className={cn("flex gap-2", isOwn && "justify-end")}>
                  {!isOwn && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={sender.avatar || ""} />
                      <AvatarFallback className="text-xs">{sender.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-[75%] space-y-0.5", isOwn && "items-end flex flex-col")}>
                    {!isOwn && <p className="text-xs text-muted-foreground px-1">{sender.name}</p>}
                    <div className={cn("px-3.5 py-2 rounded-2xl text-sm", isOwn ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {m.content}
                    </div>
                    <p className="text-[10px] text-muted-foreground px-1">{timeAgo(m.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={chatEnd} />
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2"
          >
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="notes" className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Shared Notes</h2>
            <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> New Note</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Note</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Note title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} />
                  <Textarea placeholder="Write your note..." rows={6} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
                  <Button className="w-full" onClick={createNote} disabled={!noteTitle.trim() || !noteContent.trim()}>Create Note</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground text-sm">No notes yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {notes.map((n: any) => (
                <div key={n.id} className="p-4 rounded-xl border bg-card">
                  <h3 className="font-medium">{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 whitespace-pre-wrap line-clamp-4">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    By {n.author?.name || "Unknown"} · {timeAgo(n.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Tasks ({tasks.length})</h2>
            <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> New Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                  <Textarea placeholder="Description (optional)" rows={3} value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {project.team.map((m: any) => (
                      <option key={m.id} value={m.userId}>{m.user.name}</option>
                    ))}
                  </select>
                  <Input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
                  <Button className="w-full" onClick={createTask} disabled={!taskTitle.trim()}>Create Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusColumns.map((col) => (
              <div key={col} className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {col.replace("_", " ")} ({tasks.filter((t: any) => t.status === col).length})
                </h3>
                <div className="space-y-2 min-h-[120px]">
                  {tasks
                    .filter((t: any) => t.status === col)
                    .map((t: any) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl border bg-card cursor-pointer hover:shadow-sm hover:border-primary/20 transition-all"
                        onClick={() => {
                          const next = col === "TODO" ? "IN_PROGRESS" : col === "IN_PROGRESS" ? "DONE" : "TODO";
                          updateTaskStatus(t.id, next);
                        }}
                      >
                        <p className="text-sm font-medium">{t.title}</p>
                        {t.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{t.assignedTo ? project.team.find((m: any) => m.userId === t.assignedTo)?.user?.name || "Unknown" : "Unassigned"}</span>
                          {t.dueDate && <span>{timeAgo(t.dueDate)}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
