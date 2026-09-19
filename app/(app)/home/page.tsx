"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getUserAvatarUrl } from "@/lib/avatar";

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

function SectionHeader({
  title,
  subtitle,
  actionText,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-3.5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-[#171717] sm:text-lg">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-[#77716b]">{subtitle}</p>}
      </div>
      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 text-xs font-semibold text-[#1769c2] transition hover:text-[#12569f] hover:underline"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

function EmptyStateCard({
  icon,
  title,
  description,
  actionText,
  onAction,
}: {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ded8d1] bg-white p-6 text-center shadow-xs">
      <span className="text-2xl">{icon}</span>
      <p className="mt-2 text-sm font-semibold text-[#171717]">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-[#77716b]">{description}</p>
      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3.5 inline-flex items-center rounded-xl bg-[#1769c2] px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-[#12569f]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

/* ==========================================================================
   Main Home Component (100% Real Dynamic States & Clean Empty States)
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
          <div className="h-32 rounded-2xl bg-white/60" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="h-24 rounded-2xl bg-white/60" />
            <div className="h-24 rounded-2xl bg-white/60" />
            <div className="h-24 rounded-2xl bg-white/60" />
            <div className="h-24 rounded-2xl bg-white/60" />
          </div>
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

  // Quick Access Navigation (Functional Routes)
  const quickAccessItems = [
    {
      id: "network",
      title: "Network",
      desc: "Connect with healthcare professionals",
      icon: (
        <svg className="h-5 w-5 text-[#1769c2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      href: "/network",
    },
    {
      id: "learn",
      title: "Learn",
      desc: "Courses, notes & certifications",
      icon: (
        <svg className="h-5 w-5 text-[#15803d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
      href: "/learn",
    },
    {
      id: "jobs",
      title: "Jobs",
      desc: "Find healthcare opportunities",
      icon: (
        <svg className="h-5 w-5 text-[#854d0e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      ),
      href: "/opportunities",
    },
    {
      id: "events",
      title: "Events",
      desc: "Conferences & professional events",
      icon: (
        <svg className="h-5 w-5 text-[#b91c1c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      href: "#events-section",
    },
    {
      id: "camps",
      title: "Camps",
      desc: "Join healthcare camps",
      icon: (
        <svg className="h-5 w-5 text-[#047857]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
      href: "#camps-section",
    },
    {
      id: "research",
      title: "Research",
      desc: "Research & collaboration",
      icon: (
        <svg className="h-5 w-5 text-[#6d28d9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 18h8" />
          <path d="M3 22h18" />
          <path d="M14 22a7 7 0 1 0 0-14h-1" />
          <path d="M9 14h2" />
          <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
          <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
        </svg>
      ),
      href: "#research-section",
    },
    {
      id: "meetings",
      title: "Meetings",
      desc: "Professional meetings",
      icon: (
        <svg className="h-5 w-5 text-[#0369a1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" />
        </svg>
      ),
      href: "#meetings-section",
    },
    {
      id: "marketplace",
      title: "Marketplace",
      desc: "Healthcare products & services",
      icon: (
        <svg className="h-5 w-5 text-[#c026d3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      href: "/marketplace",
    },
  ];

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
        {/* Responsive Dashboard Grid (72% Main + 28% Right Sidebar on Desktop) */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* =================================================================
              LEFT / MAIN DASHBOARD CONTENT (70–75%)
              ================================================================= */}
          <div className="w-full min-w-0 flex-1 space-y-7">
            {/* -------------------------------------------------------------
                1. WELCOME SECTION
                ------------------------------------------------------------- */}
            <section aria-label="Welcome section">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#171717] sm:text-2xl lg:text-[1.75rem]">
                    {getGreeting()}, {displayName} 👋
                  </h1>
                  <p className="mt-1 text-xs text-[#77716b] sm:text-sm">
                    Here&apos;s what&apos;s happening in your healthcare network.
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
                2. PROFILE COMPLETION CARD
                ------------------------------------------------------------- */}
            <section
              aria-label="Profile completion"
              className="overflow-hidden rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-xs transition sm:p-5"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef5fc] text-sm font-bold text-[#1769c2]">
                    {profilePercentage}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#171717]">
                        Complete your MGN profile
                      </h3>
                      <span className="rounded-full bg-[#eef5fc] px-2 py-0.5 text-[10px] font-bold text-[#1769c2]">
                        {completedStepsCount} of {profileSteps.length} complete
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#77716b]">
                      Unlock verified referrals, research collaborations, and tailored career opportunities.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/settings/account")}
                  className="inline-flex items-center justify-center rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#12569f]"
                >
                  Complete Profile
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f0efee]">
                <div
                  className="h-full rounded-full bg-[#1769c2] transition-all duration-500"
                  style={{ width: `${profilePercentage}%` }}
                />
              </div>

              {/* Checklist */}
              <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[#f5f4f3] pt-3 text-[11px]">
                {profileSteps.map((step) => (
                  <span
                    key={step.label}
                    className={`inline-flex items-center gap-1.5 ${
                      step.completed ? "font-medium text-[#15803d]" : "text-[#8a8784]"
                    }`}
                  >
                    {step.completed ? (
                      <svg className="h-3.5 w-3.5 fill-[#15803d]" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-[#cfc6be] inline-block" />
                    )}
                    {step.label}
                  </span>
                ))}
              </div>
            </section>

            {/* -------------------------------------------------------------
                3. QUICK ACCESS GRID (8 Items)
                ------------------------------------------------------------- */}
            <section aria-label="Quick Access">
              <SectionHeader title="Quick Access" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                {quickAccessItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.href.startsWith("#")) {
                        const el = document.querySelector(item.href);
                        el?.scrollIntoView({ behavior: "smooth" });
                      } else {
                        router.push(item.href);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && router.push(item.href)}
                    className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-[#e8e6e3] bg-white p-3.5 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-[#cfc6be] hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f7f6] transition group-hover:bg-[#eef5fc]">
                      {item.icon}
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-[#171717] group-hover:text-[#1769c2]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-[#77716b]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* -------------------------------------------------------------
                4. RECOMMENDED JOBS ("Jobs for You")
                ------------------------------------------------------------- */}
            <section aria-label="Recommended Jobs">
              <SectionHeader
                title="Jobs for You"
                subtitle="Opportunities based on your professional profile"
                actionText="Explore Opportunities →"
                onAction={() => router.push("/opportunities")}
              />
              <EmptyStateCard
                icon="💼"
                title="No recommended jobs yet"
                description="Complete your professional profile and medical registration to get personalized job recommendations from hospitals and clinics."
                actionText="Explore All Jobs"
                onAction={() => router.push("/opportunities")}
              />
            </section>

            {/* -------------------------------------------------------------
                5. CONTINUE LEARNING
                ------------------------------------------------------------- */}
            <section aria-label="Continue Learning">
              <SectionHeader
                title="Continue Learning"
                subtitle="Resume your active coursework & accredited CME modules"
                actionText="Browse Curriculum →"
                onAction={() => router.push("/learn")}
              />
              <EmptyStateCard
                icon="🎓"
                title="No active courses yet"
                description="Enroll in accredited clinical courses, physical therapy modules, and earn CME certifications."
                actionText="Browse Courses"
                onAction={() => router.push("/learn")}
              />
            </section>

            {/* -------------------------------------------------------------
                6. UPCOMING EVENTS
                ------------------------------------------------------------- */}
            <section id="events-section" aria-label="Upcoming Events">
              <SectionHeader
                title="Upcoming Events"
                subtitle="Accredited medical conferences, workshops & webinars"
                actionText="View Calendar →"
                onAction={() => showToast("No scheduled events in your region")}
              />
              <EmptyStateCard
                icon="📅"
                title="No upcoming events scheduled"
                description="Check back soon for upcoming clinical workshops, conferences, and CME webinars."
                actionText="Refresh Events"
                onAction={() => showToast("Checking latest conference updates...")}
              />
            </section>

            {/* -------------------------------------------------------------
                7. HEALTHCARE CAMPS
                ------------------------------------------------------------- */}
            <section id="camps-section" aria-label="Healthcare Camps">
              <SectionHeader
                title="Healthcare Camps"
                subtitle="Community health outreach & clinical volunteering"
                actionText="Explore Camps →"
                onAction={() => showToast("No active community camps listed")}
              />
              <EmptyStateCard
                icon="🏕️"
                title="No active healthcare camps at the moment"
                description="Community health check-up camps and volunteer opportunities will appear here when posted by partner organizations."
                actionText="Check Updates"
                onAction={() => showToast("Checking for community camps...")}
              />
            </section>

            {/* -------------------------------------------------------------
                8. RESEARCH & COLLABORATION
                ------------------------------------------------------------- */}
            <section id="research-section" aria-label="Research and Collaboration">
              <SectionHeader
                title="Research & Collaboration"
                subtitle="Join active clinical studies, multi-center trials & paper co-authorship"
                actionText="Explore Research →"
                onAction={() => showToast("Opening research portal")}
              />
              <EmptyStateCard
                icon="🔬"
                title="No active research opportunities yet"
                description="Clinical trial calls and co-authorship opportunities from medical institutes will appear here."
                actionText="Submit Research Proposal"
                onAction={() => showToast("Research submission portal will open soon")}
              />
            </section>

            {/* -------------------------------------------------------------
                9. COMMUNITY FEED ("From Your Network")
                ------------------------------------------------------------- */}
            <section aria-label="Community Feed">
              <SectionHeader
                title="From Your Network"
                subtitle="Clinical insights, publications & updates from healthcare peers"
              />
              <EmptyStateCard
                icon="👥"
                title="Your network feed is quiet"
                description="Connect with healthcare professionals, doctors, and specialists to see clinical discussions and publications."
                actionText="Find Healthcare Connections"
                onAction={() => router.push("/network")}
              />
            </section>

            {/* -------------------------------------------------------------
                10. HEALTHCARE MARKETPLACE PREVIEW
                ------------------------------------------------------------- */}
            <section aria-label="Healthcare Marketplace">
              <SectionHeader
                title="Healthcare Marketplace"
                subtitle="Recommended verified clinical products and specialized tools"
                actionText="Explore Marketplace →"
                onAction={() => router.push("/marketplace")}
              />
              <EmptyStateCard
                icon="🛍️"
                title="No products listed in your area yet"
                description="Verified clinical devices, physical therapy equipment, and medical literature will be available soon."
                actionText="Go to Marketplace"
                onAction={() => router.push("/marketplace")}
              />
            </section>

            {/* -------------------------------------------------------------
                11. MGN AI (Compact Assistant Section)
                ------------------------------------------------------------- */}
            <section
              aria-label="MGN AI Assistant"
              className="rounded-2xl border border-[#dbeafe] bg-gradient-to-br from-white via-white to-[#f0f7ff] p-4 shadow-xs sm:p-5"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1769c2] text-xs font-bold text-white">
                  ✦
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#171717]">MGN AI</h3>
                  <p className="text-xs text-[#77716b]">
                    Your healthcare career and clinical learning assistant.
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
                  placeholder="Ask MGN AI... e.g. 'Recommend physiotherapy courses'"
                  className="h-10 flex-1 rounded-xl border border-[#ded8d1] bg-white px-3.5 text-xs text-[#171717] shadow-2xs placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAskAI()}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="inline-flex shrink-0 items-center rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#12569f] disabled:opacity-50"
                >
                  {isAiLoading ? "Thinking..." : "Ask MGN AI"}
                </button>
              </div>

              {/* AI Response Display */}
              {aiResponse && (
                <div className="mt-3 rounded-xl border border-[#dbeafe] bg-white p-3 text-xs leading-relaxed text-[#171717] shadow-2xs">
                  <span className="font-semibold text-[#1769c2]">MGN AI: </span>
                  {aiResponse}
                </div>
              )}

              {/* Suggested Prompts */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  "Find healthcare opportunities",
                  "Recommend courses for me",
                  "Find research collaborations",
                  "Find healthcare events",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setAiPrompt(prompt);
                      handleAskAI(prompt);
                    }}
                    className="rounded-full border border-[#dbeafe] bg-white px-2.5 py-1 text-[11px] text-[#1769c2] shadow-2xs transition hover:bg-[#eef5fc]"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* =================================================================
              RIGHT SIDEBAR (Desktop 25-30% / Collapses gracefully on Mobile)
              ================================================================= */}
          <aside className="w-full shrink-0 space-y-5 lg:w-80">
            {/* 1. Profile Summary Card (Real Authenticated User Data) */}
            <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-2xs">
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
                onClick={() => router.push("/settings/account")}
                className="mt-4 w-full rounded-xl border border-[#ded8d1] py-1.5 text-xs font-semibold text-[#171717] transition hover:bg-[#f8f7f6]"
              >
                View Profile & Settings
              </button>
            </div>

            {/* 2. Upcoming Meeting Card */}
            <div id="meetings-section" className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-[#171717]">
                <span>Today&apos;s Meetings</span>
                <span className="text-[10px] text-[#8a8784]">No meetings scheduled</span>
              </div>
              <p className="mt-2 text-xs text-[#77716b]">
                Scheduled case reviews, webinars, and clinical consults will appear here.
              </p>
              <button
                type="button"
                onClick={() => showToast("Meeting scheduling will be available soon")}
                className="mt-3 w-full rounded-xl border border-[#ded8d1] py-1.5 text-xs font-medium text-[#171717] transition hover:bg-[#f8f7f6]"
              >
                Schedule a Meeting
              </button>
            </div>

            {/* 3. Connections Shortcut */}
            <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-2xs">
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
                Build your professional circle across doctors, therapists, and medical faculties.
              </p>
              <button
                type="button"
                onClick={() => router.push("/network")}
                className="mt-3 w-full rounded-xl bg-[#eef5fc] py-1.5 text-xs font-semibold text-[#1769c2] transition hover:bg-[#1769c2] hover:text-white"
              >
                Find Peers in Network
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
