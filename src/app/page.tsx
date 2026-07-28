"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users, MessageSquare, CheckSquare, Search, ArrowRight,
  Globe, Zap, Shield, Sparkles, ChevronRight, Star
} from "lucide-react";
import { motion } from "framer-motion";

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
    title: "Transparent Health",
    description: "Admin activity badges — Active, Slow, or Ghost. No more dead projects.",
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
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 px-4 flex items-center justify-center min-h-[90vh]">
          {/* Background gradient and glow */}
          <div className="absolute inset-0 bg-background" />
          <div className="glow-bg top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary rounded-[100%]" />
          <div className="glow-bg bottom-0 right-0 w-[600px] h-[600px] bg-accent rounded-[100%]" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative max-w-5xl mx-auto text-center space-y-10 z-10"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/20 glass text-sm font-medium text-foreground shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--color-primary)]" />
              Next-generation collaboration platform
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.1]">
              Find your next <br className="hidden md:block" />
              <span className="text-gradient">co-founder</span>
              <br />
              or teammate
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Post project ideas, recruit matching teammates, and collaborate with full transparency.
              Built for the fastest shipping students, hackers, and builders.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
            >
              <Link href="/sign-up">
                <Button size="lg" className="h-14 px-10 text-lg rounded-full gap-2 shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all">
                  Start Building <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full gap-2 glass hover:bg-muted/50 transition-all">
                  Browse Projects <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-8 pt-10 text-sm font-medium text-muted-foreground"
            >
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
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 border-y bg-muted/30">
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
        <section id="how-it-works" className="py-20 md:py-28 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
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
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
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
        <section id="features" className="py-20 md:py-28 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                All-in-one workspace for project collaboration
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group p-6 rounded-2xl border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
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
        <section className="py-20 md:py-28 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6">
              &ldquo;Found my co-founder on CollabSpace in just 3 days. The transparency of seeing who&apos;s active and who&apos;s ghosting made all the difference.&rdquo;
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
        <section className="py-20 md:py-28 px-4 bg-primary text-primary-foreground">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to find your team?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Join thousands of builders who are finding teammates and shipping projects together.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="text-base px-8 gap-2">
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline" className="text-base px-8 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                  Browse Projects
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
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
                <Link href="/sign-in" className="block hover:text-foreground transition-colors">Sign In</Link>
                <Link href="/sign-up" className="block hover:text-foreground transition-colors">Sign Up</Link>
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