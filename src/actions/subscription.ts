"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User, Notification, type UserPlan } from "@/lib/models";
import { getUserQuotaSummary, type UserQuotaSummary } from "@/lib/ai/rate-limiter";
import { PLANS, type PlanType } from "@/lib/plans";
import { revalidatePath } from "next/cache";

export async function getUserSubscriptionStatus(): Promise<{
  summary?: UserQuotaSummary;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Unauthorized" };
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return { error: "User not found" };

    const summary = await getUserQuotaSummary(user._id.toString());
    return { summary };
  } catch (error: any) {
    console.error("Error fetching subscription status:", error);
    return { error: error?.message || "Failed to load subscription details" };
  }
}

export async function upgradeUserPlan(
  targetPlan: PlanType = "PRO",
  billingCycle: "monthly" | "annual" = "monthly"
): Promise<{ success?: boolean; plan?: PlanType; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Please sign in to upgrade your plan." };
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return { error: "User not found" };

    const now = new Date();
    const durationDays = billingCycle === "annual" ? 365 : 30;
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    user.plan = targetPlan;
    user.planExpiresAt = targetPlan === "PRO" ? expiresAt : undefined;

    if (targetPlan === "PRO") {
      // Award gamification bonus and Pro badge
      user.points = (user.points || 0) + 100;
      if (!user.badges.includes("Pro Builder")) {
        user.badges.push("Pro Builder");
      }

      await Notification.create({
        userId: user._id,
        type: "plan_upgraded",
        message: `🎉 Welcome to CollabSpace Pro! You now have 100 monthly AI validations, 50 PRD generations, and automated sprint milestones.`,
        link: `/pricing`,
      });
    }

    await user.save();

    revalidatePath(`/dashboard`);
    revalidatePath(`/pricing`);
    revalidatePath(`/profile/${user._id}`);

    return { success: true, plan: targetPlan };
  } catch (error: any) {
    console.error("Error upgrading plan:", error);
    return { error: error?.message || "Failed to process upgrade." };
  }
}

export async function cancelUserSubscription(): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.email) return { error: "Unauthorized" };

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return { error: "User not found" };

    user.plan = "FREE";
    user.planExpiresAt = undefined;
    await user.save();

    revalidatePath(`/dashboard`);
    revalidatePath(`/pricing`);
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || "Failed to cancel subscription." };
  }
}
