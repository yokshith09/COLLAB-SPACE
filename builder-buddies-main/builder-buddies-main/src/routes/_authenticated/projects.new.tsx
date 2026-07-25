import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { NewProjectForm } from "@/components/project/NewProjectForm";

export const Route = createFileRoute("/_authenticated/projects/new")({
  head: () => ({ meta: [{ title: "Start a project — CollabSpace" }] }),
  component: () => <AppShell><NewProjectForm /></AppShell>,
});
