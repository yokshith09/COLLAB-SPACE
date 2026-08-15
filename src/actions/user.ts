"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User, TeamMember, Notification } from "@/lib/models";
import { revalidatePath } from "next/cache";

export async function endorseSkill(targetUserId: string, skill: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  
  if (!currentUserId) {
    return { error: "Unauthorized" };
  }
  
  if (currentUserId === targetUserId) {
    return { error: "You cannot endorse yourself" };
  }

  await connectDB();
  
  // Verify they share a project
  const [currentUserTeams, targetUserTeams] = await Promise.all([
    TeamMember.find({ userId: currentUserId }).lean(),
    TeamMember.find({ userId: targetUserId }).lean()
  ]);

  const currentUserProjectIds = new Set(currentUserTeams.map(t => t.projectId.toString()));
  const sharesProject = targetUserTeams.some(t => currentUserProjectIds.has(t.projectId.toString()));

  if (!sharesProject) {
    return { error: "You can only endorse team members you have collaborated with on a project." };
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return { error: "User not found" };
  }

  if (!targetUser.endorsements) {
    targetUser.endorsements = [];
  }

  const skillEndorsement = targetUser.endorsements.find((e: any) => e.skill === skill);

  if (skillEndorsement) {
    if (skillEndorsement.endorsers.includes(currentUserId)) {
      return { error: "You have already endorsed this skill" };
    }
    skillEndorsement.endorsers.push(currentUserId);
  } else {
    targetUser.endorsements.push({ skill, endorsers: [currentUserId] });
  }

  await targetUser.save();

  // Create notification
  const currentUser = await User.findById(currentUserId).select("name");
  await Notification.create({
    userId: targetUserId,
    type: "skill_endorsement",
    message: `${currentUser?.name} endorsed you for ${skill}!`,
    link: `/profile/${targetUserId}`,
  });

  // Gamification hook: 5 points for receiving an endorsement
  const { awardPoints } = await import("@/lib/gamification");
  await awardPoints(targetUserId, 5);

  revalidatePath(`/profile/${targetUserId}`);
  return { success: true };
}
