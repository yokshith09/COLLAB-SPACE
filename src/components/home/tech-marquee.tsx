"use client";

import {
  Code2,
  Cpu,
  Database,
  Globe,
  Layers,
  Server,
  Zap,
  Boxes,
  Shield,
  Sparkles,
  GitBranch,
} from "lucide-react";

const TECH_ROW_1 = [
  { name: "Google Gemini 1.5", category: "AI LLM Engine", color: "text-purple-500" },
  { name: "Next.js 16 App Router", category: "Full-Stack Web", color: "text-foreground" },
  { name: "TypeScript 5", category: "Type Safety", color: "text-blue-500" },
  { name: "Tailwind CSS 4", category: "Modern Styling", color: "text-cyan-500" },
  { name: "MongoDB & Mongoose", category: "Multi-Tenant DB", color: "text-emerald-500" },
  { name: "Rust / WASM", category: "High-Perf Runtime", color: "text-orange-500" },
  { name: "Mermaid.js", category: "Dynamic Architecture", color: "text-pink-500" },
];

const TECH_ROW_2 = [
  { name: "PyTorch & Transformers", category: "Machine Learning", color: "text-rose-500" },
  { name: "Framer Motion", category: "Fluid Animations", color: "text-indigo-500" },
  { name: "Docker & K8s", category: "Containerization", color: "text-blue-400" },
  { name: "GraphQL & REST", category: "API Contracts", color: "text-pink-400" },
  { name: "WebSockets & WebRTC", category: "Realtime Collaboration", color: "text-amber-500" },
  { name: "GitHub Actions", category: "CI/CD Automation", color: "text-gray-400" },
  { name: "NextAuth v5", category: "Hardened Security", color: "text-emerald-400" },
];

export function TechMarquee() {
  return (
    <div className="relative w-full overflow-hidden py-8 space-y-4">
      {/* Edge gradient fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      {/* Row 1: Leftward Marquee */}
      <div className="flex animate-marquee gap-3">
        {[...TECH_ROW_1, ...TECH_ROW_1, ...TECH_ROW_1].map((tech, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm hover:border-primary/40 transition-colors shrink-0"
          >
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div>
              <div className={`font-bold text-xs ${tech.color}`}>{tech.name}</div>
              <div className="text-[10px] text-muted-foreground">{tech.category}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Rightward Marquee */}
      <div className="flex animate-marquee-reverse gap-3">
        {[...TECH_ROW_2, ...TECH_ROW_2, ...TECH_ROW_2].map((tech, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm hover:border-primary/40 transition-colors shrink-0"
          >
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <div>
              <div className={`font-bold text-xs ${tech.color}`}>{tech.name}</div>
              <div className="text-[10px] text-muted-foreground">{tech.category}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
