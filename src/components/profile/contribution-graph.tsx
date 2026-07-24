"use client";

import { useMemo } from "react";
import { subDays, format, isSameDay } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContributionGraphProps {
  dates: Date[];
}

export function ContributionGraph({ dates }: ContributionGraphProps) {
  const days = 60; // Show last 60 days
  
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    dates.forEach((d) => {
      const key = format(new Date(d), "yyyy-MM-dd");
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [dates]);

  const cells = useMemo(() => {
    const today = new Date();
    return Array.from({ length: days }).map((_, i) => {
      const date = subDays(today, days - 1 - i);
      const key = format(date, "yyyy-MM-dd");
      const count = activityMap.get(key) || 0;
      return { date, count };
    });
  }, [activityMap]);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Activity Map</h2>
      <div className="p-4 rounded-xl border bg-card">
        <TooltipProvider>
          <div className="flex flex-wrap gap-1.5 justify-end sm:justify-start">
            {cells.map((cell, i) => {
              let color = "bg-muted/30 dark:bg-muted/10";
              if (cell.count > 0 && cell.count <= 2) color = "bg-primary/40";
              else if (cell.count > 2 && cell.count <= 5) color = "bg-primary/70";
              else if (cell.count > 5) color = "bg-primary";

              return (
                <Tooltip key={i} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className={`w-3.5 h-3.5 rounded-sm ${color} transition-colors`} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {cell.count} action{cell.count !== 1 ? "s" : ""} on {format(cell.date, "MMM d, yyyy")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground justify-end sm:justify-start">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-muted/30 dark:bg-muted/10" />
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <div className="w-3 h-3 rounded-sm bg-primary/70" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
