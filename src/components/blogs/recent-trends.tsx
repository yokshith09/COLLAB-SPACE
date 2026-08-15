"use client";

import { Badge } from "@/components/ui/badge";
import { TrendingUp, Hash } from "lucide-react";

export function RecentTrends({ trends }: { trends: { name: string; count: number }[] }) {
  return (
    <div className="p-4 rounded-xl border bg-card shadow-sm sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Recent Trends</h3>
      </div>
      
      {trends.length > 0 ? (
        <div className="space-y-3">
          {trends.map((trend, i) => (
            <div key={trend.name} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <span className="font-medium text-sm flex items-center gap-0.5"><Hash className="h-3 w-3 text-muted-foreground"/>{trend.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{trend.count} posts</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No trends available yet.</p>
      )}
    </div>
  );
}
