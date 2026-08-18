import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Project, User, TeamMember } from "@/lib/models";
import { connectDB } from "@/lib/mongoose";
import { AnimateIn } from "@/components/home/animate-in";
import {
  Users, MessageSquare, CheckSquare, Search, ArrowRight,
  Globe, Zap, Shield, Sparkles, ChevronRight, Star, BookOpen, Lock
} from "lucide-react";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: Search,
    title: "Discover Projects",
    description: "Browse open projects filtered by domain, skills, and status. Find what matches you instantly.",
  },
  {
    icon: Users,
    title: "Build Teams",
    description: "Apply with a message. Owners review and accept. Teams form in days, not months.",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Team workspace with live messaging, shared notes, and task boards. No more juggling tools.",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description: "Kanban board with TODO, IN PROGRESS, and DONE columns. Click to move tasks.",
  },
  {
    icon: Shield,
    title: "Project health",
    description: "Activity badges show which projects are moving and which need attention.",
  },
  {
    icon: Globe,
    title: "Public by Default",
    description: "Projects are discoverable. Skills are visible. Everything is open and honest.",
  },
  {
    icon: BookOpen,
    title: "Blogs & Trends",
    description: "Share knowledge, read community posts, and see what technologies are trending right now.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Your data is encrypted at rest and in transit. Secure OAuth authentication built-in.",
  },
];

const steps = [
  {
    number: "01",
    title: "Post Your Idea",
    description: "Define the problem, required skills, team size, and deadline. Your project goes live instantly.",
  },
  {
    number: "02",
    title: "Find Your Team",
    description: "Builders browse and apply. You review applications and accept the best fit.",
  },
  {
    number: "03",
    title: "Ship Together",
    description: "Collaborate in a shared workspace with chat, notes, and tasks. Build something real.",
  },
];

const testimonials = [
  {
    quote: "Found my co-founder on CollabSpace in just 3 days. Seeing active projects made the search feel direct and honest.",
    author: "Sarah Chen",
    role: "Built a SaaS project",
    avatar: "S"
  },
  {
    quote: "The task management and real-time chat made our hackathon project a breeze. We didn't need any other tools.",
    author: "Alex Rivera",
    role: "Won 1st place at HackMIT",
    avatar: "A"
  },
  {
    quote: "I love the transparency. You can see who is actively building and who isn't. It saves so much time.",
    author: "David Kim",
    role: "Joined an AI startup",
    avatar: "D"
  }
];

export default async function HomePage() {
  await connectDB();

  // Fetch live stats
  const projectsCount = await Project.countDocuments();
  const usersCount = await User.countDocuments();
  const teamsCount = await TeamMember.distinct("projectId").then(res => res.length);
  
  const stats = [
    { value: `${projectsCount}+`, label: "Projects Created" },
    { value: `${usersCount}+`, label: "Builders Connected" },
    { value: `${teamsCount}+`, label: "Teams Formed" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  // Fetch trending projects
  const trendingProjects = await Project.find({ status: "OPEN" })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("ownerId", "name avatar")
    .lean();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden border-b bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_58%,#eef6f5_100%)] px-4 py-16 md:py-24">
          <div className="glow-bg left-1/2 top-8 h-[420px] w-[680px] -translate-x-1/2 rounded-[100%] bg-primary" />

          <div className="relative z-10 mx-auto max-w-5xl space-y-8 text-center">
            <AnimateIn direction="up" delay={0.1}>
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                Student project collaboration
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.2}>
              <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
                Where Ideas Meet <span className="text-gradient">Execution.</span>
                <br />
                Find your Co-Founder.
              </h1>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.3}>
              <p className="mx-auto max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
                Stop building alone. COLLAB-SPACE connects you with the perfect teammates, syncs your GitHub workflow, and gives you the tools to ship faster.
              </p>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.4}>
              <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                <Link href="/projects">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Start building <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    Browse projects <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.5}>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Public by default</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Real-time collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>AI-assisted matching</span>
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="border-b bg-muted/20 py-12 overflow-hidden">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
              Trusted by builders from top institutions & organizations
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-muted-foreground transition-all">
              <div className="flex items-center gap-2 font-bold text-xl hover:text-foreground transition-colors cursor-default"><Globe className="h-6 w-6"/> MIT Build</div>
              <div className="flex items-center gap-2 font-bold text-xl hover:text-foreground transition-colors cursor-default"><Zap className="h-6 w-6"/> YC Startup School</div>
              <div className="flex items-center gap-2 font-bold text-xl hover:text-foreground transition-colors cursor-default"><Shield className="h-6 w-6"/> Stanford AI</div>
              <div className="flex items-center gap-2 font-bold text-xl hover:text-foreground transition-colors cursor-default"><Users className="h-6 w-6"/> Hackathon Org</div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b bg-card px-4 py-14">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Projects */}
        <section className="bg-muted/30 px-4 py-20 md:py-24 border-b overflow-hidden">
          <div className="max-w-5xl mx-auto">
            <AnimateIn direction="up">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-foreground md:text-4xl">Trending Projects</h2>
                  <p className="text-muted-foreground mt-2 text-lg">Join these teams before they fill up</p>
                </div>
                <Link href="/projects" className="hidden sm:flex text-primary font-medium items-center gap-1 hover:underline">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </AnimateIn>
            
            <div className="grid md:grid-cols-3 gap-6">
              {trendingProjects.map((p: any, i: number) => (
                <AnimateIn key={p._id.toString()} delay={i * 0.1} direction="up" className="h-full">
                  <Link href={`/projects/${p._id}`} className="group block h-full">
                  <div className="rounded-xl border bg-card p-6 h-full transition-all hover:border-primary/50 hover:shadow-md flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {p.domain}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {p.teamSizeMax} max
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{p.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">{p.description}</p>
                    <div className="flex items-center gap-2 pt-4 border-t mt-auto">
                      <div className="h-6 w-6 rounded-full bg-accent text-xs flex items-center justify-center overflow-hidden">
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
                <Button variant="outline" className="w-full">View all projects</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-4 py-20 md:py-24">
          <div className="max-w-5xl mx-auto">
            <AnimateIn direction="up">
              <div className="text-center mb-16">
                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">How it works</h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  Three simple steps to find your team and start building
                </p>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <AnimateIn key={step.number} delay={i * 0.15} direction="up">
                  <div className="relative">
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-[calc(50%+60px)] right-[calc(-50%+60px)] h-px bg-border" />
                    )}
                    <div className="relative text-center space-y-4">
                      <div className="inline-flex h-20 w-20 items-center justify-center rounded-xl bg-accent text-2xl font-bold text-primary">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-muted px-4 py-20 md:py-24">
          <div className="max-w-5xl mx-auto">
            <AnimateIn direction="up">
              <div className="text-center mb-16">
                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Everything you need</h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  All-in-one workspace for project collaboration
                </p>
              </div>
            </AnimateIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <AnimateIn key={feature.title} delay={i * 0.1} direction="up" className="h-full">
                    <div className="group rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md h-full">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary transition-transform group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </AnimateIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted/30 px-4 py-20 md:py-24 border-b">
          <div className="max-w-5xl mx-auto">
            <AnimateIn direction="up">
              <div className="text-center mb-16">
                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Loved by builders</h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  See what our community of students and hackers is saying.
                </p>
              </div>
            </AnimateIn>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <AnimateIn key={i} delay={i * 0.1} direction="up" className="h-full">
                  <div className="rounded-xl border bg-card p-8 shadow-sm flex flex-col h-full hover:border-primary/50 transition-colors">
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <blockquote className="text-lg leading-relaxed mb-8 flex-1 text-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4 mt-auto pt-4 border-t">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                        {t.avatar}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{t.author}</div>
                        <div className="text-sm text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary px-4 py-20 text-primary-foreground md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to find your team?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Join thousands of builders who are finding teammates and shipping projects together.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link href="/projects">
                <Button size="lg" variant="secondary" className="text-base px-8 gap-2">
                  Get started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline" className="border-white bg-primary text-white hover:bg-white hover:text-primary">
                  Browse projects
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="font-bold text-lg text-primary">CollabSpace</Link>
              <p className="text-sm text-muted-foreground mt-2">
                Build together, transparently.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Platform</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/projects" className="block hover:text-foreground transition-colors">Discover</Link>
                <Link href="/projects/new" className="block hover:text-foreground transition-colors">Create Project</Link>
                <Link href="/dashboard" className="block hover:text-foreground transition-colors">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Account</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/notifications" className="block hover:text-foreground transition-colors">Notifications</Link>
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
          <div className="mt-10 pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CollabSpace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
