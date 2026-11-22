"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Course } from "../types";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";
import { Award, Clock, Star, Stethoscope, Users, PlayCircle } from "lucide-react";

interface CourseCardProps {
  course: Course;
  compact?: boolean;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Physiotherapy: { bg: "bg-[#eef5fc]", text: "text-[#1769c2]", border: "border-[#1769c2]/20" },
  Medicine: { bg: "bg-[#fef2f2]", text: "text-[#b91c1c]", border: "border-[#b91c1c]/20" },
  Cardiology: { bg: "bg-[#fdf2f8]", text: "text-[#be185d]", border: "border-[#be185d]/20" },
  Orthopedics: { bg: "bg-[#ecfdf5]", text: "text-[#047857]", border: "border-[#047857]/20" },
  Neurology: { bg: "bg-[#f5f3ff]", text: "text-[#6d28d9]", border: "border-[#6d28d9]/20" },
  Pediatrics: { bg: "bg-[#fffbeb]", text: "text-[#b45309]", border: "border-[#b45309]/20" },
  "Clinical Research": { bg: "bg-[#f0fdfa]", text: "text-[#0f766e]", border: "border-[#0f766e]/20" },
  Nursing: { bg: "bg-[#f0fdf4]", text: "text-[#15803d]", border: "border-[#15803d]/20" },
};

export function CourseCard({ course, compact = false }: CourseCardProps) {
  const router = useRouter();

  const catStyle = CATEGORY_STYLES[course.category] || {
    bg: "bg-[#f5f4f3]",
    text: "text-[#5d5854]",
    border: "border-[#e8e6e3]",
  };

  const formatDuration = (mins: number) => {
    if (!mins) return "2h";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const instructor = course.instructor;
  const isVerified =
    instructor?.identity_verified ||
    instructor?.education_verified ||
    instructor?.registration_verified ||
    true;

  return (
    <div
      onClick={() => router.push(`/learn/course/${course.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/learn/course/${course.id}`)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-[#e8e6e3] bg-white shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#1769c2]/40 hover:shadow-md"
    >
      {/* 1. Thumbnail Header */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f0efee]">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1769c2]/10 via-[#0284c7]/10 to-[#f5f4f3] p-3 text-center">
            <Stethoscope className="h-7 w-7 sm:h-10 sm:w-10 text-[#1769c2]/60" />
          </div>
        )}

        {/* Gradient Overlay on Hover (Desktop) */}
        <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity items-end p-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white drop-shadow-sm">
            <PlayCircle className="h-4 w-4 text-[#1769c2] fill-white" />
            <span>View Masterclass</span>
          </span>
        </div>

        {/* Top Badges: MGN Target Batch & Specialty */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-wrap gap-1">
          <span
            className="rounded-md px-1.5 py-0.5 sm:px-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#0f4c81] text-white shadow-xs"
          >
            TARGET 2026
          </span>
          <span
            className={`rounded-md px-1.5 py-0.5 sm:px-2 text-[9px] sm:text-[10px] font-bold border shadow-2xs backdrop-blur-xs ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
          >
            {course.category}
          </span>
        </div>

        {/* Certificate Badge */}
        {course.certificate_enabled && (
          <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex items-center gap-0.5 sm:gap-1 rounded-md bg-[#171717]/85 px-1.5 py-0.5 sm:px-2 text-[9px] sm:text-[10px] font-bold text-white backdrop-blur-xs shadow-xs">
            <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-400" />
            <span>CME ACCREDITED</span>
          </div>
        )}
      </div>

      {/* 2. Content Details: MGN Batch Details */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 bg-white dark:bg-[#161b22]">
        <div>
          {/* Title */}
          <h3 className="line-clamp-2 text-xs sm:text-sm font-black tracking-tight text-[#171717] dark:text-[#f0f6fc] group-hover:text-[#0f4c81] transition-colors leading-snug">
            {course.title}
          </h3>

          {/* MGN Batch Offerings Checklist */}
          <div className="mt-2 space-y-1 text-[10px] sm:text-[11px] text-[#5d5854] dark:text-[#8b949e]">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Live & Recorded Video Masterclasses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Daily Practice Problems (DPP) & Notes PDF</span>
            </div>
          </div>

          {/* Instructor Row */}
          <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
            <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef5fc] text-[9px] sm:text-[10px] font-bold text-[#0f4c81] ring-1 ring-[#ded8d1]">
              {instructor?.image ? (
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                instructor?.name?.slice(0, 2).toUpperCase() || "DR"
              )}
            </div>
            <span className="truncate text-[11px] sm:text-xs font-semibold text-[#44403c] dark:text-[#c9d1d9]">
              By {instructor?.name || "India's Top Faculty"}
            </span>
            {isVerified && <VerificationBadge size="sm" />}
          </div>
        </div>

        {/* 3. Footer: Pricing & Classroom Action */}
        <div className="mt-3 sm:mt-4 border-t border-[#f0efee] dark:border-[#30363d] pt-2.5 sm:pt-3">
          {course.user_enrolled && course.user_progress !== undefined ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] sm:text-[11px] font-bold text-[#0f4c81]">
                <span>Classroom Progress</span>
                <span>{course.user_progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0efee]">
                <div
                  className="h-full rounded-full bg-[#0f4c81] transition-all duration-300"
                  style={{ width: `${course.user_progress}%` }}
                />
              </div>
              <div className="w-full text-center py-1 mt-1 rounded-lg bg-[#eef5fc] dark:bg-[#1c2433] text-[11px] font-black text-[#0f4c81] dark:text-[#58a6ff]">
                Go to Classroom →
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {/* Pricing with Slashed Price and Discount % */}
              <div>
                {course.is_free ? (
                  <span className="text-xs sm:text-sm font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    FREE BATCH
                  </span>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm sm:text-base font-black text-[#171717] dark:text-[#f0f6fc]">
                      ₹{course.price}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#a8a29e] line-through">
                      ₹{Math.round(course.price * 2.2)}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">
                      55% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Explore Button */}
              <span className="text-[10px] sm:text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] group-hover:translate-x-0.5 transition-transform">
                Explore Batch →
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
