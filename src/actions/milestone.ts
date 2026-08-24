"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Project, PRD, Milestone, User, TeamMember, Notification, type IMilestone } from "@/lib/models";
import { generatePRDFromProject, type GeneratedMilestone } from "@/lib/ai/prd-generator";
import { checkAndConsumeQuota } from "@/lib/ai/rate-limiter";
import { revalidatePath } from "next/cache";

export async function getProjectMilestones(projectId: string) {
  try {
    await connectDB();
    const milestones = await Milestone.find({ projectId }).sort({ order: 1 }).lean();
    return JSON.parse(JSON.stringify(milestones));
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return [];
  }
}

export async function generateProjectMilestones(projectId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return { error: "User not found" };

  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found" };

  const isOwner = project.ownerId.toString() === user._id.toString();
  const isMember = await TeamMember.findOne({ projectId: project._id, userId: user._id });

  if (!isOwner && !isMember) {
    return { error: "Only project team members or the owner can generate milestones" };
  }

  // Rate Limiting & Quota check
  const quota = await checkAndConsumeQuota(user._id.toString(), "MILESTONE_GENERATION");
  if (!quota.allowed) {
    return { error: quota.error, quotaExceeded: true };
  }

  try {
    // Generate AI spec with milestones
    const generated = await generatePRDFromProject({
      title: project.title,
      description: project.description,
      problemStatement: project.problemStatement,
      domain: project.domain,
      requiredSkills: project.requiredSkills || [],
      teamSizeMax: project.teamSizeMax,
    });

    // Delete existing milestones and recreate structured sprint roadmap
    await Milestone.deleteMany({ projectId: project._id });

    const createdMilestones = [];
    const now = new Date();

    for (let i = 0; i < generated.milestones.length; i++) {
      const m = generated.milestones[i];
      const targetDate = new Date(now.getTime() + m.targetDays * 24 * 60 * 60 * 1000);
      const status = i === 0 ? "IN_PROGRESS" : "UPCOMING";

      const created = await Milestone.create({
        projectId: project._id,
        title: m.title,
        description: m.description,
        order: m.order || i + 1,
        targetDays: m.targetDays || (i + 1) * 7,
        targetDate,
        status,
        deliverables: (m.deliverables || []).map((d, dIdx) => ({
          id: `del-${i + 1}-${dIdx + 1}`,
          title: d,
          completed: false,
        })),
        progress: 0,
      });

      createdMilestones.push(created);
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/team/${projectId}`);
    revalidatePath(`/dashboard`);

    return { success: true, milestones: JSON.parse(JSON.stringify(createdMilestones)) };
  } catch (error: any) {
    console.error("Error generating milestones:", error);
    return { error: error?.message || "Failed to generate milestones" };
  }
}

export async function toggleDeliverable(milestoneId: string, deliverableId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  await connectDB();
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) return { error: "Milestone not found" };

  const deliverable = milestone.deliverables.find((d) => d.id === deliverableId);
  if (!deliverable) return { error: "Deliverable not found" };

  deliverable.completed = !deliverable.completed;

  // Recalculate progress percentage
  const total = milestone.deliverables.length;
  const completedCount = milestone.deliverables.filter((d) => d.completed).length;
  const newProgress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  milestone.progress = newProgress;

  if (newProgress === 100) {
    milestone.status = "COMPLETED";
  } else if (milestone.status === "COMPLETED" && newProgress < 100) {
    milestone.status = "IN_PROGRESS";
  }

  await milestone.save();

  revalidatePath(`/projects/${milestone.projectId}`);
  revalidatePath(`/team/${milestone.projectId}`);
  revalidatePath(`/dashboard`);

  return { success: true, milestone: JSON.parse(JSON.stringify(milestone)) };
}

export async function updateMilestoneStatus(
  milestoneId: string,
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED"
) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  await connectDB();
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) return { error: "Milestone not found" };

  milestone.status = status;
  if (status === "COMPLETED") {
    milestone.progress = 100;
    milestone.deliverables.forEach((d) => {
      d.completed = true;
    });
  } else if (status === "UPCOMING") {
    milestone.progress = 0;
    milestone.deliverables.forEach((d) => {
      d.completed = false;
    });
  }

  await milestone.save();

  revalidatePath(`/projects/${milestone.projectId}`);
  revalidatePath(`/team/${milestone.projectId}`);
  revalidatePath(`/dashboard`);

  return { success: true, milestone: JSON.parse(JSON.stringify(milestone)) };
}

export async function sendMilestoneReminder(milestoneId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return { error: "User not found" };

  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) return { error: "Milestone not found" };

  const project = await Project.findById(milestone.projectId);
  if (!project) return { error: "Project not found" };

  // Fetch all team members and project owner
  const teamMembers = await TeamMember.find({ projectId: project._id });
  const recipientIds = new Set<string>();

  recipientIds.add(project.ownerId.toString());
  teamMembers.forEach((t) => recipientIds.add(t.userId.toString()));

  const reminderMessage = `🎯 Milestone Check-in: "${milestone.title}" for "${project.title}" is currently ${milestone.status} (${milestone.progress}% complete). Review deliverables!`;

  const notificationsToCreate = Array.from(recipientIds).map((uid) => ({
    userId: uid,
    type: "milestone_reminder",
    message: reminderMessage,
    link: `/projects/${project._id}`,
  }));

  if (notificationsToCreate.length > 0) {
    await Notification.insertMany(notificationsToCreate);
  }

  milestone.lastRemindedAt = new Date();
  await milestone.save();

  return { success: true, recipientsCount: recipientIds.size };
}

export async function getUserActiveMilestones(userId: string) {
  try {
    await connectDB();
    const memberships = await TeamMember.find({ userId }).select("projectId").lean();
    const projectIds = memberships.map((m) => m.projectId);

    // Also get projects owned by user
    const ownedProjects = await Project.find({ ownerId: userId }).select("_id").lean();
    ownedProjects.forEach((p) => projectIds.push(p._id));

    const activeMilestones = await Milestone.find({
      projectId: { $in: projectIds },
      status: "IN_PROGRESS",
    })
      .populate("projectId", "title")
      .sort({ targetDate: 1 })
      .limit(5)
      .lean();

    return JSON.parse(JSON.stringify(activeMilestones));
  } catch (error) {
    console.error("Error fetching active user milestones:", error);
    return [];
  }
}
