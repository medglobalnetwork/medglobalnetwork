"use client";
// modules/network/components/ProfessionalCard.tsx
import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, MoreHorizontal, Share2, Copy, Check } from "lucide-react";
import type { ProfessionalProfile, ConnectionStatus } from "../types";
import { VerificationBadge } from "./VerificationBadge";
import { ConnectionButton } from "./ConnectionButton";
import { ConnectionRequestModal } from "./ConnectionRequestModal";
import { getProfessionColor } from "../lib/network-data";

interface ProfessionalCardProps {
  profile: ProfessionalProfile;
  onConnectionChange?: (userId: string, status: ConnectionStatus) => void;
  variant?: "grid" | "list";
}

export function ProfessionalCard({
  profile,
  onConnectionChange,
  variant = "grid",
}: ProfessionalCardProps) {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>(
    profile.connection_status ?? "none"
  );
  const [isSaved, setIsSaved] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const avatarColor = getProfessionColor(profile.profession);
  const initials = (profile.name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isVerified =
    profile.identity_verified ||
    profile.education_verified ||
    profile.registration_verified;

  const handleStatusChange = (status: ConnectionStatus) => {
    setConnectionStatus(status);
    onConnectionChange?.(profile.user_id, status);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.user_id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({
        title: `${profile.name} - MGN Professional`,
        url: `${window.location.origin}/profile/${profile.user_id}`,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
    setShowMenu(false);
  };

  // Build specialty tags
  const specialtyTags = React.useMemo(() => {
    const tags: string[] = [];
    if (profile.specialization) tags.push(profile.specialization);
    if (profile.sub_specialization) tags.push(profile.sub_specialization);
    if (profile.skills && Array.isArray(profile.skills)) {
      for (const s of profile.skills) {
        if (s && !tags.includes(s) && tags.length < 2) {
          tags.push(s);
        }
      }
    }
    if (tags.length === 0 && profile.profession) {
      tags.push(profile.profession);
    }
    return tags.slice(0, 2);
  }, [profile.specialization, profile.sub_specialization, profile.skills, profile.profession]);

  if (variant === "list") {
    return (
      <div className="group relative flex items-center gap-3.5 rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs transition hover:border-[#1769c2]/30 hover:shadow-sm">
        {/* Avatar */}
        <button
          type="button"
          onClick={() => router.push(`/profile/${profile.user_id}`)}
          className="shrink-0"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-[#3f3f3c] ring-2 ring-[#f4f3f0]"
            style={{ background: avatarColor }}
          >
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </button>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => router.push(`/profile/${profile.user_id}`)}
              className="truncate text-sm font-semibold text-[#171717] hover:text-[#1769c2]"
            >
              {profile.name}
            </button>
            {isVerified && <VerificationBadge size="sm" />}
          </div>
          <p className="truncate text-xs text-[#77716b]">
            {profile.designation || profile.profession}
            {profile.specialization ? ` · ${profile.specialization}` : ""}
          </p>
          {(profile.organization || profile.city) && (
            <p className="truncate text-[11px] text-[#a09890]">
              {[profile.organization, profile.city].filter(Boolean).join(", ")}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(`/messages?to=${profile.user_id}`)}
            className="rounded-xl border border-[#ded8d1] p-2 text-[#5d5854] transition hover:bg-[#f8f7f6] hover:text-[#171717]"
            title="Send Message"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <ConnectionButton
            targetUserId={profile.user_id}
            initialStatus={connectionStatus}
            onStatusChange={handleStatusChange}
            onConnectClick={() => setShowModal(true)}
            size="sm"
          />
        </div>

        {showModal && (
          <ConnectionRequestModal
            targetName={profile.name}
            targetUserId={profile.user_id}
            onClose={() => setShowModal(false)}
            onSent={() => {
              setShowModal(false);
              setConnectionStatus("pending");
            }}
          />
        )}
      </div>
    );
  }

  // Grid variant: Full-width portrait cover photo matching the design mockup exactly
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-xs transition duration-150 hover:border-[#1769c2]/40 hover:shadow-md">
      {/* 1. TOP PORTRAIT COVER PHOTO */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#eef5fc]">
        <button
          type="button"
          onClick={() => router.push(`/profile/${profile.user_id}`)}
          className="h-full w-full block text-left"
        >
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-4xl font-bold text-slate-700/80"
              style={{ background: avatarColor }}
            >
              {initials}
            </div>
          )}
        </button>

        {/* Top-Left: Verified Badge Overlay */}
        {isVerified && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-xs backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Verified
            </span>
          </div>
        )}

        {/* Top-Right: Options and Bookmark Stack */}
        <div className="absolute right-3 top-3 flex flex-col items-center gap-2">
          {/* More Options Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#3f3f3c] shadow-xs backdrop-blur-xs transition hover:bg-white hover:text-[#171717]"
              title="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-[#e8e6e3] bg-white py-1 shadow-xl">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy profile link"}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    router.push(`/profile/${profile.user_id}`);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
                >
                  View full profile
                </button>
              </div>
            )}
          </div>

          {/* Heart Bookmark Button */}
          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-xs backdrop-blur-xs transition hover:bg-white hover:text-rose-500"
            title={isSaved ? "Saved" : "Save professional"}
          >
            <Heart
              className={`h-4 w-4 ${
                isSaved ? "fill-rose-500 text-rose-500" : "text-rose-500"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. BOTTOM CARD CONTENT */}
      <div className="flex flex-1 flex-col justify-between p-3.5">
        <div>
          {/* Name with Blue Verified Badge */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => router.push(`/profile/${profile.user_id}`)}
              className="truncate text-left text-sm font-bold text-[#171717] hover:text-[#1769c2]"
            >
              {profile.name}
            </button>
            <VerificationBadge size="sm" />
          </div>

          {/* Profession Subtitle */}
          <p className="mt-0.5 truncate text-left text-xs font-medium text-[#77716b]">
            {profile.designation || profile.profession || "Healthcare Professional"}
          </p>

          {/* Specialty Pill Tags */}
          {specialtyTags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {specialtyTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-[#f0f4f9] px-2.5 py-1 text-[11px] font-medium text-[#475569]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. ACTION BUTTONS: Connect + Message Button */}
        <div className="mt-3.5 flex items-center gap-2">
          <div className="flex-1">
            <ConnectionButton
              targetUserId={profile.user_id}
              initialStatus={connectionStatus}
              onStatusChange={handleStatusChange}
              onConnectClick={() => setShowModal(true)}
              size="sm"
            />
          </div>

          <button
            type="button"
            onClick={() => router.push(`/messages?to=${profile.user_id}`)}
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-[#ded8d1] text-[#1769c2] transition hover:bg-[#f8f7f6]"
            title="Send message"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showModal && (
        <ConnectionRequestModal
          targetName={profile.name}
          targetUserId={profile.user_id}
          onClose={() => setShowModal(false)}
          onSent={() => {
            setShowModal(false);
            setConnectionStatus("pending");
          }}
        />
      )}
    </div>
  );
}
