"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2 } from "lucide-react";

interface ProjectSettingsFormProps {
  project: {
    id: string;
    title: string;
    description: string;
    problemStatement: string;
    domain: string;
    requiredSkills: string[];
    teamSizeMax: number;
    deadline?: Date | null;
    isPrivate: boolean;
    inviteCode?: string | null;
  };
  allSkills: string[];
  allDomains: string[];
  userId: string;
}

export function ProjectSettingsForm({ project, allSkills, allDomains, userId }: ProjectSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState(project.requiredSkills);
  const [selectedDomains, setSelectedDomains] = useState([project.domain]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      // Handle checkbox separately
      return;
    }
    // This is a simplified implementation - in reality you'd need to handle form state properly
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function toggleDomain(domain: string) {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      problemStatement: form.get("problemStatement") as string,
      domain: form.get("domain") as string,
      teamSizeMax: parseInt(form.get("teamSizeMax") as string) || 5,
      requiredSkills: selectedSkills,
      deadline: form.get("deadline") ? new Date(form.get("deadline") as string) : null,
      isPrivate: form.get("isPrivate") === "on",
    };

    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const errorData = await res.json();
      toast({ title: "Error", description: errorData.error, variant: "destructive" });
      return;
    }

    toast({ title: "Project updated" });
    router.push(`/projects/${project.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

    setLoading(true);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (!res.ok) {
      const errorData = await res.json();
      toast({ title: "Error", description: errorData.error, variant: "destructive" });
      return;
    }

    toast({ title: "Project deleted" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 rounded-xl border bg-card space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>

        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={project.title}
            required
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={project.description}
            required
            rows={3}
            maxLength={1000}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="problemStatement">Problem Statement</Label>
          <Textarea
            id="problemStatement"
            name="problemStatement"
            defaultValue={project.problemStatement}
            required
            rows={3}
            maxLength={500}
          />
        </div>
      </div>

      <div className="p-6 rounded-xl border bg-card space-y-4">
        <h2 className="text-lg font-semibold">Project Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <select
              id="domain"
              name="domain"
              defaultValue={project.domain}
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select domain</option>
              {allDomains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSizeMax">Team Size (2–8)</Label>
            <Input
              id="teamSizeMax"
              name="teamSizeMax"
              type="number"
              min={2}
              max={8}
              defaultValue={project.teamSizeMax}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline (optional)</Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''}
          />
        </div>
      </div>

      <div className="p-6 rounded-xl border bg-card space-y-4">
        <h2 className="text-lg font-semibold">Skills & Tags</h2>

        <div className="space-y-2">
          <Label>Required Skills</Label>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedSkills.includes(s)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {selectedSkills.length > 0 && (
            <p className="text-xs text-muted-foreground">{selectedSkills.length} selected</p>
          )}
        </div>
      </div>

      <div className="p-6 rounded-xl border bg-card space-y-4">
        <h2 className="text-lg font-semibold">Visibility</h2>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPrivate"
            name="isPrivate"
            defaultChecked={project.isPrivate}
            className="rounded border-input"
          />
          <Label htmlFor="isPrivate">Private / Invite-only</Label>
        </div>

        {project.isPrivate && project.inviteCode && (
          <div className="text-sm text-muted-foreground">
            Invite link: {typeof window !== "undefined" && `${window.location.origin}/invite/${project.inviteCode}`}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
          className="gap-1.5"
        >
          <Trash2 className="h-4 w-4" /> Delete Project
        </Button>
      </div>
    </form>
  );
}