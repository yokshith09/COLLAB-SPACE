import { SignUpForm } from "@/components/auth/sign-up-form";
import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up - CollabSpace",
  description: "Create your CollabSpace account.",
};

export default function SignUpPage() {
  return (
    <section className="min-h-[calc(100dvh-3.5rem)] bg-[radial-gradient(circle_at_top_left,hsl(239_84%_67%_/_0.16),transparent_34%),linear-gradient(180deg,var(--color-background),var(--color-muted))] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-8.5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-xl">
          <Link href="/" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Back to home
          </Link>
          <p className="mt-10 text-sm font-semibold text-primary">Start building</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Find focused teammates for serious student projects.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
            Create a profile, publish project ideas, and join teams with clear roles and momentum.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {["Email/password account", "Project discovery", "Skill-based profiles", "Team coordination"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full rounded-xl border border-border/70 bg-card/90 p-6 shadow-2xl shadow-primary/10 backdrop-blur sm:p-8">
          <div className="mb-8">
            <p className="text-sm text-muted-foreground">Create your workspace</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Join CollabSpace</h2>
          </div>
          <SignUpForm />
        </div>
      </div>
    </section>
  );
}
