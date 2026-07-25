import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Send, Sparkles, MessageSquare, KanbanSquare, Eye, Github } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_50%)] opacity-10" />
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Now in open beta · Build in public
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl mx-auto">
            Build in public.<br />
            <span className="text-primary">Find your team.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            The transparent collaboration platform for builders. Browse open projects,
            apply to join, and ship together — all in one workspace.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Get started <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/projects">Browse projects</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 border-t border-border">
        <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight">How it works</h2>
        <p className="mt-3 text-center text-muted-foreground">Three steps from "I have an idea" to shipping.</p>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {[
            { icon: Search, n: "01", title: "Discover", body: "Browse projects that match your skills and interests. Every project is public by default." },
            { icon: Send, n: "02", title: "Apply", body: "Send a short application explaining why you'd be a great fit. Owners respond fast." },
            { icon: Sparkles, n: "03", title: "Build", body: "Collaborate in a shared workspace with real-time chat, notes, and a task kanban." },
          ].map(({ icon: Icon, n, title, body }) => (
            <div key={n} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-mono text-muted-foreground">{n}</span>
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-7xl px-4 py-20 border-t border-border">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl">Everything a small team needs. Nothing it doesn't.</h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Eye, title: "Public by default", body: "Transparency is the point. Anyone can see who's building what." },
            { icon: MessageSquare, title: "Real-time chat", body: "Built-in messaging per project. No more Discord sprawl." },
            { icon: KanbanSquare, title: "Task kanban", body: "TODO → In Progress → Done. The shape of every shipped thing." },
            { icon: Github, title: "Built for builders", body: "Tag your skills. Apply in seconds. Get back to making." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-primary mb-3" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to find your team?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Join builders shipping side projects, hackathon entries, and weekend experiments.</p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/auth">Get started — it's free <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
