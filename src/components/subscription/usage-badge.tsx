"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "./upgrade-modal";
import { Sparkles, Crown, Zap } from "lucide-react";
import type { PlanType } from "@/lib/plans";

interface Props {
  plan?: PlanType;
  currentUsage?: number;
  limit?: number;
  label?: string;
  showUpgradeButton?: boolean;
}

export function UsageBadge({
  plan = "FREE",
  currentUsage,
  limit,
  label = "AI Quota",
  showUpgradeButton = true,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const isPro = plan === "PRO";

  return (
    <>
      <div className="inline-flex items-center gap-2">
        {isPro ? (
          <Badge variant="outline" className="gap-1 text-xs border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
            <Crown className="w-3 h-3 text-amber-500" /> Pro Member
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1 text-xs font-medium">
            <Sparkles className="w-3 h-3 text-primary" />
            {currentUsage !== undefined && limit !== undefined
              ? `${label}: ${currentUsage}/${limit}`
              : "Free Tier"}
          </Badge>
        )}

        {!isPro && showUpgradeButton && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
          >
            Upgrade <Zap className="w-3 h-3" />
          </button>
        )}
      </div>

      <UpgradeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentPlan={plan}
        triggerFeature={label}
      />
    </>
  );
}
