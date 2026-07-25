import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Sparkles, LogOut } from "lucide-react";
import { useCurrentProfile, useSession, useUnreadCount } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const session = useSession();
  const { data: profile } = useCurrentProfile();
  const unread = useUnreadCount();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          CollabSpace
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link to="/projects" className="px-3 py-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" activeProps={{ className: "px-3 py-2 rounded-md bg-accent text-accent-foreground" }}>Discover</Link>
          {session && (
            <Link to="/dashboard" className="px-3 py-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" activeProps={{ className: "px-3 py-2 rounded-md bg-accent text-accent-foreground" }}>Dashboard</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link to="/notifications" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-4 w-4" />
                {unread > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />}
              </Link>
              <Button asChild size="sm" variant="outline"><Link to="/projects/new">+ New Project</Link></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar ?? undefined} alt={profile?.name ?? ""} />
                      <AvatarFallback>{profile?.name?.charAt(0) ?? "?"}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {profile && (
                    <DropdownMenuItem asChild>
                      <Link to="/profile/$id" params={{ id: profile.id }}>My profile</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild><Link to="/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : session === null ? (
            <>
              <Button asChild size="sm" variant="ghost"><Link to="/auth">Sign in</Link></Button>
              <Button asChild size="sm"><Link to="/auth">Get started</Link></Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
