import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getHealthStatus, daysLeft } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    domain: string;
    status: string;
    teamSizeMax: number;
    requiredSkills: string[];
    deadline?: Date | string | null;
    owner: { lastLoginAt: Date | string; name: string };
    team: { id: string }[];
    messages: { createdAt: Date | string }[];
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const lastMsg = project.messages?.[project.messages.length - 1]?.createdAt;
  const health = getHealthStatus(project.owner.lastLoginAt, lastMsg);
  const teamCount = project.team?.length ?? 0;

  const statusStyles: Record<string, string> = {
    OPEN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    FULL: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    ACTIVE: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    COMPLETED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="p-5 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200 space-y-3 group">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="text-xs font-normal">{project.domain}</Badge>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[project.status] || ""}`}>
            {project.status}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${health.textColor}`}>
            {health.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Team: {teamCount}/{project.teamSizeMax}</span>
          {project.deadline && (
            <span className={`text-muted-foreground ${daysLeft(project.deadline) === "Expired" ? "text-red-500" : ""}`}>
              {daysLeft(project.deadline)}
            </span>
          )}
        </div>

        {project.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.requiredSkills.slice(0, 4).map((s) => (
              <Badge key={s} variant="outline" className="text-xs font-normal">{s}</Badge>
            ))}
            {project.requiredSkills.length > 4 && (
              <span className="text-xs text-muted-foreground">+{project.requiredSkills.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
