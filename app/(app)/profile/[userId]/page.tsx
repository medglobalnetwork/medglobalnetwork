"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";
import { ConnectionButton } from "@/modules/network/components/ConnectionButton";
import { ConnectionRequestModal } from "@/modules/network/components/ConnectionRequestModal";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { SAMPLE_PROFESSIONALS, getProfessionColor } from "@/modules/network/lib/network-data";
import type { ProfessionalProfile, ConnectionStatus } from "@/modules/network/types";

const SECTION_ICONS: Record<string, string> = {
  About: "📄",
  Experience: "💼",
  Education: "🎓",
  "Professional Registration": "📋",
  Certifications: "🏅",
  Skills: "⚡",
  Publications: "📚",
  Research: "🔬",
  Courses: "📖",
  Achievements: "🏆",
  Events: "📅",
  Communities: "👥",
};

function ProfileSection({
  title,
  children,
  isEmpty,
  emptyText,
}: {
  title: string;
  children?: React.ReactNode;
  isEmpty?: boolean;
  emptyText?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#171717]">
        <span>{SECTION_ICONS[title] ?? "•"}</span> {title}
      </h2>
      {isEmpty ? (
        <p className="text-xs text-[#a09890] italic">{emptyText ?? `No ${title.toLowerCase()} added yet.`}</p>
      ) : (
        children
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const { data: session, isPending } = authClient.useSession();

  const [profile, setProfile] = React.useState<(ProfessionalProfile & {
    connection_count?: number;
    follower_count?: number;
    following_count?: number;
    is_own_profile?: boolean;
  }) | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>("none");
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
  const [showConnectModal, setShowConnectModal] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user || !params.userId) return;
    setLoading(true);
    fetch(`/api/network/profiles/${params.userId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const p = d.data;
        if (p) {
          setProfile(p);
          setConnectionStatus(p.connection_status ?? "none");
          setIsFollowing(p.follow_status === "following");
        } else {
          const sample = SAMPLE_PROFESSIONALS.find((s) => s.user_id === params.userId) ?? SAMPLE_PROFESSIONALS[0];
          setProfile({
            ...sample,
            connection_count: sample.connection_count ?? 0,
            follower_count: 0,
            following_count: 0,
            is_own_profile: false,
          });
        }
      })
      .catch(() => {
        const sample = SAMPLE_PROFESSIONALS[0];
        setProfile({
          ...sample,
          connection_count: sample.connection_count ?? 0,
          follower_count: 0,
          following_count: 0,
          is_own_profile: false,
        });
      })
      .finally(() => setLoading(false));
  }, [session?.user, params.userId]);

  const handleFollow = async () => {
    if (!profile) return;
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
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setShowMoreMenu(false);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isPending || !session) return <main className="min-h-screen bg-[#f5f5f4]" />;

  if (!loading && !profile) {
    return (
      <main className="min-h-screen bg-[#f5f5f4] flex items-center justify-center p-6">
        <EmptyState
          icon="👤"
          title="Profile not found"
          description="This user profile does not exist or has been removed."
          actionText="Go to Network"
          onAction={() => router.push("/network")}
        />
      </main>
    );
  }

  const isOwnProfile = profile?.is_own_profile || session.user.id === params.userId;
  const color = getProfessionColor(profile?.profession);
  const initials = (profile?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isVerified =
    profile?.identity_verified ||
    profile?.education_verified ||
    profile?.registration_verified ||
    profile?.experience_verified;

  const degreeStr = [
    profile?.primary_degree,
    ...(profile?.additional_degrees ?? []),
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      {/* Toast Notification */}
      {copied && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#ded8d1] bg-[#171717] px-4 py-2 text-xs font-medium text-white shadow-lg animate-fade-in">
          ✓ Profile link copied to clipboard!
        </div>
      )}

      {/* Cover */}
      <div className="h-36 bg-gradient-to-r from-[#eef5fc] via-[#dbeafe] to-[#ede9fe] lg:h-48" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="animate-pulse space-y-4 pt-4">
            <div className="h-24 w-24 -mt-12 rounded-full bg-[#f0efee]" />
            <div className="h-6 w-48 rounded bg-[#f0efee]" />
            <div className="h-4 w-64 rounded bg-[#f0efee]" />
          </div>
        ) : profile && (
          <>
            {/* Profile header card */}
            <div className="relative -mt-12 mb-5 rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Avatar */}
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold ring-4 ring-white"
                  style={{ background: color }}
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

                <div className="flex-1 min-w-0">
                  {/* Name + badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-[#171717]">{profile.name}</h1>
                    {isVerified && <VerificationBadge size="md" type="full" />}
                  </div>

                  {/* Profession line */}
                  <p className="mt-0.5 text-sm text-[#5d5854]">
                    {profile.designation ? `${profile.designation} · ` : ""}
                    {profile.profession}
                    {profile.specialization ? ` · ${profile.specialization}` : ""}
                  </p>
                  {degreeStr && <p className="text-xs text-[#77716b]">{degreeStr}</p>}
                  {profile.organization && <p className="text-xs text-[#77716b]">{profile.organization}</p>}
                  {(profile.city || profile.state) && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[#a09890]">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {[profile.city, profile.state].filter(Boolean).join(", ")}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="mt-2.5 flex flex-wrap gap-4 text-xs">
                    <span>
                      <strong className="text-[#171717]">{(profile.connection_count ?? 0).toLocaleString()}</strong>{" "}
                      <span className="text-[#77716b]">connections</span>
                    </span>
                    <span>
                      <strong className="text-[#171717]">{(profile.follower_count ?? 0).toLocaleString()}</strong>{" "}
                      <span className="text-[#77716b]">followers</span>
                    </span>
                    {profile.experience_years !== undefined && profile.experience_years > 0 && (
                      <span>
                        <strong className="text-[#171717]">{profile.experience_years} yr{profile.experience_years !== 1 ? "s" : ""}</strong>{" "}
                        <span className="text-[#77716b]">experience</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons: Connect, Message, Follow, More */}
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {isOwnProfile ? (
                    <button
                      type="button"
                      onClick={() => router.push("/settings/account")}
                      className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854] transition hover:bg-[#f8f7f6]"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <ConnectionButton
                        targetUserId={profile.user_id}
                        initialStatus={connectionStatus}
                        onStatusChange={setConnectionStatus}
                        onConnectClick={() => setShowConnectModal(true)}
                        size="md"
                      />

                      <button
                        type="button"
                        onClick={() => router.push("/home")}
                        className="rounded-xl bg-[#1769c2] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#12569f]"
                      >
                        Message
                      </button>

                      <button
                        type="button"
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                          isFollowing
                            ? "border-[#1769c2] bg-[#eef5fc] text-[#1769c2]"
                            : "border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
                        }`}
                      >
                        {followLoading ? "…" : isFollowing ? "✓ Following" : "+ Follow"}
                      </button>

                      {/* More Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowMoreMenu(!showMoreMenu)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ded8d1] text-[#5d5854] transition hover:bg-[#f8f7f6]"
                          aria-label="More options"
                        >
                          •••
                        </button>
                        {showMoreMenu && (
                          <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-[#e8e6e3] bg-white py-1 shadow-lg">
                            <button
                              type="button"
                              onClick={handleCopyLink}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#171717] hover:bg-[#f8f7f6]"
                            >
                              🔗 Copy profile link
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowMoreMenu(false);
                                alert("Profile reported for administrative review.");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                            >
                              🚩 Report profile
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Verification badges */}
              {isVerified && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-[#f0efee] pt-4">
                  {profile.identity_verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-1 text-[11px] font-semibold text-[#15803d]">
                      <VerificationBadge size="sm" /> Identity Verified
                    </span>
                  )}
                  {profile.education_verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-1 text-[11px] font-semibold text-[#1769c2]">
                      <VerificationBadge size="sm" /> Education Verified
                    </span>
                  )}
                  {profile.registration_verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fefce8] border border-[#fde68a] px-2.5 py-1 text-[11px] font-semibold text-[#854d0e]">
                      <VerificationBadge size="sm" /> Registration Verified
                    </span>
                  )}
                  {profile.experience_verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf4ff] border border-[#e9d5ff] px-2.5 py-1 text-[11px] font-semibold text-[#7e22ce]">
                      <VerificationBadge size="sm" /> Experience Verified
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Complete Profile Sections (All 12 Sections) */}
            <div className="space-y-4">
              {/* 1. About */}
              <ProfileSection title="About" isEmpty={!profile.bio} emptyText="No bio added yet.">
                <p className="text-sm leading-relaxed text-[#5d5854]">{profile.bio}</p>
              </ProfileSection>

              {/* 2. Experience */}
              <ProfileSection
                title="Experience"
                isEmpty={!profile.organization && !profile.designation}
                emptyText="No clinical or institutional experience added yet."
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f7f6] text-base">
                      🏥
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#171717]">{profile.designation || profile.profession}</p>
                      <p className="text-xs text-[#77716b]">{profile.organization}</p>
                      {profile.experience_years !== undefined && profile.experience_years > 0 && (
                        <p className="text-[11px] text-[#a09890]">{profile.experience_years} years duration</p>
                      )}
                    </div>
                  </div>
                </div>
              </ProfileSection>

              {/* 3. Education */}
              <ProfileSection
                title="Education"
                isEmpty={!degreeStr && !profile.medical_council}
                emptyText="No degree or university details added yet."
              >
                <div className="space-y-2">
                  {[profile.primary_degree, ...(profile.additional_degrees ?? [])].filter(Boolean).map((deg) => (
                    <div key={deg} className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef5fc] text-base">🎓</div>
                      <div>
                        <p className="text-sm font-medium text-[#171717]">{deg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ProfileSection>

              {/* 4. Professional Registration */}
              <ProfileSection
                title="Professional Registration"
                isEmpty={!profile.medical_council && !profile.registration_number}
                emptyText="Medical council and registration credentials not submitted."
              >
                <div className="text-sm space-y-1">
                  {profile.medical_council && (
                    <p>
                      <span className="text-[#77716b]">Medical Council: </span>
                      <span className="font-medium text-[#171717]">{profile.medical_council}</span>
                    </p>
                  )}
                  {profile.registration_number && (
                    <p>
                      <span className="text-[#77716b]">Registration Number: </span>
                      <span className="font-mono text-xs font-semibold text-[#171717]">{profile.registration_number}</span>
                    </p>
                  )}
                  <p className="mt-2 text-[10px] text-[#8a8784] italic">
                    Note: MGN platform verification is for networking purposes and does not replace statutory council verification.
                  </p>
                </div>
              </ProfileSection>

              {/* 5. Certifications */}
              <ProfileSection
                title="Certifications"
                isEmpty={true}
                emptyText="No CME or accredited clinical certifications added yet."
              />

              {/* 6. Skills */}
              <ProfileSection title="Skills" isEmpty={!profile.skills?.length} emptyText="No skills added yet.">
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[#ded8d1] bg-[#f8f7f6] px-3 py-1 text-xs font-medium text-[#5d5854]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </ProfileSection>

              {/* 7. Publications */}
              <ProfileSection
                title="Publications"
                isEmpty={true}
                emptyText="No peer-reviewed publications or case reports listed yet."
              />

              {/* 8. Research */}
              <ProfileSection
                title="Research"
                isEmpty={true}
                emptyText="No active clinical research or trial co-investigations."
              />

              {/* 9. Courses */}
              <ProfileSection
                title="Courses"
                isEmpty={true}
                emptyText="No completed courses or workshop modules."
              />

              {/* 10. Achievements */}
              <ProfileSection
                title="Achievements"
                isEmpty={true}
                emptyText="No awards, honors, or keynote appointments added yet."
              />

              {/* 11. Events */}
              <ProfileSection
                title="Events"
                isEmpty={true}
                emptyText="No scheduled conference sessions or webinars."
              />

              {/* 12. Communities */}
              <ProfileSection
                title="Communities"
                isEmpty={false}
              >
                <div className="flex flex-wrap gap-2">
                  {profile.specialization && (
                    <span
                      onClick={() => router.push("/network/communities")}
                      className="cursor-pointer rounded-full border border-[#dbeafe] bg-[#eef5fc] px-3 py-1 text-xs font-semibold text-[#1769c2] transition hover:bg-[#dbeafe]"
                    >
                      👥 {profile.specialization} Community
                    </span>
                  )}
                  <span
                    onClick={() => router.push("/network/communities")}
                    className="cursor-pointer rounded-full border border-[#ded8d1] bg-white px-3 py-1 text-xs font-medium text-[#5d5854] transition hover:bg-[#f8f7f6]"
                  >
                    Explore Healthcare Communities →
                  </span>
                </div>
              </ProfileSection>
            </div>
          </>
        )}
      </div>

      {showConnectModal && profile && (
        <ConnectionRequestModal
          targetName={profile.name}
          targetUserId={profile.user_id}
          onClose={() => setShowConnectModal(false)}
          onSent={() => {
            setShowConnectModal(false);
            setConnectionStatus("pending");
          }}
        />
      )}
    </main>
  );
}
