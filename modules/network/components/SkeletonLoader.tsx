// modules/network/components/SkeletonLoader.tsx
import * as React from "react";

export function ProfessionalCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#e8e6e3] bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-[#f0efee]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded bg-[#f0efee]" />
          <div className="h-3 w-1/2 rounded bg-[#f0efee]" />
          <div className="h-3 w-3/4 rounded bg-[#f0efee]" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 flex-1 rounded-xl bg-[#f0efee]" />
        <div className="h-8 flex-1 rounded-xl bg-[#f0efee]" />
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#e8e6e3] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-[#f0efee]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-1/3 rounded bg-[#f0efee]" />
          <div className="h-3 w-1/4 rounded bg-[#f0efee]" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-[#f0efee]" />
        <div className="h-3 w-5/6 rounded bg-[#f0efee]" />
        <div className="h-3 w-4/6 rounded bg-[#f0efee]" />
      </div>
      <div className="mt-4 flex gap-4">
        <div className="h-3 w-14 rounded bg-[#f0efee]" />
        <div className="h-3 w-14 rounded bg-[#f0efee]" />
        <div className="h-3 w-14 rounded bg-[#f0efee]" />
      </div>
    </div>
  );
}

export function CommunityCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#e8e6e3] bg-white p-4">
      <div className="h-24 w-full rounded-xl bg-[#f0efee]" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-2/3 rounded bg-[#f0efee]" />
        <div className="h-3 w-full rounded bg-[#f0efee]" />
        <div className="h-3 w-1/2 rounded bg-[#f0efee]" />
      </div>
      <div className="mt-3 h-8 rounded-xl bg-[#f0efee]" />
    </div>
  );
}

export function ListItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse flex items-center gap-3 rounded-2xl border border-[#e8e6e3] bg-white p-3.5"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-[#f0efee]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-[#f0efee]" />
            <div className="h-3 w-1/2 rounded bg-[#f0efee]" />
          </div>
          <div className="h-8 w-20 rounded-lg bg-[#f0efee]" />
        </div>
      ))}
    </>
  );
}
