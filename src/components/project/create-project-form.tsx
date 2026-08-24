"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createProject } from "@/actions/project";
import { validateProjectIdeaAction } from "@/actions/ai";
import { IdeaValidatorModal } from "./idea-validator-modal";
import { UpgradeModal } from "@/components/subscription/upgrade-modal";
import type { IdeaEvaluationResult } from "@/lib/ai/validator";
import { Sparkles, Loader2, Wand2, Zap } from "lucide-react";

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
  const [validating, setValidating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [domain, setDomain] = useState("");
  const [teamSizeMax, setTeamSizeMax] = useState(5);
  const [deadline, setDeadline] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [autoValidate, setAutoValidate] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState("");
  const [evaluation, setEvaluation] = useState<IdeaEvaluationResult | null>(null);

  async function handleValidateIdea() {
    if (!title.trim() && !description.trim()) {
      toast({ title: "Please enter a project title or description first.", variant: "destructive" });
      return;
    }

    setValidating(true);
    const res = await validateProjectIdeaAction({
      title,
      description,
      problemStatement,
      domain,
      requiredSkills: selectedSkills,
    });
    setValidating(false);

    if (res.quotaExceeded) {
      setUpgradeTrigger("AI Idea Validation");
      setUpgradeModalOpen(true);
    } else if (res.error) {
      toast({ title: "Evaluation failed", description: res.error, variant: "destructive" });
    } else if (res.data) {
      setEvaluation(res.data);
      setModalOpen(true);
    }
  }

  function handleApplyImprovements(improved: {
    title: string;
    description: string;
    problemStatement: string;
    suggestedSkills: string[];
  }) {
    if (improved.title) setTitle(improved.title);
    if (improved.description) setDescription(improved.description);
    if (improved.problemStatement) setProblemStatement(improved.problemStatement);
    if (improved.suggestedSkills?.length) {
      setSelectedSkills(Array.from(new Set([...selectedSkills, ...improved.suggestedSkills])));
    }
    toast({ title: "AI Improvements Applied! ✨", description: "Form inputs have been upgraded with refined specs." });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (autoValidate && !evaluation) {
      await handleValidateIdea();
      return;
    }

    setLoading(true);

    const result = await createProject({
      title: title.trim(),
      description: description.trim(),
      problemStatement: problemStatement.trim(),
      domain,
      teamSizeMax: Number(teamSizeMax) || 5,
      requiredSkills: selectedSkills,
      deadline: deadline ? new Date(deadline) : null,
      isPrivate,
    });

    setLoading(false);

    if (result.quotaExceeded) {
      setUpgradeTrigger("Project Creation (2 Active Projects Max)");
      setUpgradeModalOpen(true);
    } else if (result.error) {
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
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* AI Quick Polish Banner */}
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">AI Project Idea Validator</p>
              <p className="text-[11px] text-muted-foreground">
                Get an instant 5-dimension scorecard, blind-spot check, and 1-click pitch enhancer.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleValidateIdea}
            disabled={validating || (!title.trim() && !description.trim())}
            className="text-xs gap-1.5 shrink-0 border-primary/30 text-primary hover:bg-primary/10 h-8"
          >
            {validating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            {validating ? "Analyzing..." : "Validate with AI"}
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Smart Campus App"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-muted-foreground font-normal">(Markdown supported)</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of your project idea..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="problemStatement">
            Problem Statement <span className="text-muted-foreground font-normal">(Markdown supported)</span>
          </Label>
          <Textarea
            id="problemStatement"
            name="problemStatement"
            required
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            placeholder="What problem are you solving? Who is it for?"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <select
              id="domain"
              name="domain"
              required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
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
            <Input
              id="teamSizeMax"
              name="teamSizeMax"
              type="number"
              min={2}
              max={8}
              value={teamSizeMax}
              onChange={(e) => setTeamSizeMax(Number(e.target.value))}
            />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end space-y-2 pb-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-input text-primary"
              />
              Private / Invite-only
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={autoValidate}
                onChange={(e) => setAutoValidate(e.target.checked)}
                className="rounded border-input text-primary"
              />
              Auto-validate with AI before publishing
            </label>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold">
          {loading ? "Creating Project..." : "Create Project"}
        </Button>
      </form>

      <IdeaValidatorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        evaluation={evaluation}
        onApplyImprovements={handleApplyImprovements}
      />

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        triggerFeature={upgradeTrigger}
      />
    </>
  );
}
