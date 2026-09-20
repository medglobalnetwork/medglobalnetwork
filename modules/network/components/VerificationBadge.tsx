// modules/network/components/VerificationBadge.tsx
import * as React from "react";

interface VerificationBadgeProps {
  size?: "sm" | "md" | "lg";
  type?: "full" | "icon";
  verified?: boolean;
}

export function VerificationBadge({
  size = "sm",
  type = "icon",
  verified = true,
}: VerificationBadgeProps) {
  if (!verified) return null;

  const sizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className="inline-flex items-center gap-1 text-[#1769c2]"
      title="MGN Verified Healthcare Professional"
      aria-label="Verified"
    >
      <svg
        className={`${sizes[size]} fill-[#1769c2] shrink-0`}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      {type === "full" && (
        <span className="text-[10px] font-semibold text-[#1769c2]">Verified</span>
      )}
    </span>
  );
}
