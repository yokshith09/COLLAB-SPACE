import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { auth } from "@/auth";
import { SignOutButton } from "./sign-out-button";

export async function Navbar() {
  const session = await auth();
  const userId = session?.user?.id;

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
          {userId && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5">
                Dashboard
              </Button>
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {userId ? (
            <SignOutButton />
          ) : (
            <>
              <Link href="/sign-in"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/sign-up"><Button size="sm">Get Started</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
