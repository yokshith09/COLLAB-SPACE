import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { Sparkles, Users, Calendar, Layers, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-mesh">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 px-4 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary font-medium mb-2 backdrop-blur-sm animate-pulse">
              <Sparkles className="h-4 w-4" />
              Built for Next-Gen Builders & Creators
            </div>
            
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Find Your Next <br />
              <span className="bg-gradient-to-r from-primary via-accent to-pink-500 bg-clip-text text-transparent">
                Co-Founder
              </span>{" "}
              or Teammate
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Post project ideas, recruit matching teammates, and collaborate with full transparency. 
              Built for students, hackers, and startup builders.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white">
                  Start Building
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl glass-card font-semibold transition-all hover:bg-muted/50">
                  Browse Projects
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section className="py-20 md:py-28 px-4 border-y border-border/40 bg-muted/10 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-4 tracking-tight">How CollabSpace Works</h2>
            <p className="text-center text-muted-foreground max-w-lg mx-auto mb-16">
              Skip the endless DMs. Find the perfect fit with structured alignment.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  step: "1", 
                  title: "Post an Idea", 
                  desc: "Define the problem, required skills, team size, and deadline. Your project is discoverable by matching builders.",
                  icon: Layers
                },
                { 
                  step: "2", 
                  title: "Find Teammates", 
                  desc: "Browse projects by domain or skill. Apply with a structured application — directly align on expectations.",
                  icon: Users
                },
                { 
                  step: "3", 
                  title: "Build Together", 
                  desc: "Utilize the team workspace featuring real-time chat, shared notes, and task board.",
                  icon: Calendar
                },
              ].map((f) => {
                const IconComponent = f.icon;
                return (
                  <div key={f.step} className="p-8 rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-bl-full transition-all group-hover:bg-primary/10" />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold text-primary/60 tracking-wider uppercase">Step {f.step}</span>
                    <h3 className="text-xl font-bold mt-2 mb-3">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 px-4">
          <div className="max-w-5xl mx-auto text-center space-y-16">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Why Builders Choose CollabSpace</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mt-4">
                The ultimate workspace optimized for public building and collaboration.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                { 
                  title: "Transparency First", 
                  desc: "See team fullness, admin activity badges, and application expiry — no ghost projects.",
                  icon: ShieldCheck
                },
                { 
                  title: "Skill-Based Matching", 
                  desc: "Projects are tagged by required skills. Find opportunities that match your expertise.",
                  icon: Zap
                },
                { 
                  title: "All-in-One Workspace", 
                  desc: "Chat, notes, and task management built-in. No more juggling 5 tools.",
                  icon: Layers
                },
                { 
                  title: "Built for Builders", 
                  desc: "Students, hackers, and founders. Post your idea and find co-founders in days, not months.",
                  icon: Users
                },
              ].map((f) => {
                const IconComponent = f.icon;
                return (
                  <div key={f.title} className="p-6 rounded-2xl glass-card flex gap-4 items-start transition-all hover:bg-card/50">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-12 px-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          CollabSpace — Build together, transparently.
        </div>
      </footer>
    </div>
  );
}
