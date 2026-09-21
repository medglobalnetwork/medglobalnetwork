"use client";

/**
 * Clean neutral blank user avatar (SVG data URL)
 * Standard default placeholder when user has not uploaded a profile picture.
 */
export const DEFAULT_BLANK_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="%23f1f5f9"/><circle cx="50" cy="38" r="18" fill="%2394a3b8"/><path d="M22 84c0-15.464 12.536-28 28-28s28 12.536 28 28" stroke="%2394a3b8" stroke-width="12" stroke-linecap="round" fill="none"/></svg>`;

/**
 * Detects whether an avatar image URL is an automatic Google/Gmail OAuth or external aggregator image.
 */
export function isGoogleOrExternalAvatar(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes("googleusercontent.com") ||
    lower.includes("ggpht.com") ||
    lower.includes("unavatar.io") ||
    lower.includes("gravatar.com") ||
    lower.includes("ui-avatars.com")
  );
}

/**
 * Utility to get user avatar:
 * 1. Checks localStorage for a custom uploaded avatar photo.
 * 2. If a custom user image is present and NOT a Google/Gmail picture, uses it.
 * 3. Otherwise returns DEFAULT_BLANK_AVATAR. Gmail pictures are completely hidden.
 */
export function getUserAvatarUrl(
  email?: string | null,
  name?: string | null,
  serverImage?: string | null
): string {
  if (typeof window !== "undefined") {
    const customAvatar = localStorage.getItem("mgn_user_custom_avatar");
    if (customAvatar) {
      return customAvatar;
    }
  }

  // If a custom image exists on server and is NOT an automatic Google/Gmail picture
  if (serverImage && !isGoogleOrExternalAvatar(serverImage)) {
    return serverImage;
  }

  return DEFAULT_BLANK_AVATAR;
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
