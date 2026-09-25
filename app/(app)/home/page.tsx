"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Crown,
  ExternalLink,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_BLANK_AVATAR, getUserAvatarUrl, getUserCoverUrl, DEFAULT_COVER_BANNER } from "@/lib/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { StoriesBar } from "@/modules/home/components/StoriesBar";
import { QuickLinksBar } from "@/modules/home/components/QuickLinksBar";
import { HomeFeed } from "@/modules/home/components/HomeFeed";
import { PeopleYouMayKnow } from "@/modules/network/components/PeopleYouMayKnow";
import type { ProfessionalProfile } from "@/modules/network/types";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Dynamic Avatar & Cover & Profile Stats sync
  const [avatarUrl, setAvatarUrl] = React.useState<string>(DEFAULT_BLANK_AVATAR);
  const [coverUrl, setCoverUrl] = React.useState<string>(DEFAULT_COVER_BANNER);
  const [userProfile, setUserProfile] = React.useState<(ProfessionalProfile & {
    connection_count?: number;
    follower_count?: number;
    post_count?: number;
  }) | null>(null);

  React.useEffect(() => {
    const updateAvatar = () => {
      setAvatarUrl(
        getUserAvatarUrl(
          session?.user?.email,
          session?.user?.name,
          session?.user?.image
        )
      );
    };
    updateAvatar();
    window.addEventListener("mgn-avatar-updated", updateAvatar);
    return () => window.removeEventListener("mgn-avatar-updated", updateAvatar);
  }, [session?.user?.email, session?.user?.name, session?.user?.image]);

  React.useEffect(() => {
    const updateCover = () => {
      setCoverUrl(getUserCoverUrl(session?.user?.id, userProfile?.cover_image_url));
    };
    updateCover();
    window.addEventListener("mgn-cover-updated", updateCover);
    return () => window.removeEventListener("mgn-cover-updated", updateCover);
  }, [session?.user?.id, userProfile?.cover_image_url]);

  React.useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/network/profiles/${session.user.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) {
          setUserProfile(d.data);
          if (d.data.cover_image_url) {
            setCoverUrl(d.data.cover_image_url);
          }
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

  const [todaySchedule, setTodaySchedule] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!session?.user?.id) return;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

    fetch(`/api/shared/calendar?from=${startOfDay}&to=${endOfDay}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.agenda && Array.isArray(d.agenda)) {
          setTodaySchedule(d.agenda);
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
    }
  }, [isPending, router, session]);

  if (isPending || !session) {
    return (
      <main className="min-h-screen bg-[#faf9f8] p-6">
        <div className="mx-auto max-w-[1440px] space-y-4 animate-pulse">
          <div className="h-28 rounded-3xl bg-white/70" />
          <div className="h-32 rounded-3xl bg-white/70" />
          <div className="h-64 rounded-3xl bg-white/70" />
        </div>
      </main>
    );
  }

  const displayName = session.user.name || "Healthcare Professional";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#f8f7f6] pb-24 text-[#171717]">
      <div className="mx-auto max-w-[1440px] px-3 py-4 sm:px-6 lg:px-8">
        {/* 2-Column Responsive Layout Matching Mockup */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8">
          {/* =================================================================
              LEFT COLUMN: Stories + Quick Links + Inline Post + Feeds (68-70%)
              ================================================================= */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-8">
            {/* 1. STORIES SECTION */}
            <StoriesBar
              currentUserId={session.user.id}
              currentUserAvatar={avatarUrl}
              currentUserName={displayName}
            />

            {/* TODAY'S SCHEDULE (Only shown if user has active items scheduled today) */}
            {todaySchedule.length > 0 && (
              <div className="rounded-2xl border border-[#e8e6e3] bg-white p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#f5f4f3] pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#1769c2]" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#171717]">Today&apos;s Schedule</h3>
                    <span className="rounded-full bg-[#eef5fc] text-[#1769c2] px-2 py-0.5 text-[10px] font-bold">
                      {todaySchedule.length}
                    </span>
                  </div>
                  <Link
                    href="/events"
                    className="text-[11px] font-bold text-[#1769c2] hover:underline"
                  >
                    Calendar &gt;
                  </Link>
                </div>

                <div className="space-y-2">
                  {todaySchedule.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf9f8] hover:bg-[#f5f4f3] transition border border-[#f0efee]"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-[#171717] truncate">{item.title}</h4>
                        <p className="text-[10px] text-[#77716b] mt-0.5">
                          {new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {item.location ? ` · ${item.location}` : ""}
                        </p>
                      </div>
                      {item.meeting_link && (
                        <a
                          href={item.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-2.5 py-1 rounded-lg bg-[#1769c2] text-white text-[10px] font-bold hover:bg-[#12569f] transition"
                        >
                          Join
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. QUICK LINKS BAR (10 Short-cut categories) */}
            <QuickLinksBar />

            {/* 3. MAIN SOCIAL FEED + INLINE POST COMPOSER */}
            <HomeFeed
              currentUserId={session.user.id}
              currentUserAvatar={avatarUrl}
              currentUserName={displayName}
            />
          </div>

          {/* =================================================================
              RIGHT COLUMN: Profile Summary + People + Pro Card (Desktop Only)
              ================================================================= */}
          <div className="hidden lg:block space-y-5 lg:col-span-4">
            {/* 1. USER PROFILE SUMMARY CARD */}
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[#e8e6e3] bg-white shadow-2xs">
              {/* Graphic Top Banner */}
              <div className="relative h-20 sm:h-28 w-full overflow-hidden bg-gradient-to-r from-teal-900 via-emerald-800 to-cyan-900 text-white">
                <img
                  src={coverUrl}
                  alt="Profile Cover"
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <p className="relative p-2.5 sm:p-4 text-right text-[9px] sm:text-[11px] font-semibold text-white/90 leading-tight drop-shadow-md">
                  Better Professionals<br />Better Healthcare
                </p>
              </div>

              {/* Avatar + Info */}
              <div className="relative px-3.5 pb-3.5 sm:px-5 sm:pb-5 pt-0 text-center">
                {/* Center avatar overlaying banner */}
                <div className="relative -mt-7 sm:-mt-11 inline-block">
                  <div className="overflow-hidden rounded-full border-3 sm:border-4 border-white shadow-md mx-auto">
                    <UserAvatar
                      src={avatarUrl}
                      name={displayName}
                      email={session.user.email}
                      userId={session.user.id}
                      className="h-14 w-14 sm:h-20 sm:w-20 text-base sm:text-xl font-bold"
                    />
                  </div>
                </div>

                <div className="mt-1 sm:mt-2 flex items-center justify-center gap-1">
                  <h3 className="font-bold text-sm sm:text-base text-[#171717]">{displayName}</h3>
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#1769c2]/15 text-[#1769c2]" />
                </div>
                <p className="text-[11px] sm:text-xs text-[#77716b] font-medium">
                  {userProfile?.designation || userProfile?.profession || "Clinician / Member"}
                </p>
                <p className="text-[10px] sm:text-xs text-[#a09890] mt-0.5">
                  {[userProfile?.specialization, userProfile?.city, userProfile?.state].filter(Boolean).join(" · ") || "MedGlobal Network"}
                </p>

                {/* 3 Metric Stats */}
                <div className="mt-2.5 sm:mt-4 grid grid-cols-3 divide-x divide-[#f0efee] border-t border-b border-[#f5f4f3] py-2 sm:py-3 text-center">
                  <div>
                    <span className="block text-xs sm:text-sm font-bold text-[#1769c2]">
                      {(userProfile?.connection_count ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-[#77716b]">Connections</span>
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-bold text-[#171717]">
                      {(userProfile?.follower_count ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-[#77716b]">Followers</span>
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-bold text-[#171717]">
                      {(userProfile?.post_count ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-[#77716b]">Posts</span>
                  </div>
                </div>

                {/* Complete Profile Progress */}
                <div className="mt-2.5 sm:mt-4 text-left">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1">
                    <span className="font-bold text-[#171717]">Your Profile</span>
                    <Link
                      href={`/profile/${userProfile?.username || session.user.id}`}
                      className="text-[11px] sm:text-xs font-bold text-[#1769c2] hover:underline"
                    >
                      View &gt;
                    </Link>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#77716b] mb-1.5 sm:mb-2">
                    Keep your clinical dossier up-to-date
                  </p>
                </div>
              </div>
            </div>

            {/* 2. DYNAMIC PEOPLE YOU MAY KNOW WIDGET */}
            <PeopleYouMayKnow currentUserId={session.user.id} limit={4} />

            {/* 4. UPGRADE TO MGN PRO CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e40af] via-[#3b82f6] to-[#6366f1] p-5 text-white shadow-md">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-amber-300">
                    <Crown className="h-4 w-4 fill-amber-300 text-amber-300" />
                    <span>Upgrade to MGN Pro</span>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed max-w-[210px]">
                    Get advanced visibility, analytics, and premium networking features.
                  </p>
                </div>
                <span className="text-3xl">👑</span>
              </div>

              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#1e40af] shadow-xs hover:bg-slate-50 transition"
              >
                Explore Plans <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FLOATING AI/CHAT BUTTON (Bottom-Right) */}
      <button
        type="button"
        onClick={() => router.push("/network")}
        className="fixed bottom-6 right-6 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-[#171717] text-white shadow-xl transition hover:scale-105 hover:bg-black"
        aria-label="Open Chat & AI"
      >
        <MessageCircle className="h-6 w-6 stroke-[2]" />
      </button>
    </main>
  );
}
