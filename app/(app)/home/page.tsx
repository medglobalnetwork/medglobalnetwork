"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getUserAvatarUrl } from "@/lib/avatar";
import { StoriesBar } from "@/modules/home/components/StoriesBar";
import { QuickLinksBar } from "@/modules/home/components/QuickLinksBar";
import { HomeFeed } from "@/modules/home/components/HomeFeed";

/* ==========================================================================
   Helper Subcomponents
   ========================================================================== */

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center text-[#1769c2]"
      title="Verified Clinician / Organization"
      aria-label="Verified"
    >
      <svg className="h-3.5 w-3.5 fill-[#1769c2]" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    </span>
  );
}

/* ==========================================================================
   Main Home Social Page
   ========================================================================== */

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Dynamic Avatar sync
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");

  React.useEffect(() => {
    const updateAvatar = () => {
      setAvatarUrl(getUserAvatarUrl(session?.user?.email, session?.user?.name));
    };
    updateAvatar();
    window.addEventListener("mgn-avatar-updated", updateAvatar);
    return () => window.removeEventListener("mgn-avatar-updated", updateAvatar);
  }, [session?.user?.email, session?.user?.name]);

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = React.useState(false);

  // Notification toast helper
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
    }
  }, [isPending, router, session]);

  if (isPending || !session) {
    return (
      <main className="min-h-screen bg-[#f5f5f4] p-6">
        <div className="mx-auto max-w-6xl space-y-4 animate-pulse">
          <div className="h-20 rounded-2xl bg-white/60" />
          <div className="h-24 rounded-2xl bg-white/60" />
          <div className="h-40 rounded-2xl bg-white/60" />
          <div className="h-64 rounded-2xl bg-white/60" />
        </div>
      </main>
    );
  }

  // Dynamic greeting calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = session.user.name
    ? session.user.name.split(" ")[0]
    : session.user.email.split("@")[0];

  // Dynamic profile completion calculation from real user data
  const hasName = Boolean(session.user.name && session.user.name.trim().length > 0);
  const hasEmail = Boolean(session.user.email);
  const hasImage = Boolean(avatarUrl && !avatarUrl.includes("ui-avatars"));

  const profileSteps = [
    { label: "Basic information", completed: hasName && hasEmail },
    { label: "Profile Picture", completed: hasImage },
    { label: "Medical Council / Registration", completed: false },
    { label: "Clinical Specialization", completed: false },
    { label: "Work Experience", completed: false },
  ];

  const completedStepsCount = profileSteps.filter((s) => s.completed).length;
  const profilePercentage = Math.round((completedStepsCount / profileSteps.length) * 100);

  // AI Handler
  const handleAskAI = (promptText?: string) => {
    const q = (promptText || aiPrompt).trim();
    if (!q) return;

    setIsAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsAiLoading(false);
      if (q.toLowerCase().includes("job") || q.toLowerCase().includes("physio")) {
        setAiResponse(
          "You can browse active healthcare job openings and clinical roles across hospitals in the Opportunities section."
        );
      } else if (q.toLowerCase().includes("course") || q.toLowerCase().includes("learn")) {
        setAiResponse(
          "Explore the Learn section to access clinical study modules, accredited CME courses, and professional certifications."
        );
      } else if (q.toLowerCase().includes("research")) {
        setAiResponse(
          "Connect with clinical investigators and discover open multi-center trials in the Research section."
        );
      } else {
        setAiResponse(
          `MGN AI Assistant: Here are professional insights and resources for "${q}". Search across courses, peer network, and clinical opportunities.`
        );
      }
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      {/* Toast alert notification */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#ded8d1] bg-[#171717] px-4 py-2 text-xs font-medium text-white shadow-lg transition-all animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Responsive Grid: Left Social Feed + Right Professional Sidebar */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* =================================================================
              LEFT / MAIN SOCIAL FEED CONTENT (70–75%)
              ================================================================= */}
          <div className="w-full min-w-0 flex-1 space-y-6">
            {/* -------------------------------------------------------------
                1. WELCOME SECTION
                ------------------------------------------------------------- */}
            <section aria-label="Welcome section">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#171717] sm:text-2xl lg:text-[1.75rem]">
                    {getGreeting()}, {displayName} 👋
                  </h1>
                  <p className="mt-0.5 text-xs text-[#77716b] sm:text-sm">
                    Connect, share clinical updates, and collaborate with verified healthcare peers.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ded8d1] bg-white px-3 py-1 text-[11px] font-medium text-[#5d5854] shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#15803d]" />
                    Verified Clinician Network
                  </span>
                </div>
              </div>
            </section>

            {/* -------------------------------------------------------------
                2. PROFILE COMPLETION BANNER (Compact)
                ------------------------------------------------------------- */}
            {profilePercentage < 100 && (
              <section
                aria-label="Profile completion"
                className="overflow-hidden rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-2xs transition"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5fc] text-xs font-bold text-[#1769c2]">
                      {profilePercentage}%
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[#171717] sm:text-sm">
                        Complete your medical credentials
                      </h3>
                      <p className="text-[11px] text-[#77716b]">
                        Unlock verified badges, peer endorsements, and research calls.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/settings/account")}
                    className="inline-flex items-center justify-center rounded-xl bg-[#1769c2] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#12569f]"
                  >
                    Complete Profile
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#f0efee]">
                  <div
                    className="h-full rounded-full bg-[#1769c2] transition-all duration-500"
                    style={{ width: `${profilePercentage}%` }}
                  />
                </div>
              </section>
            )}

            {/* -------------------------------------------------------------
                3. STORIES BAR (24h Disappearing Rings)
                ------------------------------------------------------------- */}
            <section aria-label="Stories">
              <StoriesBar
                currentUserId={session.user.id}
                currentUserAvatar={avatarUrl}
                currentUserName={session.user.name || "You"}
              />
            </section>

            {/* -------------------------------------------------------------
                4. QUICK LINKS BAR (Horizontal Shortcut Pills)
                ------------------------------------------------------------- */}
            <section aria-label="Quick Links">
              <QuickLinksBar />
            </section>

            {/* -------------------------------------------------------------
                5. INFINITE PERSONALIZED SOCIAL FEED
                ------------------------------------------------------------- */}
            <section aria-label="Social Feed">
              <HomeFeed
                currentUserId={session.user.id}
                currentUserAvatar={avatarUrl}
                currentUserName={session.user.name || "You"}
              />
            </section>

            {/* -------------------------------------------------------------
                6. MGN AI ASSISTANT
                ------------------------------------------------------------- */}
            <section
              aria-label="MGN AI Assistant"
              className="rounded-2xl border border-[#dbeafe] bg-gradient-to-br from-white via-white to-[#f0f7ff] p-4 shadow-2xs sm:p-5"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1769c2] text-xs font-bold text-white">
                  ✦
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#171717]">MGN AI Assistant</h3>
                  <p className="text-xs text-[#77716b]">
                    Clinical insights, literature synthesis, and career guidance.
                  </p>
                </div>
              </div>

              {/* Input Form */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                  placeholder="Ask MGN AI... e.g. 'Recommend clinical updates on cardiology'"
                  className="h-10 flex-1 rounded-xl border border-[#ded8d1] bg-white px-3.5 text-xs text-[#171717] shadow-2xs placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
                />
                <button
                  type="button"
                  onClick={() => handleAskAI()}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="inline-flex shrink-0 items-center rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#12569f] disabled:opacity-50"
                >
                  {isAiLoading ? "Thinking..." : "Ask AI"}
                </button>
              </div>

              {/* AI Response Display */}
              {aiResponse && (
                <div className="mt-3 rounded-xl border border-[#dbeafe] bg-white p-3 text-xs leading-relaxed text-[#171717] shadow-2xs">
                  <span className="font-semibold text-[#1769c2]">MGN AI: </span>
                  {aiResponse}
                </div>
              )}
            </section>
          </div>

          {/* =================================================================
              RIGHT SIDEBAR (Desktop 25-30%)
              ================================================================= */}
          <aside className="w-full shrink-0 space-y-5 lg:w-80">
            {/* 1. Profile Summary Card (Real Authenticated User Data) */}
            <div className="rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ded8d1] bg-[#eef5fc] text-base font-bold text-[#1769c2]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    displayName.slice(0, 2).toUpperCase()
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-sm font-semibold text-[#171717]">
                      {session.user.name || "Healthcare Professional"}
                    </h3>
                    <VerifiedBadge />
                  </div>
                  <p className="truncate text-xs text-[#77716b]">Clinician / Member</p>
                  <p className="truncate text-[10px] text-[#a09890]">{session.user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/profile/${session.user.id}`)}
                className="mt-4 w-full rounded-xl border border-[#ded8d1] py-1.5 text-xs font-semibold text-[#171717] transition hover:bg-[#f8f7f6]"
              >
                View Full Profile
              </button>
            </div>

            {/* 2. Professional Network Shortcut */}
            <div className="rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#171717]">Healthcare Network</h3>
                <button
                  type="button"
                  onClick={() => router.push("/network")}
                  className="text-[11px] font-semibold text-[#1769c2] hover:underline"
                >
                  Explore →
                </button>
              </div>
              <p className="mt-1.5 text-xs text-[#77716b]">
                Connect with verified doctors, physical therapists, researchers, and faculties.
              </p>
              <button
                type="button"
                onClick={() => router.push("/network")}
                className="mt-3 w-full rounded-xl bg-[#eef5fc] py-1.5 text-xs font-semibold text-[#1769c2] transition hover:bg-[#1769c2] hover:text-white"
              >
                Find Peers in Network
              </button>
            </div>

            {/* 3. Today's Consultations & Meetings */}
            <div id="meetings-section" className="rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-[#171717]">
                <span>Today&apos;s Meetings</span>
                <span className="text-[10px] text-[#8a8784]">No meetings scheduled</span>
              </div>
              <p className="mt-2 text-xs text-[#77716b]">
                Scheduled case reviews, CME webinars, and peer consultations will appear here.
              </p>
              <button
                type="button"
                onClick={() => showToast("Meeting calendar integration coming soon")}
                className="mt-3 w-full rounded-xl border border-[#ded8d1] py-1.5 text-xs font-medium text-[#171717] transition hover:bg-[#f8f7f6]"
              >
                Schedule Meeting
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
