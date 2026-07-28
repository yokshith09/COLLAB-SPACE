import { SignInForm } from "@/components/auth/sign-in-form";
import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In - CollabSpace",
  description: "Sign in to your CollabSpace account.",
};

export default function SignInPage() {
  return (
    <section className="min-h-[calc(100dvh-3.5rem)] bg-[radial-gradient(circle_at_top_left,hsl(174_67%_29%_/_0.18),transparent_36%),radial-gradient(circle_at_bottom_right,hsl(39_72%_65%_/_0.20),transparent_34%),linear-gradient(180deg,var(--color-background),var(--color-muted))] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-8.5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-xl">
          <Link href="/" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Back to home
          </Link>
          <p className="mt-10 text-sm font-semibold text-primary">Workspace access</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Pick up the work where your team left it.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
            Sign in to manage projects, review applications, and keep your collaboration space moving.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {["Project dashboards", "Team workspaces", "Application reviews", "Notifications"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-2xl shadow-primary/12 sm:p-8">
          <div className="mb-8">
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Sign in to CollabSpace</h2>
          </div>
          <SignInForm />
        </div>
      </div>
    </section>
  );
}
