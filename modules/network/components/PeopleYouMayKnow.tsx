"use client";
// ============================================================
// MGN Networking System — People You May Know Component
// modules/network/components/PeopleYouMayKnow.tsx
//
// Enhanced with compound Card system, explainability badges,
// negative feedback menu, and automatic recommendation impressions.
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
  UserPlus,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import type { RecommendedUser } from "@/modules/recommendations/types";
import { getProfessionColor } from "../lib/network-data";
import { VerificationBadge } from "./VerificationBadge";
import { ConnectionRequestModal } from "./ConnectionRequestModal";
import {
  Card,
  CardHeader,
  CardHeading,
  CardTitle,
  CardDescription,
  CardToolbar,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface PeopleYouMayKnowProps {
  currentUserId?: string;
  limit?: number;
  category?: string;
  source?: string;
  title?: string;
  description?: string;
  showSeeAll?: boolean;
  borderless?: boolean;
  variant?: "default" | "accent";
  className?: string;
}

export function PeopleYouMayKnow({
  currentUserId,
  limit = 5,
  category = "people-you-may-know",
  source = "sidebar",
  title = "People You May Know",
  description,
  showSeeAll = true,
  borderless = false,
  variant,
  className = "",
}: PeopleYouMayKnowProps) {
  const router = useRouter();
  const [people, setPeople] = React.useState<RecommendedUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalTarget, setModalTarget] = React.useState<RecommendedUser | null>(null);
  const [sentIds, setSentIds] = React.useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [activeReasonUser, setActiveReasonUser] = React.useState<RecommendedUser | null>(null);

  const effectiveVariant = variant || (borderless ? "accent" : "default");

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
      <Card variant={effectiveVariant} className={className}>
        <CardHeader className="py-3 px-4 min-h-12 border-b border-[#f0efee]">
          <CardHeading>
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#171717]">
              <Sparkles className="h-4 w-4 text-[#0f4c81]" />
              {title}
            </CardTitle>
          </CardHeading>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-[#f0efee]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 rounded bg-[#f0efee]" />
                  <div className="h-2.5 w-1/2 rounded bg-[#f0efee]" />
                </div>
                <div className="h-8 w-18 shrink-0 rounded-xl bg-[#f0efee]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (people.length === 0) return null;

  return (
    <Card variant={effectiveVariant} className={`relative overflow-visible ${className}`}>
      {/* Card Header */}
      <CardHeader className="py-3.5 px-4 min-h-12 border-b border-[#f0efee]">
        <CardHeading>
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#171717]">
            <Sparkles className="h-4 w-4 text-[#0f4c81]" />
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="text-xs text-[#77716b]">{description}</CardDescription>
          ) : null}
        </CardHeading>

        {showSeeAll && (
          <CardToolbar>
            <button
              type="button"
              onClick={() => router.push("/network")}
              className="text-xs font-bold text-[#0f4c81] hover:text-[#0c3c66] hover:underline flex items-center gap-1 transition"
            >
              See all
              <ArrowRight className="h-3 w-3" />
            </button>
          </CardToolbar>
        )}
      </CardHeader>

      {/* Card Body / Suggested Members List */}
      <CardContent className="p-3 sm:p-4">
        <ul className="space-y-3">
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
              <li
                key={person.user_id}
                className="group relative flex flex-col gap-1.5 rounded-xl p-2 transition hover:bg-[#faf9f8] border border-transparent hover:border-[#f0efee]"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    <button
                      type="button"
                      onClick={() => router.push(`/profile/${person.username || person.user_id}`)}
                      className="shrink-0 mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded-full"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-[#3f3f3c] overflow-hidden border border-[#e8e6e3] shadow-2xs"
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
                          className="truncate text-xs font-bold text-[#171717] hover:text-[#0f4c81] transition text-left"
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
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#0f4c81] font-semibold">
                          {person.is_exploration ? (
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200/60">
                              ✦ Discover
                            </span>
                          ) : null}
                          <span className="truncate">{person.primary_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right controls: Connect + Menu */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSent) return;
                        setModalTarget(person);
                      }}
                      disabled={isSent}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition disabled:opacity-70 ${
                        isSent
                          ? "border border-[#ded8d1] bg-[#faf9f8] text-[#8a8784]"
                          : "border border-[#0f4c81] bg-[#0f4c81] text-white hover:bg-[#0c3c66] shadow-2xs"
                      }`}
                    >
                      {isSent ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Sent</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === person.user_id ? null : person.user_id);
                        }}
                        className="rounded-lg p-1.5 text-[#a09890] hover:bg-[#f0efee] hover:text-[#171717] transition"
                        aria-label="Recommendation options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === person.user_id && (
                        <div
                          className="absolute right-0 top-7 z-30 w-48 rounded-2xl border border-[#e8e6e3] bg-white p-1.5 shadow-xl text-left animate-in fade-in zoom-in duration-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              setActiveReasonUser(person);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#f5f4f3] hover:text-[#171717]"
                          >
                            <HelpCircle className="h-3.5 w-3.5 text-[#0f4c81]" />
                            Why this suggestion?
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleNotInterested(person.user_id, e)}
                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#f5f4f3] hover:text-[#171717]"
                          >
                            <EyeOff className="h-3.5 w-3.5 text-[#a09890]" />
                            Not interested
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDontSuggest(person.user_id, e)}
                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            <X className="h-3.5 w-3.5 text-rose-500" />
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
      </CardContent>

      {/* Card Footer */}
      {showSeeAll && (
        <CardFooter className="py-2.5 px-4 min-h-11 border-t border-[#f0efee] justify-center bg-[#faf9f8]/60">
          <button
            type="button"
            onClick={() => router.push("/network")}
            className="w-full text-center text-xs font-bold text-[#0f4c81] hover:text-[#0c3c66] transition py-0.5"
          >
            Discover more healthcare professionals →
          </button>
        </CardFooter>
      )}

      {/* "Why am I seeing this?" Modal */}
      {activeReasonUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-[#e8e6e3] text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0efee]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-[#0f4c81]">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-[#171717]">Why this suggestion?</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveReasonUser(null)}
                className="rounded-full p-1 text-[#8a8784] hover:bg-[#f0efee] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              <p className="text-xs text-[#5d5854]">
                MGN suggests <span className="font-bold text-[#171717]">{activeReasonUser.name}</span> based on your verified professional identity and clinical interests:
              </p>

              <div className="space-y-2 rounded-2xl bg-[#faf9f8] border border-[#f0efee] p-3.5 text-xs text-[#171717]">
                {activeReasonUser.recommendation_reasons && activeReasonUser.recommendation_reasons.length > 0 ? (
                  activeReasonUser.recommendation_reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#0f4c81] font-bold mt-0.5">•</span>
                      <span>{r.label}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-2">
                    <span className="text-[#0f4c81] font-bold mt-0.5">•</span>
                    <span>{activeReasonUser.primary_reason}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[#a09890] leading-relaxed">
                Your private information and browsing history are never shared with suggested professionals.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveReasonUser(null)}
                className="rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-2xs"
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
    </Card>
  );
}
