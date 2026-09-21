"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Course } from "../types";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";
import { Award, Clock, Star, Stethoscope, Users, PlayCircle, Sparkles } from "lucide-react";

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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#e8e6e3] bg-white shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#1769c2]/40 hover:shadow-md"
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
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1769c2]/10 via-[#0284c7]/10 to-[#f5f4f3] p-4 text-center">
            <Stethoscope className="h-10 w-10 text-[#1769c2]/60" />
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white drop-shadow-sm">
            <PlayCircle className="h-4 w-4 text-[#1769c2] fill-white" />
            <span>View Masterclass</span>
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border shadow-2xs backdrop-blur-xs ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
          >
            {course.category}
          </span>
          {course.level && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#171717] shadow-2xs backdrop-blur-xs">
              {course.level.replace(/_/g, " ")}
            </span>
          )}
        </div>

        {/* Certificate Badge */}
        {course.certificate_enabled && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-[#171717]/80 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs shadow-xs">
            <Award className="h-3 w-3 text-amber-400" />
            <span>CME Verified</span>
          </div>
        )}
      </div>

      {/* 2. Content Details */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-bold tracking-tight text-[#171717] group-hover:text-[#1769c2] transition-colors leading-snug">
            {course.title}
          </h3>

          {/* Short Description */}
          {!compact && course.short_description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#77716b]">
              {course.short_description}
            </p>
          )}

          {/* Instructor Row */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef5fc] text-[10px] font-bold text-[#1769c2] ring-1 ring-[#ded8d1]">
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
            <span className="truncate text-xs font-semibold text-[#44403c]">
              {instructor?.name || "Senior Medical Faculty"}
            </span>
            {isVerified && <VerificationBadge size="sm" />}
          </div>
        </div>

        {/* 3. Footer Stats / Progress */}
        <div className="mt-4 border-t border-[#f5f4f3] pt-3">
          {course.user_enrolled && course.user_progress !== undefined ? (
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-[#77716b]">
                <span>Progress</span>
                <span className="font-bold text-[#1769c2]">{course.user_progress}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f0efee]">
                <div
                  className="h-full rounded-full bg-[#1769c2] transition-all duration-300"
                  style={{ width: `${course.user_progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-[#77716b]">
                <span className="flex items-center gap-1 text-[11px] font-medium">
                  <Clock className="h-3 w-3 text-[#a8a29e]" /> {formatDuration(course.duration_minutes)}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#b45309]">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {course.rating_avg ? course.rating_avg.toFixed(1) : "4.9"}
                </span>
                {course.enrollment_count !== undefined && course.enrollment_count > 0 && (
                  <span className="hidden sm:flex items-center gap-1 text-[11px] text-[#8a8784]">
                    <Users className="h-3 w-3 text-[#a8a29e]" /> {course.enrollment_count}
                  </span>
                )}
              </div>

              <span
                className={`text-xs font-bold rounded-md px-2 py-0.5 ${
                  course.is_free
                    ? "bg-[#dcfce7] text-[#15803d]"
                    : "bg-[#f5f4f3] text-[#171717]"
                }`}
              >
                {course.is_free ? "Free CME" : `₹${course.price}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
