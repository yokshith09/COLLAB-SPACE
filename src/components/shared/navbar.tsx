import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, LogOut, Trophy, Sparkles } from "lucide-react";
import { auth, signOut } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="flex h-16 items-center px-4 gap-4 max-w-7xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight text-foreground mr-4">
          CollabSpace
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Compass className="h-4 w-4" /> Discover
            </Button>
          </Link>
          <Link href="/blogs">
            <Button variant="ghost" size="sm" className="gap-1.5">
              Blogs
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Trophy className="h-4 w-4 text-yellow-500" /> Leaderboard
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="sm" className="gap-1.5">
              About
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> Pricing
            </Button>
          </Link>
          {session?.user && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5">
                Dashboard
              </Button>
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {session?.user ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="sm">Notifications</Button>
              </Link>
              <Link href={`/profile/${session.user.id}`}>
                <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="text-xs">{session.user.name?.[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/sign-in" });
              }}>
                <Button variant="ghost" size="sm" type="submit" className="gap-1.5 px-2">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
