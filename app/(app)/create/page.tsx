"use client";

// ============================================================
// MGN Creation Hub — /create
// Unified Creation Center for Posts, Jobs, Events, Conferences,
// Health Camps, Research Projects, Communities & Marketplace
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
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { MemberBadge } from "@/modules/network/components/MemberBadge";

type CreationCategory = "all" | "content" | "events" | "jobs" | "research";

interface CreationCardItem {
  id: string;
  title: string;
  category: "content" | "events" | "jobs" | "research";
  badgeText: string;
  badgeColor: string;
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
  className = "h-7 w-7",
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
  const [loadingEligibility, setLoadingEligibility] = React.useState(true);

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
      <main className="min-h-screen bg-[#faf9f8] p-6">
        <div className="mx-auto max-w-5xl space-y-4 animate-pulse">
          <div className="h-28 rounded-3xl bg-white/70" />
          <div className="h-64 rounded-3xl bg-white/70" />
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
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon8Id: "i6fZC6wuprSu",
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
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
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
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
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
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon8Id: "YzsadpdsoN8e",
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
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
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
      badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
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
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
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
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
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
    <main className="min-h-screen bg-[#faf9f8] pb-24 text-[#171717]">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* ============================================================ */}
        {/* 1. HEADER SECTION */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e6e3] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef5fc] text-[#1769c2]">
                <Plus className="h-5 w-5 stroke-[2.5]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
                Creation Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#77716b]">
              Publish clinical updates, host conferences, post healthcare vacancies, or organize medical camps.
            </p>
          </div>

          {/* User Role & Verification Summary Pill */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#e8e6e3] shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#faf9f8] border border-[#e8e6e3]">
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt={session.user.name || "User"}
                  className="h-full w-full rounded-full object-cover"
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
                {isVerified && <ShieldCheck className="h-3.5 w-3.5 fill-[#1769c2]/15 text-[#1769c2]" />}
              </div>
              <p className="text-[10px] text-[#77716b]">
                {profile?.designation || profile?.profession || "Healthcare Professional"}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
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
                className="shrink-0 rounded-xl bg-[#1769c2] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-2xs hover:bg-[#12569f] transition"
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
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-amber-900">
                  Some publishing features require professional license verification
                </p>
                <p className="text-amber-800 text-[11px]">
                  Posts, clinical cases, and communities are open to all. Complete your clinical registration check to unlock accredited CME hosting, health camps, and research projects.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/verify")}
              className="shrink-0 rounded-xl bg-amber-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-800 transition shadow-xs"
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
            className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
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
            className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
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
            className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
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
            className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
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
            className={`px-3.5 py-2 rounded-xl transition shrink-0 ${
              activeTab === "research"
                ? "bg-[#1769c2] text-white shadow-xs"
                : "bg-white text-[#5d5854] border border-[#e8e6e3] hover:text-[#171717] hover:bg-[#f8f7f6]"
            }`}
          >
            Clinical Research
          </button>
        </div>

        {/* ============================================================ */}
        {/* 4. CREATION CARDS GRID */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredItems.map((item) => {
            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-[#e8e6e3] bg-white p-5 shadow-2xs hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Top Bar: Icon + Category Badge */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f7f6] border border-[#f0efee] group-hover:scale-105 transition-transform duration-200">
                      <CreationIcons8Icon
                        iconId={item.icon8Id}
                        fallback={item.fallbackIcon}
                        className="h-6 w-6"
                      />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${item.badgeColor}`}
                    >
                      {item.badgeText}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-[#171717] group-hover:text-[#1769c2] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#77716b] leading-relaxed">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-lg bg-[#faf9f8] px-2 py-0.5 text-[10px] font-semibold text-[#77716b]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Area with Role Clearance */}
                <div className="mt-5 pt-3.5 border-t border-[#f5f4f3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#77716b]">
                    {item.isUnlocked ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    )}
                    <span className="truncate">{item.roleRequired}</span>
                  </div>

                  {item.isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => router.push(item.targetUrl)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#12569f] transition active:scale-95 shrink-0"
                    >
                      {item.actionText} <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push("/verify")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shrink-0"
                    >
                      Verify to Unlock <Lock className="h-3 w-3" />
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
          <p className="text-xs text-[#77716b]">
            Need help publishing or organizing institutional medical programs?{" "}
            <Link href="/network" className="font-bold text-[#1769c2] hover:underline">
              Contact MGN Institutional Support
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
