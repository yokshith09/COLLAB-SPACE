"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Compass, Bell, Plus, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const hasClerkKeys =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            CollabSpace
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <Compass className="h-4 w-4" /> Discover
              </Button>
            </Link>
            {hasClerkKeys && <DashboardLink />}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {hasClerkKeys ? (
            <ClerkAuthButtons />
          ) : (
            <GuestButtons />
          )}
        </div>
      </div>
    </header>
  );
}

function DashboardLink() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return null;
  return (
    <Link href="/dashboard">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        Dashboard
      </Button>
    </Link>
  );
}

function ClerkAuthButtons() {
  const { isSignedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/notifications/unread-count")
        .then((res) => res.json())
        .then((data) => setUnreadCount(data.count || 0))
        .catch(() => {});

      const interval = setInterval(() => {
        fetch("/api/notifications/unread-count")
          .then((res) => res.json())
          .then((data) => setUnreadCount(data.count || 0))
          .catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn]);

  if (isSignedIn) {
    return (
      <>
        <Link
          href="/notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </Link>
        <Link href="/projects/new" className="hidden sm:inline-block">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </Link>
        <div className="pl-1 flex items-center">
          <UserButton />
        </div>
      </>
    );
  }

  return <GuestButtons />;
}

function GuestButtons() {
  return (
    <>
      <Link href="/sign-in">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </Link>
      <Link href="/sign-up">
        <Button size="sm">Get Started</Button>
      </Link>
    </>
  );
}
