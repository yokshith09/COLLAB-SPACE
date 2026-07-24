import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(date));
}

export function timeAgo(date: Date | string) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function daysLeft(date: Date | string) {
  const now = new Date();
  const target = new Date(date);
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day left";
  return `${diffDays} days left`;
}

export function getHealthStatus(adminLastLogin: Date | string, lastMessageDate?: Date | string) {
  const adminLogin = new Date(adminLastLogin);
  const now = new Date();
  const daysSinceLogin = Math.floor((now.getTime() - adminLogin.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLogin >= 14) return { label: "Ghost", color: "bg-red-500", textColor: "text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300" };
  if (daysSinceLogin >= 7) return { label: "Slow", color: "bg-amber-500", textColor: "text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300" };

  if (lastMessageDate) {
    const lastMsg = new Date(lastMessageDate);
    const daysSinceMsg = Math.floor((now.getTime() - lastMsg.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceMsg >= 3) return { label: "Slow", color: "bg-amber-500", textColor: "text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300" };
  }

  return { label: "Active", color: "bg-emerald-500", textColor: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300" };
}
