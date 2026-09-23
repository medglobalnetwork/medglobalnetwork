"use client";

import React, { useState } from "react";
import { getAvatarColor, getInitials, DEFAULT_BLANK_AVATAR } from "@/lib/avatar";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  userId?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
}

export function UserAvatar({
  src,
  name,
  email,
  userId,
  size = "md",
  className = "",
  alt,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Check localStorage for local override if available
  const resolvedSrc = React.useMemo(() => {
    if (typeof window !== "undefined") {
      if (userId) {
        const stored = localStorage.getItem(`mgn_avatar_${userId}`);
        if (stored) return stored;
      }
      const custom = localStorage.getItem("mgn_user_custom_avatar");
      if (custom && (!src || src === DEFAULT_BLANK_AVATAR)) {
        return custom;
      }
    }
    return src;
  }, [src, userId]);

  const hasCustomSize = /\b(h-\S+|w-\S+)\b/.test(className);
  const sizeClasses = hasCustomSize
    ? ""
    : {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-xl",
      }[size || "md"];

  const initials = getInitials(name, email);
  const color = getAvatarColor(name || email || userId || "user");

  if (resolvedSrc && !imgError && resolvedSrc !== DEFAULT_BLANK_AVATAR) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full border border-[#ded8d1] bg-slate-100 ${sizeClasses} ${className}`}
      >
        <img
          src={resolvedSrc}
          alt={alt || name || "User Avatar"}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback to vibrant initials avatar matching modern platform standards
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-full font-bold shadow-2xs select-none ${color.bg} ${color.text} ${sizeClasses} ${className}`}
      title={name || email || undefined}
    >
      <span>{initials}</span>
    </div>
  );
}

export default UserAvatar;
