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
import { getUserAvatarUrl } from "@/lib/avatar";
import { StoriesBar } from "@/modules/home/components/StoriesBar";
import { QuickLinksBar } from "@/modules/home/components/QuickLinksBar";
import { HomeFeed } from "@/modules/home/components/HomeFeed";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Dynamic Avatar sync
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");
  const [peopleStates, setPeopleStates] = React.useState<{ [id: string]: boolean }>({});

  React.useEffect(() => {
    const updateAvatar = () => {
      setAvatarUrl(getUserAvatarUrl(session?.user?.email, session?.user?.name));
    };
    updateAvatar();
    window.addEventListener("mgn-avatar-updated", updateAvatar);
    return () => window.removeEventListener("mgn-avatar-updated", updateAvatar);
  }, [session?.user?.email, session?.user?.name]);

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

  const handleConnectPeer = (id: string) => {
    setPeopleStates((prev) => ({ ...prev, [id]: true }));
  };

  const samplePeople = [
    {
      id: "p1",
      name: "Dr. Aisha Khan",
      profession: "Physician",
      city: "Raipur, CG",
      verified: true,
      initials: "AK",
    },
    {
      id: "p2",
      name: "Dr. Vikram Sahu",
      profession: "Physiotherapist",
      city: "Bilaspur, CG",
      verified: true,
      initials: "VS",
    },
    {
      id: "p3",
      name: "Dr. Meera Nair",
      profession: "Researcher",
      city: "Bengaluru, KA",
      verified: false,
      initials: "MN",
    },
  ];

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
              RIGHT COLUMN: Profile Summary + Schedule + People + Pro Card (30-32%)
              ================================================================= */}
          <div className="space-y-5 lg:col-span-4">
            {/* 1. USER PROFILE SUMMARY CARD */}
            <div className="overflow-hidden rounded-3xl border border-[#e8e6e3] bg-white shadow-2xs">
              {/* Graphic Top Banner */}
              <div className="relative h-24 w-full bg-gradient-to-r from-[#1769c2] via-[#0284c7] to-[#0ea5e9] p-4 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                <p className="relative text-right text-[11px] font-semibold text-white/90">
                  Better Professionals<br />Better Healthcare
                </p>
              </div>

              {/* Avatar + Info */}
              <div className="relative px-5 pb-5 pt-0 text-center">
                {/* Center avatar overlaying banner */}
                <div className="relative -mt-11 inline-block">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#eef5fc] text-xl font-bold text-[#1769c2] shadow-md mx-auto">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <h3 className="font-bold text-base text-[#171717]">{displayName}</h3>
                  <ShieldCheck className="h-4 w-4 fill-[#1769c2]/15 text-[#1769c2]" />
                </div>
                <p className="text-xs text-[#77716b] font-medium">Clinician / Member</p>
                <p className="text-xs text-[#a09890] mt-0.5">Physiotherapist · Raipur, CG</p>

                {/* 3 Metric Stats */}
                <div className="mt-4 grid grid-cols-3 divide-x divide-[#f0efee] border-t border-b border-[#f5f4f3] py-3 text-center">
                  <div>
                    <span className="block text-sm font-bold text-[#171717]">184</span>
                    <span className="text-[10px] text-[#77716b]">Connections</span>
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#171717]">327</span>
                    <span className="text-[10px] text-[#77716b]">Followers</span>
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#171717]">52</span>
                    <span className="text-[10px] text-[#77716b]">Posts</span>
                  </div>
                </div>

                {/* Complete Profile Progress */}
                <div className="mt-4 text-left">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#171717]">Complete your profile</span>
                    <Link
                      href="/settings/account"
                      className="text-xs font-bold text-[#1769c2] hover:underline"
                    >
                      20% &gt;
                    </Link>
                  </div>
                  <p className="text-[11px] text-[#77716b] mb-2">
                    Add credentials, skills and more to get discovered
                  </p>
                  <div className="h-1.5 w-full rounded-full bg-[#f0efee] overflow-hidden">
                    <div className="h-full w-[20%] rounded-full bg-[#1769c2]" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TODAY'S SCHEDULE WIDGET */}
            <div className="rounded-3xl border border-[#e8e6e3] bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#f5f4f3] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#1769c2]" />
                  <h3 className="font-bold text-xs text-[#171717]">Today&apos;s Schedule</h3>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/network")}
                  className="text-[11px] font-bold text-[#1769c2] hover:underline"
                >
                  View Calendar &gt;
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Item 1 */}
                <div className="flex items-start gap-3">
                  <span className="font-bold text-[#5d5854] shrink-0 text-[11px]">10:00 AM</span>
                  <div className="flex items-start gap-2 flex-1">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="font-bold text-[#171717] leading-snug">Case Review Meeting</p>
                      <p className="text-[10px] text-[#77716b]">Online (Google Meet)</p>
                    </div>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-3">
                  <span className="font-bold text-[#5d5854] shrink-0 text-[11px]">12:00 PM</span>
                  <div className="flex items-start gap-2 flex-1">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <p className="font-bold text-[#171717] leading-snug">CME Webinar</p>
                      <p className="text-[10px] text-[#77716b]">Advances in Sports Rehabilitation</p>
                    </div>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-3">
                  <span className="font-bold text-[#5d5854] shrink-0 text-[11px]">04:00 PM</span>
                  <div className="flex items-start gap-2 flex-1">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                    <div>
                      <p className="font-bold text-[#171717] leading-snug">Patient Consultation</p>
                      <p className="text-[10px] text-[#77716b]">City Care Clinic, Raipur</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. PEOPLE YOU MAY KNOW WIDGET */}
            <div className="rounded-3xl border border-[#e8e6e3] bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#f5f4f3] pb-3 mb-4">
                <h3 className="font-bold text-xs text-[#171717]">People You May Know</h3>
                <button
                  type="button"
                  onClick={() => router.push("/network")}
                  className="text-[11px] font-bold text-[#1769c2] hover:underline"
                >
                  See All &gt;
                </button>
              </div>

              <div className="space-y-3.5">
                {samplePeople.map((person) => (
                  <div key={person.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef5fc] text-xs font-bold text-[#1769c2]">
                        {person.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-xs text-[#171717]">{person.name}</h4>
                          {person.verified && (
                            <ShieldCheck className="h-3.5 w-3.5 fill-[#1769c2]/15 text-[#1769c2]" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#77716b]">
                          {person.profession} · {person.city}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConnectPeer(person.id)}
                      className={`rounded-xl px-3 py-1 text-xs font-bold transition ${
                        peopleStates[person.id]
                          ? "border border-[#ded8d1] bg-white text-emerald-700"
                          : "border border-[#ded8d1] bg-white text-[#1769c2] hover:bg-[#eef5fc]"
                      }`}
                    >
                      {peopleStates[person.id] ? "Requested" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

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
                onClick={() => router.push("/settings")}
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
