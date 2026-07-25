import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { NotificationsPage } from "@/components/notifications/NotificationsPage";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — CollabSpace" }] }),
  component: () => <AppShell><NotificationsPage /></AppShell>,
});
