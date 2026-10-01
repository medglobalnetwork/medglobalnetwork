"use client";
// modules/network/components/ProfessionalCard.tsx
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  User,
  UserPlus,
  UserCheck,
  MessageSquare,
  Share2,
  Ban,
  Flag,
  Copy,
  Check,
} from "lucide-react";
import type { ProfessionalProfile, ConnectionStatus } from "../types";
import { VerificationBadge } from "./VerificationBadge";
import { ConnectionButton } from "./ConnectionButton";
import { ConnectionRequestModal } from "./ConnectionRequestModal";
import { getProfessionColor } from "../lib/network-data";
import { isGoogleOrExternalAvatar } from "@/lib/avatar";

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
  const customImageSrc =
    profile.image && !isGoogleOrExternalAvatar(profile.image) ? profile.image : null;
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>(
    profile.connection_status ?? "none"
  );
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
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
      const slug = profile.username || profile.user_id;
      navigator.clipboard.writeText(`${window.location.origin}/profile/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    }
  };

  const handleShare = () => {
    const slug = profile.username || profile.user_id;
    if (typeof window !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `${profile.name} - MGN Professional`,
          url: `${window.location.origin}/profile/${slug}`,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
    setShowMenu(false);
  };

  const handleToggleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    setShowMenu(false);

    try {
      if (newFollowState) {
        await fetch("/api/network/follows", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: profile.user_id }),
        });
      } else {
        await fetch("/api/network/follows", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: profile.user_id }),
        });
      }
    } catch (err) {
      console.error("Failed to toggle follow state:", err);
      setIsFollowing(!newFollowState);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlock = async () => {
    setShowMenu(false);
    if (!confirm(`Are you sure you want to block ${profile.name}?`)) return;
    try {
      const res = await fetch("/api/v1/communication/safety/block", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: profile.user_id }),
      });
      if (res.ok) {
        alert(`${profile.name} has been blocked.`);
      }
    } catch (err) {
      console.error("Block error:", err);
    }
  };

  const handleReport = async () => {
    setShowMenu(false);
    const reason = prompt(`Reason for reporting ${profile.name}:`, "Inappropriate profile / spam");
    if (!reason) return;
    try {
      const res = await fetch("/api/v1/communication/safety/report", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedUserId: profile.user_id, reason }),
      });
      if (res.ok) {
        alert("Report submitted to MGN moderation team.");
      }
    } catch (err) {
      console.error("Report error:", err);
    }
  };

  const destinationSlug = profile.username || profile.user_id;

  // ─────────────────────────────────────────────────────────
  // List Variant (Borderless horizontal item)
  // ─────────────────────────────────────────────────────────
  if (variant === "list") {
    return (
      <div className="group relative flex items-center justify-between gap-3 sm:gap-4 rounded-2xl bg-white p-3.5 sm:p-4 shadow-none sm:shadow-2xs transition hover:bg-[#faf9f8] hover:shadow-xs">
        {/* Left: Circular Avatar */}
        <button
          type="button"
          onClick={() => router.push(`/profile/${destinationSlug}`)}
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded-full"
        >
          <div
            className="flex size-12 sm:size-14 items-center justify-center rounded-full text-sm sm:text-base font-bold text-[#3f3f3c] overflow-hidden border border-[#ded8d1] shadow-2xs"
            style={{ background: avatarColor }}
          >
            {customImageSrc ? (
              <img
                src={customImageSrc}
                alt={profile.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </button>

        {/* Center: Info */}
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => router.push(`/profile/${destinationSlug}`)}
              className="truncate text-xs sm:text-sm font-bold text-[#171717] hover:text-[#0f4c81] transition text-left"
            >
              {profile.name}
            </button>
            {isVerified && <VerificationBadge size="sm" />}
            {profile.is_founding_member && (
              <span className="text-[10px] font-bold text-amber-600" title="Founder">
                👑
              </span>
            )}
          </div>

          <p className="truncate text-xs font-semibold text-[#0f4c81] mt-0.5">
            {profile.designation || profile.profession || "Healthcare Professional"}
            {profile.specialization ? ` · ${profile.specialization}` : ""}
          </p>

          {(profile.organization || profile.city) && (
            <p className="truncate text-[11px] text-[#77716b] mt-0.5">
              {[profile.organization, profile.city].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* Right: Connect + Dropdown */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ConnectionButton
            targetUserId={profile.user_id}
            initialStatus={connectionStatus}
            onStatusChange={handleStatusChange}
            onConnectClick={() => setShowModal(true)}
            size="sm"
          />

          {/* Three-dot dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="flex size-8 items-center justify-center rounded-xl text-[#77716b] hover:bg-[#f0efee] hover:text-[#171717] transition"
              title="Options"
            >
              <MoreVertical className="size-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-40 mt-1 w-44 rounded-2xl border border-[#ded8d1] bg-white p-1.5 shadow-xl text-left animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    router.push(`/profile/${destinationSlug}`);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8] hover:text-[#171717]"
                >
                  <User className="size-3.5 text-[#0f4c81]" />
                  View profile
                </button>
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8] hover:text-[#171717]"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="size-3.5 text-emerald-600" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-3.5 text-[#0f4c81]" />
                      Follow
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    router.push(`/messages?to=${profile.user_id}`);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8] hover:text-[#171717]"
                >
                  <MessageSquare className="size-3.5 text-[#0f4c81]" />
                  Message
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8] hover:text-[#171717]"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Share2 className="size-3.5" />}
                  {copied ? "Copied!" : "Share account"}
                </button>
                <div className="my-1 border-t border-[#f0efee]" />
                <button
                  type="button"
                  onClick={handleBlock}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Ban className="size-3.5 text-rose-500" />
                  Block
                </button>
                <button
                  type="button"
                  onClick={handleReport}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Flag className="size-3.5 text-rose-500" />
                  Report
                </button>
              </div>
            )}
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

  // ─────────────────────────────────────────────────────────
  // Grid Variant: Clean Minimalist Healthcare Profile Card
  // ─────────────────────────────────────────────────────────
  return (
    <div className="group relative flex flex-col items-center text-center p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-[#faf9f8] transition-all duration-150">
      {/* 1. Circular Profile Picture */}
      <button
        type="button"
        onClick={() => router.push(`/profile/${destinationSlug}`)}
        className="relative group/avatar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded-full cursor-pointer"
      >
        <div
          className="size-16 sm:size-18 rounded-full overflow-hidden flex items-center justify-center text-base sm:text-lg font-bold text-[#3f3f3c] border-2 border-white shadow-2xs ring-1 ring-[#ded8d1] transition duration-200 group-hover/avatar:scale-105"
          style={{ background: avatarColor }}
        >
          {customImageSrc ? (
            <img
              src={customImageSrc}
              alt={profile.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {profile.is_founding_member && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-xs ring-1 ring-white text-[10px]"
            title="Founding Member"
          >
            👑
          </span>
        )}
      </button>

      {/* 2. Name with Verification Badge */}
      <div className="mt-2.5 flex items-center justify-center gap-1 flex-wrap max-w-full px-1">
        <button
          type="button"
          onClick={() => router.push(`/profile/${destinationSlug}`)}
          className="truncate text-xs sm:text-sm font-bold text-[#171717] hover:text-[#0f4c81] transition text-center cursor-pointer"
        >
          {profile.name}
        </button>
        {isVerified && <VerificationBadge size="sm" />}
      </div>

      {/* 3. Some Info */}
      <div className="mt-0.5 space-y-0.5 max-w-full px-1">
        <p className="truncate text-[11px] sm:text-xs font-semibold text-[#0f4c81]">
          {profile.designation || profile.profession || "Healthcare Professional"}
        </p>

        {profile.specialization && (
          <p className="truncate text-[10px] sm:text-[11px] text-[#77716b] font-medium">
            {profile.specialization}
          </p>
        )}

        {(profile.organization || profile.city) && (
          <p className="truncate text-[10px] text-[#8a8784] font-medium">
            {[profile.organization, profile.city].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* 4. Connect Button + Three-dot Menu side-by-side */}
      <div className="mt-3 flex items-center justify-center gap-1.5 w-full max-w-[200px]">
        <ConnectionButton
          targetUserId={profile.user_id}
          initialStatus={connectionStatus}
          onStatusChange={handleStatusChange}
          onConnectClick={() => setShowModal(true)}
          size="sm"
          className="flex-1 justify-center rounded-xl !py-1.5 !text-xs"
        />

        {/* 3-dots Menu Button next to Connect */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex size-7.5 items-center justify-center rounded-xl border border-[#ded8d1] bg-white text-[#77716b] hover:bg-[#f0efee] hover:text-[#171717] transition cursor-pointer"
            title="More options"
            aria-label="More options"
          >
            <MoreVertical className="size-3.5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full z-40 mt-1 w-44 rounded-2xl border border-[#ded8d1] bg-white p-1.5 shadow-xl text-left animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/profile/${destinationSlug}`);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8] hover:text-[#171717]"
              >
                <User className="size-3.5 text-[#0f4c81]" />
                View profile
              </button>
              <button
                type="button"
                onClick={handleToggleFollow}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8] hover:text-[#171717]"
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="size-3.5 text-emerald-600" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="size-3.5 text-[#0f4c81]" />
                    Follow
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/messages?to=${profile.user_id}`);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8] hover:text-[#171717]"
              >
                <MessageSquare className="size-3.5 text-[#0f4c81]" />
                Message
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8] hover:text-[#171717]"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Share2 className="size-3.5" />}
                {copied ? "Copied!" : "Share account"}
              </button>
              <div className="my-1 border-t border-[#f0efee]" />
              <button
                type="button"
                onClick={handleBlock}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <Ban className="size-3.5 text-rose-500" />
                Block
              </button>
              <button
                type="button"
                onClick={handleReport}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <Flag className="size-3.5 text-rose-500" />
                Report
              </button>
            </div>
          )}
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
