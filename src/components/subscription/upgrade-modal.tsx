"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { upgradeUserPlan } from "@/actions/subscription";
import { PLANS, type PlanType } from "@/lib/plans";
import {
  Sparkles,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Loader2,
  Crown,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: PlanType;
  triggerFeature?: string;
}

export function UpgradeModal({
  open,
  onOpenChange,
  currentPlan = "FREE",
  triggerFeature,
}: Props) {
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);

  const proPlan = PLANS.PRO;
  const price = billingCycle === "annual" ? proPlan.priceAnnual : proPlan.priceMonthly;

  async function handleUpgrade() {
    setLoading(true);
    const res = await upgradeUserPlan("PRO", billingCycle);
    setLoading(false);

    if (res.error) {
      toast({ title: "Upgrade failed", description: res.error, variant: "destructive" });
    } else {
      toast({
        title: "🎉 Welcome to CollabSpace Pro!",
        description: "Your account has been upgraded with unlimited AI features and 100x quotas.",
      });
      onOpenChange(false);
    }
  }

  const proPerks = [
    { label: "100 AI Idea Validations / month", freeLabel: "5 / month on Free" },
    { label: "50 Living PRD & Architecture Generations", freeLabel: "2 / month on Free" },
    { label: "50 Sprint Milestone Roadmaps", freeLabel: "2 / month on Free" },
    { label: "Up to 25 Active Projects", freeLabel: "2 on Free" },
    { label: "Deep Google Gemini 1.5 Flash LLM Reasoning", freeLabel: "Standard Heuristic" },
    { label: "Automated 48h Team Milestone Reminders", freeLabel: "Manual only" },
    { label: "Export PRD to Markdown (.md)", freeLabel: "Not available" },
    { label: "Pro Builder Profile Badge & +100 Points", freeLabel: "Exclusive to Pro" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider">CollabSpace Pro</span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Supercharge Your Builder Workflow
          </DialogTitle>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 mt-1">
            🎁 <span className="font-bold">30-Day All-Access Free Trial:</span> All Pro AI features are currently unlocked for free during your trial. Paid plans will activate after your 30-day trial period.
          </div>
          {triggerFeature && (
            <p className="text-xs text-muted-foreground pt-1">
              Previewing plans for <span className="font-semibold text-foreground">{triggerFeature}</span>.
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center">
            <div className="p-1 bg-muted rounded-xl flex items-center gap-1 border">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly ($19/mo)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  billingCycle === "annual"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Annual ($15/mo)</span>
                <Badge variant="secondary" className="text-[10px] bg-background/20 text-inherit font-bold h-4 px-1">
                  Save 21%
                </Badge>
              </button>
            </div>
          </div>

          {/* Pricing Highlight Card */}
          <div className="p-6 rounded-2xl border-2 border-primary/40 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-primary/20 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Pro Builder Plan</h3>
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    {billingCycle === "annual" ? "Billed Annually ($180/yr)" : "Billed Monthly"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Everything you need to ideate, spec, recruit, and ship without artificial barriers.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-3xl font-extrabold text-foreground">${price}</span>
                <span className="text-xs text-muted-foreground"> / month</span>
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              {proPerks.map((perk, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">{perk.label}</span>
                    <p className="text-[10px] text-muted-foreground">{perk.freeLabel}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <Button
                size="lg"
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full font-bold shadow-md hover:shadow-lg transition-all gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Activating Pro Account..." : `Upgrade to Pro - $${price}/mo`}
              </Button>
              <p className="text-[11px] text-center text-muted-foreground mt-2">
                Instant activation. Cancel or downgrade anytime with 1 click.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
