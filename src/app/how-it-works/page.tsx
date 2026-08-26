import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  GitBranch,
  Target,
  Users,
  Kanban,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Crown,
  Compass,
  Rocket,
  Search,
  Code2,
  Layers,
  Clock,
  Award,
  HelpCircle,
} from "lucide-react";

export const metadata = {
  title: "How It Works | CollabSpace",
  description: "Learn how CollabSpace combines AI idea validation, Living PRDs, talent matchmaking, and sprint milestone management to turn project ideas into shipped software.",
};

const lifecycleSteps = [
  {
    step: "01",
    badge: "Step 1: Ideation & Stress-Testing",
    title: "Validate Your Idea with AI",
    subtitle: "Catch blind spots, evaluate competitive moats, and score viability before building.",
    icon: Brain,
    gradient: "from-violet-500 to-purple-600",
    description:
      "When you create a project on CollabSpace, you can instantly run our AI Idea Viability Validator. Our engine evaluates your submission across 5 core dimensions: Problem Clarity, MVP Feasibility, Technical Moat, Contributor Attractiveness, and Market Traction.",
    bullets: [
      "5-Dimension quantitative scorecard (0–100 score matrix)",
      "Actionable blind-spot identification & risk mitigation tips",
      "1-click AI Pitch Enhancer to make your listing irresistible to contributors",
      "Works out of the box with built-in heuristic fallback even without API keys",
    ],
  },
  {
    step: "02",
    badge: "Step 2: Technical Specifications",
    title: "Generate Living PRDs & Mind Maps",
    subtitle: "Turn a simple pitch into production-grade technical blueprints and architecture diagrams.",
    icon: FileText,
    gradient: "from-blue-500 to-cyan-500",
    description:
      "No more vague project descriptions. The Living PRD Studio synthesizes complete technical specifications including user personas, system architectures, database schemas, and REST API contracts.",
    bullets: [
      "Interactive Mermaid.js architecture flowcharts and ER schemas",
      "Dynamic client-side zoom, pan, and SVG diagram exports",
      "Live Markdown editor with version history and .md file download",
      "Automated technical stack recommendations tailored to your MVP scope",
    ],
  },
  {
    step: "03",
    badge: "Step 3: Team Recruitment",
    title: "AI Matchmaking & Direct Invites",
    subtitle: "Find the exact developers, designers, and domain experts your project needs.",
    icon: Users,
    gradient: "from-emerald-500 to-teal-500",
    description:
      "Stop posting into the void. CollabSpace gives project leaders active matchmaking radar and direct invitation tools to assemble cross-functional teams in days.",
    bullets: [
      "AI skill-compatibility radar matching builders with project requirements",
      "Direct collaboration invites with custom role pitches and instant accept/decline",
      "Curated builder profiles showcasing verified GitHub commits and portfolios",
      "Anti-ghosting policy: unreviewed applications auto-expire in 14 days to keep queues fresh",
    ],
  },
  {
    step: "04",
    badge: "Step 4: Sprint Roadmaps",
    title: "Agile Milestones & Spec-to-Kanban",
    subtitle: "Break big projects into 4 actionable sprints with automated team accountability.",
    icon: Target,
    gradient: "from-amber-500 to-orange-500",
    description:
      "Execution is where most side projects stall. CollabSpace keeps teams aligned with automated sprint roadmaps and 1-click Spec-to-Kanban task decomposition.",
    bullets: [
      "1-Click Spec-to-Kanban: auto-converts PRD user stories into task cards with skill tags",
      "4-Phase chronological sprint milestones with interactive deliverable checklists",
      "Automated 48-hour background cron reminders to prevent stalled momentum",
      "Live sprint progress percentage meters calculated from completed deliverables",
    ],
  },
  {
    step: "05",
    badge: "Step 5: Collaborative Shipping",
    title: "Private Team Enclaves & Recognition",
    subtitle: "Collaborate in real time, push code, and build your verified builder reputation.",
    icon: Kanban,
    gradient: "from-indigo-500 to-pink-500",
    description:
      "Once your team is locked in, drop into your private Team Enclave. Chat in real time, edit shared scratchpad notes, manage task boards, and sync your GitHub repository.",
    bullets: [
      "Real-time team chat channels for low-latency technical deliberation",
      "Shared cryptographic scratchpad notes for architecture specs and meeting notes",
      "GitHub commit webhook integration showing real-time code progress",
      "Reputation points, contribution velocity heatmaps, and leaderboard recognition",
    ],
  },
];

const personas = [
  {
    role: "For Project Founders & Leaders",
    badge: "Project Creators",
    icon: Crown,
    steps: [
      "1. Post your idea and let the AI validator score viability and refine your pitch.",
      "2. Generate your Living PRD and Mermaid architecture diagrams in under 60 seconds.",
      "3. Use the Talent Radar to send direct collaboration invites to matching developers.",
      "4. Launch 4-phase sprint milestones and track team deliverables with automated 48h reminders.",
    ],
  },
  {
    role: "For Developers, Designers & Builders",
    badge: "Contributors",
    icon: Code2,
    steps: [
      "1. Browse curated projects filtered by domain, tech stack, and skill match score.",
      "2. Review living PRDs and system architecture before applying so you know exactly what you'll build.",
      "3. Apply with a custom pitch or accept direct invites from project founders.",
      "4. Ship features in the Team Workspace, sync GitHub commits, and climb the Leaderboard.",
    ],
  },
];

const faqs = [
  {
    q: "Do I need a paid API key to use AI features?",
    a: "No! CollabSpace features a dual-engine architecture. If you provide a Google Gemini API key, you get live LLM reasoning. If no key is configured, our built-in contextual domain synthesizer automatically generates complete scorecards, living PRDs, Mermaid mind maps, and sprint milestones at zero cost.",
  },
  {
    q: "How does the 30-day free trial work?",
    a: "Every new account automatically receives 30 days of unrestricted Pro access. You get 100 AI validations, 50 PRD generations, 50 sprint roadmaps, automated 48h cron team reminders, and up to 25 active projects. Paid billing ($19/mo or $15/mo annual) only activates after your trial period ends.",
  },
  {
    q: "What is the Spec-to-Kanban feature?",
    a: "Spec-to-Kanban allows project owners to decompose the feature requirements and user stories in their Living PRD directly into Kanban board task cards with a single click. Each card is automatically categorized, prioritized, and tagged with required technical skills.",
  },
  {
    q: "How do automated milestone reminders work?",
    a: "CollabSpace runs background cron workers that check all active projects with pending deliverables. If a milestone is approaching its target date or has uncompleted items, targeted in-app notifications are dispatched to all team members every 48 hours to prevent projects from going stale.",
  },
  {
    q: "Is my project data safe and private?",
    a: "Yes. While project pitches and listings are discoverable publicly to attract top talent, private team enclaves, chat messages, shared notes, and sensitive workspace discussions are restricted strictly to accepted team members.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b px-4 py-20 md:py-28 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_50%,#f1f5f9_100%)] dark:bg-none">
        <div className="glow-bg animate-pulse-glow left-1/2 top-0 h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-primary" />

        <div className="relative z-10 mx-auto max-w-4xl space-y-6 text-center">
          <Badge variant="outline" className="gap-1.5 text-xs text-primary border-primary/30 py-1 px-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> End-to-End Product Lifecycle
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            How <span className="text-gradient">CollabSpace</span> Works
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            From raw idea spark to Living PRD, dream team recruitment, and sprint execution — here is how our AI-powered ecosystem helps you ship real products.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link href="/projects/new">
              <Button size="lg" className="rounded-full px-7 font-bold gap-2 shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4" /> Try with Your Idea
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" size="lg" className="rounded-full px-7 font-semibold gap-2">
                <Compass className="w-4 h-4" /> Explore Open Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-16 sm:px-6 space-y-24">
        {/* Step-by-Step Interactive Walkthrough */}
        <section className="space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">The 5-Step Blueprint</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">The Modern Path from Idea to Launch</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Every feature in CollabSpace is engineered to remove friction at each phase of project building.
            </p>
          </div>

          <div className="space-y-12">
            {lifecycleSteps.map((item, idx) => {
              const Icon = item.icon;
              const isEven = idx % 2 === 1;

              return (
                <div
                  key={item.step}
                  className={`p-8 sm:p-10 rounded-3xl border bg-card shadow-sm hover:border-primary/40 transition-all grid md:grid-cols-12 gap-8 items-center relative overflow-hidden`}
                >
                  <div className={`md:col-span-7 space-y-4 ${isEven ? "md:order-2" : "md:order-1"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                        {item.step}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{item.title}</h3>
                    <p className="text-sm font-medium text-foreground/80">{item.subtitle}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

                    <div className="pt-2 space-y-2">
                      {item.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`md:col-span-5 flex justify-center ${isEven ? "md:order-1" : "md:order-2"}`}>
                    <div className="w-full aspect-square max-w-[280px] rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/20 p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-lg`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-black text-primary tracking-widest uppercase">Phase {item.step}</div>
                        <div className="font-bold text-base">{item.title}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Dual Personas Section */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Tailored Experience</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Built for Founders & Builders Alike</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Whether you are leading a project or looking to contribute code and design, CollabSpace gives you superpowers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {personas.map((persona, pIdx) => {
              const Icon = persona.icon;
              return (
                <div key={pIdx} className="p-8 rounded-3xl border bg-card/60 space-y-6 hover:border-primary/40 transition-all shadow-sm flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="font-bold text-xs">
                      {persona.badge}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold">{persona.role}</h3>

                  <div className="space-y-3.5 flex-1">
                    {persona.steps.map((stepText, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{stepText}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Link href={pIdx === 0 ? "/projects/new" : "/projects"}>
                      <Button className="w-full rounded-full font-semibold gap-2" variant={pIdx === 0 ? "default" : "outline"}>
                        {pIdx === 0 ? "Start a Project as Founder" : "Find Projects to Join"} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex p-2 rounded-xl bg-primary/10 text-primary mb-1">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Everything you need to know about getting started on CollabSpace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, fIdx) => (
              <div key={fIdx} className="p-6 rounded-2xl border bg-card space-y-2.5 shadow-sm">
                <h4 className="font-bold text-base text-foreground">{faq.q}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="p-10 sm:p-14 rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent text-center space-y-6 shadow-xl">
          <Badge className="bg-primary text-white text-xs font-bold uppercase tracking-wider px-3 py-1">
            <Rocket className="w-3.5 h-3.5 mr-1" /> Ready to build?
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Turn your next big idea into reality today.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of developers, designers, and founders building together on CollabSpace with a 30-day all-access free trial.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/projects/new">
              <Button size="lg" className="rounded-full px-8 font-bold gap-2 shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4" /> Create Your Project
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" size="lg" className="rounded-full px-8 font-semibold">
                Explore Discover Feed
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
