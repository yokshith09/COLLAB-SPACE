import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export function Navbar() {
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
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5">
              Dashboard
            </Button>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Auth buttons removed temporarily */}
        </div>
      </div>
    </header>
  );
}
