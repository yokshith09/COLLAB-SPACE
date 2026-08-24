export type PlanType = "FREE" | "PRO";

export interface PlanFeature {
  name: string;
  free: string | boolean;
  pro: string | boolean;
  highlight?: boolean;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  badge: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  limits: {
    maxActiveProjects: number;
    maxTeamSize: number;
    monthlyIdeaValidations: number;
    monthlyPrdGenerations: number;
    monthlyMilestoneGenerations: number;
  };
  features: {
    deepLLMReasoning: boolean;
    specToKanban: boolean;
    mermaidMindmaps: boolean;
    exportMarkdown: boolean;
    automatedMilestoneReminders: boolean;
    priorityTalentMatching: boolean;
    githubWebhookSync: boolean;
    customDomainBadges: boolean;
  };
}

export const PLANS: Record<PlanType, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Community Starter",
    badge: "Free Forever",
    description: "Essential collaboration & agile tools for student builders and weekend hackers.",
    priceMonthly: 0,
    priceAnnual: 0,
    limits: {
      maxActiveProjects: 2,
      maxTeamSize: 4,
      monthlyIdeaValidations: 5,
      monthlyPrdGenerations: 2,
      monthlyMilestoneGenerations: 2,
    },
    features: {
      deepLLMReasoning: false,
      specToKanban: true,
      mermaidMindmaps: true,
      exportMarkdown: false,
      automatedMilestoneReminders: false,
      priorityTalentMatching: false,
      githubWebhookSync: true,
      customDomainBadges: false,
    },
  },
  PRO: {
    id: "PRO",
    name: "Pro Builder Studio",
    badge: "Most Popular",
    description: "Full AI capabilities, increased rate limits, automated sprint tracking, and priority talent scouting.",
    priceMonthly: 19,
    priceAnnual: 15, // $15/mo billed annually ($180/yr)
    limits: {
      maxActiveProjects: 25,
      maxTeamSize: 12,
      monthlyIdeaValidations: 100,
      monthlyPrdGenerations: 50,
      monthlyMilestoneGenerations: 50,
    },
    features: {
      deepLLMReasoning: true,
      specToKanban: true,
      mermaidMindmaps: true,
      exportMarkdown: true,
      automatedMilestoneReminders: true,
      priorityTalentMatching: true,
      githubWebhookSync: true,
      customDomainBadges: true,
    },
  },
};

export const FEATURE_COMPARISON: PlanFeature[] = [
  { name: "Active Projects", free: "Up to 2", pro: "Up to 25", highlight: true },
  { name: "Team Members per Project", free: "Up to 4", pro: "Up to 12" },
  { name: "AI Idea Viability Validations", free: "5 / month", pro: "100 / month", highlight: true },
  { name: "Living PRD & Architecture Generations", free: "2 / month", pro: "50 / month", highlight: true },
  { name: "Sprint Roadmap & Milestone Generations", free: "2 / month", pro: "50 / month", highlight: true },
  { name: "Interactive Mermaid Mind Maps", free: true, pro: true },
  { name: "1-Click Spec-to-Kanban Decomposition", free: true, pro: true },
  { name: "Direct Candidate Collaboration Invites", free: true, pro: true },
  { name: "Export PRD to Markdown (.md)", free: false, pro: true, highlight: true },
  { name: "Automated 48h Team Milestone Reminders", free: false, pro: true, highlight: true },
  { name: "Deep Google Gemini LLM Reasoning", free: "Standard Heuristic", pro: "Gemini 1.5 Flash", highlight: true },
  { name: "Priority AI Talent Radar Matching", free: false, pro: true },
  { name: "GitHub Push Webhook Sync", free: true, pro: true },
];
