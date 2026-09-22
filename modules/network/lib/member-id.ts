// ============================================================
// MGN Member ID & Founding Member Identifier Utility
// modules/network/lib/member-id.ts
// ============================================================

import crypto from "crypto";

export const FOUNDER_EMAILS = [
  "patreshubham141@gmail.com",
];

/**
 * Checks if an email belongs to a designated platform founding member.
 */
export function isDesignatedFounderEmail(email?: string | null): boolean {
  if (!email) return false;
  return FOUNDER_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Checks if a member ID string matches the Founding Member format.
 */
export function isFoundingMemberId(memberId?: string | null): boolean {
  if (!memberId) return false;
  const upper = memberId.toUpperCase().trim();
  return upper.startsWith("MGN-FOUNDER") || upper.startsWith("MGN-FOUNDING") || upper.startsWith("MGN-FND");
}

/**
 * Generates a unique regular Healthcare Member ID in format: MGN-XXXXXX (6 alphanumeric chars)
 */
export function generateRegularMemberId(): string {
  // Use character set without easily confused characters (O, 0, I, 1) for readability
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let randomPart = "";
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    randomPart += chars[randomBytes[i] % chars.length];
  }
  return `MGN-${randomPart}`;
}

/**
 * Generates a Founding Member ID with designated sequence number.
 * e.g., index 1 -> MGN-FOUNDER-001
 */
export function generateFoundingMemberId(index: number = 1): string {
  const padded = String(Math.max(1, index)).padStart(3, "0");
  return `MGN-FOUNDER-${padded}`;
}

/**
 * Formats or normalizes any member ID to standard uppercase.
 */
export function formatMemberId(rawId: string): string {
  return rawId.trim().toUpperCase();
}
