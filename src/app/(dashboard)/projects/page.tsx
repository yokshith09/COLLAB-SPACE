import { connectDB } from "@/lib/mongoose";
import { Project, TeamMember, Message } from "@/lib/models";
import { ProjectCard } from "@/components/project/project-card";
import { SearchFilters } from "@/components/project/search-filters";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const DOMAINS = ["Web Dev","AI/ML","Mobile","Blockchain","DevOps","Data Science","Design","Open Source","IoT","SaaS"];

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; status?: string; search?: string }>;
}) {
  const sp = await searchParams;
  await connectDB();

  const filter: any = {
    status: { $nin: ["CANCELLED", "COMPLETED"] },
    isPrivate: false,
  };
  if (sp.domain) filter.domain = sp.domain;
  if (sp.status) filter.status = sp.status;
  if (sp.search) {
    filter.$or = [
      { title: { $regex: sp.search, $options: "i" } },
      { description: { $regex: sp.search, $options: "i" } },
      { requiredSkills: sp.search },
    ];
  }

  const rawProjects = await Project.find(filter)
    .populate("ownerId", "name lastLoginAt")
    .sort({ createdAt: -1 })
    .limit(24)
    .lean();

  const projects = await Promise.all(
    (rawProjects as any[]).map(async (p) => {
      const teamCount = await TeamMember.countDocuments({ projectId: p._id });
      const lastMsg = await Message.findOne({ projectId: p._id }).sort({ createdAt: -1 }).select("createdAt").lean();
      return {
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        domain: p.domain,
        status: p.status,
        teamSizeMax: p.teamSizeMax,
        requiredSkills: p.requiredSkills,
        deadline: p.deadline,
        owner: { name: (p.ownerId as any)?.name ?? "Unknown", lastLoginAt: (p.ownerId as any)?.lastLoginAt ?? new Date() },
        team: Array.from({ length: teamCount }, (_, i) => ({ id: i.toString() })),
        messages: lastMsg ? [{ createdAt: (lastMsg as any).createdAt }] : [],
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discover Projects</h1>
          <p className="text-sm text-muted-foreground">{projects.length} projects found</p>
        </div>
        <Link href="/projects/new">
          <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New Project</Button>
        </Link>
      </div>
      <SearchFilters domains={DOMAINS} />
      {projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 opacity-20">📋</div>
          <p className="text-muted-foreground mb-2">No projects found. Be the first to post one!</p>
          <Link href="/projects/new"><Button variant="outline" size="sm">Create Project</Button></Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
