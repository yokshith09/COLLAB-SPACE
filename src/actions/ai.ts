"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models";
import { evaluateProjectIdea, type IdeaEvaluationResult } from "@/lib/ai/validator";
import { checkAndConsumeQuota } from "@/lib/ai/rate-limiter";

export async function validateProjectIdeaAction(input: {
  title: string;
  description: string;
  problemStatement: string;
  domain?: string;
  requiredSkills?: string[];
}): Promise<{
  data?: IdeaEvaluationResult;
  error?: string;
  quotaExceeded?: boolean;
  remaining?: number;
}> {
  try {
    if (!input.title?.trim() && !input.description?.trim()) {
      return { error: "Please enter at least a project title or description to validate." };
    }

    const session = await auth();
    if (session?.user?.email) {
      await connectDB();
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        const quota = await checkAndConsumeQuota(user._id.toString(), "IDEA_VALIDATION");
        if (!quota.allowed) {
          return {
            error: quota.error,
            quotaExceeded: true,
            remaining: 0,
          };
        }
      }
    }

    const evaluation = await evaluateProjectIdea(input);
    return { data: evaluation };
  } catch (error) {
    console.error("Error validating idea:", error);
    return { error: "Failed to evaluate idea. Please try again." };
  }
}
