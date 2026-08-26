import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, LogOut, Trophy, Sparkles, Menu } from "lucide-react";
import { auth, signOut } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm">
      <div className="flex h-16 items-center px-4 gap-4 max-w-7xl mx-auto">
        <Link href="/" className="font-extrabold text-xl tracking-tight text-foreground mr-6 flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <span className="text-white text-xs font-black">C</span>
          </div>
          CollabSpace
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 text-sm">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
              <Compass className="h-4 w-4" /> Discover
            </Button>
          </Link>
          <Link href="/blogs">
            <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
              Blog
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
              <Trophy className="h-4 w-4 text-amber-500" /> Leaderboard
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
              How it Works
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
              About
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
              <Sparkles className="h-4 w-4 text-primary" /> Pricing
            </Button>
          </Link>
          {session?.user && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
                Dashboard
              </Button>
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {session?.user ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="font-medium">Notifications</Button>
              </Link>
              <Link href={`/profile/${session.user.id}`}>
                <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary/50 transition-all">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">{session.user.name?.[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/sign-in" });
              }}>
                <Button variant="ghost" size="sm" type="submit" className="gap-1.5 px-2 text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="font-medium">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="rounded-full px-5 font-semibold shadow-md shadow-primary/20">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
