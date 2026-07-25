import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { TeamWorkspace } from "@/components/team/TeamWorkspace";

export const Route = createFileRoute("/_authenticated/team/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <AppShell><TeamWorkspace projectId={id} /></AppShell>;
}
