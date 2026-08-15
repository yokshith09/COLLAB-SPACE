import { connectDB } from "./mongoose";
import { User, Project } from "./models";

// Scoring Weights
const SKILL_MATCH_WEIGHT = 10;
const DOMAIN_MATCH_WEIGHT = 5;

export async function getRecommendedProjects(userId: string) {
  await connectDB();
  
  const user = await User.findById(userId).lean();
  if (!user) return [];

  const userSkills = new Set((user.skills || []).map((s: string) => s.toLowerCase()));
  const userDomains = new Set((user.domains || []).map((d: string) => d.toLowerCase()));

  // Find all OPEN projects that the user doesn't own
  const openProjects = await Project.find({
    status: "OPEN",
    ownerId: { $ne: user._id },
  }).lean();

  const scoredProjects = openProjects.map((project: any) => {
    let score = 0;
    
    // Calculate skill overlap
    const projectSkills = project.requiredSkills || [];
    let matchedSkills = 0;
    for (const skill of projectSkills) {
      if (userSkills.has(skill.toLowerCase())) {
        score += SKILL_MATCH_WEIGHT;
        matchedSkills++;
      }
    }

    // Calculate domain overlap
    if (userDomains.has(project.domain?.toLowerCase())) {
      score += DOMAIN_MATCH_WEIGHT;
    }

    // Boost score slightly if project requires few skills and user has them all
    if (projectSkills.length > 0 && matchedSkills === projectSkills.length) {
      score += 5;
    }

    return { ...project, matchScore: score, matchedSkills };
  });

  // Filter out zero scores and sort by score descending
  return scoredProjects
    .filter(p => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6); // Top 6 recommendations
}

export async function getRecommendedUsers(projectId: string) {
  await connectDB();
  
  const project = await Project.findById(projectId).lean();
  if (!project) return [];

  const projectSkills = new Set((project.requiredSkills || []).map((s: string) => s.toLowerCase()));
  const projectDomain = project.domain?.toLowerCase();

  // We shouldn't recommend the owner or people already in the team (we'd have to filter team members out later)
  const users = await User.find({ _id: { $ne: project.ownerId } }).lean();

  const scoredUsers = users.map((u: any) => {
    let score = 0;
    
    let matchedSkills = 0;
    for (const skill of (u.skills || [])) {
      if (projectSkills.has(skill.toLowerCase())) {
        score += SKILL_MATCH_WEIGHT;
        matchedSkills++;
      }
    }

    if ((u.domains || []).map((d: string) => d.toLowerCase()).includes(projectDomain)) {
      score += DOMAIN_MATCH_WEIGHT;
    }

    return { ...u, matchScore: score, matchedSkills };
  });

  return scoredUsers
    .filter(u => u.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // Top 5 recommended users
}

export async function getPotentialCoFounders(projectId: string) {
  await connectDB();
  
  const project = await Project.findById(projectId).lean();
  if (!project) return [];

  const projectSkills = new Set((project.requiredSkills || []).map((s: string) => s.toLowerCase()));
  const projectDomain = project.domain?.toLowerCase();

  // Find other OPEN projects not owned by this user
  const otherProjects = await Project.find({
    _id: { $ne: project._id },
    ownerId: { $ne: project.ownerId },
    status: "OPEN"
  }).populate("ownerId", "name avatar bio githubUrl").lean();

  const scoredMatches = otherProjects.map((other: any) => {
    let score = 0;
    let matchedSkills = 0;

    const otherSkills = other.requiredSkills || [];
    for (const skill of otherSkills) {
      if (projectSkills.has(skill.toLowerCase())) {
        score += SKILL_MATCH_WEIGHT;
        matchedSkills++;
      }
    }

    if (other.domain?.toLowerCase() === projectDomain) {
      score += DOMAIN_MATCH_WEIGHT * 2; // Domain is heavily weighted for similar projects
    }

    return { ...other, matchScore: score, matchedSkills };
  });

  return scoredMatches
    .filter(p => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3); // Top 3 similar projects / co-founders
}
