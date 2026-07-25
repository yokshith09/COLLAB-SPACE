import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CollabSpace — Build in public. Find your team." },
      { name: "description", content: "The transparent collaboration platform for builders. Browse open projects, apply to join, and ship together." },
    ],
  }),
  component: LandingPage,
});
