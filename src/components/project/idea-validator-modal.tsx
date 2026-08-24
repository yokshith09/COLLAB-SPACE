"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle2, ArrowRight, Wand2 } from "lucide-react";
import type { IdeaEvaluationResult } from "@/lib/ai/validator";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: IdeaEvaluationResult | null;
  onApplyImprovements?: (improved: {
    title: string;
    description: string;
    problemStatement: string;
    suggestedSkills: string[];
  }) => void;
}

export function IdeaValidatorModal({ open, onOpenChange, evaluation, onApplyImprovements }: Props) {
  const [activeTab, setActiveTab] = useState<"scorecard" | "pitch">("scorecard");

  if (!evaluation) return null;

  const scoreColor =
    evaluation.overallScore >= 80
      ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400"
      : evaluation.overallScore >= 70
      ? "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400"
      : evaluation.overallScore >= 55
      ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400"
      : "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/50 dark:text-red-400";

  const dimensionList = [
    { label: "Problem Clarity & Pain Point", data: evaluation.dimensions.problemClarity },
    { label: "MVP Scope & Feasibility", data: evaluation.dimensions.mvpScope },
    { label: "Technical Moat & Innovation", data: evaluation.dimensions.technicalMoat },
    { label: "Team & Contributor Appeal", data: evaluation.dimensions.teamAttractiveness },
    { label: "Market Need & Traction Path", data: evaluation.dimensions.marketNeed },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Project Viability Analysis
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Header Score Card */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${scoreColor}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold tracking-tight">{evaluation.overallScore}/100</span>
                <Badge variant="outline" className="font-semibold bg-background/80">
                  {evaluation.verdict}
                </Badge>
              </div>
              <p className="text-xs mt-1 opacity-90">
                Evaluated against the Y-Combinator Lean MVP & Technical Feasibility Framework.
              </p>
            </div>

            {onApplyImprovements && (
              <Button
                size="sm"
                className="gap-1.5 shrink-0 bg-primary text-primary-foreground shadow-sm hover:opacity-90"
                onClick={() => {
                  onApplyImprovements(evaluation.enhancedPitch);
                  onOpenChange(false);
                }}
              >
                <Wand2 className="w-4 h-4" /> Apply AI Refinements
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="scorecard">5-Dimension Breakdown</TabsTrigger>
              <TabsTrigger value="pitch">AI Refined Pitch</TabsTrigger>
            </TabsList>

            {/* Scorecard Tab */}
            <TabsContent value="scorecard" className="space-y-5 pt-3">
              {/* 5-Dimension Bars */}
              <div className="space-y-3 p-4 rounded-xl bg-card border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Evaluation Matrix</h4>
                <div className="space-y-3 pt-1">
                  {dimensionList.map((d, i) => {
                    const score = d.data?.score ?? 7;
                    const barColor = score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-blue-500" : "bg-amber-500";
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span>{d.label}</span>
                          <span className="font-bold">{score}/10</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score * 10}%` }} />
                        </div>
                        {d.data?.feedback && (
                          <p className="text-[11px] text-muted-foreground pt-0.5">{d.data.feedback}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reality Check Alert */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-900/50 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Reality Check & Potential Pitfalls</span>
                </div>
                <p className="text-xs text-amber-900/90 dark:text-amber-200 leading-relaxed">
                  {evaluation.critique}
                </p>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-4 rounded-xl border bg-card space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <span>Level-Up Recommendations</span>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {evaluation.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            {/* AI Refined Pitch Tab */}
            <TabsContent value="pitch" className="space-y-4 pt-3">
              <div className="p-4 rounded-xl border bg-card space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Refined Title</h4>
                  <p className="font-semibold text-sm text-primary">{evaluation.enhancedPitch.title}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Refined Description</h4>
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line bg-muted/30 p-3 rounded-lg border">
                    {evaluation.enhancedPitch.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Sharp Problem Statement</h4>
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line bg-muted/30 p-3 rounded-lg border">
                    {evaluation.enhancedPitch.problemStatement}
                  </p>
                </div>

                {evaluation.enhancedPitch.suggestedSkills?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Suggested Skills to Tag</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluation.enhancedPitch.suggestedSkills.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {onApplyImprovements && (
                <Button
                  className="w-full gap-2 mt-2"
                  onClick={() => {
                    onApplyImprovements(evaluation.enhancedPitch);
                    onOpenChange(false);
                  }}
                >
                  <Wand2 className="w-4 h-4" /> Apply These Improvements to Project
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
