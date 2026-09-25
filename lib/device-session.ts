import { pool } from "./auth";

export type DeviceCategory = "mobile" | "tablet" | "desktop";

/**
 * Classify User-Agent into standard device category:
 * - mobile (smartphones: iPhone, Android mobile, etc.)
 * - tablet (iPads, Android tablets, Kindles, etc.)
 * - desktop (laptops, PCs, Macs, Linux desktops)
 */
export function getDeviceCategory(uaString?: string | null): DeviceCategory {
  if (!uaString) return "desktop";
  const ua = uaString.toLowerCase();

  // 1. Tablet detection
  if (
    ua.includes("ipad") ||
    ua.includes("tablet") ||
    ua.includes("kindle") ||
    ua.includes("silk") ||
    ua.includes("playbook") ||
    (ua.includes("android") && !ua.includes("mobile"))
  ) {
    return "tablet";
  }

  // 2. Mobile phone detection
  if (
    ua.includes("mobile") ||
    ua.includes("iphone") ||
    ua.includes("ipod") ||
    ua.includes("android") ||
    ua.includes("blackberry") ||
    ua.includes("opera mini") ||
    ua.includes("windows phone")
  ) {
    return "mobile";
  }

  // 3. Laptop / Desktop
  return "desktop";
}

/**
 * Enforce rule: Maximum 1 mobile, 1 laptop/desktop, 1 tablet per user at any time.
 * When a user logs in from a device category, any previous active session
 * from that same device category for this user is automatically invalidated.
 */
export async function enforceDeviceSessionLimit(
  userId: string,
  currentSessionIdOrToken?: string,
  currentUserAgent?: string | null
): Promise<{ invalidatedCount: number; deviceCategory: DeviceCategory }> {
  if (!userId) {
    return { invalidatedCount: 0, deviceCategory: "desktop" };
  }

  const currentCategory = getDeviceCategory(currentUserAgent);

  try {
    // Fetch all active sessions for this user
    const res = await pool.query(
      `SELECT id, token, "userAgent", "createdAt" 
       FROM session 
       WHERE "userId" = $1 AND "expiresAt" > now()
       ORDER BY "createdAt" DESC`,
      [userId]
    );

    const rows = res.rows || [];
    const idsToDelete: string[] = [];

    // Track sessions by category
    for (const row of rows) {
      // Skip the newly created / current session
      if (
        currentSessionIdOrToken &&
        (row.id === currentSessionIdOrToken || row.token === currentSessionIdOrToken)
      ) {
        continue;
      }

      const rowCategory = getDeviceCategory(row.userAgent);

      // If an existing session is in the same category as the new login, invalidate it
      if (rowCategory === currentCategory) {
        idsToDelete.push(row.id);
      }
    }

    if (idsToDelete.length > 0) {
      await pool.query(`DELETE FROM session WHERE id = ANY($1::text[])`, [idsToDelete]);
    }

    return { invalidatedCount: idsToDelete.length, deviceCategory: currentCategory };
  } catch (err) {
    console.error("Error enforcing device session limit:", err);
    return { invalidatedCount: 0, deviceCategory: currentCategory };
  }
}
