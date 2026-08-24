"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { upgradeUserPlan, cancelUserSubscription } from "@/actions/subscription";
import { PLANS, FEATURE_COMPARISON, type PlanType } from "@/lib/plans";
import type { UserQuotaSummary } from "@/lib/ai/rate-limiter";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Crown,
  Zap,
  Loader2,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

interface Props {
  quotaSummary: UserQuotaSummary | null;
  isAuthenticated: boolean;
}

export function PricingClient({ quotaSummary, isAuthenticated }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const currentPlan = quotaSummary?.plan || "FREE";
  const isPro = currentPlan === "PRO";

  const freePlan = PLANS.FREE;
  const proPlan = PLANS.PRO;

  const proPrice = billingCycle === "annual" ? proPlan.priceAnnual : proPlan.priceMonthly;

  async function handleUpgrade() {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    setUpgrading(true);
    const res = await upgradeUserPlan("PRO", billingCycle);
    setUpgrading(false);

    if (res.error) {
      toast({ title: "Upgrade failed", description: res.error, variant: "destructive" });
    } else {
      toast({
        title: "🎉 Welcome to CollabSpace Pro!",
        description: "Your account is now upgraded with 100 monthly AI validations and 50 PRD generations.",
      });
      router.refresh();
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to downgrade to the Community Starter tier?")) return;

    setCancelling(true);
    const res = await cancelUserSubscription();
    setCancelling(false);

    if (res.error) {
      toast({ title: "Cancellation failed", description: res.error, variant: "destructive" });
    } else {
      toast({ title: "Subscription cancelled. You are now on the Free plan." });
      router.refresh();
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/30 py-1 px-3">
          <Sparkles className="w-3.5 h-3.5" /> Flexible & Transparent Pricing
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Supercharge Your Project Lifecycle
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          From lean idea validation to AI-powered PRDs, interactive mind maps, and automated sprint milestones. Choose the plan that fits your ambition.
        </p>

        {/* Billing Cycle Switcher */}
        <div className="pt-2 flex items-center justify-center">
          <div className="p-1 bg-muted rounded-xl flex items-center gap-1 border shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                billingCycle === "annual"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Annual Billing</span>
              <Badge variant="secondary" className="text-[10px] bg-background/20 text-inherit font-bold h-4 px-1">
                Save 21%
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Free Trial Banner */}
      <div className="max-w-4xl mx-auto p-5 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base">30-Day All-Access Free Trial Active</h3>
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold">Free Trial</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enjoy all Pro features — including deep AI reasoning, Living PRDs, and sprint milestones — 100% free for your first 30 days. Paid subscription billing will activate after your 30-day trial period.
            </p>
          </div>
        </div>
        {quotaSummary?.isTrialActive && (
          <div className="shrink-0 text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-primary/10">
            <span className="text-xs font-bold text-primary block">{quotaSummary.trialDaysRemaining} Days Left</span>
            <span className="text-[10px] text-muted-foreground">in your free trial</span>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Free Tier */}
        <div className="p-8 rounded-2xl border bg-card flex flex-col justify-between space-y-6 shadow-sm hover:border-border/80 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{freePlan.name}</h3>
              <Badge variant="outline" className="text-xs">{freePlan.badge}</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{freePlan.description}</p>
            <div className="pt-2">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="text-xs text-muted-foreground"> / month</span>
            </div>

            <div className="border-t pt-4 space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan Highlights</span>
              <ul className="space-y-2.5 text-xs text-foreground/90">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Up to 2 Active Projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>5 AI Idea Validations / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>2 Living PRD & Architecture Generations / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>2 Sprint Milestone Roadmaps / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Interactive Kanban & Team Channels</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4">
            {!isPro ? (
              <Button variant="outline" disabled className="w-full">
                Current Active Plan
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full text-xs"
              >
                {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Downgrade to Free"}
              </Button>
            )}
          </div>
        </div>

        {/* Pro Tier */}
        <div className="p-8 rounded-2xl border-2 border-primary bg-gradient-to-b from-primary/10 via-primary/5 to-card flex flex-col justify-between space-y-6 shadow-md relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary text-primary-foreground text-xs font-bold gap-1 shadow-sm">
              <Crown className="w-3 h-3" /> {proPlan.badge}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">{proPlan.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{proPlan.description}</p>
            </div>

            <div className="pt-2">
              <span className="text-4xl font-extrabold text-foreground">${proPrice}</span>
              <span className="text-xs text-muted-foreground"> / month</span>
              {billingCycle === "annual" && (
                <p className="text-[11px] text-primary font-medium mt-0.5">Billed annually ($180/year)</p>
              )}
            </div>

            <div className="border-t border-primary/20 pt-4 space-y-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Everything in Free, plus:</span>
              <ul className="space-y-2.5 text-xs text-foreground/90">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold">Up to 25 Active Projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold">100 AI Idea Validations / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold">50 Living PRD & Architecture Generations / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold">50 Sprint Milestone Roadmaps / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Deep Google Gemini 1.5 Flash LLM Reasoning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Automated 48h Team Milestone Reminders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Export PRD to Markdown (.md)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Pro Builder Profile Badge & +100 Points Bonus</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4">
            {isPro ? (
              <Button variant="outline" disabled className="w-full gap-1.5 border-primary/30 text-primary font-bold">
                <Crown className="w-4 h-4" /> Active Pro Subscription
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full font-bold shadow-md hover:shadow-lg transition-all gap-2"
              >
                {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {upgrading ? "Upgrading Account..." : `Upgrade to Pro - $${proPrice}/mo`}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="p-6 sm:p-8 rounded-2xl border bg-card space-y-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Detailed Feature Comparison</h3>
          <p className="text-xs text-muted-foreground">
            Complete breakdown of limits, AI capabilities, and collaboration tools.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-3 font-bold text-muted-foreground uppercase">Feature</th>
                <th className="text-center p-3 font-bold text-muted-foreground uppercase w-36">Community (Free)</th>
                <th className="text-center p-3 font-bold text-primary uppercase w-44">Pro Builder ($19/mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {FEATURE_COMPARISON.map((feat, i) => (
                <tr key={i} className={`hover:bg-muted/30 transition-colors ${feat.highlight ? "bg-primary/[0.02]" : ""}`}>
                  <td className="p-3 font-medium text-foreground">{feat.name}</td>
                  <td className="p-3 text-center text-muted-foreground">
                    {typeof feat.free === "boolean" ? (
                      feat.free ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                      )
                    ) : (
                      feat.free
                    )}
                  </td>
                  <td className="p-3 text-center font-semibold text-foreground">
                    {typeof feat.pro === "boolean" ? (
                      feat.pro ? (
                        <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                      )
                    ) : (
                      feat.pro
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 max-w-3xl mx-auto pt-6">
        <h3 className="text-xl font-bold text-center">Frequently Asked Questions</h3>
        <div className="grid gap-4">
          <div className="p-4 rounded-xl border bg-card space-y-1.5">
            <h4 className="font-semibold text-sm">How do monthly AI quotas reset?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your AI Idea Validation, PRD Generation, and Sprint Milestone quotas reset automatically every 30 days based on your account signup or upgrade date.
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-card space-y-1.5">
            <h4 className="font-semibold text-sm">What AI models power CollabSpace Pro?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pro members benefit from deep contextual reasoning powered by Google Gemini 1.5 Flash with strict JSON schema outputs, domain-tailored architecture diagrams, and multi-week sprint synthesis.
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-card space-y-1.5">
            <h4 className="font-semibold text-sm">Can I cancel or switch plans anytime?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Yes! You can upgrade, downgrade, or cancel your Pro subscription at any time with 1 click directly from this page without penalty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
