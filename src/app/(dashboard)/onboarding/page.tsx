import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { OnboardingSteps } from "@/components/onboarding/onboarding-steps";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  let user = await safeDbQuery(
    () =>
      prisma.user.findUnique({
        where: { clerkId: userId },
        include: { skills: true, domains: true },
      }),
    null
  );

  if (!user) {
    user = await safeDbQuery(
      () =>
        prisma.user.create({
          data: {
            clerkId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Anonymous",
            avatar: clerkUser.imageUrl || null,
          },
          include: { skills: true, domains: true },
        }),
      null
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Database not available.</p>
      </div>
    );
  }

  const hasProfile = user.name && user.skills.length > 0 && user.domains.length > 0;

  if (hasProfile) {
    redirect("/dashboard");
  }

  return <OnboardingSteps user={user} />;
}