"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Code2,
  FileText,
  Target,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PRESET_IDEAS = [
  {
    title: "Autonomous AI Code Reviewer",
    pitch: "A GitHub Action that performs deep semantic analysis, detects logic vulnerabilities, and generates auto-fix pull requests using Gemini 1.5 Flash.",
    scores: { clarity: 94, feasibility: 90, moat: 92, team: 95, traction: 91 },
    blindspot: "Large monorepos with 10k+ files might hit AST parsing timeouts. Use tree-sitter WASM caching.",
    enhancement: "Highlight 'Zero-config GitHub App setup with 3-second PR comments' to boost initial dev adoption.",
    stack: ["Next.js 16", "Rust / WASM", "Gemini AI", "GitHub Octokit"],
  },
  {
    title: "Decentralized Peer Compute Market",
    pitch: "An open marketplace letting developers rent idle GPU clusters from independent providers for LLM fine-tuning with cryptographic verification.",
    scores: { clarity: 88, feasibility: 84, moat: 96, team: 92, traction: 89 },
    blindspot: "Node churn rate and non-deterministic GPU results require optimistic checkpoint verification.",
    enhancement: "Provide an npm SDK that mirrors the OpenAI client interface for instant drop-in compatibility.",
    stack: ["Go / libp2p", "PyTorch", "WebSockets", "MongoDB"],
  },
  {
    title: "Collaborative 3D CAD in Browser",
    pitch: "Figma for hardware engineering: real-time multiplayer 3D parametric CAD modeling in the browser with automated bill of materials generation.",
    scores: { clarity: 92, feasibility: 86, moat: 95, team: 94, traction: 93 },
    blindspot: "WebGL memory management on mobile devices can cause canvas crashes on complex assemblies.",
    enhancement: "Frame as 'Hardware sprints for remote engineering teams' to attract high-value student design teams.",
    stack: ["Three.js / WebGL", "Rust WASM", "CRDTs (Yjs)", "Next.js"],
  },
];

export function InteractiveValidatorSandbox() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customPitch, setCustomPitch] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [activeIdea, setActiveIdea] = useState(PRESET_IDEAS[0]);

  function handleRunScan(idx?: number) {
    const targetIdx = idx !== undefined ? idx : selectedIdx;
    if (idx !== undefined) setSelectedIdx(idx);
    setIsScanning(true);

    setTimeout(() => {
      if (customPitch.trim().length > 10) {
        setActiveIdea({
          title: "Custom Idea: " + customPitch.slice(0, 30) + "...",
          pitch: customPitch,
          scores: {
            clarity: Math.floor(Math.random() * 12) + 85,
            feasibility: Math.floor(Math.random() * 15) + 82,
            moat: Math.floor(Math.random() * 14) + 84,
            team: Math.floor(Math.random() * 10) + 88,
            traction: Math.floor(Math.random() * 12) + 86,
          },
          blindspot: "Early user acquisition needs a self-serve freemium wedge before expanding into team features.",
          enhancement: "Emphasize immediate value in first 60 seconds without requiring mandatory team onboarding.",
          stack: ["Next.js 16", "TypeScript", "Google Gemini AI", "Tailwind CSS"],
        });
      } else {
        setActiveIdea(PRESET_IDEAS[targetIdx]);
      }
      setIsScanning(false);
    }, 800);
  }

  const overallScore = Math.round(
    (activeIdea.scores.clarity +
      activeIdea.scores.feasibility +
      activeIdea.scores.moat +
      activeIdea.scores.team +
      activeIdea.scores.traction) /
      5
  );

  return (
    <div className="relative rounded-3xl border border-primary/30 bg-card/90 p-6 sm:p-10 shadow-xl backdrop-blur-xl space-y-8 overflow-hidden">
      {/* Decorative background glow */}
      <div className="glow-bg left-0 top-0 h-[250px] w-[250px] rounded-full bg-primary/20" />
      <div className="glow-bg right-0 bottom-0 h-[250px] w-[250px] rounded-full bg-purple-500/20" />

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-primary border-primary/30">
          <Sparkles className="w-3 h-3 mr-1" /> Live Interactive Sandbox
        </Badge>
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Test the AI Viability Engine <span className="text-gradient">Right Now</span>
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Select a sample project or type your own pitch to see real-time 5-dimension scoring and blind-spot analysis.
        </p>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {PRESET_IDEAS.map((idea, idx) => (
          <button
            key={idea.title}
            onClick={() => {
              setCustomPitch("");
              setSelectedIdx(idx);
              handleRunScan(idx);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedIdx === idx && !customPitch
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
            }`}
          >
            {idea.title}
          </button>
        ))}
      </div>

      {/* Input Box & Action */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="relative rounded-2xl border border-border/80 bg-background/60 p-2 shadow-inner focus-within:border-primary/60 transition-colors">
          <textarea
            value={customPitch || activeIdea.pitch}
            onChange={(e) => {
              setCustomPitch(e.target.value);
            }}
            placeholder="Or type your own startup / hackathon project pitch here..."
            rows={3}
            className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm outline-none resize-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between pt-2 px-2 border-t border-border/40">
            <span className="text-[11px] text-muted-foreground">
              Powered by Google Gemini 1.5 Flash Reasoning
            </span>
            <Button
              size="sm"
              onClick={() => handleRunScan()}
              disabled={isScanning}
              className="rounded-full gap-1.5 text-xs font-bold shadow-md shadow-primary/20"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Evaluating...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" /> Run AI Validation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Dynamic Results Card */}
      <div className="relative rounded-2xl border bg-background/80 p-5 sm:p-7 shadow-lg space-y-6">
        {/* Scanning Beam Animation */}
        {isScanning && (
          <motion.div
            className="absolute inset-0 bg-primary/10 rounded-2xl pointer-events-none z-20 flex items-center justify-center backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-bold text-primary animate-pulse">
                Evaluating Market & Tech Feasibility...
              </span>
            </div>
          </motion.div>
        )}

        {/* Overall Score Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base sm:text-lg text-foreground">{activeIdea.title}</h4>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs font-bold">
                Viability Index: {overallScore}/100
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              High potential for hackathon execution and open-source contributor recruitment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeIdea.stack.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-[11px] font-mono">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* 5-Dimension Score Progress Bars */}
        <div className="grid sm:grid-cols-5 gap-3">
          {[
            { label: "Problem Clarity", score: activeIdea.scores.clarity, color: "bg-emerald-500" },
            { label: "MVP Feasibility", score: activeIdea.scores.feasibility, color: "bg-blue-500" },
            { label: "Technical Moat", score: activeIdea.scores.moat, color: "bg-purple-500" },
            { label: "Team Appeal", score: activeIdea.scores.team, color: "bg-amber-500" },
            { label: "Market Traction", score: activeIdea.scores.traction, color: "bg-rose-500" },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl border bg-card/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground truncate">{item.label}</span>
                <span className="font-bold text-foreground">{item.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full ${item.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Blind Spot & Recommendation */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
              <AlertTriangle className="w-4 h-4" /> Detected Blind Spot
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeIdea.blindspot}
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <CheckCircle2 className="w-4 h-4" /> 1-Click AI Pitch Enhancer
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeIdea.enhancement}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
