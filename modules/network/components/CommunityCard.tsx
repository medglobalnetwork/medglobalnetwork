"use client";
// modules/network/components/CommunityCard.tsx
import * as React from "react";
import { useRouter } from "next/navigation";
import type { Community } from "../types";

const SPECIALTY_COLORS: Record<string, { bg: string; text: string }> = {
  Physiotherapy:     { bg: "#fef9c3", text: "#854d0e" },
  Cardiology:        { bg: "#fee2e2", text: "#991b1b" },
  "Medical Students":{ bg: "#dcfce7", text: "#14532d" },
  "Clinical Research":{ bg: "#ede9fe", text: "#4c1d95" },
  Nursing:           { bg: "#dbeafe", text: "#1e3a5f" },
  "Sports Medicine": { bg: "#d1fae5", text: "#065f46" },
  Radiology:         { bg: "#ffedd5", text: "#7c2d12" },
  Pediatrics:        { bg: "#cffafe", text: "#0c4a6e" },
};

function getCommunityColor(specialty?: string) {
  return (
    SPECIALTY_COLORS[specialty ?? ""] ?? { bg: "#f8f7f6", text: "#5d5854" }
  );
}

interface CommunityCardProps {
  community: Community;
  onMembershipChange?: (slug: string, isMember: boolean) => void;
}

export function CommunityCard({ community, onMembershipChange }: CommunityCardProps) {
  const router = useRouter();
  const [isMember, setIsMember] = React.useState(community.is_member ?? false);
  const [loading, setLoading] = React.useState(false);
  const color = getCommunityColor(community.specialty);

  const handleJoin = async () => {
    setLoading(true);
    try {
      if (isMember) {
        await fetch(`/api/network/communities/${community.slug}/members`, {
          method: "DELETE",
          credentials: "include",
        });
        setIsMember(false);
        onMembershipChange?.(community.slug, false);
      } else {
        await fetch(`/api/network/communities/${community.slug}/members`, {
          method: "POST",
          credentials: "include",
        });
        setIsMember(true);
        onMembershipChange?.(community.slug, true);
      }
    } catch (err) {
      console.error("Community join failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs transition hover:shadow-sm">
      {/* Header accent bar */}
      <div
        className="mb-3 flex h-16 items-center justify-center rounded-xl text-2xl"
        style={{ background: color.bg }}
      >
        <span>
          {community.specialty === "Physiotherapy" && "🦴"}
          {community.specialty === "Cardiology" && "❤️"}
          {community.specialty === "Medical Students" && "🎓"}
          {community.specialty === "Clinical Research" && "🔬"}
          {community.specialty === "Nursing" && "🩺"}
          {community.specialty === "Sports Medicine" && "🏃"}
          {community.specialty === "Radiology" && "🔭"}
          {community.specialty === "Pediatrics" && "👶"}
          {!community.specialty && "👥"}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => router.push(`/network/communities/${community.slug}`)}
            className="text-left text-sm font-semibold text-[#171717] hover:text-[#1769c2] hover:underline leading-snug"
          >
            {community.name}
          </button>
          {community.specialty && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: color.bg, color: color.text }}
            >
              {community.specialty}
            </span>
          )}
        </div>

        {community.description && (
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[#77716b]">
            {community.description}
          </p>
        )}

        <p className="mt-2 text-[11px] text-[#a09890]">
          {community.member_count.toLocaleString()} members
          {community.post_count > 0
            ? ` · ${community.post_count.toLocaleString()} posts`
            : ""}
        </p>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={handleJoin}
        disabled={loading}
        className={`mt-3 w-full rounded-xl py-2 text-xs font-semibold transition disabled:opacity-50 ${
          isMember
            ? "bg-[#eef5fc] text-[#1769c2] hover:bg-[#1769c2] hover:text-white"
            : "bg-[#1769c2] text-white hover:bg-[#12569f]"
        }`}
      >
        {loading ? "…" : isMember ? "✓ Joined" : "Join Community"}
      </button>
    </div>
  );
}
