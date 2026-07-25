import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectDetail } from "@/components/project/ProjectDetail";

export const Route = createFileRoute("/projects/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <AppShell><ProjectDetail projectId={id} /></AppShell>;
}
