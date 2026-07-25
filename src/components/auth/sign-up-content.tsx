"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ClerkSignUp = dynamic(
  () => import("@clerk/nextjs").then((mod) => ({ default: mod.SignUp })),
  { ssr: false }
);

export function SignUpPageContent() {
  return <ClerkSignUp />;
}
