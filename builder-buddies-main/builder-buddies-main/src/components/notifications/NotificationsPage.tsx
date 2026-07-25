import { useNavigate } from "@tanstack/react-router";
import { useNotifications, useMarkNotificationRead, useMarkAllRead, timeAgo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Check, X, MessageSquare, UserPlus, Clock } from "lucide-react";

const ICON: Record<string, { icon: typeof Check; tone: string }> = {
  application_accepted: { icon: Check, tone: "text-success bg-success/15" },
  application_rejected: { icon: X, tone: "text-destructive bg-destructive/15" },
  new_message: { icon: MessageSquare, tone: "text-primary bg-primary/15" },
  team_member_joined: { icon: UserPlus, tone: "text-primary bg-primary/15" },
  application_expired: { icon: Clock, tone: "text-warning bg-warning/15" },
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifs } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <Button variant="outline" size="sm" onClick={() => markAll.mutate()}>Mark all as read</Button>
      </div>
      {!notifs || notifs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">You're all caught up.</div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {notifs.map((n) => {
            const { icon: Icon, tone } = ICON[n.type] ?? ICON.new_message;
            return (
              <button key={n.id} className="w-full text-left" onClick={() => { markRead.mutate(n.id); if (n.link) navigate({ to: n.link as string }); }}>
                <div className="flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors">
                  <span className={`grid h-9 w-9 place-items-center rounded-full shrink-0 ${tone}`}><Icon className="h-4 w-4" /></span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.is_read ? "text-muted-foreground" : ""}`}>{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
