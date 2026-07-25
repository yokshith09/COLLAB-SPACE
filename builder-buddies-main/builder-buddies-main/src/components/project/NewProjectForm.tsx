import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCreateProject, useCurrentProfile } from "@/lib/api";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const DOMAINS = ["Web", "Mobile", "AI/ML", "Infra", "Design"];

export function NewProjectForm() {
  const navigate = useNavigate();
  const { data: me } = useCurrentProfile();
  const create = useCreateProject();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [domain, setDomain] = useState("Web");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [size, setSize] = useState(5);
  const [deadline, setDeadline] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const valid = title.length >= 5 && title.length <= 80
    && description.length >= 50 && description.length <= 1000
    && problem.length >= 50 && problem.length <= 500
    && skills.length >= 1;

  const addSkill = () => { const s = skillInput.trim(); if (s && !skills.includes(s) && skills.length < 10) { setSkills([...skills, s]); setSkillInput(""); } };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !me) return;
    try {
      const project = await create.mutateAsync({
        title, description, problem_statement: problem, required_skills: skills,
        team_size_max: size, deadline: deadline ? new Date(deadline).toISOString() : null,
        is_private: isPrivate, domain, owner_id: me.id,
      });
      toast.success("Project created!");
      navigate({ to: "/projects/$id", params: { id: project.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Start a project</h1>
        <p className="mt-1 text-muted-foreground">Tell builders what you're making and who you need.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lumen — open-source learning OS" />
        <p className="text-xs text-muted-foreground">{title.length}/80</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea id="desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this? Current state, vision, tech stack…" />
        <p className="text-xs text-muted-foreground">{description.length}/1000</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="problem">Problem statement</Label>
        <Textarea id="problem" rows={3} value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="What problem are you solving and for whom?" />
        <p className="text-xs text-muted-foreground">{problem.length}/500</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Domain</Label>
          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Team size max</Label>
          <Input id="size" type="number" min={2} max={10} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Required skills</Label>
        <div className="flex gap-2">
          <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Type skill, press Enter" />
          <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="gap-1">{s} <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}><X className="h-3 w-3" /></button></Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline (optional)</Label>
        <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="h-4 w-4 rounded border-border" />
        Private — only people with the invite link can join
      </label>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={!valid || create.isPending}>
          {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Create project
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/projects" })}>Cancel</Button>
      </div>
    </form>
  );
}
