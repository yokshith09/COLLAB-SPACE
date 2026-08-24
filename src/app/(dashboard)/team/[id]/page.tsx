import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User, Project, TeamMember, Message, Note, Task } from "@/lib/models";
import { notFound, redirect } from "next/navigation";
import { TeamWorkspace } from "@/components/team/team-workspace";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
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

  const rawProject = await Project.findById(projectId).populate("ownerId", "id").lean();
  if (!rawProject) notFound();
  const p = rawProject as any;

  const teamMembers = await TeamMember.find({ projectId }).populate("userId", "name avatar").lean();
  const isMember = (teamMembers as any[]).some((t) => t.userId._id.toString() === user._id.toString());
  if (!isMember) redirect(`/projects/${projectId}`);

  const [messages, notes, tasks] = await Promise.all([
    Message.find({ projectId }).populate("senderId", "id name avatar").sort({ createdAt: "asc" }).lean(),
    Note.find({ projectId }).populate("createdBy", "id name").sort({ updatedAt: -1 }).lean(),
    Task.find({ projectId }).sort({ createdAt: -1 }).lean(),
  ]);

  const project = {
    id: p._id.toString(),
    title: p.title,
    owner: { id: p.ownerId._id.toString() },
    team: (teamMembers as any[]).map((t) => ({
      id: t._id.toString(),
      userId: t.userId._id.toString(),
      role: t.role,
      user: { id: t.userId._id.toString(), name: t.userId.name, avatar: t.userId.avatar },
    })),
    messages: (messages as any[]).map((m) => ({
      id: m._id.toString(),
      content: m.content,
      senderId: m.senderId._id.toString(),
      createdAt: m.createdAt,
      sender: { id: m.senderId._id.toString(), name: m.senderId.name, avatar: m.senderId.avatar },
    })),
    notes: (notes as any[]).map((n) => ({
      id: n._id.toString(),
      title: n.title,
      content: n.content,
      updatedAt: n.updatedAt,
      author: { id: n.createdBy._id.toString(), name: n.createdBy.name },
    })),
    tasks: (tasks as any[]).map((t) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      status: t.status,
      assignedTo: t.assignedTo?.toString(),
      dueDate: t.dueDate,
    })),
  };

  const currentUser = { id: user._id.toString(), name: user.name, avatar: user.avatar };

  const { getProjectPRD } = await import("@/actions/prd");
  const { getProjectMilestones } = await import("@/actions/milestone");
  const [initialPrd, initialMilestones] = await Promise.all([
    getProjectPRD(projectId),
    getProjectMilestones(projectId),
  ]);

  return <TeamWorkspace project={project} currentUser={currentUser} initialPrd={initialPrd} initialMilestones={initialMilestones} />;
}
