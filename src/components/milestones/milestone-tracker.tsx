"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  generateProjectMilestones,
  toggleDeliverable,
  updateMilestoneStatus,
  sendMilestoneReminder,
} from "@/actions/milestone";
import {
  Flag,
  CheckCircle2,
  Circle,
  Clock,
  Bell,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Crown,
} from "lucide-react";
import { UpgradeModal } from "@/components/subscription/upgrade-modal";

interface MilestoneDeliverable {
  id: string;
  title: string;
  completed: boolean;
}

interface MilestoneData {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  order: number;
  targetDays: number;
  targetDate?: string;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
  deliverables: MilestoneDeliverable[];
  progress: number;
  lastRemindedAt?: string;
}

interface Props {
  projectId: string;
  initialMilestones: MilestoneData[];
  isOwner: boolean;
  isMember: boolean;
}

export function MilestoneTracker({
  projectId,
  initialMilestones = [],
  isOwner,
  isMember,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<MilestoneData[]>(initialMilestones);
  const [generating, setGenerating] = useState(false);
  const [reminding, setReminding] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState("");
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(0);

  const canEdit = isOwner || isMember;

  // Compute total deliverables progress across all milestones
  const totalDeliverables = milestones.reduce((acc, m) => acc + (m.deliverables?.length || 0), 0);
  const completedDeliverables = milestones.reduce(
    (acc, m) => acc + (m.deliverables?.filter((d) => d.completed).length || 0),
    0
  );
  const overallProgress = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

  async function handleGenerateMilestones() {
    setGenerating(true);
    const res = await generateProjectMilestones(projectId);
    setGenerating(false);

    if (res.quotaExceeded) {
      setUpgradeTrigger("Sprint Milestone Roadmap Generation (2 / month on Free)");
      setUpgradeModalOpen(true);
    } else if (res.error) {
      toast({ title: "Failed to generate milestones", description: res.error, variant: "destructive" });
    } else if (res.milestones) {
      setMilestones(res.milestones);
      setSelectedMilestoneIndex(0);
      toast({
        title: "Sprint Milestones Generated! 🎯",
        description: `Created ${res.milestones.length} actionable project milestones with deliverable checklists.`,
      });
      router.refresh();
    }
  }

  async function handleToggleDeliverable(milestoneId: string, deliverableId: string) {
    if (!canEdit) {
      toast({ title: "Read-only", description: "Only project collaborators can check off deliverables." });
      return;
    }

    // Optimistic UI update
    setMilestones((prev) =>
      prev.map((m) => {
        if (m._id !== milestoneId) return m;
        const updatedDelivs = m.deliverables.map((d) =>
          d.id === deliverableId ? { ...d, completed: !d.completed } : d
        );
        const comp = updatedDelivs.filter((d) => d.completed).length;
        const newProg = updatedDelivs.length > 0 ? Math.round((comp / updatedDelivs.length) * 100) : 0;
        const newStatus = newProg === 100 ? "COMPLETED" : m.status === "COMPLETED" ? "IN_PROGRESS" : m.status;
        return { ...m, deliverables: updatedDelivs, progress: newProg, status: newStatus as any };
      })
    );

    const res = await toggleDeliverable(milestoneId, deliverableId);
    if (res.error) {
      toast({ title: "Update failed", description: res.error, variant: "destructive" });
    }
  }

  async function handleStatusChange(milestoneId: string, status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED") {
    if (!canEdit) return;

    setMilestones((prev) =>
      prev.map((m) => (m._id === milestoneId ? { ...m, status, progress: status === "COMPLETED" ? 100 : m.progress } : m))
    );

    const res = await updateMilestoneStatus(milestoneId, status);
    if (res.error) {
      toast({ title: "Failed to update milestone status", variant: "destructive" });
    } else {
      toast({ title: `Milestone status set to ${status}` });
    }
  }

  async function handleSendReminder(milestoneId: string) {
    setReminding(milestoneId);
    const res = await sendMilestoneReminder(milestoneId);
    setReminding(null);

    if (res.error) {
      toast({ title: "Failed to dispatch reminder", description: res.error, variant: "destructive" });
    } else {
      toast({
        title: "Team Milestone Reminder Sent! 🔔",
        description: `Notified ${res.recipientsCount} project collaborators with action links.`,
      });
      setMilestones((prev) =>
        prev.map((m) => (m._id === milestoneId ? { ...m, lastRemindedAt: new Date().toISOString() } : m))
      );
    }
  }

  if (milestones.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-2xl border-2 border-dashed bg-card/50 text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
          <Flag className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-bold">No Milestones Tracked Yet</h3>
          <p className="text-sm text-muted-foreground">
            Break down your PRD and problem statement into structured, time-bounded sprint milestones with interactive deliverable checklists.
          </p>
        </div>

        {canEdit && (
          <Button
            size="lg"
            onClick={handleGenerateMilestones}
            disabled={generating}
            className="gap-2 shadow-md hover:shadow-lg transition-all"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Decomposing PRD into Sprints..." : "Generate Milestones from PRD"}
          </Button>
        )}
      </div>
    );
  }

  const activeMilestone = milestones[selectedMilestoneIndex] || milestones[0];

  return (
    <div className="space-y-6">
      {/* Top Overview & Action Banner */}
      <div className="p-5 rounded-xl border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base md:text-lg">Project Milestone Roadmap</h3>
            <Badge variant="secondary" className="font-mono text-xs">
              {completedDeliverables}/{totalDeliverables} Deliverables Done
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Sprint-based progression tracking with automated team reminders and deliverable check-offs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-muted-foreground">Overall Completion</span>
            <p className="text-xl font-extrabold text-primary">{overallProgress}%</p>
          </div>

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateMilestones}
              disabled={generating}
              className="gap-1.5 text-xs h-9 border-primary/30 text-primary hover:bg-primary/5"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {generating ? "Re-syncing..." : "Re-sync with PRD"}
            </Button>
          )}
        </div>
      </div>

      {/* Stepper / Milestone Timeline Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {milestones.map((m, idx) => {
          const isSelected = idx === selectedMilestoneIndex;
          const isComplete = m.status === "COMPLETED";
          const isInProgress = m.status === "IN_PROGRESS";

          return (
            <button
              key={m._id}
              onClick={() => setSelectedMilestoneIndex(idx)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "bg-card hover:bg-muted/40 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Sprint {m.order}
                </span>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isInProgress ? (
                  <Clock className="w-4 h-4 text-blue-500 shrink-0 animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                )}
              </div>

              <h4 className="font-semibold text-xs line-clamp-1 mb-2">{m.title}</h4>

              <div className="space-y-1">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isComplete ? "bg-emerald-500" : isInProgress ? "bg-blue-500" : "bg-muted-foreground/30"
                    }`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Day {m.targetDays}</span>
                  <span className="font-bold">{m.progress}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Milestone Detailed View */}
      {activeMilestone && (
        <div className="p-6 rounded-xl border bg-card space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  className={
                    activeMilestone.status === "COMPLETED"
                      ? "bg-emerald-500 text-white"
                      : activeMilestone.status === "IN_PROGRESS"
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {activeMilestone.status === "COMPLETED"
                    ? "Completed"
                    : activeMilestone.status === "IN_PROGRESS"
                    ? "In Progress (Active Sprint)"
                    : "Upcoming"}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  Target: ~Day {activeMilestone.targetDays}
                </span>
              </div>
              <h3 className="text-lg font-bold">{activeMilestone.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                {activeMilestone.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canEdit && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendReminder(activeMilestone._id)}
                    disabled={reminding === activeMilestone._id}
                    className="gap-1.5 text-xs h-8"
                    title="Send an in-app notification reminder to all team members"
                  >
                    {reminding === activeMilestone._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Bell className="w-3.5 h-3.5 text-primary" />
                    )}
                    {reminding === activeMilestone._id ? "Dispatching..." : "Remind Team"}
                  </Button>

                  {activeMilestone.status !== "COMPLETED" ? (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(activeMilestone._id, "COMPLETED")}
                      className="gap-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Sprint Done
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(activeMilestone._id, "IN_PROGRESS")}
                      className="gap-1 text-xs h-8"
                    >
                      Reopen Sprint
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Progress Bar & Deliverables Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Sprint Deliverable Progress</span>
              <span className="font-bold">{activeMilestone.progress}% Complete</span>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  activeMilestone.progress === 100
                    ? "bg-emerald-500"
                    : activeMilestone.progress > 0
                    ? "bg-primary"
                    : "bg-muted"
                }`}
                style={{ width: `${activeMilestone.progress}%` }}
              />
            </div>

            <div className="pt-2 space-y-2.5">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Deliverables & Acceptance Checklist ({activeMilestone.deliverables?.length || 0})
              </h4>

              <div className="space-y-2">
                {activeMilestone.deliverables?.map((deliv) => (
                  <div
                    key={deliv.id}
                    onClick={() => handleToggleDeliverable(activeMilestone._id, deliv.id)}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                      canEdit ? "cursor-pointer hover:border-primary/50" : ""
                    } ${
                      deliv.completed
                        ? "bg-emerald-50/40 border-emerald-200/80 dark:bg-emerald-950/20 dark:border-emerald-900/50"
                        : "bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={deliv.completed}
                      onChange={() => {}}
                      readOnly
                      className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary pointer-events-none"
                    />
                    <div className="flex-1">
                      <span
                        className={`text-xs font-medium transition-all ${
                          deliv.completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {deliv.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        triggerFeature={upgradeTrigger}
      />
    </div>
  );
}
