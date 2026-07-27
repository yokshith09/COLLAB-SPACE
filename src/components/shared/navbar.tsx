"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Plus, Compass } from "lucide-react";
import { useState, useEffect } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isLoaded, userId } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4 max-w-7xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight mr-4">
          CollabSpace
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Compass className="h-4 w-4" /> Discover
            </Button>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isLoaded && userId ? (
            <UserButton />
          ) : isLoaded && !userId ? (
            <>
              <Link href="/sign-in"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/sign-up"><Button size="sm">Get Started</Button></Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
