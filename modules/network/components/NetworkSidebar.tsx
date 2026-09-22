"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bone,
  Crown,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Sparkles,
  Stethoscope,
  Users,
  Check,
} from "lucide-react";
import { PeopleYouMayKnow } from "./PeopleYouMayKnow";
import type { Community } from "../types";

interface NetworkSidebarProps {
  currentUserId?: string;
}

export function NetworkSidebar({ currentUserId }: NetworkSidebarProps) {
  const router = useRouter();
  const [communities, setCommunities] = React.useState<any[]>([]);
  const [joinedSlugs, setJoinedSlugs] = React.useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/network/communities", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const list = d?.communities || d?.data || [];
        if (Array.isArray(list)) {
          setCommunities(list.slice(0, 4));
          const joined = new Set<string>();
          list.forEach((c: any) => {
            if (c.is_member) joined.add(c.slug);
          });
          setJoinedSlugs(joined);
        }
      })
      .catch((err) => console.error("NetworkSidebar communities fetch error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleJoinToggle = async (community: any) => {
    const isCurrentlyJoined = joinedSlugs.has(community.slug);
    setJoinedSlugs((prev) => {
      const next = new Set(prev);
      if (isCurrentlyJoined) {
        next.delete(community.slug);
      } else {
        next.add(community.slug);
      }
      return next;
    });

    try {
      if (isCurrentlyJoined) {
        await fetch(`/api/network/communities/${community.slug}/members`, {
          method: "DELETE",
          credentials: "include",
        });
      } else {
        await fetch(`/api/network/communities/${community.slug}/members`, {
          method: "POST",
          credentials: "include",
        });
      }
    } catch (err) {
      console.error("Failed to toggle join:", err);
    }
  };

  return (
    <aside className="w-full shrink-0 space-y-4 lg:w-72 xl:w-80">
      {/* 1. Top Promo Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1769c2] to-[#0f4d92] p-4 text-white shadow-xs">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
            <Sparkles className="h-3 w-3" /> Connect & Grow
          </span>
          <h3 className="mt-2 text-sm font-bold leading-tight">
            Build meaningful professional connections
          </h3>
          <p className="mt-1 text-xs text-blue-100">
            Collaborate · Learn · Grow with peer clinicians across India.
          </p>
          <button
            type="button"
            onClick={() => router.push("/network")}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#1769c2] shadow-xs transition hover:bg-blue-50"
          >
            Explore Network <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* 2. People You May Know */}
      <PeopleYouMayKnow currentUserId={currentUserId} limit={4} />

      {/* 3. Suggested Communities */}
      <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#171717]">
            <Users className="h-4 w-4 text-[#1769c2]" />
            Suggested Communities
          </h3>
          {communities.length > 0 && (
            <button
              type="button"
              onClick={() => router.push("/network/communities")}
              className="text-[11px] font-semibold text-[#1769c2] transition hover:underline"
            >
              See all →
            </button>
          )}
        </div>

        {communities.length > 0 ? (
          <ul className="space-y-3">
            {communities.map((c) => {
              const isJoined = joinedSlugs.has(c.slug);
              return (
                <li key={c.id || c.slug} className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f3f0] text-[#1769c2] overflow-hidden">
                    {c.cover_url ? (
                      <img src={c.cover_url} alt={c.name} className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-4 w-4 text-[#1769c2]" />
                    )}
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
                      {(c.member_count ?? 0).toLocaleString()} {c.member_count === 1 ? "member" : "members"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJoinToggle(c)}
                    className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                      isJoined
                        ? "bg-[#eef5fc] text-[#1769c2] border border-[#1769c2]/20"
                        : "border border-[#ded8d1] bg-white text-[#5d5854] hover:border-[#1769c2] hover:text-[#1769c2]"
                    }`}
                  >
                    {isJoined ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3" /> Joined
                      </span>
                    ) : (
                      "Join"
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : !isLoading ? (
          <div className="py-4 text-center">
            <p className="text-xs text-[#77716b]">No communities created yet.</p>
            <button
              type="button"
              onClick={() => router.push("/network")}
              className="mt-2 text-xs font-semibold text-[#1769c2] hover:underline"
            >
              Explore Specialty Hubs →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}
      </div>

      {/* 4. Upgrade to MGN Pro */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1b33] via-[#0f2c52] to-[#17487d] p-4 text-white shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Crown className="h-4 w-4 fill-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              MGN Pro
            </span>
          </div>
          <h4 className="mt-2 text-sm font-bold text-white">
            Upgrade to MGN Pro
          </h4>
          <p className="mt-1 text-xs text-blue-100/90 leading-relaxed">
            Access advanced clinical networks, verify your credentials, and unlock unlimited connection requests.
          </p>
          <button
            type="button"
            onClick={() => router.push("/pro")}
            className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2 text-xs font-bold text-[#0a1b33] shadow-xs transition hover:brightness-105"
          >
            Explore Pro Plans <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />
      </div>
    </aside>
  );
}
