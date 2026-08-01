"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users, MessageSquare, CheckSquare, Search, ArrowRight,
  Globe, Zap, Shield, Sparkles, ChevronRight, Star
} from "lucide-react";

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

const stats = [
  { value: "500+", label: "Projects Created" },
  { value: "2,000+", label: "Builders Connected" },
  { value: "150+", label: "Teams Formed" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden border-b bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_58%,#eef6f5_100%)] px-4 py-16 md:py-24">
          <div className="glow-bg left-1/2 top-8 h-[420px] w-[680px] -translate-x-1/2 rounded-[100%] bg-primary" />

          <div className="relative z-10 mx-auto max-w-5xl space-y-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Student project collaboration
            </div>

            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Find your next <br className="hidden md:block" />
              <span className="text-gradient">co-founder</span>
              <br />
              or teammate
            </h1>



            <p className="mx-auto max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              Post project ideas, recruit matching teammates, and collaborate with full transparency.
              Built for the fastest shipping students, hackers, and builders.
            </p>

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

        {/* How It Works */}
        <section id="how-it-works" className="px-4 py-20 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">How it works</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Three simple steps to find your team and start building
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.number} className="relative">
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
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-muted px-4 py-20 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Everything you need</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                All-in-one workspace for project collaboration
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary transition-transform group-hover:scale-105">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="px-4 py-20 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6">
              &ldquo;Found my co-founder on CollabSpace in just 3 days. Seeing active projects made the search feel direct and honest.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                S
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">Sarah Chen</div>
                <div className="text-xs text-muted-foreground">Built a SaaS project from CollabSpace</div>
              </div>
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
