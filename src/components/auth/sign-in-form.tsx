"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from "lucide-react";

function getSafeCallbackUrl() {
  if (typeof window === "undefined") return "/dashboard";
  const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/dashboard";
  }
  return callbackUrl;
}

export function SignInForm() {
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

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error || res?.ok === false) {
        console.error("SIGN_IN_ERROR", res);
        setError(
          res?.error === "CredentialsSignin"
            ? "The email or password does not match an account."
            : "Authentication service failed. Check DATABASE_URL, AUTH_SECRET, and the Vercel function logs."
        );
      } else {
        router.push(getSafeCallbackUrl());
        router.refresh();
      }
    } catch (error) {
      console.error("SIGN_IN_EXCEPTION", error);
      setError("Sign in failed. Check DATABASE_URL, AUTH_SECRET, and the Vercel function logs.");
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
            autoComplete="current-password"
            required
            disabled={isLoading}
            className="h-11 pl-10"
          />
        </div>
      </div>
      <Button type="submit" className="h-11 w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Sign in
        {!isLoading ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        New to CollabSpace?{" "}
        <Link href="/sign-up" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  );
}
