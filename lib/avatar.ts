"use client";

/**
 * Clean neutral blank user avatar (SVG data URL)
 * Standard default placeholder when user has not uploaded a profile picture.
 */
export const DEFAULT_BLANK_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="%23f1f5f9"/><circle cx="50" cy="38" r="18" fill="%2394a3b8"/><path d="M22 84c0-15.464 12.536-28 28-28s28 12.536 28 28" stroke="%2394a3b8" stroke-width="12" stroke-linecap="round" fill="none"/></svg>`;

/**
 * Deterministic color palette for initials avatars (vibrant, accessible healthcare tones)
 */
export const AVATAR_PALETTES = [
  { bg: "bg-blue-600", text: "text-white" },
  { bg: "bg-indigo-600", text: "text-white" },
  { bg: "bg-emerald-600", text: "text-white" },
  { bg: "bg-teal-600", text: "text-white" },
  { bg: "bg-purple-600", text: "text-white" },
  { bg: "bg-rose-600", text: "text-white" },
  { bg: "bg-amber-600", text: "text-white" },
  { bg: "bg-cyan-600", text: "text-white" },
  { bg: "bg-violet-600", text: "text-white" },
];

export function getAvatarColor(identifier?: string | null): { bg: string; text: string } {
  if (!identifier) return AVATAR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email && email.trim()) {
    return email.trim()[0].toUpperCase();
  }
  return "M";
}

/**
 * Detects whether an avatar image URL is an external aggregator image.
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
 * 1. Checks localStorage for user-scoped custom avatar (`mgn_avatar_<userId>`).
 * 2. If serverImage is provided and is a valid custom image, returns it.
 * 3. Falls back to DEFAULT_BLANK_AVATAR.
 */
export function getUserAvatarUrl(
  userIdOrServerImage?: string | null,
  serverImageOrName?: string | null,
  legacyServerImage?: string | null
): string {
  let userId: string | null | undefined = null;
  let serverImage: string | null | undefined = null;

  // Detect which argument is the userId vs image URL
  const args = [userIdOrServerImage, serverImageOrName, legacyServerImage];
  for (const arg of args) {
    if (!arg) continue;
    if (arg.startsWith("http://") || arg.startsWith("https://") || arg.startsWith("data:") || arg.startsWith("/")) {
      if (!serverImage) serverImage = arg;
    } else if (!userId && arg.length > 3 && !arg.includes("@") && !arg.includes(" ")) {
      // Looks like a userId
      userId = arg;
    }
  }

  // If first arg didn't match the regex but isn't an image URL, treat as userId if provided
  if (!userId && userIdOrServerImage && !userIdOrServerImage.startsWith("http") && !userIdOrServerImage.startsWith("data:") && !userIdOrServerImage.startsWith("/")) {
    userId = userIdOrServerImage;
  }

  if (typeof window !== "undefined" && userId) {
    const userCustom = localStorage.getItem(`mgn_avatar_${userId}`);
    if (userCustom) {
      return userCustom;
    }
  }

  if (serverImage && serverImage !== DEFAULT_BLANK_AVATAR) {
    return serverImage;
  }

  return DEFAULT_BLANK_AVATAR;
}

export function setUserCustomAvatar(userIdOrDataUrl: string | null, dataUrlOrNull?: string | null) {
  if (typeof window === "undefined") return;

  let userId: string | null = null;
  let dataUrl: string | null = null;

  if (dataUrlOrNull !== undefined) {
    userId = userIdOrDataUrl;
    dataUrl = dataUrlOrNull;
  } else {
    dataUrl = userIdOrDataUrl;
  }

  if (userId) {
    if (dataUrl) {
      localStorage.setItem(`mgn_avatar_${userId}`, dataUrl);
    } else {
      localStorage.removeItem(`mgn_avatar_${userId}`);
    }
  }

  // Clear legacy global key to prevent cross-account leak
  localStorage.removeItem("mgn_user_custom_avatar");

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
