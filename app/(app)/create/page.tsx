"use client";

// ============================================================
// MGN Creation Hub — /create
// Unified Creation Center for Posts, Jobs, Events, Conferences,
// Health Camps, Research Projects, Communities & Marketplace
// Strictly aligned with baseline-ui & icons8 guidelines
// ============================================================

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  PenSquare,
  Briefcase,
  Calendar,
  Award,
  Tent,
  FlaskConical,
  Compass,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type CreationCategory = "all" | "content" | "events" | "jobs" | "research";

interface CreationCardItem {
  id: string;
  title: string;
  category: "content" | "events" | "jobs" | "research";
  badgeText: string;
  icon8Id: string;
  fallbackIcon: React.ComponentType<{ className?: string }>;
  description: string;
  targetUrl: string;
  roleRequired: string;
  isUnlocked: boolean;
  lockReason?: string;
  actionText: string;
  tags: string[];
}

function CreationIcons8Icon({
  iconId,
  colorHex = "1769C2",
  fallback: Fallback,
  className = "size-7",
}: {
  iconId: string;
  colorHex?: string;
  fallback: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const [error, setError] = React.useState(false);
  if (error) {
    return <Fallback className={`${className} stroke-[1.9] text-[#1769c2]`} />;
  }
  return (
    <img
      src={`https://img.icons8.com/?id=${iconId}&format=png&size=64&color=${colorHex}`}
      alt=""
      className={`${className} object-contain select-none`}
      onError={() => setError(true)}
      loading="eager"
    />
  );
}

export default function CreateHubPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [activeTab, setActiveTab] = React.useState<CreationCategory>("all");
  const [profile, setProfile] = React.useState<any>(null);
  const [eligibility, setEligibility] = React.useState<{
    event?: boolean;
    camp?: boolean;
    research?: boolean;
  }>({});
  const [, setLoadingEligibility] = React.useState(true);

  // Sync profile & permissions
  React.useEffect(() => {
    if (!session?.user?.id) return;

    fetch(`/api/network/profiles/${session.user.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) setProfile(d.data);
      })
      .catch(() => {});

    // Check event/camp/research eligibility
    Promise.all([
      fetch("/api/shared/eligibility?type=event", { credentials: "include" })
        .then((r) => r.json())
        .catch(() => ({ eligible: false })),
      fetch("/api/shared/eligibility?type=camp", { credentials: "include" })
        .then((r) => r.json())
        .catch(() => ({ eligible: false })),
      fetch("/api/shared/eligibility?type=research", { credentials: "include" })
        .then((r) => r.json())
        .catch(() => ({ eligible: false })),
    ]).then(([evt, camp, res]) => {
      setEligibility({
        event: Boolean(evt?.eligible),
        camp: Boolean(camp?.eligible),
        research: Boolean(res?.eligible),
      });
      setLoadingEligibility(false);
    });
  }, [session?.user?.id]);

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <main className="min-h-dvh bg-[#faf9f8] p-6">
        <div className="mx-auto max-w-5xl space-y-4 animate-pulse">
          <div className="h-28 rounded-2xl bg-white/70 border border-[#e8e6e3]" />
          <div className="h-64 rounded-2xl bg-white/70 border border-[#e8e6e3]" />
        </div>
      </main>
    );
  }

  const isVerified = Boolean(
    profile?.registration_verified ||
    profile?.identity_verified ||
    profile?.education_verified
  );

  const creationItems: CreationCardItem[] = [
    {
      id: "post",
      title: "Clinical Post & Case Study",
      category: "content",
      badgeText: "Instant Publish",
      icon8Id: "zqRKVWtC1VeY",
      fallbackIcon: PenSquare,
      description:
        "Share clinical insights, diagnostic updates, complex cases, or research commentary with healthcare peers.",
      targetUrl: "/home",
      roleRequired: "All Healthcare Members",
      isUnlocked: true,
      actionText: "Create Post",
      tags: ["Medical Feed", "Case Discussion", "Peer Interaction"],
    },
    {
      id: "job",
      title: "Job & Fellowship Opening",
      category: "jobs",
      badgeText: "Recruitment Portal",
      icon8Id: "IOkzpfWnUztj",
      fallbackIcon: Briefcase,
      description:
        "Recruit verified physicians, therapists, nursing staff, clinical residents, or healthcare administrators.",
      targetUrl: "/recruiter/jobs/create",
      roleRequired: "Healthcare Organizations & Recruiters",
      isUnlocked: true,
      actionText: "Post Opportunity",
      tags: ["Hiring", "Clinical Positions", "Residencies"],
    },
    {
      id: "event",
      title: "Medical Event & CME Webinar",
      category: "events",
      badgeText: "CME & Certificates",
      icon8Id: "vwGXRtPWrZSn",
      fallbackIcon: Calendar,
      description:
        "Host accredited continuing medical education sessions, clinical workshops, webinars, and expert medical panels.",
      targetUrl: "/events/create",
      roleRequired: "Verified Professionals & Organizations",
      isUnlocked: isVerified || Boolean(eligibility.event),
      lockReason: "Requires verified clinician or registered organization profile.",
      actionText: "Schedule Event",
      tags: ["CME Accredited", "Webinars", "Hands-on Workshops"],
    },
    {
      id: "conference",
      title: "Conference & Academic Summit",
      category: "events",
      badgeText: "Multi-Session Summit",
      icon8Id: "FcRGrhzjfIeb",
      fallbackIcon: Award,
      description:
        "Organize multi-day medical conferences, annual society congresses, symposiums, and abstract presentation summits.",
      targetUrl: "/events/create?type=conference",
      roleRequired: "Verified Organizers & Societies",
      isUnlocked: isVerified || Boolean(eligibility.event),
      lockReason: "Requires verified organizer or healthcare society credentials.",
      actionText: "Host Conference",
      tags: ["Academic Congress", "Keynotes", "Abstract Review"],
    },
    {
      id: "camp",
      title: "Health & Clinical Screening Camp",
      category: "events",
      badgeText: "Clinical Outreach",
      icon8Id: "HBLTBJiOS1vp",
      fallbackIcon: Tent,
      description:
        "Coordinate free health screenings, rural outreach, physiotherapy camps, and recruit clinical volunteers.",
      targetUrl: "/camps/create",
      roleRequired: "Verified Clinicians & Medical NGOs",
      isUnlocked: isVerified || Boolean(eligibility.camp),
      lockReason: "Only verified healthcare professionals and NGOs can coordinate camps.",
      actionText: "Organize Camp",
      tags: ["Free Screening", "Volunteers", "Rural Health"],
    },
    {
      id: "research",
      title: "Clinical Research Project",
      category: "research",
      badgeText: "Collaborative Study",
      icon8Id: "9ZmP1ylpYlqn",
      fallbackIcon: FlaskConical,
      description:
        "Initiate clinical trials, observational studies, publish protocols, find co-authors, and recruit medical investigators.",
      targetUrl: "/research/projects/create",
      roleRequired: "Clinicians & Medical Researchers",
      isUnlocked: isVerified || Boolean(eligibility.research),
      lockReason: "Requires verified clinical or research credentials.",
      actionText: "Start Research Project",
      tags: ["Clinical Trials", "Co-Authors", "Methodology"],
    },
    {
      id: "community",
      title: "Clinical Community & Specialty Forum",
      category: "content",
      badgeText: "Peer Discussion",
      icon8Id: "aBDIThwGtLKb",
      fallbackIcon: Compass,
      description:
        "Form an exclusive discussion community for your medical subspecialty, hospital department, or alumni batch.",
      targetUrl: "/network/communities",
      roleRequired: "All Healthcare Members",
      isUnlocked: true,
      actionText: "Create Community",
      tags: ["Specialty Group", "Case Forum", "Alumni Hub"],
    },
    {
      id: "marketplace",
      title: "Medical Equipment & Practice Supplies",
      category: "jobs",
      badgeText: "Direct Inquiries",
      icon8Id: "VksxHreSn4ck",
      fallbackIcon: ShoppingBag,
      description:
        "List diagnostic equipment, rehabilitation tools, clinic furniture, medical books, or certified consumables.",
      targetUrl: "/marketplace",
      roleRequired: "Verified Practitioners & Vendors",
      isUnlocked: isVerified,
      lockReason: "Requires practitioner verification to list practice equipment.",
      actionText: "Create Listing",
      tags: ["Clinical Gear", "Clinic Setup", "Medical Books"],
    },
  ];

  const filteredItems = creationItems.filter((item) => {
    if (activeTab === "all") return true;
    return item.category === activeTab;
  });

  return (
    <main className="min-h-dvh bg-[#faf9f8] pb-24 text-[#171717]">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* ============================================================ */}
        {/* 1. HEADER SECTION */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e6e3] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#eef5fc] text-[#1769c2]">
                <Plus className="size-5 stroke-[2.5]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#171717] text-balance">
                Creation Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#77716b] text-pretty">
              Publish clinical updates, host conferences, post healthcare vacancies, or organize medical camps.
            </p>
          </div>

          {/* User Role & Verification Summary Pill */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#e8e6e3] shadow-xs">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#faf9f8] border border-[#e8e6e3] overflow-hidden">
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt={session.user.name || "User"}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-[#1769c2]">
                  {(session.user.name || "U").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#171717] truncate max-w-[140px]">
                  {session.user.name || "Healthcare Clinician"}
                </span>
                {isVerified && <ShieldCheck className="size-3.5 fill-[#1769c2]/15 text-[#1769c2]" />}
              </div>
              <p className="text-[10px] text-[#77716b] truncate">
                {profile?.designation || profile?.profession || "Healthcare Professional"}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span
                  className={`inline-block size-1.5 rounded-full ${
                    isVerified ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-[9px] font-semibold text-[#5d5854]">
                  {isVerified ? "Verified Practitioner" : "Standard Account"}
                </span>
              </div>
            </div>
            {!isVerified && (
              <button
                type="button"
                onClick={() => router.push("/verify")}
                className="shrink-0 rounded-xl bg-[#1769c2] px-3 py-1.5 text-[10px] font-bold text-white shadow-xs hover:bg-[#12569f] focus-visible:ring-2 focus-visible:ring-[#1769c2] focus-visible:ring-offset-2 focus-visible:outline-none transition"
              >
                Verify
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. ROLE PRIVILEGES BANNER (Contextual notice) */}
        {/* ============================================================ */}
        {!isVerified && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <Info className="size-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-amber-900 text-balance">
                  Some publishing features require professional license verification
                </p>
                <p className="text-amber-800 text-[11px] text-pretty">
                  Posts, clinical cases, and communities are open to all. Complete your clinical registration check to unlock accredited CME hosting, health camps, and research projects.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/verify")}
              className="shrink-0 rounded-xl bg-amber-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-800 focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 focus-visible:outline-none transition shadow-xs"
            >
              Verify Credentials
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. CATEGORY FILTER TABS */}
        {/* ============================================================ */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-xl transition shrink-0 focus-visible:ring-2 focus-visible:ring-[#1769c2] focus-visible:ring-offset-2 focus-visible:outline-none ${
              activeTab === "all"
                ? "bg-[#1769c2] text-white shadow-xs"
                : "bg-white text-[#5d5854] border border-[#e8e6e3] hover:text-[#171717] hover:bg-[#f8f7f6]"
            }`}
          >
            All Options ({creationItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`px-3.5 py-2 rounded-xl transition shrink-0 focus-visible:ring-2 focus-visible:ring-[#1769c2] focus-visible:ring-offset-2 focus-visible:outline-none ${
              activeTab === "content"
                ? "bg-[#1769c2] text-white shadow-xs"
                : "bg-white text-[#5d5854] border border-[#e8e6e3] hover:text-[#171717] hover:bg-[#f8f7f6]"
            }`}
          >
            Posts & Communities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`px-3.5 py-2 rounded-xl transition shrink-0 focus-visible:ring-2 focus-visible:ring-[#1769c2] focus-visible:ring-offset-2 focus-visible:outline-none ${
              activeTab === "events"
                ? "bg-[#1769c2] text-white shadow-xs"
                : "bg-white text-[#5d5854] border border-[#e8e6e3] hover:text-[#171717] hover:bg-[#f8f7f6]"
            }`}
          >
            Events & Camps
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("jobs")}
            className={`px-3.5 py-2 rounded-xl transition shrink-0 focus-visible:ring-2 focus-visible:ring-[#1769c2] focus-visible:ring-offset-2 focus-visible:outline-none ${
              activeTab === "jobs"
                ? "bg-[#1769c2] text-white shadow-xs"
                : "bg-white text-[#5d5854] border border-[#e8e6e3] hover:text-[#171717] hover:bg-[#f8f7f6]"
            }`}
          >
            Jobs & Market
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("research")}
            className={`px-3.5 py-2 rounded-xl transition shrink-0 focus-visible:ring-2 focus-visible:ring-[#1769c2] focus-visible:ring-offset-2 focus-visible:outline-none ${
              activeTab === "research"
                ? "bg-[#1769c2] text-white shadow-xs"
                : "bg-white text-[#5d5854] border border-[#e8e6e3] hover:text-[#171717] hover:bg-[#f8f7f6]"
            }`}
          >
            Clinical Research
          </button>
        </div>

        {/* ============================================================ */}
        {/* 4. CREATION CARDS GRID (2 columns on mobile, compact & clean) */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredItems.map((item) => {
            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-[#e8e6e3] bg-white p-3 sm:p-4 shadow-xs hover:border-[#1769c2]/30 hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Top Bar: Icon + Category Badge */}
                  <div className="flex items-start justify-between gap-1.5 mb-2.5">
                    <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[#f8f7f6] border border-[#e8e6e3] group-hover:scale-105 group-hover:border-[#1769c2]/20 transition-transform duration-200">
                      <CreationIcons8Icon
                        iconId={item.icon8Id}
                        fallback={item.fallbackIcon}
                        className="size-5"
                      />
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-[#f5f4f3] text-[#5d5854] border border-[#e8e6e3] truncate max-w-[85px] sm:max-w-none">
                      {item.badgeText}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-xs sm:text-sm font-bold text-[#171717] group-hover:text-[#1769c2] transition-colors text-balance line-clamp-2 leading-snug">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-[11px] sm:text-xs text-[#77716b] leading-relaxed text-pretty line-clamp-2 sm:line-clamp-3">
                    {item.description}
                  </p>

                  {/* Tags (visible on sm+) */}
                  <div className="mt-2 hidden sm:flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-[#faf9f8] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-[#77716b] border border-[#f0efee]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Area with Role Clearance */}
                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#f0efee] flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#77716b]">
                    {item.isUnlocked ? (
                      <CheckCircle2 className="size-3 sm:size-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="size-3 sm:size-3.5 text-amber-600 shrink-0" />
                    )}
                    <span className="truncate">{item.roleRequired}</span>
                  </div>

                  {item.isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => router.push(item.targetUrl)}
                      className="w-full inline-flex items-center justify-center gap-1 rounded-lg sm:rounded-xl bg-[#1769c2] py-1.5 sm:py-2 px-2 text-[11px] sm:text-xs font-bold text-white shadow-xs hover:bg-[#12569f] focus-visible:ring-2 focus-visible:ring-[#1769c2] focus-visible:ring-offset-1 focus-visible:outline-none transition active:scale-95 shrink-0"
                    >
                      {item.actionText} <ArrowRight className="size-3 sm:size-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push("/verify")}
                      className="w-full inline-flex items-center justify-center gap-1 rounded-lg sm:rounded-xl border border-amber-300 bg-amber-50 py-1.5 sm:py-2 px-2 text-[10px] sm:text-xs font-bold text-amber-800 hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-1 focus-visible:outline-none transition shrink-0"
                    >
                      Verify <Lock className="size-2.5 sm:size-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* 5. QUICK DRAFT / HELPFUL NOTE */}
        {/* ============================================================ */}
        <div className="rounded-2xl border border-[#e8e6e3] bg-[#faf9f8] p-4 text-center">
          <p className="text-xs text-[#77716b] text-pretty">
            Need help publishing or organizing institutional medical programs?{" "}
            <Link
              href="/network"
              className="font-bold text-[#1769c2] hover:underline focus-visible:ring-2 focus-visible:ring-[#1769c2] focus-visible:outline-none rounded"
            >
              Contact MGN Institutional Support
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
