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
  Users,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MemberBadge } from "@/modules/network/components/MemberBadge";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";
import { ConnectionButton } from "@/modules/network/components/ConnectionButton";
import type { ProfessionalProfile, ConnectionStatus } from "@/modules/network/types";
import { getProfessionColor } from "@/modules/network/lib/network-data";
import { DEFAULT_BLANK_AVATAR, isGoogleOrExternalAvatar, setUserCustomCover, setUserCustomAvatar } from "@/lib/avatar";
import { ImageSelectorModal } from "@/components/media/ImageSelectorModal";

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

const COVER_PRESETS = [
  { label: "Modern Hospital", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&auto=format&fit=crop&q=80" },
  { label: "Clinical Lab", url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&auto=format&fit=crop&q=80" },
  { label: "Surgical Suite", url: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1600&auto=format&fit=crop&q=80" },
  { label: "Teal Gradient", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80" },
  { label: "Deep Blue Tech", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&auto=format&fit=crop&q=80" },
  { label: "Wellness Clinic", url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&auto=format&fit=crop&q=80" }
];

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
  const router = useRouter();
  const [coverUrl, setCoverUrl] = React.useState<string>(
    profile.cover_image_url ||
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80"
  );
  const [avatarUrl, setAvatarUrl] = React.useState<string>(profile.image || "");
  const [showCoverModal, setShowCoverModal] = React.useState(false);
  const [showAvatarModal, setShowAvatarModal] = React.useState(false);

  // Sync state with props & localStorage
  React.useEffect(() => {
    if (profile.cover_image_url) {
      setCoverUrl(profile.cover_image_url);
    } else if (typeof window !== "undefined" && profile.user_id) {
      const savedCover = localStorage.getItem(`mgn_cover_${profile.user_id}`);
      if (savedCover) setCoverUrl(savedCover);
    }

    if (profile.image) {
      setAvatarUrl(profile.image);
    } else if (typeof window !== "undefined") {
      const customAvatar = isOwnProfile
        ? localStorage.getItem("mgn_user_custom_avatar")
        : localStorage.getItem(`mgn_avatar_${profile.user_id}`);
      if (customAvatar) setAvatarUrl(customAvatar);
    }
  }, [profile.cover_image_url, profile.image, profile.user_id, isOwnProfile]);

  const handleUpdateCover = async (newUrl: string) => {
    setCoverUrl(newUrl);
    if (profile.user_id) {
      setUserCustomCover(profile.user_id, newUrl);
    }

    // Persist to server
    try {
      await fetch("/api/network/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cover_image_url: newUrl }),
      });
    } catch (err) {
      console.error("Failed to persist cover image to DB:", err);
    }
  };

  const handleUpdateAvatar = async (newUrl: string) => {
    setAvatarUrl(newUrl);
    setUserCustomAvatar(newUrl);

    // Persist to server
    try {
      await fetch("/api/network/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: newUrl }),
      });
    } catch (err) {
      console.error("Failed to persist avatar to DB:", err);
    }
  };

  const isVerified =
    profile.identity_verified ||
    profile.education_verified ||
    profile.registration_verified ||
    profile.experience_verified;

  const color = getProfessionColor(profile.profession);
  const tags = profile.skills && profile.skills.length > 0 ? profile.skills : [];

  const formatCount = (count?: number) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  return (
    <>
      <div className="relative rounded-3xl bg-white shadow-xs border border-[#e8e6e3] overflow-hidden mb-4 sm:mb-5">
        {/* 1. Cover Banner */}
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
                onClick={() => setShowCoverModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-white border border-white/30 transition-all hover:bg-black/60 active:scale-95 shadow-md"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Edit Cover</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Main Profile Details Section */}
        <div className="px-4 sm:px-5 pb-3.5 sm:pb-4">
          {/* TOP ROW: Overlapping Avatar + 4 Stats (Posts, Followers, Following, Connections) */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-2">
            {/* Avatar with Story Ring overlapping cover */}
            <div className="relative shrink-0 -mt-10 sm:-mt-12 lg:-mt-14 z-10 group">
              <div className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 shadow-md">
                <div
                  className="h-full w-full rounded-full overflow-hidden flex items-center justify-center bg-slate-100 border-2 border-white relative"
                >
                  <img
                    src={avatarUrl || DEFAULT_BLANK_AVATAR}
                    alt={profile.name || "User Avatar"}
                    className="h-full w-full object-cover"
                  />
                  {/* Camera overlay on hover for own profile */}
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => setShowAvatarModal(true)}
                      aria-label="Change Profile Picture"
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full text-white"
                    >
                      <Camera className="h-5 w-5 drop-shadow" />
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Avatar button (floating for touch screens) */}
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute bottom-0 right-0 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#1769c2] text-white ring-2 ring-white shadow-md hover:bg-[#12569f] transition"
                  title="Change Profile Photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Online Green Indicator Dot if not editing */}
              {!isOwnProfile && (
                <span
                  className="absolute bottom-1 right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs"
                  title="Online & Verified"
                />
              )}
            </div>

            {/* 4 Stats: Posts, Followers, Following, Connections */}
            <div className="flex-1 flex items-center justify-around text-center max-w-md sm:max-w-lg ml-1 sm:ml-4 pt-1 sm:pt-2">
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <span className="block text-sm sm:text-base lg:text-lg font-black text-[#171717] tracking-tight leading-none mb-0.5">
                  {(profile.post_count ?? 0).toLocaleString()}
                </span>
                <span className="text-[11px] sm:text-xs text-[#5d5854] font-medium leading-none">posts</span>
              </div>

              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <span className="block text-sm sm:text-base lg:text-lg font-black text-[#171717] tracking-tight leading-none mb-0.5">
                  {formatCount(profile.follower_count ?? 0)}
                </span>
                <span className="text-[11px] sm:text-xs text-[#5d5854] font-medium leading-none">followers</span>
              </div>

              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <span className="block text-sm sm:text-base lg:text-lg font-black text-[#171717] tracking-tight leading-none mb-0.5">
                  {formatCount(profile.following_count ?? 0)}
                </span>
                <span className="text-[11px] sm:text-xs text-[#5d5854] font-medium leading-none">following</span>
              </div>

              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <span className="block text-sm sm:text-base lg:text-lg font-black text-[#1769c2] tracking-tight leading-none mb-0.5">
                  {formatCount(profile.connection_count ?? 0)}
                </span>
                <span className="text-[11px] sm:text-xs text-[#5d5854] font-medium leading-none">connections</span>
              </div>
            </div>
          </div>

          {/* 3. NAME, PROFESSION, BIO & LINKS */}
          <div className="space-y-1.5 mb-2.5 sm:mb-3">
            {/* Name with Blue Verification Badge & Member ID Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-[#171717] tracking-tight leading-none">
                {profile.name || "Medical Professional"}
              </h1>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 leading-none">
                  <ShieldCheck className="h-3 w-3" /> Verified Clinician
                </span>
              ) : (
                <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500 text-white shrink-0" />
              )}
              {/* Unique Member ID Badge */}
              <MemberBadge
                memberId={profile.member_id}
                isFoundingMember={profile.is_founding_member}
                membershipTier={profile.membership_tier}
                size="sm"
                variant={profile.is_founding_member ? "full" : "pill"}
              />
            </div>

            {/* Handle & Profession & Specialization */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#5d5854]">
              {profile.username && (
                <span className="font-mono font-semibold text-[#1769c2]">
                  @{profile.username}
                </span>
              )}
              {(profile.designation || profile.profession || profile.specialization) ? (
                <p className="font-semibold leading-snug">
                  {profile.username ? "· " : ""}
                  {profile.designation ? `${profile.designation} · ` : ""}
                  {profile.profession || ""}
                  {profile.specialization ? ` (${profile.specialization})` : ""}
                </p>
              ) : isOwnProfile ? (
                <button
                  type="button"
                  onClick={onEditProfileClick}
                  className="text-xs font-semibold text-[#1769c2] hover:underline"
                >
                  · + Add designation & specialty
                </button>
              ) : null}
            </div>

            {/* Bio Text */}
            {profile.bio ? (
              <p className="text-xs sm:text-sm text-[#262626] leading-snug">
                {profile.bio}
              </p>
            ) : isOwnProfile ? (
              <button
                type="button"
                onClick={onEditProfileClick}
                className="text-xs text-[#1769c2] font-semibold hover:underline inline-flex items-center gap-1 py-0.5"
              >
                <span>+ Add your clinical bio & background</span>
              </button>
            ) : (
              <p className="text-xs text-[#8a8784] italic">No bio provided yet.</p>
            )}

            {/* Location & Links (only if present) */}
            {(profile.city || profile.state || profile.organization || (profile.experience_years !== undefined && profile.experience_years > 0)) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#171717]">
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
            )}

            {/* Specialty Tag Pills */}
            {tags.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
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
            ) : isOwnProfile ? (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={onEditProfileClick}
                  className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#cbdff7] bg-[#f4f8fe] px-2.5 py-1 text-[11px] font-semibold text-[#1769c2] hover:bg-[#eef5fc] transition"
                >
                  <span>+ Add Clinical Specialties & Skills</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* 4. ACTION BUTTONS ROW (Instagram / Modern Social Style) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isOwnProfile ? (
              <>
                <button
                  type="button"
                  onClick={onEditProfileClick}
                  className="flex-1 min-w-0 h-9 sm:h-10 rounded-xl bg-[#efefef] hover:bg-[#e4e4e4] px-2 sm:px-3 text-xs sm:text-sm font-bold text-[#171717] truncate whitespace-nowrap flex items-center justify-center transition active:scale-98 text-center"
                >
                  Edit profile
                </button>
                <button
                  type="button"
                  onClick={onOpenKnowMore}
                  className="flex-1 min-w-0 h-9 sm:h-10 rounded-xl bg-[#efefef] hover:bg-[#e4e4e4] px-2 sm:px-3 text-xs sm:text-sm font-bold text-[#171717] truncate whitespace-nowrap flex items-center justify-center transition active:scale-98 text-center"
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
                  className={`flex-1 min-w-0 h-9 sm:h-10 rounded-xl px-2 sm:px-3 text-xs sm:text-sm font-bold truncate whitespace-nowrap flex items-center justify-center transition active:scale-98 text-center ${
                    isFollowing
                      ? "bg-[#efefef] hover:bg-[#e4e4e4] text-[#171717]"
                      : "bg-[#1769c2] hover:bg-[#12569f] text-white shadow-xs"
                  }`}
                >
                  {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
                <ConnectionButton
                  targetUserId={profile.user_id}
                  initialStatus={connectionStatus}
                  onStatusChange={onStatusChange}
                  onConnectClick={onConnectClick}
                  size="md"
                  className="flex-1 min-w-0 h-9 sm:h-10 rounded-xl px-2 sm:px-3 text-xs sm:text-sm font-bold truncate whitespace-nowrap flex items-center justify-center transition active:scale-98 text-center"
                />
                <button
                  type="button"
                  onClick={() => router.push(`/messages?to=${profile.user_id}`)}
                  className="flex-1 min-w-0 h-9 sm:h-10 rounded-xl bg-[#efefef] hover:bg-[#e4e4e4] px-2 sm:px-3 text-xs sm:text-sm font-bold text-[#171717] truncate whitespace-nowrap flex items-center justify-center gap-1 transition active:scale-98 text-center"
                  title="Direct Message"
                >
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#1769c2]" />
                  <span>Message</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenKnowMore}
                  className="hidden sm:flex flex-1 min-w-0 h-9 sm:h-10 rounded-xl bg-[#efefef] hover:bg-[#e4e4e4] px-2 sm:px-3 text-xs sm:text-sm font-bold text-[#171717] truncate whitespace-nowrap items-center justify-center transition active:scale-98 text-center"
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

      {/* Cover Selector Modal */}
      <ImageSelectorModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        title="Change Cover Banner"
        description="Select a professional medical banner or upload an image."
        currentImageUrl={coverUrl}
        folder="covers"
        aspectRatio="cover"
        presets={COVER_PRESETS}
        onSelect={handleUpdateCover}
        onRemove={() => handleUpdateCover("")}
      />

      {/* Avatar Selector Modal */}
      <ImageSelectorModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Change Profile Picture"
        description="Choose a high quality photo of yourself (Upload from device or enter web URL)."
        currentImageUrl={avatarUrl}
        folder="avatars"
        aspectRatio="square"
        onSelect={handleUpdateAvatar}
        onRemove={() => handleUpdateAvatar("")}
      />
    </>
  );
}
