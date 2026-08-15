import { User } from "./models";

const BADGES = {
  FIRST_PROJECT: { name: "First Project", threshold: 50 },
  TOP_CONTRIBUTOR: { name: "Top Contributor", threshold: 250 },
  TEAM_PLAYER: { name: "Team Player", threshold: 100 },
  MASTER: { name: "Collab Master", threshold: 1000 },
};

export const ACTION_POINTS = {
  PROJECT_COMPLETED: 50,
  APPLICATION_ACCEPTED: 20,
  PROFILE_COMPLETED: 10,
};

export async function awardPoints(userId: string, points: number) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.points = (user.points || 0) + points;
    
    // Check for new badges
    const currentBadges = new Set(user.badges || []);
    
    for (const [key, badge] of Object.entries(BADGES)) {
      if (user.points >= badge.threshold && !currentBadges.has(badge.name)) {
        currentBadges.add(badge.name);
      }
    }
    
    user.badges = Array.from(currentBadges);
    await user.save();
    return user;
  } catch (error) {
    console.error("Error awarding points:", error);
  }
}
