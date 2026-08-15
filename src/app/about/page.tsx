import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 px-4">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">About CollabSpace</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The unified platform for students, creators, and builders to discover ideas, recruit teammates, and execute projects together.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">How it Works</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-xl bg-card space-y-3">
            <h3 className="font-semibold text-lg">1. Pitch Your Idea</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Have an idea? Create a project, write a rich markdown pitch explaining the problem you're solving, and list the exact skills you need to build it.
            </p>
          </div>
          <div className="p-6 border rounded-xl bg-card space-y-3">
            <h3 className="font-semibold text-lg">2. Find Your Team</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Builders can browse open projects and apply to join. Our AI-assisted matching engine automatically recommends projects to users based on their skills.
            </p>
          </div>
          <div className="p-6 border rounded-xl bg-card space-y-3">
            <h3 className="font-semibold text-lg">3. Collaborate</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Once a team is formed, drop into the Team Workspace! Chat in real-time, share notes, and manage progress using the drag-and-drop Kanban board.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6 p-8 bg-primary/5 rounded-2xl border border-primary/10">
        <h2 className="text-2xl font-bold">The Application Process</h2>
        <p className="text-muted-foreground leading-relaxed">
          When applying for a project, you provide a message outlining why you're a great fit, what role you want to fill, and your availability.
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li><strong>Project Admins</strong> review applications by viewing your profile, Github/LinkedIn links, and your pitch.</li>
          <li><strong>Expiration:</strong> Applications automatically expire after 14 days if the admin does not respond, to ensure you aren't kept waiting forever.</li>
          <li><strong>Limits:</strong> To prevent spam, you can apply to a maximum of 5 projects per day.</li>
        </ul>
      </section>

      <div className="text-center pt-8">
        <Link href="/projects">
          <Button size="lg" className="rounded-full px-8">Discover Projects</Button>
        </Link>
      </div>
    </div>
  );
}
