import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/mongoose";
import { User, Project, TeamMember } from "@/lib/models";
import { ProjectSettingsForm } from "@/components/project/project-settings-form";

const SKILLS = ["React","TypeScript","Python","Node.js","UI/UX Design","MongoDB","Docker","Machine Learning","Mobile Dev","Solidity","Rust","Go","AWS","GraphQL","Next.js"];
const DOMAINS = ["Web Dev","AI/ML","Mobile","Blockchain","DevOps","Data Science","Design","Open Source","IoT","SaaS"];

export default async function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  await connectDB();
  let user = await User.findOne({ email: session.user.email });
  if (!user) { user = await User.create({ name: session.user.name || "Anonymous", email: session.user.email, avatar: session.user.image || undefined }); }

  const rawProject = await Project.findById(projectId).lean();
  if (!rawProject) notFound();
  const p = rawProject as any;
  if (p.ownerId.toString() !== user._id.toString()) notFound();

  const teamMembers = await TeamMember.find({ projectId }).populate("userId", "name avatar").lean();

  const project = {
    id: p._id.toString(),
    title: p.title,
    description: p.description,
    problemStatement: p.problemStatement,
    domain: p.domain,
    requiredSkills: p.requiredSkills,
    teamSizeMax: p.teamSizeMax,
    deadline: p.deadline ?? null,
    isPrivate: p.isPrivate,
    inviteCode: p.inviteCode ?? null,
    team: (teamMembers as any[]).map((t) => ({
      id: t._id.toString(),
      userId: t.userId._id.toString(),
      role: t.role,
      user: { id: t.userId._id.toString(), name: t.userId.name, avatar: t.userId.avatar },
    })),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Project Settings</h1>
          <p className="text-sm text-muted-foreground">{project.title}</p>
        </div>
      </div>
      <ProjectSettingsForm
        project={project}
        allSkills={SKILLS}
        allDomains={DOMAINS}
        userId={user._id.toString()}
      />
    </div>
  );
}
