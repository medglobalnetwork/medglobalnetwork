// ============================================================
// MGN Networking System — Helper Utilities
// modules/network/lib/network-data.ts
// ============================================================

export const PROFESSION_COLORS: Record<string, string> = {
  Doctor: "#dbeafe",
  Nurse: "#dcfce7",
  Physiotherapist: "#fef9c3",
  Pharmacist: "#ede9fe",
  "Lab Technician": "#fee2e2",
  Radiographer: "#ffedd5",
  "Occupational Therapist": "#cffafe",
  "Speech Therapist": "#fce7f3",
  Dietitian: "#d1fae5",
  Paramedic: "#fef3c7",
  Researcher: "#f0fdf4",
  Student: "#f1f5f9",
  Educator: "#ede9fe",
  Other: "#f5f5f5",
};

export function getProfessionColor(profession?: string): string {
  return PROFESSION_COLORS[profession ?? "Other"] ?? "#f5f5f5";
}

import {
  formatContentTimestamp,
  formatExactDateTime,
  formatExactTime,
  formatExactDate,
  formatFullDateTime,
} from "@/lib/date";

export {
  formatContentTimestamp,
  formatExactDateTime,
  formatExactTime,
  formatExactDate,
  formatFullDateTime,
};

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeTime(dateStr?: string | Date): string {
  if (!dateStr) return "recently";
  const diffSec = Math.round((new Date(dateStr).getTime() - Date.now()) / 1000);
  if (isNaN(diffSec)) return "recently";
  if (Math.abs(diffSec) < 60) return "just now";

  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units: Intl.RelativeTimeFormatUnit[] = ["second", "minute", "hour", "day", "week", "month", "year"];
  const unitIndex = cutoffs.findIndex((cutoff) => cutoff > Math.abs(diffSec));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  return rtf.format(Math.round(diffSec / divisor), units[unitIndex]);
}
