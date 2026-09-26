"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Crown,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_BLANK_AVATAR, getUserAvatarUrl } from "@/lib/avatar";
import { StoriesBar } from "@/modules/home/components/StoriesBar";
import { QuickLinksBar } from "@/modules/home/components/QuickLinksBar";
import { HomeFeed } from "@/modules/home/components/HomeFeed";
import { PeopleYouMayKnow } from "@/modules/network/components/PeopleYouMayKnow";
import { AppPageSkeleton } from "@/components/AppPageSkeleton";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Dynamic Avatar sync
  const [avatarUrl, setAvatarUrl] = React.useState<string>(DEFAULT_BLANK_AVATAR);

  React.useEffect(() => {
    const updateAvatar = () => {
      setAvatarUrl(
        getUserAvatarUrl(
          session?.user?.id,
          session?.user?.image
        )
      );
    };
    updateAvatar();
    window.addEventListener("mgn-avatar-updated", updateAvatar);
    return () => window.removeEventListener("mgn-avatar-updated", updateAvatar);
  }, [session?.user?.id, session?.user?.image]);

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
    return <AppPageSkeleton type="feed" />;
  }

  const displayName = session.user.name || "Healthcare Professional";

  return (
    <main className="min-h-dvh bg-[#f8f7f6] pb-24 text-[#171717]">
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
                    <Calendar className="size-4 text-[#1769c2]" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#171717] text-balance">Today&apos;s Schedule</h3>
                    <span className="rounded-full bg-[#eef5fc] text-[#1769c2] px-2 py-0.5 text-[10px] font-bold">
                      {todaySchedule.length}
                    </span>
                  </div>
                  <Link
                    href="/events"
                    className="text-[11px] font-bold text-[#1769c2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] rounded"
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
                          className="shrink-0 px-2.5 py-1 rounded-lg bg-[#1769c2] text-white text-[10px] font-bold hover:bg-[#12569f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] transition"
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
            {/* 1. AD PLACEHOLDER */}
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[#e8e6e3] bg-white shadow-2xs">
              <div className="px-4 py-2.5 border-b border-[#f0efee] flex items-center justify-between text-xs bg-[#faf9f8]">
                <span className="text-[10px] font-bold uppercase text-[#a09890]">Partner Spotlight</span>
                <span className="rounded bg-white border border-[#e8e6e3] px-1.5 py-0.5 text-[9px] font-semibold text-[#77716b]">Ad</span>
              </div>
              <div className="p-4 sm:p-5 flex flex-col items-center text-center">
                <div className="w-full h-32 rounded-2xl bg-[#1769c2] p-4 text-white flex flex-col justify-between mb-3 relative overflow-hidden">
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-bold text-blue-100 bg-white/15 px-2 py-0.5 rounded-full inline-block mb-1">
                      Healthcare Tech
                    </span>
                    <h4 className="font-bold text-sm text-white leading-tight text-balance">
                      Next-Gen Clinical Diagnostics
                    </h4>
                  </div>
                  <p className="text-[10px] text-white/90 text-left line-clamp-2 text-pretty">
                    AI-assisted clinical decision support for modern practices.
                  </p>
                </div>
                <h5 className="font-bold text-xs text-[#171717] mb-1 text-balance">
                  Reach 50,000+ Medical Professionals
                </h5>
                <p className="text-[11px] text-[#77716b] mb-3.5 leading-relaxed text-pretty">
                  Showcase your medical devices, pharmaceuticals, or hospital programs directly to clinicians.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/opportunities")}
                  className="w-full rounded-xl bg-[#1769c2] py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#12569f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] transition active:scale-95"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* 2. DYNAMIC PEOPLE YOU MAY KNOW WIDGET (BORDERLESS) */}
            <PeopleYouMayKnow currentUserId={session.user.id} limit={4} borderless={true} />

            {/* 4. UPGRADE TO MGN PRO CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-[#1769c2] p-5 text-white shadow-md">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-amber-300">
                    <Crown className="size-4 fill-amber-300 text-amber-300" />
                    <span>Upgrade to MGN Pro</span>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed max-w-[210px] text-pretty">
                    Get advanced visibility, analytics, and premium networking features.
                  </p>
                </div>
                <span className="text-3xl">👑</span>
              </div>

              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#1769c2] shadow-xs hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition"
              >
                Explore Plans <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
