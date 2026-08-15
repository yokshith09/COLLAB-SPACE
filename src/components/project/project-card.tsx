import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getHealthStatus, daysLeft } from "@/lib/utils";
import { Users, Calendar, ArrowRight, Activity, FolderDot } from "lucide-react";

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
    OPEN: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
    FULL: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
    ACTIVE: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
    COMPLETED: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border-slate-500/20",
    CANCELLED: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/20",
  };

  return (
    <Link href={`/projects/${project.id}`} className="block h-full">
      <div className="relative h-full flex flex-col p-6 rounded-2xl border bg-card/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        {/* Subtle background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10 flex flex-col h-full space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center pt-1">
            <Badge variant="outline" className="text-[10px] font-medium border-primary/20 text-primary/80 bg-primary/5">{project.domain}</Badge>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${statusStyles[project.status] || ""}`}>
              {project.status}
            </span>
            <span className={`flex items-center gap-1 text-[10px] font-medium ${health.textColor}`}>
              <Activity className="h-3 w-3" /> {health.label}
            </span>
          </div>

          <div className="flex-1" />

          {project.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
              {project.requiredSkills.slice(0, 3).map((s) => (
                <span key={s} className="px-2 py-0.5 bg-muted rounded-md text-[10px] text-muted-foreground font-medium">
                  {s}
                </span>
              ))}
              {project.requiredSkills.length > 3 && (
                <span className="px-2 py-0.5 bg-muted/50 rounded-md text-[10px] text-muted-foreground font-medium">
                  +{project.requiredSkills.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="h-3.5 w-3.5" /> {teamCount} / {project.teamSizeMax}
            </span>
            {project.deadline && (
              <span className={`flex items-center gap-1.5 font-medium ${daysLeft(project.deadline) === "Expired" ? "text-red-500/80" : ""}`}>
                <Calendar className="h-3.5 w-3.5" /> {daysLeft(project.deadline)}
              </span>
            )}
          </div>
        </div>
        
        {/* Subtle hover arrow */}
        <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
           <div className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-md">
             <ArrowRight className="h-3 w-3" />
           </div>
        </div>
      </div>
    </Link>
  );
}
