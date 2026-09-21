"use client";

import * as React from "react";
import { 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Edit3, 
  Share2, 
  Camera,
  MessageSquare, 
  UserPlus, 
  Check, 
  Stethoscope,
  ExternalLink,
  Users
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
  const [coverUrl, setCoverUrl] = React.useState<string>(
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80"
  );
  const [isEditingCover, setIsEditingCover] = React.useState(false);
  const [newCoverInput, setNewCoverInput] = React.useState("");

  // Load custom cover from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined" && profile.user_id) {
      const savedCover = localStorage.getItem(`mgn_cover_${profile.user_id}`);
      if (savedCover) setCoverUrl(savedCover);
    }
  }, [profile.user_id]);

  const handleSaveCover = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCoverInput.trim()) {
      setCoverUrl(newCoverInput.trim());
      localStorage.setItem(`mgn_cover_${profile.user_id}`, newCoverInput.trim());
    }
    setIsEditingCover(false);
  };

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
    <div className="relative rounded-3xl bg-white shadow-xs border border-[#e8e6e3] overflow-hidden mb-4 sm:mb-5">
      {/* 1. LinkedIn-Style Cover Banner */}
      <div className="relative h-28 sm:h-36 lg:h-44 w-full overflow-hidden bg-gradient-to-r from-teal-900 via-emerald-800 to-cyan-900">
        <img
          src={coverUrl}
          alt="Profile Cover"
          className="h-full w-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Edit Cover Trigger for Own Profile */}
        {isOwnProfile && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-5">
            <button
              type="button"
              onClick={() => {
                setNewCoverInput(coverUrl);
                setIsEditingCover(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] sm:text-xs font-semibold text-white border border-white/30 transition-all hover:bg-black/60 active:scale-95 shadow-md"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Edit Cover</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Cover Modal */}
      {isEditingCover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#e8e6e3]">
            <h3 className="text-base font-bold text-[#171717] mb-1">Customize Cover Banner</h3>
            <p className="text-xs text-[#77716b] mb-4">
              Enter an image URL for your profile cover.
            </p>
            <form onSubmit={handleSaveCover} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5d5854] mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newCoverInput}
                  onChange={(e) => setNewCoverInput(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] px-3 py-2 text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#1769c2]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCover(false)}
                  className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#12569f]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Main Profile Details Section */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-5">
        {/* TOP ROW: Overlapping Avatar + 4 Stats (Posts, Followers, Following, Connections) */}
        <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3.5">
          {/* Avatar with Story Ring overlapping cover */}
          <div className="relative shrink-0 -mt-10 sm:-mt-12 lg:-mt-14 z-10">
            <div className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 shadow-md">
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
            {/* Online Green Indicator Dot */}
            <span
              className="absolute bottom-1 right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs"
              title="Online & Verified"
            />
          </div>

          {/* 4 Stats: Posts, Followers, Following, Connections - shifted down comfortably */}
          <div className="flex-1 flex items-center justify-around text-center max-w-md sm:max-w-lg ml-1 sm:ml-4 pt-5 sm:pt-6 pb-2">
            <div className="cursor-pointer hover:opacity-80 transition-opacity">
              <span className="block text-sm sm:text-base lg:text-lg font-black text-[#171717] tracking-tight leading-none mb-1">
                {(profile.post_count ?? 142).toLocaleString()}
              </span>
              <span className="text-[11px] sm:text-xs text-[#5d5854] font-medium leading-none">posts</span>
            </div>

            <div className="cursor-pointer hover:opacity-80 transition-opacity">
              <span className="block text-sm sm:text-base lg:text-lg font-black text-[#171717] tracking-tight leading-none mb-1">
                {formatCount(profile.follower_count ?? 1240)}
              </span>
              <span className="text-[11px] sm:text-xs text-[#5d5854] font-medium leading-none">followers</span>
            </div>

            <div className="cursor-pointer hover:opacity-80 transition-opacity">
              <span className="block text-sm sm:text-base lg:text-lg font-black text-[#171717] tracking-tight leading-none mb-1">
                {formatCount(profile.following_count ?? 320)}
              </span>
              <span className="text-[11px] sm:text-xs text-[#5d5854] font-medium leading-none">following</span>
            </div>

            <div className="cursor-pointer hover:opacity-80 transition-opacity">
              <span className="block text-sm sm:text-base lg:text-lg font-black text-[#1769c2] tracking-tight leading-none mb-1">
                {formatCount(profile.connection_count ?? 584)}
              </span>
              <span className="text-[11px] sm:text-xs text-[#5d5854] font-medium leading-none">connections</span>
            </div>
          </div>
        </div>

        {/* 3. NAME, PROFESSION, BIO & LINKS */}
        <div className="space-y-1 mb-3.5">
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

          {/* Location & Links */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#171717] pt-0.5">
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
            {profile.experience_years !== undefined && profile.experience_years > 0 && (
              <span className="text-[#77716b]">
                · <strong>{profile.experience_years} yrs</strong> experience
              </span>
            )}
          </div>

          {/* Specialty Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
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

        {/* 4. ACTION BUTTONS ROW (Instagram / LinkedIn Hybrid Style) */}
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
              <ConnectionButton
                targetUserId={profile.user_id}
                initialStatus={connectionStatus}
                onStatusChange={onStatusChange}
                onConnectClick={onConnectClick}
                size="md"
              />
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
          )}
        </div>
      </div>
    </div>
  );
}
