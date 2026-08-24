"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Project, PRD, Task, User, TeamMember, type IProject, type IPRD } from "@/lib/models";
import { generatePRDFromProject } from "@/lib/ai/prd-generator";
import { checkAndConsumeQuota } from "@/lib/ai/rate-limiter";
import { revalidatePath } from "next/cache";

export async function getProjectPRD(projectId: string) {
  try {
    await connectDB();
    const prd = await PRD.findOne({ projectId }).lean();
    if (!prd) return null;
    return JSON.parse(JSON.stringify(prd));
  } catch (error) {
    console.error("Error fetching PRD:", error);
    return null;
  }
}

export async function generateProjectPRD(projectId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  await connectDB();
  const user = await User.findOne({ email: session.user?.email });
  if (!user) return { error: "User not found" };

  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found" };

  // Allow project owner or team members to generate / regenerate PRD
  const isOwner = project.ownerId.toString() === user._id.toString();
  const isMember = await TeamMember.findOne({ projectId: project._id, userId: user._id });

  if (!isOwner && !isMember) {
    return { error: "Only project team members or the owner can generate a PRD" };
  }

  // Rate Limiting & Quota check
  const quota = await checkAndConsumeQuota(user._id.toString(), "PRD_GENERATION");
  if (!quota.allowed) {
    return { error: quota.error, quotaExceeded: true };
  }

  try {
    const generated = await generatePRDFromProject({
      title: project.title,
      description: project.description,
      problemStatement: project.problemStatement,
      domain: project.domain,
      requiredSkills: project.requiredSkills || [],
      teamSizeMax: project.teamSizeMax,
    });

    const existingPRD = await PRD.findOne({ projectId: project._id });

    if (existingPRD) {
      existingPRD.title = generated.title;
      existingPRD.version += 1;
      existingPRD.overview = generated.overview;
      existingPRD.features = generated.features;
      existingPRD.techStack = generated.techStack;
      existingPRD.apiEndpoints = generated.apiEndpoints;
      existingPRD.diagrams = generated.diagrams;
      existingPRD.rawMarkdown = generated.rawMarkdown;
      await existingPRD.save();

      revalidatePath(`/projects/${projectId}`);
      revalidatePath(`/team/${projectId}`);
      return { success: true, prd: JSON.parse(JSON.stringify(existingPRD)) };
    } else {
      const newPRD = await PRD.create({
        projectId: project._id,
        title: generated.title,
        version: 1,
        overview: generated.overview,
        features: generated.features,
        techStack: generated.techStack,
        apiEndpoints: generated.apiEndpoints,
        diagrams: generated.diagrams,
        rawMarkdown: generated.rawMarkdown,
      });

      revalidatePath(`/projects/${projectId}`);
      revalidatePath(`/team/${projectId}`);
      return { success: true, prd: JSON.parse(JSON.stringify(newPRD)) };
    }
  } catch (error: any) {
    console.error("Error generating PRD:", error);
    return { error: error?.message || "Failed to generate PRD" };
  }
}

export async function updatePRDMarkdown(projectId: string, rawMarkdown: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  await connectDB();
  const prd = await PRD.findOne({ projectId });
  if (!prd) return { error: "PRD not found" };

  prd.rawMarkdown = rawMarkdown;
  prd.version += 1;
  await prd.save();

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/team/${projectId}`);
  return { success: true };
}

export async function convertPRDToTasks(projectId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  await connectDB();
  const prd = await PRD.findOne({ projectId });
  if (!prd || !prd.features?.length) {
    return { error: "No features found in PRD to convert into tasks." };
  }

  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found" };

  const createdTasks = [];
  const allSkills = new Set(project.requiredSkills || []);

  for (const feature of prd.features) {
    // Check if task with same title already exists
    const existing = await Task.findOne({ projectId: project._id, title: feature.title });
    if (!existing) {
      const criteriaText = feature.acceptanceCriteria?.length
        ? `\n\n**Acceptance Criteria:**\n` + feature.acceptanceCriteria.map((c) => `- ${c}`).join("\n")
        : "";

      const skillsText = feature.suggestedSkills?.length
        ? `\n\n**Required Skills:** ${feature.suggestedSkills.join(", ")}`
        : "";

      const task = await Task.create({
        title: feature.title,
        description: `${feature.description}${criteriaText}${skillsText}`,
        status: "TODO",
        projectId: project._id,
      });

      createdTasks.push(task);
    }

    if (feature.suggestedSkills?.length) {
      feature.suggestedSkills.forEach((s) => allSkills.add(s));
    }
  }

  // Update project skills based on PRD requirements
  project.requiredSkills = Array.from(allSkills);
  await project.save();

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/team/${projectId}`);
  return {
    success: true,
    tasksCreated: createdTasks.length,
    totalSkills: project.requiredSkills.length,
  };
}
