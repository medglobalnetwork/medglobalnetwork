"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Course } from "../types";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";

interface CourseCardProps {
  course: Course;
  compact?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Physiotherapy: { bg: "bg-[#eef5fc]", text: "text-[#1769c2]" },
  Medicine: { bg: "bg-[#fef2f2]", text: "text-[#b91c1c]" },
  Cardiology: { bg: "bg-[#fdf2f8]", text: "text-[#be185d]" },
  Orthopedics: { bg: "bg-[#ecfdf5]", text: "text-[#047857]" },
  Neurology: { bg: "bg-[#f5f3ff]", text: "text-[#6d28d9]" },
  Pediatrics: { bg: "bg-[#fffbeb]", text: "text-[#b45309]" },
  "Clinical Research": { bg: "bg-[#f0fdfa]", text: "text-[#0f766e]" },
  Nursing: { bg: "bg-[#f0fdf4]", text: "text-[#15803d]" },
};

export function CourseCard({ course, compact = false }: CourseCardProps) {
  const router = useRouter();

  const catStyle = CATEGORY_COLORS[course.category] || {
    bg: "bg-[#f5f4f3]",
    text: "text-[#5d5854]",
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const instructor = course.instructor;
  const isVerified =
    instructor?.identity_verified ||
    instructor?.education_verified ||
    instructor?.registration_verified;

  return (
    <div
      onClick={() => router.push(`/learn/course/${course.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/learn/course/${course.id}`)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#ded8d1] bg-white shadow-2xs transition-all hover:-translate-y-1 hover:border-[#cfc6be] hover:shadow-md"
    >
      {/* 1. Thumbnail Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#eef5fc]">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1769c2]/10 via-[#0284c7]/10 to-[#f5f4f3] p-4 text-center">
            <span className="text-3xl">🩺</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-2xs ${catStyle.bg} ${catStyle.text}`}
          >
            {course.category}
          </span>
          {course.profession && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#171717] shadow-2xs backdrop-blur-xs">
              {course.profession}
            </span>
          )}
        </div>

        {/* Certificate Badge */}
        {course.certificate_enabled && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-[#171717]/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
            <span>📜</span>
            <span>Cert</span>
          </div>
        )}
      </div>

      {/* 2. Content Details */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-bold text-[#171717] group-hover:text-[#1769c2]">
            {course.title}
          </h3>

          {/* Short Description */}
          {!compact && course.short_description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#77716b]">
              {course.short_description}
            </p>
          )}

          {/* Instructor Row */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef5fc] text-[10px] font-bold text-[#1769c2]">
              {instructor?.image ? (
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                instructor?.name.slice(0, 2).toUpperCase() || "DR"
              )}
            </div>
            <span className="truncate text-xs font-semibold text-[#5d5854]">
              {instructor?.name || "Healthcare Faculty"}
            </span>
            {isVerified && <VerificationBadge size="sm" />}
          </div>
        </div>

        {/* 3. Footer Stats / Progress */}
        <div className="mt-4 border-t border-[#f5f4f3] pt-3">
          {course.user_enrolled && course.user_progress !== undefined ? (
            <div>
              <div className="flex justify-between text-[11px] font-medium text-[#77716b]">
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
                <span className="flex items-center gap-1 text-[11px]">
                  ⏱ {formatDuration(course.duration_minutes)}
                </span>
                {course.rating_avg > 0 && (
                  <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#b45309]">
                    ★ {course.rating_avg.toFixed(1)}
                  </span>
                )}
              </div>

              <span className="text-xs font-bold text-[#15803d]">
                {course.is_free ? "Free CME" : `₹${course.price}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
