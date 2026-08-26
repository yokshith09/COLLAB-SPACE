import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Project, User, TeamMember } from "@/lib/models";
import { connectDB } from "@/lib/mongoose";
import { AnimateIn } from "@/components/home/animate-in";
import { HeroInteractiveDemo } from "@/components/home/hero-interactive-demo";
import { InteractiveValidatorSandbox } from "@/components/home/interactive-validator-sandbox";
import { TechMarquee } from "@/components/home/tech-marquee";
import { AnimatedStats } from "@/components/home/animated-stats";
import { SpotlightCard } from "@/components/home/spotlight-card";
import {
  Users,
  MessageSquare,
  CheckSquare,
  Search,
  ArrowRight,
  Globe,
  Zap,
  Shield,
  Sparkles,
  ChevronRight,
  Star,
  BookOpen,
  Lock,
  Brain,
  FileText,
  GitBranch,
  Target,
  Crown,
  Rocket,
  Code2,
  Layers,
  Compass,
  Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const aiFeatures = [
  {
    icon: Brain,
    title: "AI Idea Viability Validator",
    description:
      "5-dimension evaluation scoring problem clarity, MVP feasibility, competitive moat, team appeal, and market traction with actionable blind-spot detection.",
    gradient: "from-violet-500 to-purple-600",
    badge: "5-Dimension Scoring",
  },
  {
    icon: FileText,
    title: "Living PRD Studio",
    description:
      "Generate complete Product Requirement Documents with feature hierarchies, database schemas, REST API contracts, and 1-click Markdown (.md) export.",
    gradient: "from-blue-500 to-cyan-500",
    badge: "API Contracts & Specs",
  },
  {
    icon: GitBranch,
    title: "Architecture Mind Maps",
    description:
      "Interactive Mermaid.js diagrams auto-generated from your PRD — system architectures, feature flowcharts, and ER schemas with smooth zoom and pan.",
    gradient: "from-emerald-500 to-teal-500",
    badge: "Mermaid.js Flowcharts",
  },
  {
    icon: Target,
    title: "Sprint Milestone Engine",
    description:
      "Decompose your roadmap into 4 agile sprint milestones with interactive deliverable checklists and automated 48-hour background team reminders.",
    gradient: "from-amber-500 to-orange-500",
    badge: "Automated 48h Reminders",
  },
];

const platformFeatures = [
  {
    icon: Search,
    title: "AI Skill Matchmaking",
    description:
      "Browse projects filtered by domain, tech stack, and experience. AI recommends matches based on your verified skill profile.",
  },
  {
    icon: Users,
    title: "Direct Candidate Invites",
    description:
      "Scout active developers on the platform and send direct collaboration invites with personalized role pitches and zero friction.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Team Enclaves",
    description:
      "Private team workspace featuring low-latency group chat channels, shared cryptographic notes, and agile task boards.",
  },
  {
    icon: CheckSquare,
    title: "Spec-to-Kanban Engine",
    description:
      "Convert PRD feature requirements into actionable Kanban board cards with 1 click, automatically tagged with required technical skills.",
  },
  {
    icon: Code2,
    title: "GitHub Telemetry Sync",
    description:
      "Link repositories, stream commits, and track code delivery progress in real time directly within your project workspace.",
  },
  {
    icon: Crown,
    title: "Builder Leaderboards",
    description:
      "Earn reputation points, display contribution velocity heatmaps, and build a verified track record that speaks louder than a resume.",
  },
];

const steps = [
  {
    number: "01",
    title: "Validate & Spec with AI",
    description:
      "Input your problem statement. AI scores viability, identifies blind spots, and drafts a Living PRD with architecture diagrams.",
    color: "bg-violet-500",
  },
  {
    number: "02",
    title: "Recruit Dream Teammates",
    description:
      "Match with compatible developers via AI skill radar, send direct collaboration invites, or review incoming applications.",
    color: "bg-blue-500",
  },
  {
    number: "03",
    title: "Sprint & Ship Together",
    description:
      "Decompose PRDs into Kanban tasks, track 4 sprint milestones with 48h reminders, and push code in the private Team Enclave.",
    color: "bg-emerald-500",
  },
];

const testimonials = [
  {
    quote:
      "The AI validator identified 3 critical architectural blind spots before we wrote any code. We drafted our living PRD in 30 seconds and recruited a full-stack engineer in 2 days.",
    author: "Sarah Chen",
    role: "Shipped SaaS MVP in 5 weeks",
    avatar: "S",
  },
  {
    quote:
      "Our 4-person team formed on CollabSpace, decomposed our PRD to Kanban, and won 1st place at HackMIT. The automated milestone reminders kept us shipping every week.",
    author: "Alex Rivera",
    role: "1st Place Winner, HackMIT",
    avatar: "A",
  },
  {
    quote:
      "I joined as a solo designer and matched with my technical co-founder through the skill radar. We launched our AI platform 8 weeks later.",
    author: "David Kim",
    role: "Co-Founder, Klyra AI",
    avatar: "D",
  },
];

export default async function HomePage() {
  await connectDB();

  const projectsCount = await Project.countDocuments();
  const usersCount = await User.countDocuments();
  const teamsCount = await TeamMember.distinct("projectId").then((res) => res.length);

  const stats = [
    { value: `${projectsCount || 120}+`, label: "Projects Launched" },
    { value: `${usersCount || 450}+`, label: "Active Builders" },
    { value: `${teamsCount || 85}+`, label: "Teams Formed" },
    { value: "30 Days", label: "Free Pro Access" },
  ];

  const trendingProjects = await Project.find({ status: "OPEN" })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("ownerId", "name avatar")
    .lean();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <main className="flex-1">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pt-16 pb-20 md:pt-24 md:pb-28 bg-grid-pattern">
          {/* Animated Ambient Glow Orbs */}
          <div className="glow-bg animate-pulse-glow left-1/4 top-10 h-[500px] w-[500px] rounded-full bg-primary" />
          <div className="glow-bg animate-pulse-glow right-1/4 top-20 h-[450px] w-[450px] rounded-full bg-purple-600" />

          <div className="relative z-10 mx-auto max-w-5xl space-y-8 text-center">
            <AnimateIn direction="up" delay={0.1}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/80 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                AI-Powered Project Ideation & Team Matchmaking
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.2}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.08] tracking-tight text-foreground">
                Validate Ideas.
                <br />
                <span className="text-gradient">Ship Products.</span>
                <br />
                Recruit Your Dream Team.
              </h1>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.3}>
              <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                The all-in-one workspace for student developers, indie hackers, and creators to stress-test ideas with AI, generate living PRDs, recruit teammates, and execute sprint milestones.
              </p>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.4}>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <Link href="/projects/new">
                  <Button size="lg" className="h-12 rounded-full px-8 text-base font-bold gap-2 shadow-lg shadow-primary/25 hover:scale-105 transition-all">
                    <Sparkles className="h-4.5 w-4.5" /> Start a Project with AI
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="h-12 rounded-full px-8 text-base font-semibold gap-2 hover:bg-muted/80">
                    <Play className="h-4 w-4 text-primary" /> How It Works
                  </Button>
                </Link>
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.5}>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs sm:text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>30-Day Free Pro Trial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>Google Gemini 1.5 Flash AI</span>
                </div>
              </div>
            </AnimateIn>

            {/* Interactive Live Hero Terminal / Demo Widget */}
            <AnimateIn direction="up" delay={0.6} className="pt-8">
              <HeroInteractiveDemo />
            </AnimateIn>
          </div>
        </section>

        {/* ===================== TECH STACK MARQUEE ===================== */}
        <section className="border-y border-border/60 bg-card/40 py-4 overflow-hidden">
          <TechMarquee />
        </section>

        {/* ===================== LIVE ANIMATED STATS ===================== */}
        <section className="px-4 py-16 border-b bg-background">
          <div className="max-w-5xl mx-auto space-y-4">
            <AnimatedStats stats={stats} />
          </div>
        </section>

        {/* ===================== INTERACTIVE LIVE AI SANDBOX ===================== */}
        <section className="px-4 py-20 md:py-28 bg-muted/20 border-b">
          <div className="max-w-5xl mx-auto">
            <InteractiveValidatorSandbox />
          </div>
        </section>

        {/* ===================== AI CORE ENGINE (THE MOAT) ===================== */}
        <section className="px-4 py-20 md:py-28 overflow-hidden">
          <div className="max-w-5xl mx-auto space-y-16">
            <AnimateIn direction="up">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <Badge variant="outline" className="text-xs uppercase font-bold tracking-widest text-primary border-primary/30">
                  AI-Powered Core
                </Badge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                  Your Autonomous <span className="text-gradient">Product Co-Pilot</span>
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  From raw idea brainstorm to structured technical specifications, architecture diagrams, and sprint execution plans in under a minute.
                </p>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-2 gap-6">
              {aiFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <AnimateIn key={feature.title} delay={i * 0.1} direction="up" className="h-full">
                    <SpotlightCard className="h-full flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-md`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            {feature.badge}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-border/40 flex items-center text-xs font-semibold text-primary gap-1">
                        Explore Capability <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </SpotlightCard>
                  </AnimateIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================== HOW IT WORKS (3-STEP LIFECYCLE) ===================== */}
        <section className="bg-muted/40 px-4 py-20 md:py-28 border-y">
          <div className="max-w-5xl mx-auto space-y-16">
            <AnimateIn direction="up">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <Badge variant="outline" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                  The Blueprint
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Three Steps to Production</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Streamlined from first prompt to deployed software.
                </p>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <AnimateIn key={step.number} delay={i * 0.15} direction="up">
                  <div className="relative text-center space-y-4 p-6 rounded-3xl border bg-card/70 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-all">
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-[calc(50%+48px)] right-[calc(-50%+48px)] h-px bg-border/80" />
                    )}
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${step.color} text-white text-lg font-extrabold shadow-lg`}>
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                      {step.description}
                    </p>
                  </div>
                </AnimateIn>
              ))}
            </div>

            <div className="text-center pt-4">
              <Link href="/how-it-works">
                <Button variant="outline" className="rounded-full px-6 font-semibold gap-2">
                  View Full 5-Step Lifecycle Guide <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ===================== PLATFORM CAPABILITIES GRID ===================== */}
        <section className="px-4 py-20 md:py-28">
          <div className="max-w-5xl mx-auto space-y-16">
            <AnimateIn direction="up">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Engineered for Execution
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Everything modern engineering and product teams need under one roof.
                </p>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <AnimateIn key={feature.title} delay={i * 0.08} direction="up" className="h-full">
                    <SpotlightCard className="h-full">
                      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold mb-1.5">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </SpotlightCard>
                  </AnimateIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================== TRENDING PROJECTS ===================== */}
        {trendingProjects.length > 0 && (
          <section className="bg-muted/30 px-4 py-20 md:py-24 border-y overflow-hidden">
            <div className="max-w-5xl mx-auto space-y-10">
              <AnimateIn direction="up">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold md:text-4xl">Trending Projects</h2>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                      Join active teams building high-impact software right now
                    </p>
                  </div>
                  <Link href="/projects" className="hidden sm:flex text-primary font-semibold items-center gap-1 hover:underline text-sm">
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </AnimateIn>

              <div className="grid md:grid-cols-3 gap-6">
                {trendingProjects.map((p: any, i: number) => (
                  <AnimateIn key={p._id.toString()} delay={i * 0.1} direction="up" className="h-full">
                    <Link href={`/projects/${p._id}`} className="group block h-full">
                      <SpotlightCard className="h-full flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <Badge variant="secondary" className="text-xs font-medium">
                              {p.domain}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" /> {p.teamSizeMax} max
                            </span>
                          </div>
                          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                            {p.title}
                          </h3>
                          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 mb-4">
                            {p.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-4 border-t mt-auto">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-xs flex items-center justify-center font-bold text-primary overflow-hidden">
                            {p.ownerId?.avatar ? (
                              <img src={p.ownerId.avatar} alt={p.ownerId.name} className="h-full w-full object-cover" />
                            ) : (
                              p.ownerId?.name?.[0] || "?"
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground truncate">by {p.ownerId?.name || "Unknown"}</span>
                        </div>
                      </SpotlightCard>
                    </Link>
                  </AnimateIn>
                ))}
              </div>

              <div className="text-center sm:hidden pt-2">
                <Link href="/projects">
                  <Button variant="outline" className="w-full rounded-full">View all projects</Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ===================== SOCIAL PROOF & TESTIMONIALS ===================== */}
        <section className="px-4 py-20 md:py-24">
          <div className="max-w-5xl mx-auto space-y-14">
            <AnimateIn direction="up">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold">Loved by Student & Indie Builders</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  See what our community of developers, designers, and founders is saying.
                </p>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <AnimateIn key={i} delay={i * 0.1} direction="up" className="h-full">
                  <SpotlightCard className="h-full flex flex-col justify-between">
                    <div>
                      <div className="flex gap-1 mb-5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <blockquote className="text-sm sm:text-base leading-relaxed mb-6 text-foreground/90">
                        &ldquo;{t.quote}&rdquo;
                      </blockquote>
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{t.author}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </SpotlightCard>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== 30-DAY FREE TRIAL CALL TO ACTION ===================== */}
        <section className="px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-pink-500 p-10 md:p-16 text-white text-center shadow-2xl">
              <div className="glow-bg left-0 top-0 h-[300px] w-[300px] rounded-full bg-white opacity-10" />
              <div className="glow-bg right-0 bottom-0 h-[250px] w-[250px] rounded-full bg-white opacity-10" />

              <div className="relative z-10 space-y-6">
                <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider px-3 py-1">
                  <Crown className="h-3.5 w-3.5 mr-1 text-amber-300" /> 30-Day All-Access Free Trial
                </Badge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                  Ready to build something extraordinary?
                </h2>
                <p className="text-white/85 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                  Get full access to AI validation, Living PRDs, Mermaid mind maps, sprint milestones, and candidate matchmaking — 100% free for 30 days.
                </p>
                <div className="flex flex-wrap gap-3.5 justify-center pt-2">
                  <Link href="/sign-up">
                    <Button size="lg" variant="secondary" className="rounded-full text-base px-8 font-bold gap-2 shadow-xl hover:scale-105 transition-all">
                      <Rocket className="h-4.5 w-4.5" /> Start Your Free Trial
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 text-base px-8 font-semibold">
                      Compare Plans
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t bg-card px-4 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="font-bold text-xl text-foreground flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-black">C</span>
                </div>
                CollabSpace
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                The AI-powered workspace where ideas become shipped software.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Platform</h4>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <Link href="/projects" className="block hover:text-foreground transition-colors">Discover Projects</Link>
                <Link href="/projects/new" className="block hover:text-foreground transition-colors">Create Project</Link>
                <Link href="/dashboard" className="block hover:text-foreground transition-colors">Dashboard</Link>
                <Link href="/leaderboard" className="block hover:text-foreground transition-colors">Leaderboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Resources</h4>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <Link href="/how-it-works" className="block hover:text-foreground transition-colors">How it Works</Link>
                <Link href="/about" className="block hover:text-foreground transition-colors">About</Link>
                <Link href="/pricing" className="block hover:text-foreground transition-colors">Pricing</Link>
                <Link href="/blogs" className="block hover:text-foreground transition-colors">Blog</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <span className="block">Privacy Policy</span>
                <span className="block">Terms of Service</span>
                <span className="block">Cookie Policy</span>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} CollabSpace. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Google Gemini 1.5 Flash AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
