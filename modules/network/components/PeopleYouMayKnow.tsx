"use client";
// ============================================================
// MGN Networking System — People You May Know Component
// modules/network/components/PeopleYouMayKnow.tsx
//
// Enhanced with explainability badges, negative feedback menu,
// and automatic recommendation impression logging.
// ============================================================

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  X,
  EyeOff,
  HelpCircle,
  Sparkles,
  Users,
  Check,
  Building2,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import type { RecommendedUser } from "@/modules/recommendations/types";
import { getProfessionColor } from "../lib/network-data";
import { VerificationBadge } from "./VerificationBadge";
import { ConnectionRequestModal } from "./ConnectionRequestModal";

interface PeopleYouMayKnowProps {
  currentUserId?: string;
  limit?: number;
  category?: string;
  source?: string;
  title?: string;
  showSeeAll?: boolean;
}

export function PeopleYouMayKnow({
  currentUserId,
  limit = 5,
  category = "people-you-may-know",
  source = "sidebar",
  title = "People You May Know",
  showSeeAll = true,
}: PeopleYouMayKnowProps) {
  const router = useRouter();
  const [people, setPeople] = React.useState<RecommendedUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalTarget, setModalTarget] = React.useState<RecommendedUser | null>(null);
  const [sentIds, setSentIds] = React.useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [activeReasonUser, setActiveReasonUser] = React.useState<RecommendedUser | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/recommendations/people?category=${category}&limit=${limit}&source=${source}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            const list: RecommendedUser[] = data.data ?? [];
            setPeople(list);

            // Log impression automatically
            if (currentUserId && list.length > 0) {
              fetch("/api/recommendations/impression", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  impressions: list.map((p, idx) => ({
                    candidateId: p.user_id,
                    recommendationType: category,
                    source,
                    score: p.recommendation_score || 0,
                    reasons: p.recommendation_reasons,
                    position: idx + 1,
                  })),
                }),
              }).catch(() => {});
            }
          }
        } else {
          if (!cancelled) setPeople([]);
        }
      } catch {
        if (!cancelled) setPeople([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [currentUserId, limit, category, source]);

  // Handle "Not Interested" dismissal
  const handleNotInterested = async (candidateId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveMenuId(null);
    setPeople((prev) => prev.filter((p) => p.user_id !== candidateId));

    try {
      await fetch("/api/recommendations/not-interested", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ candidateId, category }),
      });
    } catch (err) {
      console.error("Failed to mark not interested:", err);
    }
  };

  // Handle "Don't Suggest" dismissal
  const handleDontSuggest = async (candidateId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveMenuId(null);
    setPeople((prev) => prev.filter((p) => p.user_id !== candidateId));

    try {
      await fetch("/api/recommendations/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          candidateId,
          feedbackType: "dont_suggest",
          category,
        }),
      });
    } catch (err) {
      console.error("Failed to dismiss suggestion:", err);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
        <h3 className="mb-3 text-sm font-semibold text-[#171717]">{title}</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-2.5">
              <div className="h-9 w-9 shrink-0 rounded-full bg-[#f0efee]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-2/3 rounded bg-[#f0efee]" />
                <div className="h-2.5 w-1/2 rounded bg-[#f0efee]" />
              </div>
              <div className="h-7 w-16 shrink-0 rounded-lg bg-[#f0efee]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (people.length === 0) return null;

  return (
    <div className="relative rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#171717]">
          <Sparkles className="h-4 w-4 text-[#1769c2]" />
          {title}
        </h3>
        {showSeeAll && (
          <button
            type="button"
            onClick={() => router.push("/network")}
            className="text-[11px] font-semibold text-[#1769c2] hover:underline"
          >
            See all →
          </button>
        )}
      </div>

      <ul className="space-y-3.5">
        {people.map((person) => {
          const color = getProfessionColor(person.profession);
          const initials = (person.name || "U")
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          const isSent = sentIds.has(person.user_id);
          const isVerified =
            person.identity_verified ||
            person.education_verified ||
            person.registration_verified;

          return (
            <li key={person.user_id} className="relative flex flex-col gap-1.5 border-b border-[#f5f4f3] pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {/* Avatar */}
                  <button
                    type="button"
                    onClick={() => router.push(`/profile/${person.username || person.user_id}`)}
                    className="shrink-0 mt-0.5"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-[#3f3f3c] overflow-hidden border border-[#e8e6e3]"
                      style={{ background: color }}
                    >
                      {person.image ? (
                        <img
                          src={person.image}
                          alt={person.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                  </button>

                  {/* Profile info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => router.push(`/profile/${person.username || person.user_id}`)}
                        className="truncate text-xs font-semibold text-[#171717] hover:text-[#1769c2]"
                      >
                        {person.name}
                      </button>
                      {isVerified && <VerificationBadge size="sm" />}
                    </div>

                    <p className="truncate text-[11px] text-[#77716b] font-medium">
                      {person.profession || "Clinician"}
                      {person.specialization ? ` · ${person.specialization}` : ""}
                    </p>

                    {/* Recommendation reason tag */}
                    {person.primary_reason && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#1769c2] font-medium">
                        {person.is_exploration ? (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                            ✦ Discover
                          </span>
                        ) : null}
                        <span className="truncate">{person.primary_reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right controls: Connect + Menu */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isSent) return;
                      setModalTarget(person);
                    }}
                    disabled={isSent}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-70 ${
                      isSent
                        ? "border border-[#ded8d1] bg-[#faf9f8] text-[#8a8784]"
                        : "border border-[#1769c2] bg-[#1769c2] text-white hover:bg-[#12569f] shadow-2xs"
                    }`}
                  >
                    {isSent ? "Sent" : "Connect"}
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === person.user_id ? null : person.user_id);
                      }}
                      className="rounded-lg p-1 text-[#a09890] hover:bg-[#f0efee] hover:text-[#171717] transition"
                      aria-label="Recommendation options"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === person.user_id && (
                      <div
                        className="absolute right-0 top-6 z-30 w-44 rounded-xl border border-[#e8e6e3] bg-white p-1 shadow-lg text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            setActiveReasonUser(person);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[#5d5854] hover:bg-[#f5f4f3] hover:text-[#171717]"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-[#1769c2]" />
                          Why this suggestion?
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleNotInterested(person.user_id, e)}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[#5d5854] hover:bg-[#f5f4f3] hover:text-[#171717]"
                        >
                          <EyeOff className="h-3.5 w-3.5 text-[#a09890]" />
                          Not interested
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDontSuggest(person.user_id, e)}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50"
                        >
                          <X className="h-3.5 w-3.5 text-red-500" />
                          Don&apos;t suggest again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* "Why am I seeing this?" Modal */}
      {activeReasonUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-[#e8e6e3] text-left animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0efee]">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#1769c2]" />
                <h4 className="text-sm font-bold text-[#171717]">Why this suggestion?</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveReasonUser(null)}
                className="rounded-lg p-1 text-[#8a8784] hover:bg-[#f0efee]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-2.5">
              <p className="text-xs text-[#5d5854]">
                MGN suggests <span className="font-semibold text-[#171717]">{activeReasonUser.name}</span> based on your professional graph and mutual clinical interests:
              </p>

              <div className="space-y-1.5 rounded-xl bg-[#f8f7f6] p-3 text-xs text-[#171717]">
                {activeReasonUser.recommendation_reasons && activeReasonUser.recommendation_reasons.length > 0 ? (
                  activeReasonUser.recommendation_reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#1769c2] font-bold">•</span>
                      <span>{r.label}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-2">
                    <span className="text-[#1769c2] font-bold">•</span>
                    <span>{activeReasonUser.primary_reason}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[#a09890] leading-relaxed">
                Your private information and browsing history are never shared with suggested professionals.
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveReasonUser(null)}
                className="rounded-xl bg-[#1769c2] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#12569f]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Modal */}
      {modalTarget && (
        <ConnectionRequestModal
          targetName={modalTarget.name}
          targetUserId={modalTarget.user_id}
          onClose={() => setModalTarget(null)}
          onSent={() => {
            setSentIds((prev) => new Set([...prev, modalTarget.user_id]));
            setModalTarget(null);
          }}
        />
      )}
    </div>
  );
}
