"use client";

import React, { useState } from "react";
import {
  MapPinCheck,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Navigation,
} from "lucide-react";
import { getDeviceLocation, triggerHaptic } from "@/lib/native-mobile";
import { formatDistance, mapsUrl } from "@/lib/geo";
import type { CampRecord } from "@/modules/camps/domain/types";

type Result =
  | { kind: "success"; distanceMeters: number; radiusMeters: number }
  | { kind: "outside"; distanceMeters: number; radiusMeters: number }
  | { kind: "error"; text: string };

/**
 * GPS check-in for camp attendance.
 *
 * The server does the geofence maths and records every attempt, so this
 * component only reports the outcome. Renders nothing when the organizer
 * has not set venue coordinates — there is nothing to check against.
 */
export function CampCheckIn({
  camp,
  onMessage,
}: {
  camp: CampRecord;
  onMessage?: (text: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [done, setDone] = useState(false);

  const hasVenue =
    typeof camp.latitude === "number" && typeof camp.longitude === "number";
  const radiusMeters = camp.checkin_radius_meters ?? 500;

  if (!hasVenue) return null;

  const checkIn = async () => {
    setBusy(true);
    setResult(null);
    void triggerHaptic();

    try {
      const position = await getDeviceLocation();
      if (!position) {
        setResult({
          kind: "error",
          text: "Could not get a location fix. Enable location and try again.",
        });
        return;
      }

      const res = await fetch(`/api/camps/${camp.id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: position.lat,
          lng: position.lng,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setDone(true);
        setResult({
          kind: "success",
          distanceMeters: data.distanceMeters ?? 0,
          radiusMeters: data.radiusMeters ?? radiusMeters,
        });
        onMessage?.("You are checked in for this camp.");
        void triggerHaptic();
      } else if (res.status === 422 && data.radiusMeters) {
        setResult({
          kind: "outside",
          distanceMeters: data.distanceMeters ?? 0,
          radiusMeters: data.radiusMeters,
        });
        onMessage?.(data.error ?? "You are outside the check-in area.");
      } else {
        setResult({ kind: "error", text: data.error ?? "Check-in failed" });
      }
    } catch {
      setResult({ kind: "error", text: "Check-in failed. Check your connection." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-label="Camp check-in"
      className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#ded8d1] bg-[#fcfbfa] p-4 dark:border-[#21262d] dark:bg-[#161b22]"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5fc] text-[#1769c2] dark:bg-[#0d2233]">
          {done ? (
            <CheckCircle2 className="size-5 text-emerald-600" />
          ) : (
            <MapPin className="size-5" />
          )}
        </span>
        <div>
          <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
            {done ? "Checked in" : "Check in on arrival"}
          </h3>
          <p className="mt-0.5 text-xs text-[#77716b] dark:text-[#8b949e]">
            Within {formatDistance(radiusMeters)} of {camp.venue_name}
          </p>

          {result?.kind === "outside" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-3.5" />
              {formatDistance(result.distanceMeters)} away — move closer and retry.
            </p>
          )}
          {result?.kind === "error" && (
            <p className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {result.text}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={mapsUrl(
            { lat: Number(camp.latitude), lng: Number(camp.longitude) },
            camp.venue_name
          )}
          target="_blank"
          rel="noreferrer noopener"
          className="flex size-9 items-center justify-center rounded-xl border border-[#ded8d1] text-[#1769c2] hover:bg-[#eef5fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] dark:border-[#21262d]"
          aria-label={`Open directions to ${camp.venue_name}`}
        >
          <Navigation className="size-4" />
        </a>

        <button
          type="button"
          onClick={checkIn}
          disabled={busy || done}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#12569f] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MapPinCheck className="size-4" />
          )}
          {done ? "Checked in" : busy ? "Locating…" : "Check in"}
        </button>
      </div>
    </section>
  );
}
