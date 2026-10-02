"use client";

import React from "react";
import { MapPin, Navigation, Radio } from "lucide-react";
import { formatDistance, mapsUrl } from "@/lib/geo";

export type LocationSharePayload = {
  lat: number;
  lng: number;
  label?: string | null;
  accuracyMeters?: number | null;
  /** True while the sharer is still updating the pin. */
  live?: boolean;
  sharedAt?: string;
};

/**
 * A shared pin inside a chat bubble.
 *
 * Opens the platform map rather than embedding one — an in-chat map view
 * would need a tile provider key and a full-screen gesture surface, and
 * directions are what the recipient actually wants.
 */
export function LocationMessageCard({
  payload,
  isMe,
}: {
  payload: LocationSharePayload;
  isMe: boolean;
}) {
  if (typeof payload?.lat !== "number" || typeof payload?.lng !== "number") {
    return null;
  }

  const point = { lat: payload.lat, lng: payload.lng };
  const href = mapsUrl(point, payload.label);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={`block overflow-hidden rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] ${
        isMe
          ? "border-blue-300/40 bg-white/10 hover:bg-white/15"
          : "border-[#e8e6e3] bg-white hover:bg-[#f8f7f6]"
      }`}
    >
      {/* Static map preview — a rendered pin, not an interactive map. */}
      <div
        className="relative h-28 w-full"
        style={{
          backgroundImage:
            "linear-gradient(rgba(23,111,194,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(23,111,194,0.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          backgroundColor: isMe ? "rgba(255,255,255,0.06)" : "#eef5fc",
        }}
      >
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="relative flex size-9 items-center justify-center rounded-full bg-[#1769c2] text-white shadow-lg">
            <MapPin className="size-5" />
            {payload.live && (
              <span className="absolute inset-0 animate-ping rounded-full bg-[#1769c2]/40" />
            )}
          </span>
        </span>
      </div>

      <div className="px-3 py-2.5">
        <p
          className={`flex items-center gap-1.5 text-xs font-bold ${
            isMe ? "text-white" : "text-[#171717]"
          }`}
        >
          {payload.label || "Shared location"}
        </p>
        <p
          className={`mt-0.5 flex items-center gap-1 text-[11px] ${
            isMe ? "text-blue-100" : "text-[#77716b]"
          }`}
        >
          {payload.live ? (
            <>
              <Radio className="size-3" />
              Live — updating
            </>
          ) : (
            <span className="tabular-nums">
              {payload.lat.toFixed(4)}, {payload.lng.toFixed(4)}
            </span>
          )}
        </p>
        <p
          className={`mt-1.5 flex items-center gap-1 text-[11px] font-semibold ${
            isMe ? "text-blue-100" : "text-[#1769c2]"
          }`}
        >
          <Navigation className="size-3" />
          Open in Maps
        </p>
      </div>
    </a>
  );
}

export { formatDistance };
