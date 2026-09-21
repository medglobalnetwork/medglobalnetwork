"use client";

import * as React from "react";
import { 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Edit3, 
  Share2, 
  MessageSquare, 
  UserPlus, 
  Check, 
  Stethoscope,
  ExternalLink,
  Mail
} from "lucide-react";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";
import { ConnectionButton } from "@/modules/network/components/ConnectionButton";
import type { ProfessionalProfile, ConnectionStatus } from "@/modules/network/types";
import { getProfessionColor } from "@/modules/network/lib/network-data";

interface ProfileHeaderProps {
  profile: ProfessionalProfile & {
    connection_count?: number;
    follower_count?: number;
    following_count?: number;
    is_own_profile?: boolean;
    post_count?: number;
  };
  isOwnProfile: boolean;
  connectionStatus: ConnectionStatus;
  onStatusChange: (status: ConnectionStatus) => void;
  onConnectClick: () => void;
  isFollowing: boolean;
  onFollowToggle: () => void;
  followLoading: boolean;
  onEditProfileClick: () => void;
  onOpenKnowMore: () => void;
  onShareClick: () => void;
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  connectionStatus,
  onStatusChange,
  onConnectClick,
  isFollowing,
  onFollowToggle,
  followLoading,
  onEditProfileClick,
  onOpenKnowMore,
  onShareClick,
}: ProfileHeaderProps) {
  const isVerified =
    profile.identity_verified ||
    profile.education_verified ||
    profile.registration_verified ||
    profile.experience_verified;

  const color = getProfessionColor(profile.profession);
  const initials = (profile.name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const tags = profile.skills && profile.skills.length > 0 
    ? profile.skills 
    : [profile.profession, profile.specialization, "Evidence-Based Care", "Clinical Rehab"].filter(Boolean) as string[];

  const formatCount = (count?: number) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e8e6e3] shadow-xs p-4 sm:p-6 mb-4 sm:mb-5">
      {/* 1. TOP ROW: Avatar on Left + (Posts, Followers, Following) on Right */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Large Round Avatar with Gradient Story Ring */}
        <div className="relative shrink-0">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 shadow-xs">
            <div
              className="h-full w-full rounded-full overflow-hidden flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white border-2 border-white"
              style={{ background: color }}
            >
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </div>
          {/* Online green indicator dot */}
          <span className="absolute bottom-1 right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs" />
        </div>

        {/* Stats on the right: Posts, Followers, Following */}
        <div className="flex-1 flex items-center justify-around text-center max-w-sm sm:max-w-md ml-1 sm:ml-4">
          <div className="cursor-pointer">
            <span className="block text-base sm:text-lg font-black text-[#171717] tracking-tight">
              {(profile.post_count ?? 142).toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm text-[#5d5854] font-medium">posts</span>
          </div>

          <div className="cursor-pointer">
            <span className="block text-base sm:text-lg font-black text-[#171717] tracking-tight">
              {formatCount(profile.follower_count ?? 1240)}
            </span>
            <span className="text-xs sm:text-sm text-[#5d5854] font-medium">followers</span>
          </div>

          <div className="cursor-pointer">
            <span className="block text-base sm:text-lg font-black text-[#171717] tracking-tight">
              {formatCount(profile.following_count ?? 320)}
            </span>
            <span className="text-xs sm:text-sm text-[#5d5854] font-medium">following</span>
          </div>
        </div>
      </div>

      {/* 2. NAME, PROFESSION, BIO & LINKS */}
      <div className="space-y-1 mb-4">
        {/* Name with Blue Verification Badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <h1 className="text-base sm:text-lg font-black text-[#171717] tracking-tight">
            {profile.name}
          </h1>
          <CheckCircle2 className="h-4.5 w-4.5 text-blue-500 fill-blue-500 text-white shrink-0" />
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <ShieldCheck className="h-3 w-3" /> Verified Clinician
            </span>
          )}
        </div>

        {/* Profession & Specialization */}
        <p className="text-xs font-semibold text-[#5d5854]">
          {profile.designation ? `${profile.designation} · ` : ""}
          {profile.profession}
          {profile.specialization ? ` (${profile.specialization})` : ""}
        </p>

        {/* Bio Text */}
        <p className="text-xs sm:text-sm text-[#262626] leading-relaxed pt-0.5">
          {profile.bio ||
            "Specialized in Clinical Healthcare, Rehabilitation & Patient Wellness. Helping patients regain strength & health with evidence-based modern medical practices."}
        </p>

        {/* Location & Organization / Links */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#171717] pt-1">
          {(profile.city || profile.state) && (
            <span className="inline-flex items-center gap-1 text-[#5d5854] font-medium">
              <MapPin className="h-3.5 w-3.5 text-[#1769c2]" />
              {[profile.city, profile.state].filter(Boolean).join(", ")}
            </span>
          )}
          {profile.organization && (
            <span className="inline-flex items-center gap-1 font-semibold text-[#1769c2]">
              🔗 {profile.organization}
            </span>
          )}
        </div>

        {/* Specialty Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
          {tags.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-lg bg-[#f0f4f8] px-2.5 py-0.5 text-[11px] font-semibold text-[#1769c2] border border-[#d8e5f2]"
            >
              {tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="inline-flex items-center rounded-lg bg-[#f8f7f6] px-2 py-0.5 text-[11px] font-bold text-[#77716b] border border-[#e8e6e3]">
              +{tags.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* 3. ACTION BUTTONS ROW (Instagram Style) */}
      <div className="flex items-center gap-2 pt-1">
        {isOwnProfile ? (
          <>
            <button
              type="button"
              onClick={onEditProfileClick}
              className="flex-1 rounded-xl bg-[#efefef] hover:bg-[#e4e4e4] py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#171717] transition active:scale-98 text-center"
            >
              Edit profile
            </button>
            <button
              type="button"
              onClick={onOpenKnowMore}
              className="flex-1 rounded-xl bg-[#efefef] hover:bg-[#e4e4e4] py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#171717] transition active:scale-98 text-center"
            >
              Know More
            </button>
            <button
              type="button"
              onClick={onShareClick}
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#efefef] hover:bg-[#e4e4e4] text-[#171717] transition active:scale-95"
              title="Share profile"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onFollowToggle}
              disabled={followLoading}
              className={`flex-1 rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition active:scale-98 text-center ${
                isFollowing
                  ? "bg-[#efefef] hover:bg-[#e4e4e4] text-[#171717]"
                  : "bg-[#1769c2] hover:bg-[#12569f] text-white shadow-xs"
              }`}
            >
              {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
            </button>
            <button
              type="button"
              onClick={() => {}}
              className="flex-1 rounded-xl bg-[#efefef] hover:bg-[#e4e4e4] py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#171717] transition active:scale-98 text-center"
            >
              Message
            </button>
            <button
              type="button"
              onClick={onOpenKnowMore}
              className="flex-1 rounded-xl bg-[#efefef] hover:bg-[#e4e4e4] py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#171717] transition active:scale-98 text-center"
            >
              Know More
            </button>
            <button
              type="button"
              onClick={onConnectClick}
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#efefef] hover:bg-[#e4e4e4] text-[#171717] transition active:scale-95"
              title="Add connection"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
