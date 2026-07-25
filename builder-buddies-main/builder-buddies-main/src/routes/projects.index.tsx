import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DiscoverPage } from "@/components/project/DiscoverPage";

export const Route = createFileRoute("/projects/")({
  head: () => ({ meta: [{ title: "Discover Projects — CollabSpace" }, { name: "description", content: "Browse open projects looking for collaborators." }] }),
  component: () => <AppShell><DiscoverPage /></AppShell>,
});
