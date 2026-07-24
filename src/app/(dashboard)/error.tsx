"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-4xl opacity-30">⚠</div>
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground text-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
