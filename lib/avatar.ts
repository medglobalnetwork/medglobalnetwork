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

/**
 * Default scenic medical cover banner when user has not set a custom cover.
 */
export const DEFAULT_COVER_BANNER =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80";

/**
 * Utility to get user cover image:
 * 1. Checks localStorage for a custom cover image (`mgn_cover_<userId>`).
 * 2. Checks serverProfile cover_image_url.
 * 3. Falls back to DEFAULT_COVER_BANNER.
 */
export function getUserCoverUrl(
  userId?: string | null,
  serverCover?: string | null
): string {
  if (typeof window !== "undefined" && userId) {
    const customCover = localStorage.getItem(`mgn_cover_${userId}`);
    if (customCover) {
      return customCover;
    }
  }

  if (serverCover) {
    return serverCover;
  }

  return DEFAULT_COVER_BANNER;
}

export function setUserCustomCover(userId: string, coverUrl: string | null) {
  if (typeof window === "undefined" || !userId) return;
  if (coverUrl) {
    localStorage.setItem(`mgn_cover_${userId}`, coverUrl);
  } else {
    localStorage.removeItem(`mgn_cover_${userId}`);
  }
  window.dispatchEvent(new Event("mgn-cover-updated"));
}

