"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Job } from "../types";

interface JobCardProps {
  job: Job;
  onSaveToggle?: (jobId: string, isSaved: boolean) => void;
  onApplyClick?: (job: Job) => void;
}

export function JobCard({ job, onSaveToggle, onApplyClick }: JobCardProps) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(Boolean(job.is_saved));
  const [saving, setSaving] = React.useState(false);

  const org = job.organization;
  const isVerified = org?.verification_status === "verified";

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    const newSaved = !saved;
    setSaved(newSaved);

    try {
      const method = newSaved ? "POST" : "DELETE";
      const res = await fetch(`/api/opportunities/jobs/${job.id}/save`, { method });
      if (res.ok) {
        onSaveToggle?.(job.id, newSaved);
      } else {
        setSaved(!newSaved); // rollback
      }
    } catch {
      setSaved(!newSaved);
    } finally {
      setSaving(false);
    }
  };

  const formatSalary = () => {
    if (!job.is_salary_visible) return "Competitive Compensation";
    if (job.salary_min && job.salary_max) {
      if (job.salary_currency === "INR") {
        const minLakhs = (job.salary_min / 100000).toFixed(1).replace(".0", "");
        const maxLakhs = (job.salary_max / 100000).toFixed(1).replace(".0", "");
        return `₹${minLakhs} - ${maxLakhs} LPA`;
      }
      return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.salary_currency}`;
    }
    if (job.salary_min) {
      if (job.salary_currency === "INR") {
        return `From ₹${(job.salary_min / 100000).toFixed(1)} LPA`;
      }
      return `From ${job.salary_min.toLocaleString()} ${job.salary_currency}`;
    }
    return "Salary on Discussion";
  };

  const getWorkModeBadge = () => {
    switch (job.work_mode) {
      case "remote":
        return { label: "Remote", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "hybrid":
        return { label: "Hybrid", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      default:
        return { label: "On-site", bg: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const workMode = getWorkModeBadge();

  return (
    <div
      onClick={() => router.push(`/opportunities/jobs/${job.slug || job.id}`)}
      className="group relative flex cursor-pointer flex-col justify-between rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-2xs transition hover:-translate-y-0.5 hover:border-[#0f4c81] hover:shadow-md"
    >
      <div>
        {/* Top Header: Logo, Org Name, Save & Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {org?.logo_url ? (
              <img
                src={org.logo_url}
                alt={org.name}
                className="h-12 w-12 shrink-0 rounded-2xl border border-[#e8e6e3] object-cover shadow-2xs"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#e8e6e3] bg-[#f0efee] text-base font-bold text-[#0f4c81] shadow-2xs">
                {org?.name ? org.name.slice(0, 2).toUpperCase() : <Building2 className="h-6 w-6" />}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-semibold text-[#77716b]">{org?.name}</span>
                {isVerified && (
                  <span title="Verified Healthcare Employer" className="inline-flex items-center">
                    <ShieldCheck className="h-3.5 w-3.5 fill-[#16804d]/15 text-[#16804d]" />
                  </span>
                )}
              </div>
              <h3 className="line-clamp-1 text-sm font-bold text-[#171717] transition group-hover:text-[#0f4c81] sm:text-base">
                {job.title}
              </h3>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleSave}
            title={saved ? "Saved" : "Save Job"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ded8d1] bg-white text-[#77716b] transition hover:border-[#0f4c81] hover:text-[#0f4c81]"
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4 text-[#0f4c81] fill-[#0f4c81]" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Badges & Meta Row */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${workMode.bg}`}>
            {workMode.label}
          </span>

          <span className="rounded-full bg-[#f5f4f3] px-2.5 py-0.5 text-[11px] font-medium text-[#5d5854]">
            {job.employment_type.replace("_", " ").toUpperCase()}
          </span>

          {job.experience_min !== undefined && (
            <span className="rounded-full bg-[#f5f4f3] px-2.5 py-0.5 text-[11px] font-medium text-[#5d5854]">
              {job.experience_min === 0 ? "Fresher Friendly" : `${job.experience_min}+ yrs exp`}
            </span>
          )}

          {job.is_urgent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
              <Zap className="h-3 w-3 fill-amber-500 text-amber-500" /> Urgent Hiring
            </span>
          )}

          {job.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
          )}
        </div>

        {/* Location & Salary Info */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#f5f4f3] pt-3 text-xs text-[#5d5854]">
          <div className="flex items-center gap-1 text-[#77716b]">
            <MapPin className="h-3.5 w-3.5 text-[#0f4c81]" />
            <span className="truncate">{job.city ? `${job.city}, ${job.state || "India"}` : job.location || "Pan-India"}</span>
          </div>

          <div className="font-bold text-[#171717]">
            {formatSalary()}
          </div>
        </div>
      </div>

      {/* Footer CTA & Application Status */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f5f4f3] pt-3 text-xs">
        <span className="text-[11px] text-[#77716b]">
          Posted {new Date(job.published_at || job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>

        {job.has_applied ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-bold text-[#16804d]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Applied
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onApplyClick) {
                onApplyClick(job);
              } else {
                router.push(`/opportunities/jobs/${job.slug || job.id}?apply=true`);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#0c3c66]"
          >
            Easy Apply →
          </button>
        )}
      </div>
    </div>
  );
}
