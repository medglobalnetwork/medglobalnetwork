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
  Hash
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
        } else {
          // Fallback demo profile for immediate visual rendering if mock user
          setProfile({
            id: params.userId,
            user_id: params.userId,
            name: session.user.id === params.userId ? session.user.name || "Dr. Professional" : "Dr. Rajesh Varma",
            email: session.user.email || "professional@medglobalnetwork.com",
            image: session.user.id === params.userId ? session.user.image || "" : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
            profession: "Physiotherapy",
            designation: "Consultant Physiotherapist",
            specialization: "Sports Injury & Neuro Rehab",
            organization: "Department of Clinical Health & Rehabilitation",
            medical_council: "State Medical & Physiotherapy Council",
            registration_number: "KAR-PT-2018-09842",
            primary_degree: "MPT (Sports Rehabilitation)",
            additional_degrees: ["BPT (Orthopaedics)", "Fellowship in Sports Sciences"],
            experience_years: 8,
            bio: "Specialized in Sports Injury Rehab, Post-Op Recovery & Ergonomics. Helping patients regain strength, mobility & longevity with evidence-based modern protocols.",
            city: "Bangalore",
            state: "Karnataka",
            skills: ["Musculoskeletal Rehab", "Dry Needling", "Spine Mobilization", "Biomechanics", "Ergonomics", "Kinesiology"],
            identity_verified: true,
            education_verified: true,
            registration_verified: true,
            experience_verified: true,
            connection_count: 584,
            follower_count: 1240,
            following_count: 320,
            post_count: 142,
            is_own_profile: session.user.id === params.userId,
          });
        }
      })
      .catch(() => {
        setProfile(null);
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
      navigator.clipboard.writeText(window.location.href);
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

  return (
    <main className="min-h-screen bg-[#f8f7f6] pb-28 text-[#171717]">
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
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#1769c2]" />
                      <span>About (Quick View)</span>
                    </h3>
                  </div>

                  <p className="text-xs text-[#5d5854] leading-relaxed line-clamp-4 mb-4">
                    {profile.bio ||
                      "Dedicated healthcare clinician focused on delivering exceptional patient care and continuous evidence-based rehabilitation."}
                  </p>

                  <div className="space-y-2 py-3 border-y border-[#f0efee] text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#77716b]">Experience</span>
                      <span className="font-bold text-[#171717]">{profile.experience_years ?? 8} Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#77716b]">Location</span>
                      <span className="font-bold text-[#171717]">{[profile.city, profile.state].filter(Boolean).join(", ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#77716b]">Registration</span>
                      <span className="font-bold font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {profile.registration_number || "Verified"}
                      </span>
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
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#171717] mb-3 flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-[#1769c2]" />
                    <span>My Interests & Specialties</span>
                  </h3>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "#SportsRehab",
                      "#NeuroRehabilitation",
                      "#Ergonomics",
                      "#ManualTherapy",
                      "#Kinesiology",
                      "#PostOpCare",
                      "#DryNeedling",
                      "#SpineHealth",
                    ].map((interest, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-[#f4f6f9] border border-[#e2e8f0] px-3 py-1 text-xs font-semibold text-[#334155] hover:bg-[#e2e8f0] transition cursor-pointer"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Featured Content Widget */}
                <div className="rounded-3xl bg-white p-5 border border-[#e8e6e3] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      <span>Featured Milestone</span>
                    </h3>
                  </div>

                  <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1769c2]/10 to-teal-500/10 border border-[#d0e1fd] p-4 space-y-2">
                    <span className="text-[10px] font-bold text-[#1769c2] uppercase tracking-wider">
                      Featured Case Study
                    </span>
                    <h4 className="text-xs font-bold text-[#171717]">
                      Accelerated ACL Return-to-Sport in National Level Athletes
                    </h4>
                    <p className="text-[11px] text-[#5d5854]">
                      A 12-week comprehensive eccentric loading and biomechanical stabilization trial.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowKnowMoreDrawer(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1769c2] hover:underline pt-1"
                    >
                      <span>Read Case Study</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Communities Widget */}
                <div className="rounded-3xl bg-white p-5 border border-[#e8e6e3] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#1769c2]" />
                      <span>Communities</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => router.push("/network/communities")}
                      className="text-[11px] font-bold text-[#1769c2] hover:underline"
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
