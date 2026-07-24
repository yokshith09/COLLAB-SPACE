"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { timeAgo } from "@/lib/utils";
import { CheckCheck, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export function NotificationsList({ notifications }: { notifications: any[] }) {
  const router = useRouter();
  const { toast } = useToast();

  async function markAllRead() {
    const res = await fetch("/api/notifications/read-all", { method: "PUT" });
    if (res.ok) {
      router.refresh();
      toast({ title: "All marked as read" });
    }
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    router.refresh();
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unread} unread</p>
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="gap-1.5">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`block p-4 rounded-xl border transition-colors ${
                n.isRead
                  ? "bg-card hover:bg-muted/50"
                  : "bg-primary/[0.03] border-primary/20 hover:bg-primary/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? "" : "font-medium"}`}>{n.message}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
