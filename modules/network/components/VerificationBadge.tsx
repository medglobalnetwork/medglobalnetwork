// modules/network/components/VerificationBadge.tsx
import * as React from "react";
import { ShieldCheck } from "lucide-react";

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
      <ShieldCheck
        className={`${sizes[size]} shrink-0 text-[#1769c2] fill-[#1769c2]/15`}
        aria-hidden="true"
      />
      {type === "full" && (
        <span className="text-[10px] font-semibold text-[#1769c2]">Verified</span>
      )}
    </span>
  );
}
