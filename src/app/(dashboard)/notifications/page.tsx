import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongoose";
import { User, Notification } from "@/lib/models";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
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

  const rawNotifications = await Notification.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const notifications = (rawNotifications as any[]).map((n) => ({
    id: n._id.toString(),
    type: n.type,
    message: n.message,
    isRead: n.isRead,
    link: n.link,
    createdAt: n.createdAt,
  }));

  return <NotificationsList notifications={notifications} />;
}
