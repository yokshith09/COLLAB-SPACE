"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  FileText,
  GitBranch,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Code2,
  Layers,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HeroInteractiveDemo() {
  const [activeTab, setActiveTab] = useState<"validator" | "prd" | "mindmap" | "milestones">("validator");
  const [animatingScore, setAnimatingScore] = useState(true);

  // Auto-switch tabs every 6 seconds if user hasn't clicked recently
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === "validator") return "prd";
        if (prev === "prd") return "mindmap";
        if (prev === "mindmap") return "milestones";
        return "validator";
      });
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-4xl rounded-2xl md:rounded-3xl border border-primary/20 bg-card/80 p-2 sm:p-4 shadow-2xl backdrop-blur-xl">
      {/* Decorative top window bar */}
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-muted-foreground hidden sm:inline">
            collabspace.ai/workspace/active-preview
          </span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
          {[
            { id: "validator", label: "AI Validator", icon: Brain },
            { id: "prd", label: "Living PRD", icon: FileText },
            { id: "mindmap", label: "Mind Map", icon: GitBranch },
            { id: "milestones", label: "Sprints", icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? "text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Content Preview */}
      <div className="min-h-[380px] p-2 sm:p-4 rounded-xl bg-background/50 border border-border/40 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* TAB 1: AI VALIDATOR */}
          {activeTab === "validator" && (
            <motion.div
              key="validator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base">Autonomous AI Code Reviewer</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                      Viability: 91/100
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Evaluated by Google Gemini 1.5 Flash against 10k+ open-source repos
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs border border-primary/20">
                    <Sparkles className="w-3 h-3 mr-1" /> High Moat
                  </Badge>
                </div>
              </div>

              {/* 5-Dimension Radar Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { label: "Problem Clarity", score: 94, color: "text-emerald-500", stroke: "#10b981" },
                  { label: "MVP Feasibility", score: 88, color: "text-blue-500", stroke: "#3b82f6" },
                  { label: "Technical Moat", score: 92, color: "text-purple-500", stroke: "#a855f7" },
                  { label: "Team Appeal", score: 90, color: "text-amber-500", stroke: "#f59e0b" },
                  { label: "Market Traction", score: 91, color: "text-rose-500", stroke: "#f43f5e" },
                ].map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl border bg-card/80 flex flex-col items-center text-center shadow-sm"
                  >
                    <div className="relative w-12 h-12 flex items-center justify-center my-1">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-muted/40"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <motion.path
                          className={metric.color}
                          strokeDasharray={`${metric.score}, 100`}
                          strokeWidth="3"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          initial={{ strokeDasharray: "0, 100" }}
                          animate={{ strokeDasharray: `${metric.score}, 100` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className={`absolute text-xs font-bold ${metric.color}`}>
                        {metric.score}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground truncate w-full">
                      {metric.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Blind Spot Detector & Pitch Enhancer */}
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl border bg-card/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                    <AlertTriangle className="w-3.5 h-3.5" /> Blind Spot Detected
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    AST parser parsing speed could bottleneck large diffs. Consider caching sub-trees with WebAssembly.
                  </p>
                </div>
                <div className="p-3 rounded-xl border bg-card/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <Sparkles className="w-3.5 h-3.5" /> AI Pitch Recommendation
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Lead with &apos;Zero-setup GitHub Action with 1-second latency&apos; to maximize developer conversions.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: LIVING PRD */}
          {activeTab === "prd" && (
            <motion.div
              key="prd"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">PRD_SPEC_v2.md</span>
                  <Badge variant="outline" className="text-[10px]">Living Document</Badge>
                </div>
                <span className="text-[11px] text-muted-foreground">Auto-generated API schema</span>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-foreground/90">
                <div className="text-primary font-bold"># 1. System Architecture & Tech Stack</div>
                <div className="pl-3 text-muted-foreground">
                  • Engine: Next.js 16 App Router + Rust Core WASM bindings<br />
                  • Database: MongoDB Multi-tenant + Mongoose Schemas<br />
                  • AI LLM: Google Gemini 1.5 Flash via Server Actions
                </div>
                <div className="text-primary font-bold pt-1"># 2. REST API Contract (/api/v1/review)</div>
                <div className="p-2 rounded bg-card/80 border text-[11px] text-emerald-600 dark:text-emerald-400">
                  POST /api/v1/review HTTP/1.1<br />
                  Payload: &#123; &quot;repoUrl&quot;: &quot;git@github.com:...&quot;, &quot;pullNumber&quot;: 42 &#125;<br />
                  Response: &#123; &quot;status&quot;: &quot;ANALYZED&quot;, &quot;suggestionsCount&quot;: 4 &#125;
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: MERMAID MIND MAP */}
          {activeTab === "mindmap" && (
            <motion.div
              key="mindmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="font-bold text-sm">Interactive Architecture Mind Map</span>
                <Badge variant="secondary" className="text-[10px]">Client-side Mermaid.js</Badge>
              </div>

              {/* Animated Interactive Flow Nodes */}
              <div className="p-4 rounded-xl bg-card border border-border/60 flex flex-col items-center justify-center space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md"
                  >
                    User Submission
                  </motion.div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md">
                    Gemini 1.5 AI Core
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md">
                    Living PRD Synthesizer
                  </div>
                </div>

                <div className="w-full max-w-sm h-px bg-border/60 relative">
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
                    animate={{ left: ["0%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="px-3 py-1 rounded-lg border bg-background text-xs font-semibold text-muted-foreground">
                    Mermaid Mind Map
                  </div>
                  <div className="px-3 py-1 rounded-lg border bg-background text-xs font-semibold text-muted-foreground">
                    Spec-to-Kanban Cards
                  </div>
                  <div className="px-3 py-1 rounded-lg border bg-background text-xs font-semibold text-muted-foreground">
                    4-Sprint Milestones
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: SPRINT MILESTONES */}
          {activeTab === "milestones" && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div>
                  <span className="font-bold text-sm">Sprint Roadmap & Team Accountability</span>
                  <p className="text-xs text-muted-foreground">Automated 48h cron reminder active</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs">
                  75% Complete
                </Badge>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Sprint 1: Core AST Engine & Parser", status: "DONE", pct: 100, color: "bg-emerald-500" },
                  { name: "Sprint 2: Google Gemini Integration", status: "DONE", pct: 100, color: "bg-emerald-500" },
                  { name: "Sprint 3: GitHub Webhook Action & PR Bot", status: "IN PROGRESS", pct: 60, color: "bg-primary" },
                  { name: "Sprint 4: Production Staging & Benchmarking", status: "UPCOMING", pct: 0, color: "bg-muted" },
                ].map((sprint, idx) => (
                  <div key={sprint.name} className="p-2.5 rounded-xl border bg-card/60 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-2 w-2 rounded-full ${sprint.color}`} />
                      <span className="font-semibold text-foreground truncate">{sprint.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                        <motion.div
                          className={`h-full ${sprint.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${sprint.pct}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        {sprint.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
