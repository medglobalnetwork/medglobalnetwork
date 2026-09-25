// ============================================================
// MGN Ecosystem Date & Time Formatting Utilities
// lib/date.ts
// ============================================================

/**
 * Parses any date-like input safely. Returns null on invalid date.
 */
export function safeDate(val: string | number | Date | null | undefined): Date | null {
  if (!val) return null;
  const d = typeof val === "object" && val instanceof Date ? val : new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns exact formatted time: e.g. "10:45 AM"
 */
export function formatExactTime(
  val: string | number | Date | null | undefined,
  includeSeconds = false
): string {
  const d = safeDate(val);
  if (!d) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: true,
  });
}

/**
 * Returns exact formatted date: e.g. "26 Sep 2026"
 */
export function formatExactDate(val: string | number | Date | null | undefined): string {
  const d = safeDate(val);
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Returns exact date & time together: e.g. "10:45 AM · 26 Sep 2026"
 */
export function formatExactDateTime(val: string | number | Date | null | undefined): string {
  const d = safeDate(val);
  if (!d) return "";
  const time = formatExactTime(d);
  const date = formatExactDate(d);
  return `${time} · ${date}`;
}

/**
 * Returns full verbose date and time: e.g. "Saturday, 26 September 2026 at 10:45 AM"
 */
export function formatFullDateTime(val: string | number | Date | null | undefined): string {
  const d = safeDate(val);
  if (!d) return "";
  const datePart = d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timePart = formatExactTime(d);
  return `${datePart} at ${timePart}`;
}

/**
 * Formats content timestamps for feeds, posts, uploads, and comments with exact time:
 * - "Today at 10:45 AM"
 * - "Yesterday at 4:30 PM"
 * - "24 Sep at 11:20 AM" (current year)
 * - "15 Dec 2025 at 3:10 PM" (prior year)
 */
export function formatContentTimestamp(val: string | number | Date | null | undefined): string {
  const d = safeDate(val);
  if (!d) return "recently";

  const now = new Date();
  const time = formatExactTime(d);

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today at ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday at ${time}`;
  }

  const isSameYear = d.getFullYear() === now.getFullYear();
  const datePart = d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: isSameYear ? undefined : "numeric",
  });

  return `${datePart} at ${time}`;
}

/**
 * Formats message timestamp with exact time and day separators.
 */
export function formatMessageTime(val: string | number | Date | null | undefined): string {
  const d = safeDate(val);
  if (!d) return "";
  return formatExactTime(d);
}

/**
 * Formats day header for message grouping: "Today", "Yesterday", "Friday, 25 September 2026"
 */
export function formatMessageDayHeader(val: string | number | Date | null | undefined): string {
  const d = safeDate(val);
  if (!d) return "";

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Yesterday";

  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}
