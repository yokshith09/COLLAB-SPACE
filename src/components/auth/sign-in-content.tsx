"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ClerkSignIn = dynamic(
  () => import("@clerk/nextjs").then((mod) => ({ default: mod.SignIn })),
  { ssr: false }
);

export function SignInPageContent() {
  return <ClerkSignIn />;
}
