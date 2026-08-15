import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User, Project, TeamMember, Application, Message } from "@/lib/models";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/project/project-detail";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const session = await auth();
  await connectDB();

  let dbUser: any = null;
  if (session?.user?.email) {
    dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      dbUser = await User.create({
        name: session.user.name || "Anonymous",
        email: session.user.email,
        avatar: session.user.image || undefined,
      });
    }
  }

  const rawProject = await Project.findById(projectId).populate("ownerId").lean();
  if (!rawProject) notFound();
  const p = rawProject as any;
  if (p.isPrivate && !dbUser) notFound();

  const teamMembers = await TeamMember.find({ projectId }).populate("userId", "id name avatar skills").lean();
  const lastMsg = await Message.findOne({ projectId }).sort({ createdAt: -1 }).select("createdAt").lean();

  const project = {
    id: p._id.toString(),
    title: p.title,
    description: p.description,
    problemStatement: p.problemStatement,
    requiredSkills: p.requiredSkills,
    teamSizeMax: p.teamSizeMax,
    status: p.status,
    deadline: p.deadline,
    isPrivate: p.isPrivate,
    inviteCode: p.inviteCode,
    domain: p.domain,
    createdAt: p.createdAt,
    owner: { id: p.ownerId._id.toString(), name: p.ownerId.name, lastLoginAt: p.ownerId.lastLoginAt },
    team: (teamMembers as any[]).map((t) => ({
      id: t._id.toString(),
      userId: t.userId._id.toString(),
      role: t.role,
      user: { id: t.userId._id.toString(), name: t.userId.name, avatar: t.userId.avatar, skills: t.userId.skills ?? [] },
    })),
    messages: lastMsg ? [{ createdAt: (lastMsg as any).createdAt }] : [],
  };

  const isOwner = dbUser?._id.toString() === p.ownerId._id.toString();
  const isMember = project.team.some((t) => t.userId === dbUser?._id.toString());

  let userApplication: any = null;
  if (dbUser) {
    const app = await Application.findOne({ userId: dbUser._id, projectId }).lean();
    if (app) {
      const a = app as any;
      userApplication = { id: a._id.toString(), status: a.status, expiresAt: a.expiresAt, messages: a.messages || [] };
    }
  }

  let allApplications: any[] = [];
  if (isOwner) {
    const apps = await Application.find({ projectId }).populate("userId", "name avatar bio skills githubUrl linkedinUrl").populate("messages.senderId", "name avatar").sort({ createdAt: -1 }).lean();
    allApplications = (apps as any[]).map((a) => ({
      id: a._id.toString(),
      status: a.status,
      message: a.message,
      roleRequested: a.roleRequested,
      availability: a.availability,
      resumeUrl: a.resumeUrl,
      messages: (a.messages || []).map((m: any) => ({
        content: m.content,
        createdAt: m.createdAt,
        senderId: m.senderId._id ? m.senderId._id.toString() : m.senderId.toString(),
        senderName: m.senderId.name,
      })),
      createdAt: a.createdAt,
      user: { id: a.userId._id.toString(), name: a.userId.name, avatar: a.userId.avatar, bio: a.userId.bio, skills: a.userId.skills ?? [], githubUrl: a.userId.githubUrl, linkedinUrl: a.userId.linkedinUrl },
    }));
  }

  const currentUser = dbUser ? { id: dbUser._id.toString(), name: dbUser.name, email: dbUser.email, avatar: dbUser.avatar } : null;

  let recommendedUsers: any[] = [];
  let potentialCoFounders: any[] = [];
  if (isOwner && project.status === "OPEN") {
    const { getRecommendedUsers, getPotentialCoFounders } = await import("@/lib/matching");
    recommendedUsers = await getRecommendedUsers(projectId);
    potentialCoFounders = await getPotentialCoFounders(projectId);
  }

  return (
    <ProjectDetail
      project={project}
      isOwner={isOwner}
      isMember={isMember}
      userApplication={userApplication}
      allApplications={allApplications}
      currentUser={currentUser}
      recommendedUsers={recommendedUsers.map((u: any) => ({
        id: u._id.toString(),
        name: u.name,
        avatar: u.avatar,
        bio: u.bio,
        skills: u.skills || [],
        matchScore: u.matchScore
      }))}
      potentialCoFounders={potentialCoFounders.map((p: any) => ({
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        matchScore: p.matchScore,
        owner: {
          id: p.ownerId._id.toString(),
          name: p.ownerId.name,
          avatar: p.ownerId.avatar,
        }
      }))}
    />
  );
}
