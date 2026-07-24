import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { ProjectCard } from "@/components/project/project-card";
import { SearchFilters } from "@/components/project/search-filters";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; status?: string; skill?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const where: any = {
    status: { notIn: ["CANCELLED", "COMPLETED"] },
    isPrivate: false,
  };

  if (sp.domain) where.domain = sp.domain;
  if (sp.status) where.status = sp.status;
  if (sp.search) {
    where.OR = [
      { title: { contains: sp.search, mode: "insensitive" } },
      { description: { contains: sp.search, mode: "insensitive" } },
    ];
  }

  const { userId } = await auth();
  let userProfile = null;
  if (userId) {
    userProfile = await safeDbQuery(
      () => prisma.user.findUnique({ where: { clerkId: userId }, include: { skills: true, domains: true } }),
      null
    );
  }

  const [projects, domains] = await Promise.all([
    safeDbQuery(
      () =>
        prisma.project.findMany({
          where,
          include: {
            owner: { select: { name: true, lastLoginAt: true } },
            team: { select: { id: true } },
            messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      []
    ),
    safeDbQuery(() => prisma.domain.findMany({ orderBy: { name: "asc" } }), []),
  ]);

  if (userProfile && !sp.search && !sp.domain && !sp.status) {
    const userDomainNames = userProfile.domains.map((d: any) => d.name);
    const userSkillNames = userProfile.skills.map((s: any) => s.name);
    
    projects.sort((a: any, b: any) => {
      let scoreA = 0;
      let scoreB = 0;
      
      if (userDomainNames.includes(a.domain)) scoreA += 10;
      const matchedSkillsA = a.requiredSkills.filter((rs: string) => userSkillNames.includes(rs));
      scoreA += matchedSkillsA.length;
      
      if (userDomainNames.includes(b.domain)) scoreB += 10;
      const matchedSkillsB = b.requiredSkills.filter((rs: string) => userSkillNames.includes(rs));
      scoreB += matchedSkillsB.length;
      
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discover Projects</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} projects found
            {userProfile && !sp.search && !sp.domain && !sp.status && " • Smart Feed Active ✨"}
          </p>
        </div>
        <Link href="/projects/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      <SearchFilters domains={domains.map((d) => d.name)} />

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 opacity-20">📋</div>
          <p className="text-muted-foreground mb-2">No projects found. Be the first to post one!</p>
          <Link href="/projects/new"><Button variant="outline" size="sm">Create Project</Button></Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
