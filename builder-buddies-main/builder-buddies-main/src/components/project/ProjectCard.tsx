import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProfile, useTeam } from "@/lib/api";
import type { Project } from "@/lib/api";
import { ArrowRight, Users } from "lucide-react";

export function ProjectCard({ project }: { project: Project }) {
  const { data: owner } = useProfile(project.owner_id);
  const { data: team } = useTeam(project.id);
  const teamCount = team?.length ?? 0;

  return (
    <Link
      to="/projects/$id"
      params={{ id: project.id }}
      className="group flex flex-col rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="text-xs">{project.domain}</Badge>
        <span className="text-xs text-muted-foreground">{teamCount}/{project.team_size_max} <Users className="inline h-3 w-3 ml-0.5" /></span>
      </div>
      <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">{project.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.required_skills.slice(0, 4).map((s) => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{s}</span>
        ))}
        {project.required_skills.length > 4 && (
          <span className="text-xs px-2 py-0.5 text-muted-foreground">+{project.required_skills.length - 4}</span>
        )}
      </div>
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-7 w-7">
            <AvatarImage src={owner?.avatar ?? undefined} alt={owner?.name ?? ""} />
            <AvatarFallback>{owner?.name?.charAt(0) ?? "?"}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">{owner?.name ?? "…"}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          View <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}
