"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { generateProjectPRD, updatePRDMarkdown, convertPRDToTasks } from "@/actions/prd";
import { MermaidViewer } from "./mermaid-viewer";
import { MilestoneTracker } from "@/components/milestones/milestone-tracker";
import { UpgradeModal } from "@/components/subscription/upgrade-modal";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  FileText,
  GitBranch,
  CheckSquare,
  Download,
  Copy,
  Edit3,
  Loader2,
  Check,
  Layers,
  Database,
  Network,
  Wand2,
  Flag,
  Crown,
} from "lucide-react";

interface Props {
  projectId: string;
  initialPrd: any | null;
  initialMilestones?: any[];
  isOwner: boolean;
  isMember: boolean;
}

export function PRDStudio({ projectId, initialPrd, initialMilestones = [], isOwner, isMember }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [prd, setPrd] = useState<any | null>(initialPrd);
  const [generating, setGenerating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState("");
  const [editMarkdown, setEditMarkdown] = useState(initialPrd?.rawMarkdown || "");
  const [activeTab, setActiveTab] = useState<"document" | "diagrams" | "milestones" | "edit">("document");
  const [diagramSubTab, setDiagramSubTab] = useState<"mindmap" | "architecture" | "er">("mindmap");

  async function handleGeneratePRD() {
    setGenerating(true);
    const res = await generateProjectPRD(projectId);
    setGenerating(false);

    if (res.quotaExceeded) {
      setUpgradeTrigger("Living PRD & Architecture Generation (2 / month on Free)");
      setUpgradeModalOpen(true);
    } else if (res.error) {
      toast({ title: "Failed to generate PRD", description: res.error, variant: "destructive" });
    } else if (res.prd) {
      setPrd(res.prd);
      setEditMarkdown(res.prd.rawMarkdown || "");
      toast({
        title: "PRD & Architecture Generated! ✨",
        description: "Living specifications and interactive mind maps are ready.",
      });
      router.refresh();
    }
  }

  async function handleConvertToTasks() {
    if (!prd) return;
    setConverting(true);
    const res = await convertPRDToTasks(projectId);
    setConverting(false);

    if (res.error) {
      toast({ title: "Conversion failed", description: res.error, variant: "destructive" });
    } else {
      toast({
        title: `Created ${res.tasksCreated} Kanban Tasks! 🎉`,
        description: `Project skills updated. Tasks are now live in the Team Workspace.`,
      });
      router.refresh();
    }
  }

  async function handleSaveMarkdown() {
    setSavingEdit(true);
    const res = await updatePRDMarkdown(projectId, editMarkdown);
    setSavingEdit(false);

    if (res.error) {
      toast({ title: "Failed to save edits", description: res.error, variant: "destructive" });
    } else {
      setPrd((prev: any) => ({ ...prev, rawMarkdown: editMarkdown, version: (prev?.version || 1) + 1 }));
      toast({ title: "PRD specifications updated!" });
      setActiveTab("document");
      router.refresh();
    }
  }

  function handleExportMarkdown() {
    if (!prd?.rawMarkdown) return;
    const blob = new Blob([prd.rawMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prd.title || "Project"}_PRD.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "PRD downloaded as Markdown (.md)" });
  }

  if (!prd) {
    return (
      <div className="p-8 sm:p-12 rounded-2xl border-2 border-dashed bg-card/50 text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-bold">No PRD Generated Yet</h3>
          <p className="text-sm text-muted-foreground">
            Generate an AI-powered Product Requirement Document (PRD), feature breakdown, system architecture, and ER diagram in seconds.
          </p>
        </div>

        {(isOwner || isMember) && (
          <Button
            size="lg"
            onClick={handleGeneratePRD}
            disabled={generating}
            className="gap-2 shadow-md hover:shadow-lg transition-all"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {generating ? "Synthesizing Living PRD & Mind Maps..." : "Generate PRD & Architecture with AI"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Header Banner */}
      <div className="p-4 rounded-xl border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base md:text-lg">{prd.title || "Product Requirement Document"}</h2>
              <Badge variant="secondary" className="text-xs">
                v{prd.version || 1}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated {new Date(prd.updatedAt || Date.now()).toLocaleDateString()} · {prd.features?.length || 0} Features Planned
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(isOwner || isMember) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGeneratePRD}
                disabled={generating}
                className="gap-1.5 text-xs h-8"
              >
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
                {generating ? "Regenerating..." : "Regenerate with AI"}
              </Button>

              <Button
                size="sm"
                onClick={handleConvertToTasks}
                disabled={converting}
                className="gap-1.5 text-xs h-8 shadow-sm"
              >
                {converting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5" />}
                {converting ? "Creating Tasks..." : "Convert to Kanban Tasks"}
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportMarkdown}
            className="gap-1.5 text-xs h-8"
            title="Download PRD Markdown"
          >
            <Download className="w-3.5 h-3.5" /> Export .md
          </Button>
        </div>
      </div>

      {/* Main PRD Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 max-w-xl mb-4">
          <TabsTrigger value="document" className="gap-1.5 text-xs sm:text-sm">
            <FileText className="w-3.5 h-3.5" /> Spec Document
          </TabsTrigger>
          <TabsTrigger value="milestones" className="gap-1.5 text-xs sm:text-sm">
            <Flag className="w-3.5 h-3.5 text-primary" /> Sprints & Milestones
          </TabsTrigger>
          <TabsTrigger value="diagrams" className="gap-1.5 text-xs sm:text-sm">
            <Layers className="w-3.5 h-3.5" /> Mind Maps & Arch
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-1.5 text-xs sm:text-sm">
            <Edit3 className="w-3.5 h-3.5" /> Markdown Editor
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Spec Document */}
        <TabsContent value="document" className="space-y-6">
          {/* Executive Overview */}
          {prd.overview && (
            <div className="p-6 rounded-xl border bg-card space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2 border-b pb-2">
                <FileText className="w-4 h-4 text-primary" />
                1. Project Overview & Strategy
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Executive Summary</h4>
                  <p className="text-sm text-foreground/90 leading-relaxed bg-muted/20 p-3 rounded-lg border">
                    {prd.overview.summary}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Problem Statement</h4>
                  <p className="text-sm text-foreground/90 leading-relaxed bg-muted/20 p-3 rounded-lg border">
                    {prd.overview.problemStatement}
                  </p>
                </div>
              </div>

              {prd.overview.successMetrics?.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Key Success Metrics</h4>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {prd.overview.successMetrics.map((metric: string, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg border bg-primary/5 text-xs font-medium flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Features / User Stories */}
          {prd.features?.length > 0 && (
            <div className="p-6 rounded-xl border bg-card space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  2. Feature Specifications & User Stories ({prd.features.length})
                </h3>
              </div>

              <div className="grid gap-4">
                {prd.features.map((feat: any, idx: number) => (
                  <div key={feat.id || idx} className="p-4 rounded-xl border bg-muted/20 hover:border-primary/40 transition-colors space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm">
                        2.{idx + 1} {feat.title}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px]">
                          {feat.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {feat.phase}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>

                    {feat.acceptanceCriteria?.length > 0 && (
                      <div className="pt-2 border-t border-border/40 space-y-1">
                        <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-wider">Acceptance Criteria:</span>
                        <ul className="space-y-1">
                          {feat.acceptanceCriteria.map((c: string, cIdx: number) => (
                            <li key={cIdx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary font-bold">✓</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {feat.suggestedSkills?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] text-muted-foreground mr-1">Skills:</span>
                        {feat.suggestedSkills.map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-[9px] h-4 px-1.5">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack & Architecture */}
          {prd.techStack?.length > 0 && (
            <div className="p-6 rounded-xl border bg-card space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2 border-b pb-2">
                <Network className="w-4 h-4 text-primary" />
                3. Technical Architecture & Stack
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {prd.techStack.map((tech: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-lg border bg-muted/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{tech.category}</span>
                      <Badge variant="outline" className="font-mono text-xs text-primary">
                        {tech.technology}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pt-1">{tech.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Endpoints */}
          {prd.apiEndpoints?.length > 0 && (
            <div className="p-6 rounded-xl border bg-card space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2 border-b pb-2">
                <Database className="w-4 h-4 text-primary" />
                4. API Endpoints Contract
              </h3>
              <div className="space-y-2">
                {prd.apiEndpoints.map((api: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          api.method === "GET"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : api.method === "POST"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {api.method}
                      </span>
                      <span className="font-semibold text-foreground">{api.path}</span>
                    </div>
                    <span className="text-muted-foreground">{api.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Sprints & Milestones */}
        <TabsContent value="milestones" className="space-y-6">
          <MilestoneTracker
            projectId={projectId}
            initialMilestones={initialMilestones}
            isOwner={isOwner}
            isMember={isMember}
          />
        </TabsContent>

        {/* Tab 3: Interactive Mind Maps & Architecture Diagrams */}
        <TabsContent value="diagrams" className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-2">
            <Button
              variant={diagramSubTab === "mindmap" ? "default" : "outline"}
              size="sm"
              onClick={() => setDiagramSubTab("mindmap")}
              className="gap-1.5 text-xs"
            >
              <GitBranch className="w-3.5 h-3.5" /> Feature Mind Map
            </Button>
            <Button
              variant={diagramSubTab === "architecture" ? "default" : "outline"}
              size="sm"
              onClick={() => setDiagramSubTab("architecture")}
              className="gap-1.5 text-xs"
            >
              <Network className="w-3.5 h-3.5" /> System Architecture
            </Button>
            <Button
              variant={diagramSubTab === "er" ? "default" : "outline"}
              size="sm"
              onClick={() => setDiagramSubTab("er")}
              className="gap-1.5 text-xs"
            >
              <Database className="w-3.5 h-3.5" /> Database ER Schema
            </Button>
          </div>

          {diagramSubTab === "mindmap" && (
            <MermaidViewer
              chart={prd.diagrams?.mindmapMermaid || `mindmap\n  root(("${prd.title}"))\n    Architecture\n    Features\n    Roadmap`}
              title="Feature Hierarchy & Roadmap Mind Map"
            />
          )}

          {diagramSubTab === "architecture" && (
            <MermaidViewer
              chart={prd.diagrams?.architectureMermaid || `graph TD\n    Client --> API\n    API --> DB[(Database)]`}
              title="System Architecture & Flow Diagram"
            />
          )}

          {diagramSubTab === "er" && (
            <MermaidViewer
              chart={prd.diagrams?.erDiagramMermaid || `erDiagram\n    PROJECT ||--o{ TASK : contains`}
              title="Database Entity Relationship (ER) Diagram"
            />
          )}
        </TabsContent>

        {/* Tab 3: Raw Markdown Editor */}
        <TabsContent value="edit" className="space-y-4">
          <div className="p-4 rounded-xl border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Direct Markdown Specification</h3>
              {(isOwner || isMember) && (
                <Button size="sm" onClick={handleSaveMarkdown} disabled={savingEdit} className="gap-1.5">
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {savingEdit ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </div>

            <Textarea
              rows={18}
              value={editMarkdown}
              onChange={(e) => setEditMarkdown(e.target.value)}
              className="font-mono text-xs leading-relaxed"
              placeholder="# Product Requirements Document..."
            />
          </div>
        </TabsContent>
      </Tabs>

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        triggerFeature={upgradeTrigger}
      />
    </div>
  );
}
