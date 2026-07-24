import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="flex h-14 items-center px-4 max-w-7xl mx-auto">
          <span className="font-bold text-lg tracking-tight">CollabSpace</span>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/projects"><Button variant="ghost" size="sm">Discover</Button></Link>
            <Link href="/sign-in"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/sign-up"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 md:py-32 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/50 text-sm text-muted-foreground mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Platform for builders
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Find your next<br />
              <span className="text-primary">co-founder</span> or teammate
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Post project ideas, recruit matching teammates, and collaborate with full transparency.
              Built for students, hackers, and startup builders.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link href="/sign-up"><Button size="lg" className="text-base px-8">Start Building</Button></Link>
              <Link href="/projects"><Button size="lg" variant="outline" className="text-base px-8">Browse Projects</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Post an Idea", desc: "Define the problem, required skills, team size, and deadline. Your project is discoverable by matching builders." },
                { step: "2", title: "Find Teammates", desc: "Browse projects by domain or skill. Apply with a message — no cold DMs needed." },
                { step: "3", title: "Build Together", desc: "Team chat, shared notes, task board — all in one workspace with full visibility." },
              ].map((f) => (
                <div key={f.step} className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
                  <span className="text-2xl font-bold text-primary">{f.step}</span>
                  <h3 className="font-semibold mt-2 mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <h2 className="text-2xl font-bold">Why CollabSpace?</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              {[
                { title: "Transparency First", desc: "See team fullness, admin activity badges, and application expiry — no ghost projects." },
                { title: "Skill-Based Matching", desc: "Projects are tagged by required skills. Find opportunities that match your expertise." },
                { title: "All-in-One Workspace", desc: "Chat, notes, and task management built-in. No more juggling 5 tools." },
                { title: "Built for Builders", desc: "Students, hackers, and founders. Post your idea and find co-founders in days, not months." },
              ].map((f) => (
                <div key={f.title} className="p-5 rounded-xl border bg-card">
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          CollabSpace — Build together, transparently.
        </div>
      </footer>
    </div>
  );
}
