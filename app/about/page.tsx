import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Users,
  Globe2,
  Stethoscope,
  GraduationCap,
  Briefcase,
  Building2,
  ChevronRight,
  ArrowRight,
  HeartHandshake,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us | MedGlobalNetwork (MGN)",
  description:
    "Learn about MedGlobalNetwork (MGN) – the dedicated, 100% verified professional network uniting physicians, surgeons, physical therapists, medical institutions, and healthcare innovators worldwide.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About MedGlobalNetwork (MGN)",
    description:
      "Empowering verified medical professionals, advancing healthcare education, and connecting clinical practitioners worldwide.",
    url: `${SITE_URL}/about`,
    type: "website",
  },
};

export default function AboutPage() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "100% Verified Clinicians",
      description:
        "Every doctor, specialist, and medical student on MGN undergoes strict credential verification through official medical council IDs and licensing records.",
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900",
    },
    {
      icon: GraduationCap,
      title: "Continuous Medical Education",
      description:
        "Accredited CME courses, live clinical webinars, hands-on surgical case workshops, and peer-reviewed case study reviews to upskill medical teams.",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900",
    },
    {
      icon: Briefcase,
      title: "Clinical Careers & Locum Tenens",
      description:
        "Direct connection between leading multi-specialty hospitals, research institutes, diagnostic labs, and medical talent without recruitment middlemen.",
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900",
    },
    {
      icon: HeartHandshake,
      title: "Community Outreach & Camps",
      description:
        "Organize, volunteer, and track community health camps, surgical drives, and preventive rural wellness missions with seamless digital records.",
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900",
    },
  ];

  const milestones = [
    { number: "100%", label: "Verified Credentials" },
    { number: "50+", label: "Medical Specialties" },
    { number: "24/7", label: "Peer Collaboration" },
    { number: "DPDP", label: "Compliant & Encrypted" },
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
          <span className="text-[#171717] dark:text-[#f0f6fc] font-semibold">About Us</span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-3.5 py-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff]">
            <Sparkles className="size-3.5" />
            <span>Uniting Healthcare Excellence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#171717] dark:text-[#f0f6fc]">
            Building the Global Network for Healthcare Pioneers
          </h1>
          <p className="text-sm sm:text-base text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
            MedGlobalNetwork (MGN) is the premier social and professional platform exclusively tailored for doctors, surgeons, physical therapists, nurses, healthcare institutions, and biomedical researchers.
          </p>
        </div>

        {/* Milestone Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {milestones.map((m, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 text-center shadow-xs"
            >
              <div className="text-2xl sm:text-3xl font-black text-[#0f4c81] dark:text-[#58a6ff]">
                {m.number}
              </div>
              <div className="mt-1 text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#0f4c81] dark:text-[#58a6ff]">
              <Globe2 className="size-5" />
            </div>
            <h2 className="text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">Our Mission</h2>
            <p className="text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
              To eliminate professional silos in medicine by giving healthcare workers a secure, verified environment to discuss complex clinical cases, share breakthrough discoveries, access continuous learning, and find life-changing opportunities.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#16804d] dark:text-emerald-400">
              <Award className="size-5" />
            </div>
            <h2 className="text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">Our Vision</h2>
            <p className="text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
              To become the world&apos;s most trusted healthcare professional ecosystem, where clinical knowledge flows effortlessly, medical innovation accelerates, and patient outcomes improve worldwide through peer collaboration.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-[#171717] dark:text-[#f0f6fc]">
              What Sets MGN Apart
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e]">
              Engineered from the ground up to respect medical ethics, patient confidentiality, and clinical standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className={`size-10 rounded-xl border flex items-center justify-center ${pillar.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust & DPDP Privacy Section */}
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/70 via-white to-emerald-50/50 dark:from-[#111927] dark:via-[#161b22] dark:to-[#0d1e19] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Lock className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                Medical Privacy & Data Governance (DPDP Act 2023)
              </h3>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e]">
                We enforce the highest standards of data security, TLS encryption, and Indian DPDP compliance.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#5d5854] dark:text-[#8b949e]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>De-identified Patient Cases</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Encrypted Credentials Vault</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Dedicated Grievance Desk</span>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="rounded-2xl bg-[#0f4c81] text-white p-8 sm:p-10 text-center space-y-5 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Join Thousands of Verified Medical Leaders
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
            Create your verified clinical profile today. Expand your professional network, share cases, and unlock global opportunities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#0f4c81] hover:bg-blue-50 transition shadow-md"
            >
              <span>Get Started – It&apos;s Free</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
            >
              <span>Explore All Features</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
