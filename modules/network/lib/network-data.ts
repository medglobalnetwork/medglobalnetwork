// ============================================================
// MGN Networking System — Helper Utilities
// modules/network/lib/network-data.ts
//
// Clean production file: all mock/sample data removed.
// Real data is fetched directly from database via API routes.
// ============================================================

import type { ProfessionalProfile, Community, NetworkPost } from "../types";

export const SAMPLE_PROFESSIONALS: ProfessionalProfile[] = [];
export const SAMPLE_COMMUNITIES: Community[] = [];
export const SAMPLE_POSTS: NetworkPost[] = [];

// ─────────────────────────────────────────────
// SPECIALTY AVATAR COLORS
// Consistent color per profession for avatars
// ─────────────────────────────────────────────

export const PROFESSION_COLORS: Record<string, string> = {
  Doctor:                  "#dbeafe",
  Nurse:                   "#dcfce7",
  Physiotherapist:         "#fef9c3",
  Pharmacist:              "#ede9fe",
  "Lab Technician":        "#fee2e2",
  Radiographer:            "#ffedd5",
  "Occupational Therapist":"#cffafe",
  "Speech Therapist":      "#fce7f3",
  Dietitian:               "#d1fae5",
  Paramedic:               "#fef3c7",
  Researcher:              "#f0fdf4",
  Student:                 "#f1f5f9",
  Educator:                "#ede9fe",
  Other:                   "#f5f5f5",
};

export function getProfessionColor(profession?: string): string {
  return PROFESSION_COLORS[profession ?? "Other"] ?? "#f5f5f5";
}

// ─────────────────────────────────────────────
// HELPER: Format relative time
// ─────────────────────────────────────────────

export function formatRelativeTime(dateStr?: string | Date): string {
  if (!dateStr) return "recently";
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  if (isNaN(diff) || diff < 0) return "just now";

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (weeks < 5) return `${weeks}w`;
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}
