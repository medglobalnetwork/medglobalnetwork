"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  IndianRupee,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react";
import { Job } from "../types";
import { ApplicationModal } from "./ApplicationModal";
import { JobCard } from "./JobCard";

interface JobDetailViewProps {
  job: Job;
  similarJobs: Job[];
  currentUser?: any;
  userProfile?: any;
  autoOpenApply?: boolean;
}

export function JobDetailView({
  job,
  similarJobs,
  currentUser,
  userProfile,
  autoOpenApply = false,
}: JobDetailViewProps) {
  const router = useRouter();
  const [isApplyOpen, setIsApplyOpen] = React.useState(autoOpenApply);
  const [applied, setApplied] = React.useState(Boolean(job.has_applied));
  const [saved, setSaved] = React.useState(Boolean(job.is_saved));
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const org = job.organization;
  const isVerified = org?.verification_status === "verified";

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveToggle = async () => {
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      const method = newSaved ? "POST" : "DELETE";
      const res = await fetch(`/api/opportunities/jobs/${job.id}/save`, { method });
      if (res.ok) {
        showToast(newSaved ? "Job saved to your bookmarks" : "Job removed from saved");
      } else {
        setSaved(!newSaved);
      }
    } catch {
      setSaved(!newSaved);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({
        title: `${job.title} at ${org?.name}`,
        text: `Check out this healthcare opportunity on MGN.life: ${job.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Job link copied to clipboard!");
    }
  };

  const formatSalary = () => {
    if (!job.is_salary_visible) return "Competitive Industry Standard";
    if (job.salary_min && job.salary_max) {
      if (job.salary_currency === "INR") {
        const minLakhs = (job.salary_min / 100000).toFixed(1).replace(".0", "");
        const maxLakhs = (job.salary_max / 100000).toFixed(1).replace(".0", "");
        return `₹${minLakhs} - ${maxLakhs} Lakhs per Annum`;
      }
      return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.salary_currency} / ${job.salary_period}`;
    }
    if (job.salary_min) {
      if (job.salary_currency === "INR") {
        return `₹${(job.salary_min / 100000).toFixed(1)} Lakhs+ per Annum`;
      }
      return `From ${job.salary_min.toLocaleString()} ${job.salary_currency}`;
    }
    return "Salary on Discussion";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#ded8d1] bg-[#171717] px-4 py-2 text-xs font-semibold text-white shadow-lg animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.push("/opportunities/jobs")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1769c2] hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to All Opportunities
      </button>

      {/* ─────────────────────────────────────────────
          1. HERO HEADER CARD
          ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            {org?.logo_url ? (
              <img
                src={org.logo_url}
                alt={org.name}
                className="h-16 w-16 shrink-0 rounded-2xl border border-[#ded8d1] object-cover shadow-2xs sm:h-20 sm:w-20"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#ded8d1] bg-[#eef5fc] text-xl font-bold text-[#1769c2] shadow-2xs sm:h-20 sm:w-20">
                {org?.name ? org.name.slice(0, 2).toUpperCase() : <Building2 className="h-8 w-8" />}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  onClick={() => router.push(`/opportunities/organizations/${org?.slug || org?.id}`)}
                  className="cursor-pointer text-sm font-semibold text-[#1769c2] hover:underline"
                >
                  {org?.name}
                </span>
                {isVerified && (
                  <span title="Verified Healthcare Employer" className="inline-flex items-center">
                    <ShieldCheck className="h-4 w-4 fill-[#1769c2]/15 text-[#1769c2]" />
                  </span>
                )}
              </div>

              <h1 className="text-xl font-black tracking-tight text-[#171717] sm:text-2xl">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#77716b]">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#1769c2]" />
                  {job.city ? `${job.city}, ${job.state || "India"}` : job.location || "Pan-India"}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-[#1769c2]" />
                  {job.employment_type.replace("_", " ").toUpperCase()} ({job.work_mode.toUpperCase()})
                </span>
                <span>·</span>
                <span>
                  Posted {new Date(job.published_at || job.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex shrink-0 items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={handleShare}
              title="Share Opportunity"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded8d1] bg-white text-[#5d5854] transition hover:bg-[#faf9f8]"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleSaveToggle}
              title={saved ? "Saved" : "Save Job"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded8d1] bg-white text-[#5d5854] transition hover:bg-[#faf9f8]"
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4 text-[#1769c2] fill-[#1769c2]" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>

            {applied ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#ecfdf5] px-5 py-2.5 text-xs font-bold text-[#047857]">
                <CheckCircle2 className="h-4 w-4" /> Application Submitted
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    router.push("/?login=true");
                  } else {
                    setIsApplyOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#12569f]"
              >
                Apply with MGN Profile →
              </button>
            )}
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#f5f4f3] pt-5 sm:grid-cols-4">
          <div className="rounded-2xl bg-[#faf9f8] p-3 text-xs">
            <span className="text-[10px] font-bold uppercase text-[#77716b]">Compensation</span>
            <p className="mt-0.5 font-bold text-[#171717]">{formatSalary()}</p>
          </div>

          <div className="rounded-2xl bg-[#faf9f8] p-3 text-xs">
            <span className="text-[10px] font-bold uppercase text-[#77716b]">Experience Required</span>
            <p className="mt-0.5 font-bold text-[#171717]">
              {job.experience_min === 0 ? "Freshers Eligible" : `${job.experience_min} - ${job.experience_max || "+"} Years`}
            </p>
          </div>

          <div className="rounded-2xl bg-[#faf9f8] p-3 text-xs">
            <span className="text-[10px] font-bold uppercase text-[#77716b]">Profession / Specialty</span>
            <p className="mt-0.5 font-bold text-[#171717] truncate">
              {job.specialization || job.profession || "Healthcare"}
            </p>
          </div>

          <div className="rounded-2xl bg-[#faf9f8] p-3 text-xs">
            <span className="text-[10px] font-bold uppercase text-[#77716b]">Applicants</span>
            <p className="mt-0.5 font-bold text-[#171717]">{job.applicant_count} Applied</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          2. MAIN DETAILS & SIDEBAR SPLIT
          ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3): Job Overview & Clinical Scope */}
        <div className="space-y-6 lg:col-span-2">
          {/* About the Position */}
          <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717]">About the Opportunity</h2>
            <p className="whitespace-pre-line text-xs leading-relaxed text-[#44403c]">
              {job.description}
            </p>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && (
            <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-[#171717]">Clinical Responsibilities</h2>
              <p className="whitespace-pre-line text-xs leading-relaxed text-[#44403c]">
                {job.responsibilities}
              </p>
            </div>
          )}

          {/* Requirements & Qualifications */}
          {job.requirements && (
            <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-[#171717]">Qualifications & Requirements</h2>
              <p className="whitespace-pre-line text-xs leading-relaxed text-[#44403c]">
                {job.requirements}
              </p>

              {job.qualifications && job.qualifications.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-[#f5f4f3] pt-3">
                  <span className="block text-[11px] font-bold uppercase text-[#77716b]">Required Degrees / Certifications</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.qualifications.map((q) => (
                      <span key={q} className="rounded-xl bg-[#eef5fc] px-3 py-1 text-xs font-semibold text-[#1769c2]">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills Required */}
          {job.skills && job.skills.length > 0 && (
            <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-[#171717]">Clinical Skills & Competencies</h2>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[#ded8d1] bg-[#faf9f8] px-3 py-1 text-xs font-medium text-[#44403c]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-[#15803d]" /> Benefits & Offerings
              </h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs text-[#44403c]">
                {job.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#15803d] shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column (1/3): Organization & Similar Jobs */}
        <div className="space-y-6">
          {/* Organization Card */}
          <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">About the Organization</h3>
            
            <div className="flex items-center gap-3">
              {org?.logo_url ? (
                <img src={org.logo_url} alt={org.name} className="h-12 w-12 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5fc] font-bold text-[#1769c2]">
                  {org?.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="font-bold text-[#171717] text-xs sm:text-sm">{org?.name}</h4>
                <p className="text-[11px] text-[#77716b]">{org?.organization_type} · {org?.city}</p>
              </div>
            </div>

            {org?.description && (
              <p className="text-xs leading-relaxed text-[#5d5854] line-clamp-4">
                {org.description}
              </p>
            )}

            <button
              type="button"
              onClick={() => router.push(`/opportunities/organizations/${org?.slug || org?.id}`)}
              className="w-full rounded-xl bg-[#eef5fc] py-2 text-xs font-bold text-[#1769c2] transition hover:bg-[#1769c2] hover:text-white"
            >
              View Organization & Openings →
            </button>
          </div>

          {/* Similar Opportunities */}
          {similarJobs.length > 0 && (
            <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#171717]">Similar Clinical Openings</h3>
              <div className="space-y-3">
                {similarJobs.map((simJob) => (
                  <div
                    key={simJob.id}
                    onClick={() => router.push(`/opportunities/jobs/${simJob.slug || simJob.id}`)}
                    className="cursor-pointer rounded-2xl border border-[#f5f4f3] p-3 transition hover:border-[#1769c2] hover:bg-[#f0f7ff]"
                  >
                    <h4 className="font-bold text-xs text-[#171717] line-clamp-1">{simJob.title}</h4>
                    <p className="text-[11px] text-[#77716b]">{simJob.organization?.name} · {simJob.city}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Flow Modal */}
      <ApplicationModal
        job={job}
        user={currentUser}
        userProfile={userProfile}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSuccess={() => {
          setIsApplyOpen(false);
          setApplied(true);
          showToast("Application submitted successfully!");
        }}
      />
    </div>
  );
}
