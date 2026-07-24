import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  let user = await safeDbQuery(
    () => prisma.user.findUnique({ where: { clerkId: userId } }),
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

  const notifications = await safeDbQuery(
    () =>
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    []
  );

  return <NotificationsList notifications={notifications} />;
}
