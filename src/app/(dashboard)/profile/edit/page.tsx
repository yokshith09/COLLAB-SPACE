import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";

export default async function ProfileEditPage() {
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

  const [allSkills, allDomains] = await Promise.all([
    safeDbQuery(() => prisma.skill.findMany({ orderBy: { name: "asc" } }), []),
    safeDbQuery(() => prisma.domain.findMany({ orderBy: { name: "asc" } }), []),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-sm text-muted-foreground">Update your profile information</p>
      </div>

      <ProfileEditForm
        user={user}
        allSkills={allSkills.map((s) => s.name)}
        allDomains={allDomains.map((d) => d.name)}
      />
    </div>
  );
}