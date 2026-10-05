"use client";

import React, { useState } from "react";

interface AdminIconProps {
  iconId?: string;
  fallback: React.ComponentType<{ className?: string }>;
  active?: boolean;
  className?: string;
  size?: number;
  /** When true, active icon color is rendered as white (for solid colored backgrounds) */
  activeColorWhite?: boolean;
}

export function AdminIcon({
  iconId,
  fallback: FallbackIcon,
  active = false,
  className = "size-4",
  size = 48,
  activeColorWhite = true,
}: AdminIconProps) {
  const [imgError, setImgError] = useState(false);

  if (!iconId || imgError) {
    return (
      <FallbackIcon
        className={`${className} shrink-0 stroke-[2] transition-colors`}
      />
    );
  }

  // Icons8 fluent-systems-regular CDN matching project lock
  const colorHex = active
    ? activeColorWhite
      ? "FFFFFF"
      : "2563EB"
    : "64748B";

  const url = `https://img.icons8.com/?id=${iconId}&format=png&size=${size}&color=${colorHex}`;

  return (
    <img
      src={url}
      alt=""
      aria-hidden="true"
      className={`${className} shrink-0 object-contain transition-transform duration-150 select-none`}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}
