import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  
  

  let user = await safeDbQuery(
    () => prisma.user.findUnique({ where: { id: userId } }),
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
