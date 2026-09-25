"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Share2, 
  Sparkles, 
  Award, 
  BookOpen, 
  Users, 
  Compass, 
  TrendingUp, 
  ShieldCheck, 
  FileText,
  ExternalLink,
  ChevronRight,
  Hash,
  Edit3
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { ConnectionRequestModal } from "@/modules/network/components/ConnectionRequestModal";
import { ProfileHeader } from "@/modules/network/components/ProfileHeader";
import { ProfileHighlights } from "@/modules/network/components/ProfileHighlights";
import { ProfileContentGrid } from "@/modules/network/components/ProfileContentGrid";
import { KnowMoreDrawer } from "@/modules/network/components/KnowMoreDrawer";
import { EditProfileModal } from "@/modules/network/components/EditProfileModal";
import type { ProfessionalProfile, ConnectionStatus } from "@/modules/network/types";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const { data: session, isPending } = authClient.useSession();

  const [profile, setProfile] = React.useState<(ProfessionalProfile & {
    connection_count?: number;
    follower_count?: number;
    following_count?: number;
    is_own_profile?: boolean;
    post_count?: number;
  }) | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>("none");
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
  const [showConnectModal, setShowConnectModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showKnowMoreDrawer, setShowKnowMoreDrawer] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

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

          // Update URL bar to clean GitHub-style username slug if available
          if (p.username && typeof window !== "undefined" && window.location.pathname !== `/profile/${p.username}`) {
            window.history.replaceState(null, "", `/profile/${p.username}`);
          }
        } else {
          // Check if requested slug matches current session user
          const paramId = (params.userId || "").toLowerCase().trim();
          const strippedParam = paramId.replace(/[^a-z0-9]/g, "");
          const isSelf =
            session.user.id === params.userId ||
            paramId === "me" ||
            paramId === "self" ||
            (session.user.name || "").toLowerCase().trim() === paramId ||
            (session.user.name || "").toLowerCase().replace(/[^a-z0-9]/g, "") === strippedParam ||
            (session.user.email || "").split("@")[0].toLowerCase().trim() === paramId ||
            (session.user.email || "").split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") === strippedParam;

          if (isSelf) {
            setProfile({
              id: session.user.id,
              user_id: session.user.id,
              username: session.user.email?.split("@")[0] || "user",
              name: session.user.name || "Medical Professional",
              email: session.user.email || "",
              image: session.user.image || "",
              profession: "Physiotherapy",
              designation: undefined,
              specialization: undefined,
              organization: undefined,
              medical_council: undefined,
              registration_number: undefined,
              primary_degree: undefined,
              additional_degrees: undefined,
              experience_years: 0,
              bio: undefined,
              city: undefined,
              state: undefined,
              country: "India",
              skills: [],
              identity_verified: false,
              education_verified: false,
              registration_verified: false,
              experience_verified: false,
              connection_count: 0,
              follower_count: 0,
              following_count: 0,
              post_count: 0,
              is_own_profile: true,
            });
          } else {
            setProfile(null);
          }
        }
      })
      .catch(() => {
        const paramId = (params.userId || "").toLowerCase().trim();
        const strippedParam = paramId.replace(/[^a-z0-9]/g, "");
        const isSelf =
          session.user.id === params.userId ||
          paramId === "me" ||
          paramId === "self" ||
          (session.user.name || "").toLowerCase().trim() === paramId ||
          (session.user.name || "").toLowerCase().replace(/[^a-z0-9]/g, "") === strippedParam ||
          (session.user.email || "").split("@")[0].toLowerCase().trim() === paramId ||
          (session.user.email || "").split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") === strippedParam;

        if (isSelf) {
          setProfile({
            id: session.user.id,
            user_id: session.user.id,
            username: session.user.email?.split("@")[0] || "user",
            name: session.user.name || "Medical Professional",
            email: session.user.email || "",
            image: session.user.image || "",
            profession: "Physiotherapy",
            experience_years: 0,
            skills: [],
            identity_verified: false,
            education_verified: false,
            registration_verified: false,
            experience_verified: false,
            connection_count: 0,
            follower_count: 0,
            following_count: 0,
            post_count: 0,
            is_own_profile: true,
          });
        } else {
          setProfile(null);
        }
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
      // Optimistic toggle fallback
      setIsFollowing(!isFollowing);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      const cleanUrl = `${window.location.origin}/profile/${profile?.username || profile?.user_id}`;
      navigator.clipboard.writeText(cleanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSaveProfileUpdates = (updated: Partial<ProfessionalProfile>) => {
    if (profile) {
      const merged = { ...profile, ...updated };
      setProfile(merged);
      // Persist to localStorage for client-side demo persistence
      if (typeof window !== "undefined") {
        localStorage.setItem(`mgn_profile_${profile.user_id}`, JSON.stringify(merged));
      }
    }
  };

  if (isPending || !session) return <main className="min-h-dvh bg-[#f5f5f4]" />;

  if (!loading && !profile) {
    return (
      <main className="min-h-dvh bg-[#f5f5f4] flex items-center justify-center p-6">
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

  return (
    <main className="min-h-dvh bg-[#f8f7f6] pb-28 text-[#171717]">
      {/* Toast Notification */}
      {copied && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#ded8d1] bg-[#171717] px-5 py-2.5 text-xs font-bold text-white shadow-xl animate-fade-in flex items-center gap-2">
          <span>✓</span>
          <span>Profile link copied to clipboard!</span>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-48 sm:h-64 rounded-3xl bg-[#e8e6e3]" />
            <div className="h-24 rounded-3xl bg-[#e8e6e3]" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 h-96 rounded-3xl bg-[#e8e6e3]" />
              <div className="lg:col-span-4 h-96 rounded-3xl bg-[#e8e6e3]" />
            </div>
          </div>
        ) : profile && (
          <>
            {/* 1. Instagram-Style Header */}
            <ProfileHeader
              profile={profile}
              isOwnProfile={isOwnProfile}
              connectionStatus={connectionStatus}
              onStatusChange={setConnectionStatus}
              onConnectClick={() => setShowConnectModal(true)}
              isFollowing={isFollowing}
              onFollowToggle={handleFollow}
              followLoading={followLoading}
              onEditProfileClick={() => setShowEditModal(true)}
              onOpenKnowMore={() => setShowKnowMoreDrawer(true)}
              onShareClick={handleShareProfile}
            />

            {/* 2. Stories / Highlights Row */}
            <ProfileHighlights
              userId={profile.user_id}
              isOwnProfile={isOwnProfile}
            />

            {/* 3. Main 2-Column Grid (Left: Content Grid / Right: Sidebar Widgets) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 4-Tab Media Grid (8 cols on desktop) */}
              <div className="lg:col-span-8">
                <ProfileContentGrid
                  userId={profile.user_id}
                  isOwnProfile={isOwnProfile}
                />
              </div>

              {/* Right Column: Sidebar Widgets (4 cols on desktop) */}
              <div className="lg:col-span-4 space-y-5">
                {/* About (Quick View) Card */}
                <div className="rounded-3xl bg-white p-5 border border-[#e8e6e3] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-extrabold uppercase text-[#171717] flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-[#1769c2]" />
                      <span>About (Quick View)</span>
                    </h3>
                  </div>

                  {profile.bio ? (
                    <p className="text-xs text-[#5d5854] leading-relaxed line-clamp-4 mb-4">
                      {profile.bio}
                    </p>
                  ) : isOwnProfile ? (
                    <button
                      type="button"
                      onClick={() => setShowEditModal(true)}
                      className="w-full text-left text-xs text-[#1769c2] font-semibold hover:underline mb-4 p-2.5 rounded-xl bg-[#f4f8fe] border border-dashed border-[#cbdff7] flex items-center gap-1.5"
                    >
                      <Edit3 className="h-3.5 w-3.5 shrink-0" />
                      <span>+ Add your clinical summary & background</span>
                    </button>
                  ) : (
                    <p className="text-xs text-[#8a8784] italic mb-4">
                      No clinical bio provided yet.
                    </p>
                  )}

                  <div className="space-y-2.5 py-3 border-y border-[#f0efee] text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#77716b]">Experience</span>
                      {profile.experience_years !== undefined && profile.experience_years > 0 ? (
                        <span className="font-bold text-[#171717]">{profile.experience_years} Years</span>
                      ) : isOwnProfile ? (
                        <button
                          type="button"
                          onClick={() => setShowEditModal(true)}
                          className="text-[11px] font-semibold text-[#1769c2] hover:underline"
                        >
                          + Add Experience
                        </button>
                      ) : (
                        <span className="text-[#8a8784] italic">Not specified</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#77716b]">Location</span>
                      {[profile.city, profile.state].filter(Boolean).length > 0 ? (
                        <span className="font-bold text-[#171717]">{[profile.city, profile.state].filter(Boolean).join(", ")}</span>
                      ) : isOwnProfile ? (
                        <button
                          type="button"
                          onClick={() => setShowEditModal(true)}
                          className="text-[11px] font-semibold text-[#1769c2] hover:underline"
                        >
                          + Add Location
                        </button>
                      ) : (
                        <span className="text-[#8a8784] italic">Not specified</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#77716b]">Registration</span>
                      {profile.registration_number ? (
                        <span className="font-bold font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {profile.registration_number}
                        </span>
                      ) : isOwnProfile ? (
                        <button
                          type="button"
                          onClick={() => setShowEditModal(true)}
                          className="text-[11px] font-semibold text-[#1769c2] hover:underline"
                        >
                          + Add Registration
                        </button>
                      ) : (
                        <span className="text-[#8a8784] italic">Under Review</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowKnowMoreDrawer(true)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1769c2] to-[#0ea5e9] py-3 px-4 text-xs font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-98"
                  >
                    <span>Know More About Me</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* My Interests Widget */}
                <div className="rounded-3xl bg-white p-5 border border-[#e8e6e3] shadow-sm">
                  <h3 className="text-xs font-extrabold uppercase text-[#171717] mb-3 flex items-center gap-1.5">
                    <Hash className="size-3.5 text-[#1769c2]" />
                    <span>My Interests & Specialties</span>
                  </h3>

                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map((interest, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-[#f4f6f9] border border-[#e2e8f0] px-3 py-1 text-xs font-semibold text-[#334155]"
                        >
                          #{interest.replace(/^#/, "")}
                        </span>
                      ))}
                    </div>
                  ) : isOwnProfile ? (
                    <button
                      type="button"
                      onClick={() => setShowEditModal(true)}
                      className="w-full text-center text-xs text-[#1769c2] font-semibold hover:underline py-3 px-3 rounded-2xl bg-[#f4f8fe] border border-dashed border-[#cbdff7] flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
                    >
                      <span>+ Add Clinical Specialties & Interests</span>
                    </button>
                  ) : (
                    <p className="text-xs text-[#8a8784] italic">No specialties listed yet.</p>
                  )}
                </div>

                {/* Featured Milestone Card */}
                {isOwnProfile && (
                  <div className="rounded-3xl bg-white p-5 border border-[#e8e6e3] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-extrabold uppercase text-[#171717] flex items-center gap-1.5">
                        <Award className="size-3.5 text-amber-500" />
                        <span>Featured Milestone</span>
                      </h3>
                    </div>

                    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1769c2]/10 to-teal-500/10 border border-[#d0e1fd] p-4 space-y-2">
                      <span className="text-[10px] font-bold text-[#1769c2] uppercase">
                        Highlight Your Achievements
                      </span>
                      <h4 className="text-xs font-bold text-[#171717]">
                        Pin your best clinical case or research paper
                      </h4>
                      <p className="text-[11px] text-[#5d5854]">
                        Showcase clinical milestones and key career accomplishments directly on your profile.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowEditModal(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1769c2] hover:underline pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
                      >
                        <span>Update Dossier Details</span>
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Communities Widget */}
                <div className="rounded-3xl bg-white p-5 border border-[#e8e6e3] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-extrabold uppercase text-[#171717] flex items-center gap-1.5">
                      <Users className="size-3.5 text-[#1769c2]" />
                      <span>Communities</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => router.push("/network/communities")}
                      className="text-[11px] font-bold text-[#1769c2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
                    >
                      Explore →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: "Sports Physiotherapy Guild", members: "4.2K members", tag: "Active" },
                      { name: "Clinical Neuro Rehab", members: "1.8K members", tag: "Top 5%" },
                      { name: "Healthcare Innovations India", members: "9.5K members", tag: "Popular" },
                    ].map((comm, idx) => (
                      <div
                        key={idx}
                        onClick={() => router.push("/network/communities")}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-[#f8f7f6] hover:bg-[#f0efee] transition cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#171717]">{comm.name}</p>
                          <p className="text-[10px] text-[#77716b]">{comm.members}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#1769c2] bg-[#eef5fc] px-2 py-0.5 rounded-full">
                          {comm.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Know More Comprehensive Dossier Drawer */}
      {profile && (
        <KnowMoreDrawer
          isOpen={showKnowMoreDrawer}
          onClose={() => setShowKnowMoreDrawer(false)}
          profile={profile}
        />
      )}

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onSave={handleSaveProfileUpdates}
        />
      )}

      {/* Connect Request Modal */}
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
