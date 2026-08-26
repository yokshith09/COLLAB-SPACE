import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  Target,
  Users,
  Compass,
  FileText,
  GitBranch,
  Crown,
  CheckCircle2,
  Bell,
  Code2,
  TrendingUp,
  ShieldCheck,
  Award,
  ArrowRight,
  Kanban,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 py-12 px-4 sm:px-6">
      {/* Hero Header */}
      <section className="text-center space-y-5 max-w-3xl mx-auto">
        <Badge variant="outline" className="gap-1.5 text-xs text-primary border-primary/30 py-1 px-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" /> Next-Generation Project Collaboration
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Where Visionary Ideas Become <span className="text-primary bg-clip-text">Shipped Products</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          CollabSpace is an AI-augmented workspace for student developers, indie hackers, and open-source creators to stress-test ideas, generate living PRDs, recruit dream teams, and sprint toward launch.
        </p>
        <div className="pt-3 flex flex-wrap justify-center gap-3">
          <Link href="/projects/new">
            <Button size="lg" className="rounded-full gap-2 shadow-md">
              <Sparkles className="w-4 h-4" /> Start a Project with AI
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="outline" size="lg" className="rounded-full gap-2">
              <Compass className="w-4 h-4" /> Explore Open Projects
            </Button>
          </Link>
        </div>
      </section>

      {/* 3-Step Lifecycle */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">The 3-Step Project Lifecycle</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            From initial brainstorm to sprint milestones and final delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-2xl bg-card space-y-3 relative overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-lg">AI Idea Validation & PRD</h3>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Input your problem statement. Our 5-dimension AI validator scores feasibility, detects blind spots, and drafts a Living PRD with interactive Mermaid architecture mind maps.
            </p>
          </div>

          <div className="p-6 border rounded-2xl bg-card space-y-3 relative overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-lg">AI Matchmaking & Direct Invites</h3>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Recruit the exact talent you need. Use AI radar matching to discover active builders by skill stack or send direct collaboration invitations with personalized notes.
            </p>
          </div>

          <div className="p-6 border rounded-2xl bg-card space-y-3 relative overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-lg">Sprint Milestones & Execution</h3>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Decompose your PRD into Kanban tasks with 1 click. Track multi-week sprint deliverables with automated 48-hour team reminders to prevent project staleness.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Capabilities</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Everything Modern Builders Need</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-2xl bg-card space-y-2.5 hover:border-primary/40 transition-colors shadow-sm">
            <div className="p-2.5 w-fit rounded-xl bg-primary/10 text-primary mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">AI Idea Viability Validator</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              5-dimension evaluation scoring problem clarity, feasibility, moat, team attractiveness, and traction potential with actionable blind-spot analysis.
            </p>
          </div>

          <div className="p-6 border rounded-2xl bg-card space-y-2.5 hover:border-primary/40 transition-colors shadow-sm">
            <div className="p-2.5 w-fit rounded-xl bg-blue-500/10 text-blue-500 mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Living PRD Studio</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate complete Product Requirement Documents with feature breakdowns, data schemas, API contracts, and direct Markdown export (.md).
            </p>
          </div>

          <div className="p-6 border rounded-2xl bg-card space-y-2.5 hover:border-primary/40 transition-colors shadow-sm">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-500 mb-2">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Mermaid Mind Maps</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Interactive client-side rendered architecture diagrams, feature flowcharts, and Entity-Relationship mind maps with instant zoom and pan.
            </p>
          </div>

          <div className="p-6 border rounded-2xl bg-card space-y-2.5 hover:border-primary/40 transition-colors shadow-sm">
            <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 text-purple-500 mb-2">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Sprint Milestone Tracker</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Break work into chronological sprint milestones with interactive deliverable checklists, real-time progress calculations, and team reminders.
            </p>
          </div>

          <div className="p-6 border rounded-2xl bg-card space-y-2.5 hover:border-primary/40 transition-colors shadow-sm">
            <div className="p-2.5 w-fit rounded-xl bg-amber-500/10 text-amber-500 mb-2">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Direct Candidate Invites</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Match with compatible developers through AI skill radar and dispatch direct collaboration invitations with custom role pitches.
            </p>
          </div>

          <div className="p-6 border rounded-2xl bg-card space-y-2.5 hover:border-primary/40 transition-colors shadow-sm">
            <div className="p-2.5 w-fit rounded-xl bg-indigo-500/10 text-indigo-500 mb-2">
              <Kanban className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Private Team Enclaves</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dedicated collaborative workspaces featuring real-time group chat, shared notes, agile Kanban boards, and GitHub activity feeds.
            </p>
          </div>
        </div>
      </section>

      {/* Free Trial Banner */}
      <section className="p-8 rounded-3xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-bold">30-Day All-Access Free Trial</h3>
              <Badge className="bg-emerald-500 text-white text-[10px] font-bold">Free for All</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every new user gets full, unrestricted access to deep Google Gemini 1.5 Flash AI reasoning, Living PRDs, mind maps, and automated sprint milestones for 30 days. Paid plans activate only after your trial period.
            </p>
          </div>
          <Link href="/pricing">
            <Button size="lg" className="rounded-full gap-2 shrink-0 font-bold shadow-md">
              View Pricing & Plans <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Application Workflow & Rules */}
      <section className="p-8 rounded-2xl border bg-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold">Safe & Respectful Collaboration</h2>
        <div className="grid sm:grid-cols-3 gap-4 pt-2 text-xs sm:text-sm text-muted-foreground">
          <div className="space-y-1 p-3 rounded-xl border bg-background/50">
            <h4 className="font-semibold text-foreground">Transparent Applications</h4>
            <p>Apply to open projects with your desired role, availability, and portfolio pitch.</p>
          </div>
          <div className="space-y-1 p-3 rounded-xl border bg-background/50">
            <h4 className="font-semibold text-foreground">Anti-Ghosting Policy</h4>
            <p>Applications auto-expire after 14 days if unreviewed, keeping project queues fresh.</p>
          </div>
          <div className="space-y-1 p-3 rounded-xl border bg-background/50">
            <h4 className="font-semibold text-foreground">Quality Rate Limits</h4>
            <p>5 applications per day limit prevents mass spam and fosters meaningful interactions.</p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <div className="text-center pt-4 space-y-3">
        <h3 className="text-2xl font-bold">Ready to bring your next idea to life?</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Join thousands of developers, designers, and creators building on CollabSpace.
        </p>
        <div className="pt-2">
          <Link href="/projects/new">
            <Button size="lg" className="rounded-full px-8 shadow-lg font-bold">
              Create Your First Project
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
