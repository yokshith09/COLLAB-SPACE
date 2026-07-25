import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderOpen, MessageSquare, Clock, TrendingUp, AlertTriangle } from "lucide-react";

export default async function AdminDashboard() {
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

  const isAdmin = user.email === "admin@collabspace.app";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const [
    totalUsers,
    totalProjects,
    openProjects,
    totalApplications,
    pendingApplications,
    recentUsers,
    recentProjects,
    expiringApplications,
  ] = await Promise.all([
    safeDbQuery(() => prisma.user.count(), 0),
    safeDbQuery(() => prisma.project.count(), 0),
    safeDbQuery(() => prisma.project.count({ where: { status: "OPEN" } }), 0),
    safeDbQuery(() => prisma.application.count(), 0),
    safeDbQuery(() => prisma.application.count({ where: { status: "PENDING" } }), 0),
    safeDbQuery(() => prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5 }), []),
    safeDbQuery(() => prisma.project.findMany({ orderBy: { createdAt: "desc" }, take: 5 }), []),
    safeDbQuery(
      () =>
        prisma.application.findMany({
          where: { status: "PENDING", expiresAt: { gt: new Date() } },
          include: { user: { select: { name: true } }, project: { select: { title: true } } },
          orderBy: { expiresAt: "asc" },
          take: 5,
        }),
      []
    ),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform overview and management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">All projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openProjects}</div>
            <p className="text-xs text-muted-foreground">Accepting applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">{pendingApplications} pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Last 5 registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Last 5 created projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">by {p.ownerId}</p>
                  </div>
                  <Badge variant={p.status === "OPEN" ? "default" : "secondary"} className="text-xs">
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Expiring Applications
            </CardTitle>
            <CardDescription>Applications expiring soon (7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {expiringApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications expiring soon</p>
            ) : (
              <div className="space-y-3">
                {expiringApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{app.user.name}</p>
                      <p className="text-xs text-muted-foreground">Applied to {app.project.title}</p>
                    </div>
                    <Badge variant="outline" className="text-xs text-amber-600">
                      <Clock className="h-3 w-3 mr-1" /> Expires soon
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}