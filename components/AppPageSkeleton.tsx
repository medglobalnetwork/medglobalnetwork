"use client";

import * as React from "react";

export function AppPageSkeleton({ type = "feed" }: { type?: "feed" | "grid" | "profile" | "dashboard" }) {
  if (type === "profile") {
    return (
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6 p-3 sm:p-6 animate-pulse">
        {/* Cover Banner Skeleton */}
        <div className="h-44 sm:h-60 w-full rounded-2xl sm:rounded-3xl bg-[#e8e6e3]/70" />
        
        {/* Profile Details Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#e8e6e3] bg-white p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-16 sm:size-20 rounded-full bg-[#e8e6e3]" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 rounded-lg bg-[#e8e6e3]" />
              <div className="h-3.5 w-64 rounded-lg bg-[#f0efee]" />
            </div>
          </div>
          <div className="h-16 w-full rounded-xl bg-[#faf9f8]" />
        </div>
      </div>
    );
  }

  if (type === "grid") {
    return (
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 space-y-5 animate-pulse">
        <div className="h-10 w-64 rounded-xl bg-[#e8e6e3]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#e8e6e3] bg-white p-4 space-y-3 shadow-2xs"
            >
              <div className="h-32 w-full rounded-xl bg-[#e8e6e3]" />
              <div className="h-4 w-3/4 rounded-md bg-[#e8e6e3]" />
              <div className="h-3 w-1/2 rounded-md bg-[#f0efee]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: Feed & Home Shell Skeleton
  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 py-4 space-y-4 sm:space-y-6 animate-pulse">
      {/* Top Stories / Highlights Skeleton */}
      <div className="flex gap-3 overflow-hidden py-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-1.5 shrink-0">
            <div className="size-14 sm:size-16 rounded-full bg-[#e8e6e3]" />
            <div className="h-2.5 w-12 rounded bg-[#f0efee]" />
          </div>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Feed Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Post composer skeleton */}
          <div className="rounded-2xl sm:rounded-3xl border border-[#e8e6e3] bg-white p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#e8e6e3]" />
              <div className="h-10 flex-1 rounded-xl bg-[#faf9f8]" />
            </div>
          </div>

          {/* Post cards skeletons */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-none sm:rounded-3xl border-y sm:border border-[#f0efee] sm:border-[#e8e6e3] bg-white p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#e8e6e3]" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-40 rounded bg-[#e8e6e3]" />
                  <div className="h-3 w-28 rounded bg-[#f0efee]" />
                </div>
              </div>
              <div className="space-y-2 py-2">
                <div className="h-3.5 w-full rounded bg-[#f0efee]" />
                <div className="h-3.5 w-5/6 rounded bg-[#f0efee]" />
              </div>
              <div className="h-52 w-full rounded-2xl bg-[#e8e6e3]/70" />
            </div>
          ))}
        </div>

        {/* Right Sidebar Skeleton (Desktop only) */}
        <div className="hidden lg:block lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-[#e8e6e3] bg-white p-5 space-y-3">
            <div className="h-4 w-36 rounded bg-[#e8e6e3]" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#e8e6e3]" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3.5 w-24 rounded bg-[#e8e6e3]" />
                    <div className="h-3 w-32 rounded bg-[#f0efee]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppPageSkeleton;
