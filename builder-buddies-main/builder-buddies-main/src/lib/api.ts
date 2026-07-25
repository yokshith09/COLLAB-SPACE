import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

// ===== Types =====
export type AppStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
export type ProjectStatus = "OPEN" | "FULL" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Profile {
  id: string; name: string; email: string | null; avatar: string | null;
  bio: string | null; github_url: string | null; linkedin_url: string | null;
  skills: string[]; domains: string[]; created_at: string; last_login_at: string;
}
export interface Project {
  id: string; title: string; description: string; problem_statement: string;
  required_skills: string[]; team_size_max: number; status: ProjectStatus;
  deadline: string | null; is_private: boolean; invite_code: string | null;
  owner_id: string; domain: string; created_at: string;
}
export interface Application {
  id: string; user_id: string; project_id: string; message: string;
  status: AppStatus; expires_at: string; created_at: string;
}
export interface TeamMember {
  id: string; user_id: string; project_id: string; role: string; joined_at: string;
}
export interface Message {
  id: string; project_id: string; sender_id: string; content: string;
  attachment_url: string | null; attachment_name: string | null;
  attachment_type: string | null; attachment_size: number | null;
  created_at: string;
}
export interface Note {
  id: string; project_id: string; created_by: string; title: string;
  content: string; created_at: string; updated_at: string;
}
export interface Task {
  id: string; project_id: string; title: string; description: string | null;
  status: TaskStatus; assigned_to: string | null; due_date: string | null; created_at: string;
}
export interface Notification {
  id: string; user_id: string; type: string; message: string;
  is_read: boolean; link: string | null; created_at: string;
}

// ===== Session =====
export function useSession() {
  // undefined = loading, null = signed out, Session = signed in
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setSession(data.session); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (active) setSession(s); });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);
  return session;
}

// ===== Profiles =====
export function useProfile(id: string | null | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["profile", id],
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}
export function useProfiles(ids: string[]) {
  const unique = Array.from(new Set(ids));
  return useQuery({
    enabled: unique.length > 0,
    queryKey: ["profiles", unique.sort().join(",")],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").in("id", unique);
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });
}
export function useCurrentProfile() {
  const session = useSession();
  return useProfile(session?.user.id ?? null);
}

// ===== Projects =====
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });
}
export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Project | null;
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string; description: string; problem_statement: string;
      required_skills: string[]; team_size_max: number; deadline?: string | null;
      is_private: boolean; domain: string; owner_id: string;
    }) => {
      const invite_code = input.is_private ? `inv-${crypto.randomUUID().slice(0, 8)}` : null;
      const { data, error } = await supabase.from("projects").insert({ ...input, invite_code }).select().single();
      if (error) throw error;
      // auto-add owner as team member
      await supabase.from("team_members").insert({ project_id: data.id, user_id: input.owner_id, role: "owner" });
      return data as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

// ===== Team =====
export function useTeam(projectId: string) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["team", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_members").select("*").eq("project_id", projectId);
      if (error) throw error;
      return (data ?? []) as TeamMember[];
    },
  });
}
export function useIsTeamMember(projectId: string | undefined, userId: string | undefined) {
  return useQuery({
    enabled: !!projectId && !!userId,
    queryKey: ["isTeamMember", projectId, userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_members").select("id")
        .eq("project_id", projectId!).eq("user_id", userId!).maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}
export function useLeaveTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }) => {
      const { error } = await supabase.from("team_members").delete()
        .eq("project_id", projectId).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["team", v.projectId] }),
  });
}

// ===== Applications =====
export function useApplications(projectId: string) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["applications", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Application[];
    },
  });
}
export function useMyApplications() {
  const session = useSession();
  return useQuery({
    enabled: !!session,
    queryKey: ["myApplications", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Application[];
    },
  });
}
export function useApply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, userId, message }: { projectId: string; userId: string; message: string }) => {
      const { error } = await supabase.from("applications").insert({ project_id: projectId, user_id: userId, message });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["applications", v.projectId] });
      qc.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
}
export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppStatus; projectId: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["applications", v.projectId] });
      qc.invalidateQueries({ queryKey: ["team", v.projectId] });
    },
  });
}

// ===== Messages (realtime + uploads) =====
export function useMessages(projectId: string) {
  const qc = useQueryClient();
  const q = useQuery({
    enabled: !!projectId,
    queryKey: ["messages", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*")
        .eq("project_id", projectId).order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
  });
  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel(`messages:${projectId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${projectId}` },
        (payload) => {
          qc.setQueryData<Message[]>(["messages", projectId], (prev) => {
            const m = payload.new as Message;
            if (prev?.some((x) => x.id === m.id)) return prev;
            return [...(prev ?? []), m];
          });
        })
      .on("postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `project_id=eq.${projectId}` },
        (payload) => {
          qc.setQueryData<Message[]>(["messages", projectId], (prev) => prev?.filter((m) => m.id !== (payload.old as Message).id));
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId, qc]);
  return q;
}

export async function uploadAttachment(projectId: string, file: File) {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${projectId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("chat-attachments").upload(path, file, {
    cacheControl: "3600", upsert: false, contentType: file.type,
  });
  if (error) throw error;
  // Use signed URL (1 year) since bucket is private
  const { data: signed, error: signErr } = await supabase.storage
    .from("chat-attachments").createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signErr) throw signErr;
  return { url: signed.signedUrl, name: file.name, type: file.type, size: file.size, path };
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async (input: {
      projectId: string; senderId: string; content: string;
      file?: File | null;
    }) => {
      let attachment: { url: string; name: string; type: string; size: number } | null = null;
      if (input.file) {
        const a = await uploadAttachment(input.projectId, input.file);
        attachment = { url: a.url, name: a.name, type: a.type, size: a.size };
      }
      const { error } = await supabase.from("messages").insert({
        project_id: input.projectId,
        sender_id: input.senderId,
        content: input.content,
        attachment_url: attachment?.url ?? null,
        attachment_name: attachment?.name ?? null,
        attachment_type: attachment?.type ?? null,
        attachment_size: attachment?.size ?? null,
      });
      if (error) throw error;
    },
  });
}

// ===== Notes =====
export function useNotes(projectId: string) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["notes", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("notes").select("*").eq("project_id", projectId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Note[];
    },
  });
}
export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, createdBy }: { projectId: string; createdBy: string }) => {
      const { error } = await supabase.from("notes").insert({ project_id: projectId, created_by: createdBy, title: "Untitled", content: "" });
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["notes", v.projectId] }),
  });
}
export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title, content }: { id: string; projectId: string; title: string; content: string }) => {
      const { error } = await supabase.from("notes").update({ title, content }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["notes", v.projectId] }),
  });
}

// ===== Tasks =====
export function useTasks(projectId: string) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });
}
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, title }: { projectId: string; title: string }) => {
      const { error } = await supabase.from("tasks").insert({ project_id: projectId, title });
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["tasks", v.projectId] }),
  });
}
export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; projectId: string; status: TaskStatus }) => {
      const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["tasks", v.projectId] }),
  });
}

// ===== Notifications =====
export function useNotifications() {
  const session = useSession();
  return useQuery({
    enabled: !!session,
    queryKey: ["notifications", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*")
        .eq("user_id", session!.user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });
}
export function useUnreadCount() {
  const { data } = useNotifications();
  return data?.filter((n) => !n.is_read).length ?? 0;
}
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
export function useMarkAllRead() {
  const qc = useQueryClient();
  const session = useSession();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications").update({ is_read: true })
        .eq("user_id", session!.user.id).eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ===== Utils =====
export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
