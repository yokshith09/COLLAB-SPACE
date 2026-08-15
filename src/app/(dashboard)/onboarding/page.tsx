import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models";
import { OnboardingSteps } from "@/components/onboarding/onboarding-steps";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  await connectDB();
  let user = await User.findOne({ email: session.user.email });
  if (!user) {
    user = await User.create({
      name: session.user.name || "Anonymous",
      email: session.user.email,
      avatar: session.user.image || undefined,
    });
  }

  const hasProfile = user.name && user.skills.length > 0 && user.domains.length > 0;
  if (hasProfile) redirect("/dashboard");

  const userData = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? null,
    bio: user.bio ?? null,
    githubUrl: user.githubUrl ?? null,
    linkedinUrl: user.linkedinUrl ?? null,
    skills: user.skills.map((s: string) => ({ name: s })),
    domains: user.domains.map((d: string) => ({ name: d })),
  };

  return <OnboardingSteps user={userData} />;
}
