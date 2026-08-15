import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongoose";
import { User, Project, Application } from "@/lib/models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderOpen, MessageSquare, Clock, TrendingUp, AlertTriangle } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  await connectDB();
  let user = await User.findOne({ email: session.user.email });
  if (!user) { user = await User.create({ name: session.user.name || "Anonymous", email: session.user.email, avatar: session.user.image || undefined }); }

  if (user.email !== "admin@collabspace.app") redirect("/dashboard");

  const [totalUsers, totalProjects, openProjects, totalApplications, pendingApplications, recentUsers, recentProjects, expiringApplications] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Project.countDocuments({ status: "OPEN" }),
    Application.countDocuments(),
    Application.countDocuments({ status: "PENDING" }),
    User.find().sort({ createdAt: -1 }).limit(5).lean(),
    Project.find().sort({ createdAt: -1 }).limit(5).lean(),
    Application.find({ status: "PENDING", expiresAt: { $gt: new Date() } })
      .populate("userId", "name").populate("projectId", "title")
      .sort({ expiresAt: 1 }).limit(5).lean(),
  ]);

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="text-sm text-muted-foreground">Platform overview</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalUsers}</div><p className="text-xs text-muted-foreground">Registered users</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Projects</CardTitle><FolderOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalProjects}</div><p className="text-xs text-muted-foreground">All projects</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Open Projects</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{openProjects}</div><p className="text-xs text-muted-foreground">Accepting applications</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Applications</CardTitle><MessageSquare className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalApplications}</div><p className="text-xs text-muted-foreground">{pendingApplications} pending</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Users</CardTitle><CardDescription>Last 5 registered users</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentUsers as any[]).map((u) => (
                <div key={u._id.toString()} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">{u.name[0]}</div>
                    <div><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                  </div>
                  <Badge variant="outline" className="text-xs">{new Date(u.createdAt).toLocaleDateString()}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Projects</CardTitle><CardDescription>Last 5 created projects</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentProjects as any[]).map((p) => (
                <div key={p._id.toString()} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{p.title}</p></div>
                  <Badge variant={p.status === "OPEN" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Expiring Applications</CardTitle><CardDescription>Applications expiring soon</CardDescription></CardHeader>
          <CardContent>
            {expiringApplications.length === 0 ? <p className="text-sm text-muted-foreground">No applications expiring soon</p> : (
              <div className="space-y-3">
                {(expiringApplications as any[]).map((app) => (
                  <div key={app._id.toString()} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                    <div><p className="text-sm font-medium">{app.userId.name}</p><p className="text-xs text-muted-foreground">Applied to {app.projectId.title}</p></div>
                    <Badge variant="outline" className="text-xs text-amber-600"><Clock className="h-3 w-3 mr-1" /> Expires soon</Badge>
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
