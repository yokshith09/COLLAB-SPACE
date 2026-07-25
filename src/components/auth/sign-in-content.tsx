"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ClerkSignIn = dynamic(
  () => import("@clerk/nextjs").then((mod) => ({ default: mod.SignIn })),
  { ssr: false }
);

export function SignInPageContent() {
  const hasClerk =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

  if (!hasClerk) {
    return (
      <div className="max-w-sm w-full p-8 rounded-xl border bg-card text-center space-y-4">
        <h1 className="text-xl font-bold">Sign In</h1>
        <p className="text-muted-foreground text-sm">
          Authentication is not configured. Set up Clerk keys in .env.local to enable sign in.
        </p>
        <Link href="/">
          <Button variant="outline" className="w-full">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return <ClerkSignIn />;
}
