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
  error?: string;
}

export interface UserQuotaSummary {
  plan: PlanType;
  planName: string;
  isPro: boolean;
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

  const planType: PlanType = (user.plan as PlanType) || "FREE";
  const planConfig = PLANS[planType] || PLANS.FREE;

  // Check 30-day reset cycle
  const now = new Date();
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
  let limit = 0;

  switch (action) {
    case "IDEA_VALIDATION":
      currentUsage = user.aiUsage?.ideaValidations || 0;
      limit = planConfig.limits.monthlyIdeaValidations;
      break;
    case "PRD_GENERATION":
      currentUsage = user.aiUsage?.prdGenerations || 0;
      limit = planConfig.limits.monthlyPrdGenerations;
      break;
    case "MILESTONE_GENERATION":
      currentUsage = user.aiUsage?.milestoneGenerations || 0;
      limit = planConfig.limits.monthlyMilestoneGenerations;
      break;
    case "PROJECT_CREATION":
      const activeCount = await Project.countDocuments({
        ownerId: user._id,
        status: { $in: ["OPEN", "ACTIVE", "FULL"] },
      });
      currentUsage = activeCount;
      limit = planConfig.limits.maxActiveProjects;
      break;
  }

  if (currentUsage >= limit) {
    return {
      allowed: false,
      action,
      plan: planType,
      currentUsage,
      limit,
      remaining: 0,
      resetDate: nextResetDate,
      error: `You've reached your monthly limit of ${limit} for ${action.replace("_", " ").toLowerCase()} on the ${planConfig.name} plan. Upgrade to Pro for increased limits!`,
    };
  }

  // Consume quota (except PROJECT_CREATION which is checked dynamically)
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
    remaining: limit - (currentUsage + 1),
    resetDate: nextResetDate,
  };
}

export async function getUserQuotaSummary(userId: string): Promise<UserQuotaSummary> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const planType: PlanType = (user.plan as PlanType) || "FREE";
  const planConfig = PLANS[planType] || PLANS.FREE;

  const now = new Date();
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
    planName: planConfig.name,
    isPro: planType === "PRO",
    planExpiresAt: user.planExpiresAt,
    resetDate,
    activeProjects: {
      current: activeProjectsCount,
      limit: planConfig.limits.maxActiveProjects,
      percentage: Math.min(100, Math.round((activeProjectsCount / planConfig.limits.maxActiveProjects) * 100)),
    },
    ideaValidations: {
      current: ideaVal,
      limit: planConfig.limits.monthlyIdeaValidations,
      percentage: Math.min(100, Math.round((ideaVal / planConfig.limits.monthlyIdeaValidations) * 100)),
    },
    prdGenerations: {
      current: prdGen,
      limit: planConfig.limits.monthlyPrdGenerations,
      percentage: Math.min(100, Math.round((prdGen / planConfig.limits.monthlyPrdGenerations) * 100)),
    },
    milestoneGenerations: {
      current: mileGen,
      limit: planConfig.limits.monthlyMilestoneGenerations,
      percentage: Math.min(100, Math.round((mileGen / planConfig.limits.monthlyMilestoneGenerations) * 100)),
    },
  };
}
