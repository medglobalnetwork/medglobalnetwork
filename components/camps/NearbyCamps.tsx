"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  LocateFixed,
  MapPin,
  Navigation,
  Loader2,
  AlertTriangle,
  Crosshair,
} from "lucide-react";
import { getDeviceLocation, triggerHaptic } from "@/lib/native-mobile";

type NearbyCamp = {
  id: string;
  slug: string;
  title: string;
  venue_name: string;
  city: string;
  state: string;
  camp_type: string;
  start_date: string;
  distance_meters: number;
  distance_label: string;
  walk_minutes: number;
  maps_url: string;
};

const RADIUS_OPTIONS = [
  { km: 10, label: "10 km" },
  { km: 25, label: "25 km" },
  { km: 50, label: "50 km" },
  { km: 100, label: "100 km" },
];

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

/**
 * Camps near the device, ordered by distance.
 *
 * The location fix is taken in the browser and sent explicitly as query
 * parameters — the server never asks for it, so a user who declines the
 * permission prompt simply sees nothing instead of an error.
 */
export function NearbyCamps() {
  const [camps, setCamps] = useState<NearbyCamp[]>([]);
  const [status, setStatus] = useState<"idle" | "locating" | "ready" | "denied" | "error">("idle");
  const [radiusKm, setRadiusKm] = useState(25);
  const [message, setMessage] = useState<string | null>(null);

  const loadNearby = useCallback(async (km: number) => {
    setStatus("locating");
    setMessage(null);

    const position = await getDeviceLocation();
    if (!position) {
      setStatus("denied");
      setMessage(
        "Location is unavailable. Enable location permission to see camps near you."
      );
      return;
    }

    try {
      const res = await fetch(
        `/api/location/nearby?lat=${position.lat}&lng=${position.lng}&radiusKm=${km}&limit=12`
      );
      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      setCamps(data.camps ?? []);
      setStatus("ready");
      if ((data.camps ?? []).length === 0) {
        setMessage("No camps with venue coordinates within this range yet.");
      }
    } catch {
      setStatus("error");
      setMessage("Could not load nearby camps. Check your connection.");
    }
  }, []);

  // Nothing is requested until the user asks for it.
  useEffect(() => {
    if (status !== "ready") return;
    void loadNearby(radiusKm);
  }, [radiusKm, status, loadNearby]);

  if (status === "idle") {
    return (
      <div className="mt-6 rounded-2xl border border-[#ded8d1] bg-[#fcfbfa] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef5fc] text-[#1769c2]">
              <LocateFixed className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#171717]">Find camps near you</h3>
              <p className="mt-0.5 text-xs text-[#5d5854]">
                Uses your device location — nothing is stored.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              void triggerHaptic();
              void loadNearby(radiusKm);
            }}
            className="rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#12569f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
          >
            Use my location
          </button>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label="Camps near you"
      className="mt-6 rounded-2xl border border-[#ded8d1] bg-white p-5 dark:border-[#21262d] dark:bg-[#161b22]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef5fc] text-[#1769c2] dark:bg-[#0d2233]">
            {status === "locating" ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Crosshair className="size-5" />
            )}
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
              Camps near you
            </h3>
            <p className="mt-0.5 text-xs text-[#77716b] dark:text-[#8b949e]">
              {status === "locating"
                ? "Getting your location…"
                : `${camps.length} within ${radiusKm} km`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option.km}
              type="button"
              onClick={() => setRadiusKm(option.km)}
              disabled={status === "locating"}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] ${
                radiusKm === option.km
                  ? "bg-[#1769c2] text-white"
                  : "border border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6] dark:border-[#21262d] dark:text-[#8b949e] dark:hover:bg-[#21262d]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-xl bg-[#fdf6f3] p-3 text-xs text-[#8a4b32] dark:bg-[#2a1a14] dark:text-[#e8a882]"
        >
          {status === "error" ? (
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          ) : (
            <MapPin className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{message}</span>
        </p>
      )}

      {camps.length > 0 && (
        <ul className="mt-4 divide-y divide-[#f0efee] dark:divide-[#21262d]">
          {camps.map((camp) => (
            <li
              key={camp.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/camps/${camp.id}`}
                  className="truncate text-sm font-semibold text-[#171717] hover:text-[#1769c2] dark:text-[#f0f6fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
                >
                  {camp.title}
                </Link>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#77716b] dark:text-[#8b949e]">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">
                    {camp.venue_name}, {camp.city}
                  </span>
                  <span className="shrink-0">· {formatDate(camp.start_date)}</span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-right">
                  <span className="block text-xs font-bold text-[#1769c2]">
                    {camp.distance_label}
                  </span>
                  <span className="block text-[10px] text-[#77716b] dark:text-[#8b949e">
                    ~{camp.walk_minutes} min walk
                  </span>
                </span>
                <a
                  href={camp.maps_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex size-8 items-center justify-center rounded-lg border border-[#ded8d1] text-[#1769c2] hover:bg-[#eef5fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] dark:border-[#21262d]"
                  aria-label={`Open directions to ${camp.title}`}
                >
                  <Navigation className="size-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
