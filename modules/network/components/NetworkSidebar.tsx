"use client";
// modules/network/components/NetworkSidebar.tsx
import * as React from "react";
import { useRouter } from "next/navigation";
import { PeopleYouMayKnow } from "./PeopleYouMayKnow";
import { SAMPLE_COMMUNITIES } from "../lib/network-data";

interface NetworkSidebarProps {
  currentUserId?: string;
}

export function NetworkSidebar({ currentUserId }: NetworkSidebarProps) {
  const router = useRouter();
  const communities = SAMPLE_COMMUNITIES.slice(0, 4);

  return (
    <aside className="w-full shrink-0 space-y-4 lg:w-72">
      {/* People You May Know */}
      <PeopleYouMayKnow currentUserId={currentUserId} limit={5} />

      {/* Suggested Communities */}
      <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#171717]">Communities</h3>
          <button
            type="button"
            onClick={() => router.push("/network/communities")}
            className="text-[11px] font-semibold text-[#1769c2] hover:underline"
          >
            See all →
          </button>
        </div>

        <ul className="space-y-2.5">
          {communities.map((c) => (
            <li key={c.slug} className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0efee] text-sm">
                {c.specialty === "Physiotherapy" && "🦴"}
                {c.specialty === "Cardiology" && "❤️"}
                {c.specialty === "Medical Students" && "🎓"}
                {c.specialty === "Clinical Research" && "🔬"}
                {c.specialty === "Nursing" && "🩺"}
                {c.specialty === "Sports Medicine" && "🏃"}
                {c.specialty === "Radiology" && "🔭"}
                {c.specialty === "Pediatrics" && "👶"}
                {!c.specialty && "👥"}
              </div>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => router.push(`/network/communities/${c.slug}`)}
                  className="block truncate text-xs font-semibold text-[#171717] hover:text-[#1769c2]"
                >
                  {c.name}
                </button>
                <p className="text-[11px] text-[#a09890]">
                  {c.member_count.toLocaleString()} members
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/network/communities/${c.slug}`)}
                className="shrink-0 rounded-lg border border-[#ded8d1] px-2 py-0.5 text-[10px] font-medium text-[#5d5854] transition hover:bg-[#f8f7f6]"
              >
                View
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Feed shortcut */}
      <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
        <h3 className="text-sm font-semibold text-[#171717]">Professional Feed</h3>
        <p className="mt-1 text-xs text-[#77716b]">
          Share clinical insights, research updates, and achievements with your healthcare network.
        </p>
        <button
          type="button"
          onClick={() => router.push("/network/feed")}
          className="mt-3 w-full rounded-xl bg-[#eef5fc] py-2 text-xs font-semibold text-[#1769c2] transition hover:bg-[#1769c2] hover:text-white"
        >
          Go to Feed
        </button>
      </div>
    </aside>
  );
}
