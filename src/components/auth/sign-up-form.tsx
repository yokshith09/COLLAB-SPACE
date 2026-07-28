"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, UserRound } from "lucide-react";
import { registerUser } from "@/actions/auth";

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = ((formData.get("email") as string) || "").trim().toLowerCase();
    const password = formData.get("password") as string;

    try {
      const res = await registerUser(formData);

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
        return;
      }

      // Auto login after successful registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error || signInRes?.ok === false) {
        setError("Account created, but auto-login failed. Please sign in.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("We could not create your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            placeholder="Aarav Mehta"
            autoComplete="name"
            required
            disabled={isLoading}
            className="h-11 pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={isLoading}
            className="h-11 pl-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={isLoading}
            className="h-11 pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
      </div>
      <Button type="submit" className="h-11 w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Create account
        {!isLoading ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
