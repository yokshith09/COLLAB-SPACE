"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ClerkSignUp = dynamic(
  () => import("@clerk/nextjs").then((mod) => ({ default: mod.SignUp })),
  { ssr: false }
);

export function SignUpPageContent() {
  const hasClerk =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

  if (!hasClerk) {
    return (
      <div className="max-w-sm w-full p-8 rounded-xl border bg-card text-center space-y-4">
        <h1 className="text-xl font-bold">Get Started</h1>
        <p className="text-muted-foreground text-sm">
          Authentication is not configured. Set up Clerk keys in .env.local to enable registration.
        </p>
        <Link href="/">
          <Button variant="outline" className="w-full">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return <ClerkSignUp />;
}
