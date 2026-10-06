import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // In Capacitor Android/iOS WebView or native file origin, use production server
    if (
      origin &&
      (origin.startsWith("capacitor:") ||
        origin.startsWith("file:") ||
        origin.includes("life.mgn.app"))
    ) {
      return "https://www.mgn.life";
    }
    if (origin && origin !== "null") {
      return origin;
    }
  }
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.mgn.life";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include",
  },
});

/**
 * Checks whether a given user object or email belongs to a Super Admin / Admin
 */
export function isSuperAdminUser(user?: { email?: string | null; phone?: string | null; name?: string | null; role?: string | null } | null): boolean {
  if (!user) return false;
  const email = (user.email || "").toLowerCase().trim();
  const phone = (user.phone || "").replace(/\D/g, "");
  const role = (user.role || "").toUpperCase().trim();

  if (role === "ADMIN" || role === "SUPER_ADMIN" || role === "SUPERADMIN") return true;

  const adminEmails = [
    "patreshubham141@gmail.com",
    "patresweeti@gmail.com",
  ];

  if (adminEmails.includes(email)) return true;

  const adminPhones = ["6263585180", "7987522275"];
  if (adminPhones.includes(phone) || adminPhones.some((p) => phone.endsWith(p))) return true;

  if (email.startsWith("phone_")) {
    const emailDigits = email.replace(/\D/g, "");
    if (adminPhones.some((p) => emailDigits.includes(p) || p.endsWith(emailDigits.slice(-10)))) return true;
  }

  return false;
}

/**
 * Guaranteed, fail-safe logout across all layers:
 * 1. Server-side session deletion & cookie purging (/api/auth/logout)
 * 2. Better Auth client store reset
 * 3. LocalStorage & SessionStorage cleanup
 * 4. Document cookies cleanup
 * 5. Hard browser replacement to target route
 */
export async function signOutUser(redirectPath = "/login"): Promise<void> {
  try {
    // 1. Trigger dedicated backend logout endpoint
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  } catch {}

  try {
    // 2. Trigger Better-Auth internal client signOut
    await authClient.signOut().catch(() => {});
  } catch {}

  // 3. Clear all auth tokens & user cached keys in Storage
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("better-auth.session_token");
      localStorage.removeItem("mgn_user_session");
      localStorage.removeItem("mgn_auth_user");
      sessionStorage.clear();

      // Clear client-accessible cookies
      if (document.cookie) {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          try {
            const host = window.location.hostname;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
            const dotHost = "." + host;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${dotHost};`;
          } catch {}
        }
      }
    }
  } catch {}

  // 4. Force hard reload navigation so all memory states and router caches reset cleanly
  if (typeof window !== "undefined") {
    window.location.replace(redirectPath);
  }
}
