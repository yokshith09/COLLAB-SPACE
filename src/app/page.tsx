import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Project, User, TeamMember } from "@/lib/models";
import { connectDB } from "@/lib/mongoose";
import { AnimateIn } from "@/components/home/animate-in";
import {
  Users, MessageSquare, CheckSquare, Search, ArrowRight,
  Globe, Zap, Shield, Sparkles, ChevronRight, Star, BookOpen, Lock,
  Brain, FileText, GitBranch, Target, Crown, Rocket, Code2, Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const aiFeatures = [
  {
    icon: Brain,
    title: "AI Idea Validator",
    description: "5-dimension scoring evaluates problem clarity, feasibility, competitive moat, team attractiveness, and traction potential before you write a single line of code.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: FileText,
    title: "Living PRD Studio",
    description: "Generate complete Product Requirement Documents with feature hierarchies, data schemas, API contracts, and direct Markdown export.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: GitBranch,
    title: "Architecture Mind Maps",
    description: "Interactive Mermaid.js diagrams auto-generated from your PRD — system architecture, user flows, and ER schemas with zoom and pan.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Target,
    title: "Sprint Milestone Engine",
    description: "AI decomposes your roadmap into 4 agile sprints with deliverable checklists, progress tracking, and automated 48-hour team reminders.",
    gradient: "from-amber-500 to-orange-500",
  },
];

const platformFeatures = [
  {
    icon: Search,
    title: "Smart Discovery",
    description: "Browse open projects filtered by domain, tech stack, and team needs. AI recommends matches based on your skill profile.",
  },
  {
    icon: Users,
    title: "Direct Team Invites",
    description: "Send collaboration invitations to compatible builders with personalized role pitches. No more cold DMs.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Team Chat",
    description: "Private team workspace with instant messaging, shared scratchpad notes, and threaded discussions.",
  },
  {
    icon: CheckSquare,
    title: "Kanban Task Boards",
    description: "Drag-and-drop task management with TODO, IN PROGRESS, and DONE columns. AI can auto-generate tasks from your PRD.",
  },
  {
    icon: Code2,
    title: "GitHub Integration",
    description: "Link repositories, track commits, and sync your codebase progress directly into the project workspace.",
  },
  {
    icon: Crown,
    title: "Builder Reputation",
    description: "Earn points, climb the leaderboard, and build a verified track record that speaks louder than any resume.",
  },
];

const steps = [
  {
    number: "01",
    title: "Validate & Spec",
    description: "Input your idea. AI scores its viability, generates a Living PRD, architecture diagrams, and sprint milestones.",
    color: "bg-violet-500",
  },
  {
    number: "02",
    title: "Recruit & Match",
    description: "AI recommends compatible teammates. Send direct invites or let builders apply to your project with a pitch.",
    color: "bg-blue-500",
  },
  {
    number: "03",
    title: "Build & Ship",
    description: "Collaborate in a private team workspace with chat, Kanban boards, milestone tracking, and GitHub sync.",
    color: "bg-emerald-500",
  },
];

const testimonials = [
  {
    quote: "The AI validator caught 3 blind spots in my pitch I never would have seen. Our PRD was generated in 30 seconds.",
    author: "Sarah Chen",
    role: "Shipped a SaaS MVP in 6 weeks",
    avatar: "S",
  },
  {
    quote: "We formed a 4-person team in 2 days and won first place. The sprint milestones kept us shipping every week.",
    author: "Alex Rivera",
    role: "1st Place at HackMIT 2025",
    avatar: "A",
  },
  {
    quote: "I joined as a solo designer and found my technical co-founder through the skill matching. We launched 8 weeks later.",
    author: "David Kim",
    role: "Co-founder, Klyra AI",
    avatar: "D",
  },
];

export default async function HomePage() {
  await connectDB();

  const projectsCount = await Project.countDocuments();
  const usersCount = await User.countDocuments();
  const teamsCount = await TeamMember.distinct("projectId").then((res) => res.length);

  const stats = [
    { value: `${projectsCount}+`, label: "Projects Launched" },
    { value: `${usersCount}+`, label: "Active Builders" },
    { value: `${teamsCount}+`, label: "Teams Formed" },
    { value: "30 days", label: "Free Pro Trial" },
  ];

  const trendingProjects = await Project.find({ status: "OPEN" })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("ownerId", "name avatar")
    .lean();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        {/* === HERO === */}
        <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden px-4 py-20 md:py-28">
          {/* Glow orbs */}
          <div className="glow-bg animate-pulse-glow left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary" />
          <div className="glow-bg animate-pulse-glow right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-500" />

          <div className="relative z-10 mx-auto max-w-5xl space-y-8 text-center">
            <AnimateIn direction="up" delay={0.1}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                AI-Powered Project Collaboration Platform
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.2}>
              <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
                Validate Ideas.
                <br />
                <span className="text-gradient">Ship Products.</span>
                <br />
                Find Co-Founders.
              </h1>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.3}>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
                CollabSpace is where builders stress-test ideas with AI, generate living PRDs, recruit dream teams, and sprint toward launch — all in one workspace.
              </p>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.4}>
              <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
                <Link href="/projects/new">
                  <Button size="lg" className="h-12 rounded-full px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25">
                    <Sparkles className="h-4.5 w-4.5" /> Start with AI
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline" className="h-12 rounded-full px-8 text-base font-semibold gap-2">
                    Explore Projects <ChevronRight className="h-4.5 w-4.5" />
                  </Button>
                </Link>
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.5}>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>30-day Pro trial free</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>Powered by Gemini AI</span>
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>

        {/* === LIVE STATS === */}
        <section className="border-y bg-card/50 px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === AI FEATURES (The MOAT) === */}
        <section className="px-4 py-20 md:py-28 overflow-hidden">
          <div className="max-w-5xl mx-auto">
            <AnimateIn direction="up">
              <div className="text-center mb-16 space-y-3">
                <Badge variant="outline" className="text-xs uppercase tracking-widest font-bold text-primary border-primary/30">
                  AI-Powered Engine
                </Badge>
                <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                  Your AI Co-Pilot for <span className="text-gradient">Product Building</span>
                </h2>
                <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                  From raw idea to structured execution plan in minutes — not weeks.
                </p>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-2 gap-6">
              {aiFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <AnimateIn key={feature.title} delay={i * 0.12} direction="up" className="h-full">
                    <div className="group relative rounded-2xl border bg-card p-7 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
                      <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-md`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </AnimateIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* === HOW IT WORKS === */}
        <section className="bg-muted/40 px-4 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <AnimateIn direction="up">
              <div className="text-center mb-16 space-y-3">
                <h2 className="text-3xl font-bold md:text-4xl">Three Steps to Launch</h2>
                <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                  From idea validation to deployed product in record time.
                </p>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <AnimateIn key={step.number} delay={i * 0.15} direction="up">
                  <div className="relative text-center space-y-5">
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-7 left-[calc(50%+48px)] right-[calc(-50%+48px)] h-px bg-border" />
                    )}
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${step.color} text-white text-lg font-bold shadow-lg`}>
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* === PLATFORM FEATURES === */}
        <section className="px-4 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <AnimateIn direction="up">
              <div className="text-center mb-16 space-y-3">
                <h2 className="text-3xl font-bold md:text-4xl">Everything Builders Need</h2>
                <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                  An all-in-one workspace designed for execution, not just discussion.
                </p>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <AnimateIn key={feature.title} delay={i * 0.08} direction="up" className="h-full">
                    <div className="group rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md h-full">
                      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold mb-1.5">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </AnimateIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* === TRENDING PROJECTS === */}
        {trendingProjects.length > 0 && (
          <section className="bg-muted/30 px-4 py-20 md:py-24 border-y overflow-hidden">
            <div className="max-w-5xl mx-auto">
              <AnimateIn direction="up">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-bold md:text-4xl">Trending Now</h2>
                    <p className="text-muted-foreground mt-1.5">Join these teams before they fill up</p>
                  </div>
                  <Link href="/projects" className="hidden sm:flex text-primary font-semibold items-center gap-1 hover:underline">
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </AnimateIn>

              <div className="grid md:grid-cols-3 gap-6">
                {trendingProjects.map((p: any, i: number) => (
                  <AnimateIn key={p._id.toString()} delay={i * 0.1} direction="up" className="h-full">
                    <Link href={`/projects/${p._id}`} className="group block h-full">
                      <div className="rounded-2xl border bg-card p-6 h-full transition-all hover:border-primary/40 hover:shadow-lg flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="secondary" className="text-xs font-medium">
                            {p.domain}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {p.teamSizeMax} max
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{p.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">{p.description}</p>
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
                      </div>
                    </Link>
                  </AnimateIn>
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link href="/projects">
                  <Button variant="outline" className="w-full rounded-full">View all projects</Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* === TESTIMONIALS === */}
        <section className="px-4 py-20 md:py-24">
          <div className="max-w-5xl mx-auto">
            <AnimateIn direction="up">
              <div className="text-center mb-14 space-y-3">
                <h2 className="text-3xl font-bold md:text-4xl">Loved by Builders</h2>
                <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                  See what our community of student developers and indie hackers is saying.
                </p>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <AnimateIn key={i} delay={i * 0.1} direction="up" className="h-full">
                  <div className="rounded-2xl border bg-card p-7 shadow-sm flex flex-col h-full hover:border-primary/30 transition-colors">
                    <div className="flex gap-0.5 mb-5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <blockquote className="text-base leading-relaxed mb-6 flex-1 text-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{t.author}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* === FREE TRIAL CTA === */}
        <section className="px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-pink-500 p-10 md:p-16 text-white text-center shadow-2xl">
              <div className="glow-bg left-0 top-0 h-[300px] w-[300px] rounded-full bg-white opacity-10" />
              <div className="glow-bg right-0 bottom-0 h-[250px] w-[250px] rounded-full bg-white opacity-10" />

              <div className="relative z-10 space-y-5">
                <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider">
                  <Crown className="h-3.5 w-3.5 mr-1" /> 30-Day Free Trial
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
                  Ready to build something real?
                </h2>
                <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto">
                  Get full access to AI validation, Living PRDs, sprint milestones, and team matching — free for 30 days.
                </p>
                <div className="flex flex-wrap gap-3 justify-center pt-3">
                  <Link href="/sign-up">
                    <Button size="lg" variant="secondary" className="rounded-full text-base px-8 font-bold gap-2 shadow-lg">
                      <Rocket className="h-4.5 w-4.5" /> Get Started Free
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 text-base px-8 font-semibold">
                      View Plans
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* === FOOTER === */}
      <footer className="border-t bg-card px-4 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="font-bold text-xl text-foreground">CollabSpace</Link>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                AI-powered workspace where ideas become shipped products.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Platform</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/projects" className="block hover:text-foreground transition-colors">Discover Projects</Link>
                <Link href="/projects/new" className="block hover:text-foreground transition-colors">Create Project</Link>
                <Link href="/dashboard" className="block hover:text-foreground transition-colors">Dashboard</Link>
                <Link href="/leaderboard" className="block hover:text-foreground transition-colors">Leaderboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Resources</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/about" className="block hover:text-foreground transition-colors">About</Link>
                <Link href="/pricing" className="block hover:text-foreground transition-colors">Pricing</Link>
                <Link href="/blogs" className="block hover:text-foreground transition-colors">Blog</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <span className="block">Privacy Policy</span>
                <span className="block">Terms of Service</span>
                <span className="block">Cookie Policy</span>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CollabSpace. All rights reserved.</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Google Gemini AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
