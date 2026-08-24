import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models";
import { getUserQuotaSummary } from "@/lib/ai/rate-limiter";
import { PLANS, FEATURE_COMPARISON } from "@/lib/plans";
import { PricingClient } from "./pricing-client";

export default async function PricingPage() {
  const session = await auth();
  let quotaSummary = null;

  if (session?.user?.email) {
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (user) {
      quotaSummary = await getUserQuotaSummary(user._id.toString());
    }
  }

  return <PricingClient quotaSummary={quotaSummary} isAuthenticated={!!session?.user} />;
}
