import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProfilePage } from "@/components/profile/ProfilePage";

export const Route = createFileRoute("/profile/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <AppShell><ProfilePage userId={id} /></AppShell>;
}
