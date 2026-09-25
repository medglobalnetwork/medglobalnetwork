"use client";

import * as React from "react";
import { Sparkles, Crown, Copy, Check, ShieldCheck } from "lucide-react";
import { isFoundingMemberId } from "../lib/member-id";

interface MemberBadgeProps {
  memberId?: string | null;
  isFoundingMember?: boolean;
  membershipTier?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  showCopy?: boolean;
  variant?: "pill" | "tag" | "full" | "subtle";
  className?: string;
}

export function MemberBadge({
  memberId,
  isFoundingMember,
  membershipTier,
  size = "sm",
  showCopy = true,
  variant = "pill",
  className = "",
}: MemberBadgeProps) {
  const [copied, setCopied] = React.useState(false);

  const displayId = memberId || "MGN-MEMBER";
  const isFounder = Boolean(isFoundingMember) || isFoundingMemberId(displayId) || membershipTier === "FOUNDING_MEMBER";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && memberId) {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(memberId).catch(() => {});
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Size styles
  const sizeStyles = {
    xs: {
      text: "text-[10px]",
      padding: "px-1.5 py-0.5",
      icon: "size-2.5",
    },
    sm: {
      text: "text-[11px]",
      padding: "px-2 py-0.5",
      icon: "size-3",
    },
    md: {
      text: "text-xs",
      padding: "px-2.5 py-1",
      icon: "size-3.5",
    },
    lg: {
      text: "text-sm",
      padding: "px-3.5 py-1.5",
      icon: "size-4",
    },
  }[size];

  if (isFounder) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold shadow-xs select-none transition-all ${sizeStyles.text} ${sizeStyles.padding} bg-amber-50 text-amber-900 border border-amber-200 ${className}`}
        title={`Founding Member ID: ${displayId}`}
      >
        <span className="flex items-center gap-1 text-amber-600">
          <Crown className={`${sizeStyles.icon} fill-amber-500 text-amber-600`} />
        </span>
        <span className="font-extrabold">{displayId}</span>
        {variant === "full" && (
          <span className="rounded-full bg-amber-900/10 px-1.5 py-0.2 text-[9px] font-sans font-bold uppercase text-amber-900">
            Founder
          </span>
        )}
        {showCopy && memberId && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-amber-800 hover:text-amber-950 transition p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-700 rounded"
            title={copied ? "Copied Member ID" : "Copy Member ID"}
          >
            {copied ? (
              <Check className={`${sizeStyles.icon} text-emerald-700`} />
            ) : (
              <Copy className={`${sizeStyles.icon} opacity-70 hover:opacity-100`} />
            )}
          </button>
        )}
      </div>
    );
  }

  // Standard Member Badge
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-semibold shadow-2xs select-none transition-all ${sizeStyles.text} ${sizeStyles.padding} ${
        variant === "subtle"
          ? "bg-[#f8f7f6] text-[#5d5854] border border-[#e8e6e3]"
          : "bg-[#f0efee] text-[#0f4c81] border border-[#ded8d1]"
      } ${className}`}
      title={`MGN Member ID: ${displayId}`}
    >
      <span className="text-[#0f4c81] font-mono font-bold">ID:</span>
      <span className="font-bold">{displayId}</span>
      {showCopy && memberId && (
        <button
          type="button"
          onClick={handleCopy}
          className="text-[#5d5854] hover:text-[#171717] transition p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0f4c81] rounded"
          title={copied ? "Copied Member ID" : "Copy Member ID"}
        >
          {copied ? (
            <Check className={`${sizeStyles.icon} text-emerald-600`} />
          ) : (
            <Copy className={`${sizeStyles.icon} opacity-60 hover:opacity-100`} />
          )}
        </button>
      )}
    </div>
  );
}
