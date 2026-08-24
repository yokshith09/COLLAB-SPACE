import { User, Project, type IUser, type UserPlan } from "@/lib/models";
import { PLANS, type PlanType } from "@/lib/plans";
import { connectDB } from "@/lib/mongoose";

export type QuotaAction =
  | "IDEA_VALIDATION"
  | "PRD_GENERATION"
  | "MILESTONE_GENERATION"
  | "PROJECT_CREATION";

export interface QuotaCheckResult {
  allowed: boolean;
  action: QuotaAction;
  plan: PlanType;
  currentUsage: number;
  limit: number;
  remaining: number;
  resetDate: Date;
  isTrialActive?: boolean;
  trialDaysRemaining?: number;
  error?: string;
}

export interface UserQuotaSummary {
  plan: PlanType;
  planName: string;
  isPro: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  planExpiresAt?: Date;
  resetDate: Date;
  activeProjects: { current: number; limit: number; percentage: number };
  ideaValidations: { current: number; limit: number; percentage: number };
  prdGenerations: { current: number; limit: number; percentage: number };
  milestoneGenerations: { current: number; limit: number; percentage: number };
}

export async function checkAndConsumeQuota(
  userId: string,
  action: QuotaAction
): Promise<QuotaCheckResult> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const planType: PlanType = (user.plan as PlanType) || "FREE";
  const planConfig = PLANS[planType] || PLANS.FREE;

  // 30-Day All-Access Free Trial calculation
  const createdDate = user.createdAt ? new Date(user.createdAt) : now;
  const trialEnd = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const trialDaysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
  const isTrialActive = trialDaysRemaining > 0;

  // Check 30-day reset cycle
  const lastReset = user.aiUsage?.lastResetAt ? new Date(user.aiUsage.lastResetAt) : new Date(0);
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const isResetDue = now.getTime() - lastReset.getTime() >= thirtyDaysMs;

  if (isResetDue) {
    user.aiUsage = {
      ideaValidations: 0,
      prdGenerations: 0,
      milestoneGenerations: 0,
      lastResetAt: now,
    };
  }

  const nextResetDate = new Date(
    (user.aiUsage?.lastResetAt ? new Date(user.aiUsage.lastResetAt) : now).getTime() + thirtyDaysMs
  );

  let currentUsage = 0;
  // If trial is active or user is Pro, grant generous trial quota
  const effectiveLimits = (isTrialActive || planType === "PRO") ? PLANS.PRO.limits : planConfig.limits;
  let limit = 0;

  switch (action) {
    case "IDEA_VALIDATION":
      currentUsage = user.aiUsage?.ideaValidations || 0;
      limit = effectiveLimits.monthlyIdeaValidations;
      break;
    case "PRD_GENERATION":
      currentUsage = user.aiUsage?.prdGenerations || 0;
      limit = effectiveLimits.monthlyPrdGenerations;
      break;
    case "MILESTONE_GENERATION":
      currentUsage = user.aiUsage?.milestoneGenerations || 0;
      limit = effectiveLimits.monthlyMilestoneGenerations;
      break;
    case "PROJECT_CREATION":
      const activeCount = await Project.countDocuments({
        ownerId: user._id,
        status: { $in: ["OPEN", "ACTIVE", "FULL"] },
      });
      currentUsage = activeCount;
      limit = effectiveLimits.maxActiveProjects;
      break;
  }

  // If beyond trial/pro quota and not in trial
  if (!isTrialActive && planType === "FREE" && currentUsage >= planConfig.limits[
    action === "IDEA_VALIDATION" ? "monthlyIdeaValidations" :
    action === "PRD_GENERATION" ? "monthlyPrdGenerations" :
    action === "MILESTONE_GENERATION" ? "monthlyMilestoneGenerations" : "maxActiveProjects"
  ]) {
    return {
      allowed: false,
      action,
      plan: planType,
      currentUsage,
      limit,
      remaining: 0,
      resetDate: nextResetDate,
      isTrialActive: false,
      trialDaysRemaining: 0,
      error: `Your 30-day free trial has expired and you've reached the Free limit for ${action.replace("_", " ").toLowerCase()}. Upgrade to Pro to continue unlimited access!`,
    };
  }

  // Consume quota
  if (action === "IDEA_VALIDATION") {
    user.aiUsage.ideaValidations = (user.aiUsage.ideaValidations || 0) + 1;
  } else if (action === "PRD_GENERATION") {
    user.aiUsage.prdGenerations = (user.aiUsage.prdGenerations || 0) + 1;
  } else if (action === "MILESTONE_GENERATION") {
    user.aiUsage.milestoneGenerations = (user.aiUsage.milestoneGenerations || 0) + 1;
  }

  await user.save();

  return {
    allowed: true,
    action,
    plan: planType,
    currentUsage: currentUsage + 1,
    limit,
    remaining: Math.max(0, limit - (currentUsage + 1)),
    resetDate: nextResetDate,
    isTrialActive,
    trialDaysRemaining,
  };
}

export async function getUserQuotaSummary(userId: string): Promise<UserQuotaSummary> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const planType: PlanType = (user.plan as PlanType) || "FREE";
  const planConfig = PLANS[planType] || PLANS.FREE;

  // 30-Day All-Access Free Trial calculation
  const createdDate = user.createdAt ? new Date(user.createdAt) : now;
  const trialEnd = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const trialDaysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
  const isTrialActive = trialDaysRemaining > 0;

  const effectiveLimits = (isTrialActive || planType === "PRO") ? PLANS.PRO.limits : planConfig.limits;

  const lastReset = user.aiUsage?.lastResetAt ? new Date(user.aiUsage.lastResetAt) : new Date(0);
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const resetDate = new Date(lastReset.getTime() + thirtyDaysMs);

  const activeProjectsCount = await Project.countDocuments({
    ownerId: user._id,
    status: { $in: ["OPEN", "ACTIVE", "FULL"] },
  });

  const ideaVal = user.aiUsage?.ideaValidations || 0;
  const prdGen = user.aiUsage?.prdGenerations || 0;
  const mileGen = user.aiUsage?.milestoneGenerations || 0;

  return {
    plan: planType,
    planName: isTrialActive ? "30-Day All-Access Free Trial" : planConfig.name,
    isPro: planType === "PRO" || isTrialActive,
    isTrialActive,
    trialDaysRemaining,
    planExpiresAt: user.planExpiresAt,
    resetDate,
    activeProjects: {
      current: activeProjectsCount,
      limit: effectiveLimits.maxActiveProjects,
      percentage: Math.min(100, Math.round((activeProjectsCount / effectiveLimits.maxActiveProjects) * 100)),
    },
    ideaValidations: {
      current: ideaVal,
      limit: effectiveLimits.monthlyIdeaValidations,
      percentage: Math.min(100, Math.round((ideaVal / effectiveLimits.monthlyIdeaValidations) * 100)),
    },
    prdGenerations: {
      current: prdGen,
      limit: effectiveLimits.monthlyPrdGenerations,
      percentage: Math.min(100, Math.round((prdGen / effectiveLimits.monthlyPrdGenerations) * 100)),
    },
    milestoneGenerations: {
      current: mileGen,
      limit: effectiveLimits.monthlyMilestoneGenerations,
      percentage: Math.min(100, Math.round((mileGen / effectiveLimits.monthlyMilestoneGenerations) * 100)),
    },
  };
}
