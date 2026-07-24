"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createProject } from "@/actions/project";

interface Props {
  skills: string[];
  domains: string[];
  activeCount: number;
  maxActive: number;
  userId: string;
}

export function CreateProjectForm({ skills, domains, activeCount, maxActive, userId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const result = await createProject({
      title: form.get("title") as string,
      description: form.get("description") as string,
      problemStatement: form.get("problemStatement") as string,
      domain: form.get("domain") as string,
      teamSizeMax: parseInt(form.get("teamSizeMax") as string) || 5,
      requiredSkills: selectedSkills,
      deadline: form.get("deadline") ? new Date(form.get("deadline") as string) : null,
      isPrivate: form.get("isPrivate") === "on",
    });

    setLoading(false);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else if (result.id) {
      toast({ title: "Project created!" });
      router.push(`/projects/${result.id}`);
      router.refresh();
    }
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Project Title</Label>
        <Input id="title" name="title" required placeholder="e.g. Smart Campus App" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required placeholder="Brief overview of your project idea..." rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="problemStatement">Problem Statement</Label>
        <Textarea id="problemStatement" name="problemStatement" required placeholder="What problem are you solving? Who is it for?" rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="domain">Domain</Label>
          <select
            id="domain"
            name="domain"
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select domain</option>
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="teamSizeMax">Team Size (2–8)</Label>
          <Input id="teamSizeMax" name="teamSizeMax" type="number" min={2} max={8} defaultValue={5} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Required Skills</Label>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline (optional)</Label>
          <Input id="deadline" name="deadline" type="date" />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="isPrivate" className="rounded border-input" />
            Private / Invite-only
          </label>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating Project..." : "Create Project"}
      </Button>
    </form>
  );
}
