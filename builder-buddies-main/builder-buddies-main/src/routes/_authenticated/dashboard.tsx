import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/components/dashboard/DashboardPage";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CollabSpace" }] }),
  component: () => <AppShell><DashboardPage /></AppShell>,
});
