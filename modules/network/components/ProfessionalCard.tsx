"use client";
// modules/network/components/ProfessionalCard.tsx
import * as React from "react";
import { useRouter } from "next/navigation";
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
  const [isFollowing, setIsFollowing] = React.useState(
    profile.follow_status === "following"
  );
  const [showModal, setShowModal] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);

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

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await fetch(`/api/network/follows?followingId=${profile.user_id}`, {
          method: "DELETE",
          credentials: "include",
        });
        setIsFollowing(false);
      } else {
        await fetch("/api/network/follows", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: profile.user_id }),
        });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow action failed:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleStatusChange = (status: ConnectionStatus) => {
    setConnectionStatus(status);
    onConnectionChange?.(profile.user_id, status);
  };

  const degreeStr = [
    profile.primary_degree,
    ...(profile.additional_degrees ?? []),
  ]
    .filter(Boolean)
    .join(" • ");

  if (variant === "list") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#e8e6e3] bg-white p-3.5 shadow-xs">
        {/* Avatar */}
        <button
          type="button"
          onClick={() => router.push(`/profile/${profile.user_id}`)}
          className="shrink-0"
        >
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-[#3f3f3c]"
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
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => router.push(`/profile/${profile.user_id}`)}
              className="truncate text-sm font-semibold text-[#171717] hover:text-[#1769c2] hover:underline"
            >
              {profile.name}
            </button>
            {isVerified && <VerificationBadge size="sm" />}
          </div>
          <p className="truncate text-xs text-[#77716b]">
            {profile.profession}
            {profile.specialization ? ` · ${profile.specialization}` : ""}
          </p>
          {profile.organization && (
            <p className="truncate text-[11px] text-[#a09890]">{profile.organization}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-1.5">
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

  // Grid variant (default)
  return (
    <div className="flex flex-col rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs transition hover:shadow-sm">
      {/* Top: Avatar + Name */}
      <div className="flex flex-col items-center text-center">
        <button
          type="button"
          onClick={() => router.push(`/profile/${profile.user_id}`)}
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-[#3f3f3c] ring-2 ring-white"
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
        </button>

        <div className="mt-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => router.push(`/profile/${profile.user_id}`)}
            className="text-sm font-semibold text-[#171717] hover:text-[#1769c2] hover:underline"
          >
            {profile.name}
          </button>
          {isVerified && <VerificationBadge size="sm" />}
        </div>

        <p className="mt-0.5 text-xs text-[#77716b]">
          {profile.profession}
          {profile.specialization ? ` · ${profile.specialization}` : ""}
        </p>

        {degreeStr && (
          <p className="mt-0.5 text-[11px] text-[#a09890]">{degreeStr}</p>
        )}

        {(profile.city || profile.state) && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-[#a09890]">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {[profile.city, profile.state].filter(Boolean).join(", ")}
          </p>
        )}

        {profile.experience_years !== undefined && (
          <p className="mt-0.5 text-[11px] text-[#a09890]">
            {profile.experience_years} yr{profile.experience_years !== 1 ? "s" : ""} experience
          </p>
        )}

        {profile.connection_count !== undefined && (
          <p className="mt-0.5 text-[11px] font-medium text-[#5d5854]">
            {profile.connection_count.toLocaleString()} connections
          </p>
        )}

        {(profile.mutual_connections ?? 0) > 0 && (
          <p className="mt-0.5 text-[11px] text-[#77716b]">
            {profile.mutual_connections} mutual connection
            {profile.mutual_connections !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
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
            onClick={() => router.push(`/profile/${profile.user_id}`)}
            className="flex-1 rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs font-medium text-[#5d5854] transition hover:bg-[#f8f7f6]"
          >
            View Profile
          </button>
        </div>

        <button
          type="button"
          onClick={handleFollow}
          disabled={followLoading}
          className={`w-full rounded-xl border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
            isFollowing
              ? "border-[#1769c2] bg-[#eef5fc] text-[#1769c2]"
              : "border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
          }`}
        >
          {followLoading ? "…" : isFollowing ? "✓ Following" : "+ Follow"}
        </button>
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
