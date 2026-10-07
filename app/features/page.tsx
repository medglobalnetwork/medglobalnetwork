import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Briefcase,
  GraduationCap,
  ShoppingCart,
  Calendar,
  HeartHandshake,
  BookOpen,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Stethoscope,
  MessageSquare,
  FileCheck,
  Building2,
  TrendingUp,
  Share2,
} from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Features & Capabilities | MedGlobalNetwork (MGN)",
  description:
    "Explore the complete suite of features on MedGlobalNetwork (MGN) – verified doctor networking, accredited CME courses, clinical job board, medical camps, marketplace, and research collaboration.",
  alternates: {
    canonical: `${SITE_URL}/features`,
  },
  openGraph: {
    title: "MedGlobalNetwork Features – Clinical Network & Medical Growth",
    description:
      "All-in-one ecosystem for healthcare professionals: networking, CME learning, job opportunities, and medical equipment marketplace.",
    url: `${SITE_URL}/features`,
    type: "website",
  },
};

export default function FeaturesPage() {
  const featureList = [
    {
      id: "network",
      badge: "Social & Professional",
      title: "100% Verified Clinician Networking",
      description:
        "Connect with doctors, specialists, nurses, and researchers verified via medical council registration. Share clinical posts, discuss complex diagnostic dilemmas, and publish case photos in a peer-only space.",
      icon: Users,
      color: "text-[#0f4c81] dark:text-[#58a6ff] bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900",
      bullets: [
        "Verified badge for verified medical council practitioners",
        "Direct peer messaging and group clinical discussions",
        "Filter connections by specialty, hospital, or city",
      ],
      link: "/network",
      linkText: "Explore Network",
    },
    {
      id: "learn",
      badge: "Skill Development",
      title: "CME & Medical Learning Hub",
      description:
        "Earn CME credits, watch high-yield surgical video modules, and access peer-reviewed educational articles authored by leading department chairs and subject matter experts.",
      icon: GraduationCap,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900",
      bullets: [
        "Interactive clinical quizzes and knowledge assessments",
        "Curated medical literature summaries and drug updates",
        "Certificate of completion for qualifying courses",
      ],
      link: "/learn",
      linkText: "Browse Courses",
    },
    {
      id: "jobs",
      badge: "Career Advancement",
      title: "Medical Jobs & Locum Opportunities",
      description:
        "Browse verified healthcare openings from top hospitals, research labs, diagnostic centers, and clinics. Apply directly with your structured MGN clinical profile.",
      icon: Briefcase,
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900",
      bullets: [
        "Specialist doctor, resident, and nursing openings",
        "Locum tenens and visiting consultant contracts",
        "Direct recruiter outreach without middlemen",
      ],
      link: "/opportunities/jobs",
      linkText: "Find Jobs",
    },
    {
      id: "camps",
      badge: "Public Health",
      title: "Medical Camps & Health Drives",
      description:
        "Organize, volunteer, and manage community medical outreach drives. Track screening counts, volunteer doctor rosters, and patient follow-ups with digital accuracy.",
      icon: HeartHandshake,
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900",
      bullets: [
        "Organize free health checkups and rural diagnostic drives",
        "Volunteer doctor signups and coordinated scheduling",
        "Impact reporting and patient follow-up registries",
      ],
      link: "/camps",
      linkText: "Explore Camps",
    },
    {
      id: "events",
      badge: "Conferences & CMEs",
      title: "Medical Events & Conferences",
      description:
        "Discover upcoming national and international medical summits, hands-on surgical workshops, and online clinical webinars across all therapeutic areas.",
      icon: Calendar,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900",
      bullets: [
        "Register for hybrid, virtual, and in-person summits",
        "Submit abstracts and paper presentations",
        "Sync event schedules to personal calendars",
      ],
      link: "/events",
      linkText: "View Events",
    },
    {
      id: "marketplace",
      badge: "B2B & Supplies",
      title: "Healthcare Marketplace",
      description:
        "Buy, lease, and sell new or refurbished medical devices, diagnostic kits, clinic equipment, and consumables from trusted medical vendors and fellow practitioners.",
      icon: ShoppingCart,
      color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900",
      bullets: [
        "Verified medical equipment dealers & certified pre-owned",
        "Direct doctor-to-doctor clinic asset listings",
        "Request quotes and bulk clinic pricing",
      ],
      link: "/marketplace",
      linkText: "Visit Marketplace",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#77716b] dark:text-[#8b949e]">
          <Link href="/" className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff]">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-[#171717] dark:text-[#f0f6fc] font-semibold">Features</span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-3.5 py-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff]">
            <Sparkles className="size-3.5" />
            <span>The Complete Medical Ecosystem</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#171717] dark:text-[#f0f6fc]">
            Built Specifically for Healthcare Professionals
          </h1>
          <p className="text-sm sm:text-base text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
            From clinical networking and accredited CMEs to healthcare recruitment and medical camp management — explore everything MGN has to offer.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`size-11 rounded-xl border flex items-center justify-center ${item.color}`}>
                      <Icon className="size-5.5" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                      {item.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-[#ded8d1]/60 dark:border-[#30363d]/60">
                    {item.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#5d5854] dark:text-[#8b949e]">
                        <span className="text-[#16804d] dark:text-emerald-400 font-bold">✓</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:gap-2.5 transition-all"
                  >
                    <span>{item.linkText}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Verification Guarantee */}
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/80 to-emerald-50/80 dark:from-[#0d1626] dark:to-[#091a13] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 justify-between shadow-xs">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff]">
              <ShieldCheck className="size-4" />
              <span>Security & Privacy Built-in</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">
              All accounts are verified with official medical councils
            </h3>
            <p className="text-xs text-[#5d5854] dark:text-[#8b949e] max-w-xl">
              Spam-free, troll-free, and compliant with medical ethics and DPDP Act 2023 regulations.
            </p>
          </div>
          <Link
            href="/signup"
            className="shrink-0 rounded-xl bg-[#0f4c81] dark:bg-[#58a6ff] text-white dark:text-[#0d1117] px-6 py-3 text-xs sm:text-sm font-bold hover:opacity-90 transition shadow-md"
          >
            Join the Network
          </Link>
        </div>
      </div>
    </div>
  );
}
