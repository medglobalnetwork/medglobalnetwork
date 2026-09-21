"use client";

import * as React from "react";
import { 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Camera, 
  Edit3, 
  Share2, 
  MoreHorizontal, 
  MessageSquare, 
  UserPlus, 
  Check, 
  ExternalLink,
  Award,
  Stethoscope
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
  const [quoteText, setQuoteText] = React.useState<string>("Healing Movement, Better Lives");
  const [isEditingCover, setIsEditingCover] = React.useState(false);
  const [newCoverInput, setNewCoverInput] = React.useState("");
  const [newQuoteInput, setNewQuoteInput] = React.useState("");

  // Load custom cover & quote from localStorage if customized
  React.useEffect(() => {
    if (typeof window !== "undefined" && profile.user_id) {
      const savedCover = localStorage.getItem(`mgn_cover_${profile.user_id}`);
      if (savedCover) setCoverUrl(savedCover);
      const savedQuote = localStorage.getItem(`mgn_quote_${profile.user_id}`);
      if (savedQuote) setQuoteText(savedQuote);
    }
  }, [profile.user_id]);

  const handleSaveCover = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCoverInput.trim()) {
      setCoverUrl(newCoverInput.trim());
      localStorage.setItem(`mgn_cover_${profile.user_id}`, newCoverInput.trim());
    }
    if (newQuoteInput.trim()) {
      setQuoteText(newQuoteInput.trim());
      localStorage.setItem(`mgn_quote_${profile.user_id}`, newQuoteInput.trim());
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

  return (
    <div className="relative rounded-3xl bg-white shadow-sm border border-[#e8e6e3] overflow-hidden mb-4 sm:mb-5">
      {/* 1. Panoramic Mountain Cover Image with Overlay Quote */}
      <div className="relative h-28 sm:h-36 lg:h-44 w-full overflow-hidden bg-gradient-to-r from-teal-900 via-emerald-800 to-cyan-900">
        <img
          src={coverUrl}
          alt="Profile Cover"
          className="h-full w-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
        />
        
        {/* Soft Dark Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        {/* Inspirational Floating Motto / Quote */}
        {quoteText && (
          <div className="absolute top-3 left-4 sm:top-4 sm:left-6 max-w-md hidden xs:block">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 border border-white/15 text-[11px] sm:text-xs text-white/95 font-medium tracking-wide shadow-md">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>&ldquo;{quoteText}&rdquo;</span>
            </div>
          </div>
        )}

        {/* Edit Cover Action Button for Own Profile */}
        {isOwnProfile && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-5">
            <button
              type="button"
              onClick={() => {
                setNewCoverInput(coverUrl);
                setNewQuoteInput(quoteText);
                setIsEditingCover(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] sm:text-xs font-semibold text-white border border-white/30 transition-all hover:bg-white/30 hover:scale-105 active:scale-95 shadow-md"
            >
              <Camera className="h-3 w-3" />
              <span>Edit Cover</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Cover Edit Dialog Modal */}
      {isEditingCover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#e8e6e3]">
            <h3 className="text-base font-bold text-[#171717] mb-1">Customize Cover Header</h3>
            <p className="text-xs text-[#77716b] mb-4">
              Enter an image URL for your cover banner and set your inspirational professional motto.
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
              <div>
                <label className="block text-xs font-semibold text-[#5d5854] mb-1">
                  Cover Quote / Motto
                </label>
                <input
                  type="text"
                  placeholder="Healing Movement, Better Lives"
                  value={newQuoteInput}
                  onChange={(e) => setNewQuoteInput(e.target.value)}
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Main Profile Details Section */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 -mt-10 sm:-mt-12 lg:-mt-14 mb-3 sm:mb-4">
          {/* Avatar with Teal Ring & Online Dot */}
          <div className="flex items-end gap-3.5">
            <div className="relative group">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-full p-1 bg-white shadow-lg ring-3 sm:ring-4 ring-cyan-500/80">
                <div
                  className="h-full w-full rounded-full overflow-hidden flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white"
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
                className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-emerald-500 ring-2 sm:ring-3 ring-white shadow-sm"
                title="Online & Verified"
              />
            </div>

            {/* Quick Mobile Bio Info */}
            <div className="md:hidden pb-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-[#171717]">{profile.name}</h1>
                <CheckCircle2 className="h-4.5 w-4.5 text-blue-500 fill-blue-500 text-white shrink-0" />
              </div>
              <p className="text-[11px] font-medium text-[#5d5854] line-clamp-1">
                {profile.designation || profile.profession}
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {isOwnProfile ? (
              <>
                <button
                  type="button"
                  onClick={onEditProfileClick}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#12569f] active:scale-95"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenKnowMore}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-3.5 py-2 text-xs font-semibold text-[#5d5854] shadow-xs transition hover:bg-[#f8f7f6] active:scale-95"
                >
                  <Stethoscope className="h-3.5 w-3.5 text-[#1769c2]" />
                  <span>Know More</span>
                </button>
                <button
                  type="button"
                  onClick={onShareClick}
                  className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-[#ded8d1] bg-white text-[#5d5854] transition hover:bg-[#f8f7f6] active:scale-95"
                  title="Share Profile"
                >
                  <Share2 className="h-3.5 w-3.5" />
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
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition active:scale-95 disabled:opacity-50 ${
                    isFollowing
                      ? "border-[#1769c2] bg-[#eef5fc] text-[#1769c2]"
                      : "border-[#ded8d1] bg-white text-[#171717] hover:bg-[#f8f7f6]"
                  }`}
                >
                  {followLoading ? (
                    "..."
                  ) : isFollowing ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5 text-[#1769c2]" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onOpenKnowMore}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3.5 py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#f0efee] active:scale-95"
                >
                  <span>Know More</span>
                </button>
                <button
                  type="button"
                  onClick={onShareClick}
                  className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-[#ded8d1] bg-white text-[#5d5854] transition hover:bg-[#f8f7f6]"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Info Row (Desktop & Tablet) */}
        <div className="space-y-2">
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">{profile.name}</h1>
              <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500 text-white" />
              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Clinician
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[#5d5854]">
              {profile.designation ? `${profile.designation} · ` : ""}
              {profile.profession}
              {profile.specialization ? ` (${profile.specialization})` : ""}
            </p>
          </div>

          {/* Location & Organization */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#77716b]">
            {(profile.city || profile.state) && (
              <span className="inline-flex items-center gap-1 text-[#5d5854] font-medium">
                <MapPin className="h-3.5 w-3.5 text-[#1769c2]" />
                {[profile.city, profile.state].filter(Boolean).join(", ")}
              </span>
            )}
            {profile.organization && (
              <span>
                Affiliated with <strong className="text-[#171717]">{profile.organization}</strong>
              </span>
            )}
            {profile.experience_years !== undefined && profile.experience_years > 0 && (
              <span>
                <strong className="text-[#171717]">{profile.experience_years} years</strong> active practice
              </span>
            )}
          </div>

          {/* Bio snippet */}
          <p className="text-xs sm:text-sm text-[#44403c] leading-relaxed max-w-3xl">
            {profile.bio ||
              "Specialized in Clinical Healthcare, Rehabilitation & Patient Wellness. Helping patients regain strength & health with evidence-based modern medical practices."}
          </p>

          {/* Specialty Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {tags.slice(0, 5).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg bg-[#f0f4f8] px-2.5 py-1 text-xs font-semibold text-[#1769c2] border border-[#d8e5f2]"
              >
                {tag}
              </span>
            ))}
            {tags.length > 5 && (
              <span className="inline-flex items-center rounded-lg bg-[#f8f7f6] px-2 py-1 text-xs font-bold text-[#77716b] border border-[#e8e6e3]">
                +{tags.length - 5}
              </span>
            )}
          </div>

          {/* Key Stats Strip */}
          <div className="flex items-center gap-6 sm:gap-8 pt-3 border-t border-[#f0efee] text-xs">
            <div>
              <span className="block text-base font-extrabold text-[#171717]">
                {(profile.post_count ?? 142).toLocaleString()}
              </span>
              <span className="text-[#77716b] text-[11px] font-medium">Posts</span>
            </div>
            <div>
              <span className="block text-base font-extrabold text-[#171717]">
                {(profile.connection_count ?? 584).toLocaleString()}
              </span>
              <span className="text-[#77716b] text-[11px] font-medium">Connections</span>
            </div>
            <div>
              <span className="block text-base font-extrabold text-[#171717]">
                {(profile.follower_count ?? 1240).toLocaleString()}
              </span>
              <span className="text-[#77716b] text-[11px] font-medium">Followers</span>
            </div>
            <div>
              <span className="block text-base font-extrabold text-[#171717]">
                {(profile.following_count ?? 320).toLocaleString()}
              </span>
              <span className="text-[#77716b] text-[11px] font-medium">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
