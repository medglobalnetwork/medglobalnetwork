"use client";
// modules/network/components/PeopleYouMayKnow.tsx
import * as React from "react";
import { useRouter } from "next/navigation";
import type { ProfessionalProfile } from "../types";
import { getProfessionColor } from "../lib/network-data";
import { VerificationBadge } from "./VerificationBadge";
import { ConnectionRequestModal } from "./ConnectionRequestModal";

interface PeopleYouMayKnowProps {
  currentUserId?: string;
  limit?: number;
}

export function PeopleYouMayKnow({ currentUserId, limit = 5 }: PeopleYouMayKnowProps) {
  const router = useRouter();
  const [people, setPeople] = React.useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalTarget, setModalTarget] = React.useState<ProfessionalProfile | null>(null);
  const [sentIds, setSentIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/network/recommendations?limit=${limit}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setPeople(data.data ?? []);
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
    return () => { cancelled = true; };
  }, [currentUserId, limit]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
        <h3 className="mb-3 text-sm font-semibold text-[#171717]">People You May Know</h3>
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
    <div className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#171717]">People You May Know</h3>
        <button
          type="button"
          onClick={() => router.push("/network")}
          className="text-[11px] font-semibold text-[#1769c2] hover:underline"
        >
          See all →
        </button>
      </div>

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
            <li key={person.user_id} className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.push(`/profile/${person.user_id}`)}
                className="shrink-0"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-[#3f3f3c]"
                  style={{ background: color }}
                >
                  {person.image ? (
                    <img
                      src={person.image}
                      alt={person.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => router.push(`/profile/${person.user_id}`)}
                    className="truncate text-xs font-semibold text-[#171717] hover:text-[#1769c2]"
                  >
                    {person.name}
                  </button>
                  {isVerified && <VerificationBadge size="sm" />}
                </div>
                <p className="truncate text-[11px] text-[#77716b]">
                  {person.profession}
                  {person.specialization ? ` · ${person.specialization}` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isSent) return;
                  setModalTarget(person);
                }}
                disabled={isSent}
                className={`shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-70 ${
                  isSent
                    ? "border-[#ded8d1] text-[#8a8784]"
                    : "border-[#1769c2] text-[#1769c2] hover:bg-[#eef5fc]"
                }`}
              >
                {isSent ? "Sent" : "Connect"}
              </button>
            </li>
          );
        })}
      </ul>

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
