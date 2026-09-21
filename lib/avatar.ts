"use client";

/**
 * Utility to get user avatar:
 * 1. Checks localStorage for a custom uploaded avatar photo.
 * 2. If session.user.image is provided, uses that.
 * 3. Fetches from Gravatar / unavatar.io using email.
 *    If no public photo is found, gracefully falls back to ui-avatars.
 */
export function getUserAvatarUrl(email?: string | null, name?: string | null): string {
  if (typeof window !== "undefined") {
    const customAvatar = localStorage.getItem("mgn_user_custom_avatar");
    if (customAvatar) {
      return customAvatar;
    }
  }

  const cleanEmail = (email || "").trim().toLowerCase();
  const displayName = name || (cleanEmail ? cleanEmail.split("@")[0] : "User");

  // Fallback styled avatar if email doesn't have an uploaded gravatar/google avatar
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&background=1769c2&color=ffffff&bold=true&size=128`;

  if (cleanEmail) {
    // Unavatar queries Gravatar, Google, GitHub etc. using the email address
    return `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=${encodeURIComponent(
      fallbackUrl
    )}`;
  }

  return fallbackUrl;
}

export function setUserCustomAvatar(dataUrl: string | null) {
  if (typeof window === "undefined") return;
  if (dataUrl) {
    localStorage.setItem("mgn_user_custom_avatar", dataUrl);
  } else {
    localStorage.removeItem("mgn_user_custom_avatar");
  }
  // Dispatch custom storage event so all components update instantly
  window.dispatchEvent(new Event("mgn-avatar-updated"));
}
