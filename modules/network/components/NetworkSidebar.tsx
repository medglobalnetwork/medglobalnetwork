"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bone,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Stethoscope,
  Users,
} from "lucide-react";
import { PeopleYouMayKnow } from "./PeopleYouMayKnow";
import type { Community } from "../types";

interface NetworkSidebarProps {
  currentUserId?: string;
}

function getCommunityIcon(specialty?: string) {
  switch (specialty) {
    case "Physiotherapy":
      return <Bone className="h-4 w-4 text-[#1769c2]" />;
    case "Cardiology":
      return <HeartPulse className="h-4 w-4 text-[#e11d48]" />;
    case "Medical Students":
      return <GraduationCap className="h-4 w-4 text-[#047857]" />;
    case "Clinical Research":
      return <FlaskConical className="h-4 w-4 text-[#8b5cf6]" />;
    case "Nursing":
      return <Stethoscope className="h-4 w-4 text-[#0284c7]" />;
    case "Sports Medicine":
      return <Activity className="h-4 w-4 text-[#d97706]" />;
    default:
      return <Users className="h-4 w-4 text-[#1769c2]" />;
  }
}

export function NetworkSidebar({ currentUserId }: NetworkSidebarProps) {
  const router = useRouter();
  const [communities, setCommunities] = React.useState<Community[]>([]);

  React.useEffect(() => {
    fetch("/api/network/communities", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCommunities((d.data ?? []).slice(0, 4)))
      .catch(() => setCommunities([]));
  }, []);

  return (
    <aside className="w-full shrink-0 space-y-4 lg:w-72">
      {/* People You May Know */}
      <PeopleYouMayKnow currentUserId={currentUserId} limit={5} />

      {/* Suggested Communities */}
      {communities.length > 0 && (
        <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#171717] flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[#1769c2]" /> Communities
            </h3>
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0efee]">
                  {getCommunityIcon(c.specialty)}
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
      )}

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
