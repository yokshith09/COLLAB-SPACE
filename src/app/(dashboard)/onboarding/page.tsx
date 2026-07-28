import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { OnboardingSteps } from "@/components/onboarding/onboarding-steps";

export default async function OnboardingPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  
  

  let user = await safeDbQuery(
    () =>
      prisma.user.findUnique({
        where: { id: userId },
        include: { skills: true, domains: true },
      }),
    null
  );

  if (!user) {
    user = await safeDbQuery(
      () =>
        prisma.user.create({
          data: {
            id: userId,
            email: session?.user?.email || "",
            name: `${session?.user?.name} ${""}`.trim() || "Anonymous",
            avatar: session?.user?.image || null,
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