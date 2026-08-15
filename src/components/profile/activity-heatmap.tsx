import { Project, Application } from "@/lib/models";
import { connectDB } from "@/lib/mongoose";

export async function ActivityHeatmap({ userId }: { userId: string }) {
  await connectDB();
  
  const now = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(now.getDate() - 89);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  // Fetch all projects created by user in last 90 days
  const projects = await Project.find({
    ownerId: userId,
    createdAt: { $gte: ninetyDaysAgo }
  }).select("createdAt").lean();

  // Fetch all applications created by user in last 90 days
  const applications = await Application.find({
    userId: userId,
    createdAt: { $gte: ninetyDaysAgo }
  }).select("createdAt").lean();

  // Aggregate by day string (YYYY-MM-DD)
  const activityMap: Record<string, number> = {};
  
  const formatDate = (d: Date) => {
    return d.toISOString().split("T")[0];
  };

  for (const p of projects) {
    const d = formatDate((p as any).createdAt);
    activityMap[d] = (activityMap[d] || 0) + 1;
  }
  
  for (const a of applications) {
    const d = formatDate((a as any).createdAt);
    activityMap[d] = (activityMap[d] || 0) + 1;
  }

  // Generate last 90 days array
  const days = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(ninetyDaysAgo);
    d.setDate(ninetyDaysAgo.getDate() + i);
    days.push({
      dateStr: formatDate(d),
      count: activityMap[formatDate(d)] || 0
    });
  }

  return (
    <section className="mt-8 bg-card border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Activity (Last 90 Days)</h3>
      <div className="flex flex-wrap gap-1">
        {days.map((day) => {
          let colorClass = "bg-muted"; // 0
          if (day.count === 1) colorClass = "bg-primary/40";
          else if (day.count === 2) colorClass = "bg-primary/60";
          else if (day.count === 3) colorClass = "bg-primary/80";
          else if (day.count > 3) colorClass = "bg-primary";

          return (
            <div
              key={day.dateStr}
              className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm ${colorClass}`}
              title={`${day.count} contributions on ${day.dateStr}`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <div className="w-3 h-3 rounded-sm bg-primary/60" />
          <div className="w-3 h-3 rounded-sm bg-primary/80" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span>More</span>
      </div>
    </section>
  );
}
