// components/events/EventCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Video, CheckCircle2, Award, Users } from "lucide-react";
import { EventRecord } from "@/modules/events/domain/types";

interface EventCardProps {
  event: EventRecord;
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.start_time);
  const formattedDate = startDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = startDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const isOnline = event.format === "online";
  const locationText = isOnline
    ? "Online (Webinar)"
    : event.city
    ? `${event.city}${event.state ? `, ${event.state}` : ""}`
    : "In-Person";

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs transition-all hover:border-[#ded8d1] hover:shadow-md">
      <div>
        {/* Cover / Fallback header */}
        <div className="relative mb-4 h-36 w-full overflow-hidden rounded-xl bg-[#f0efee]">
          {event.cover_url ? (
            <img
              src={event.cover_url}
              alt={event.title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center p-4 text-center">
              <span className="text-xs font-semibold uppercase text-[#5d5854]">
                {event.category || "Healthcare Event"}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-bold text-[#0f4c81] shadow-xs backdrop-blur-xs">
              {event.event_type.toUpperCase()}
            </span>
            {event.cme_credits && event.cme_credits > 0 ? (
              <span className="flex items-center gap-1 rounded-md bg-[#16804d] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                <Award className="size-3" />
                {event.cme_credits} CME
              </span>
            ) : null}
          </div>

          {event.is_user_registered && (
            <div className="absolute top-2.5 right-2.5 rounded-md bg-[#0f4c81] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
              Registered
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={`/events/${event.id}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded">
          <h3 className="line-clamp-2 text-base font-bold text-[#171717] transition-colors group-hover:text-[#0f4c81] text-balance">
            {event.title}
          </h3>
        </Link>

        {/* Short description */}
        {event.short_description && (
          <p className="mt-1 line-clamp-2 text-xs text-[#5d5854] text-pretty">
            {event.short_description}
          </p>
        )}

        {/* Meta details */}
        <div className="mt-3 space-y-1.5 text-xs text-[#5d5854]">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 text-[#77716b]" />
            <span>
              {formattedDate} · {formattedTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Video className="size-3.5 text-[#0f4c81]" />
            ) : (
              <MapPin className="size-3.5 text-[#0f4c81]" />
            )}
            <span className="truncate">{locationText}</span>
          </div>
        </div>

        {/* Organizer info */}
        <div className="mt-4 flex items-center gap-2 border-t border-[#f0efee] pt-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f0efee] text-[11px] font-bold text-[#171717]">
            {event.organizer_image ? (
              <img src={event.organizer_image} alt="" className="size-full rounded-full object-cover" />
            ) : (
              (event.organization_name || event.organizer_name || "M")[0]
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-xs font-semibold text-[#171717]">
                {event.organization_name || event.organizer_name || "Healthcare Institution"}
              </span>
              {(event.organization_verification === "verified" || event.organizer_verified) && (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#16804d]" />
              )}
            </div>
            {event.organizer_profession && (
              <p className="truncate text-[11px] text-[#77716b]">{event.organizer_profession}</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f0efee] pt-3">
        <div className="flex items-center gap-2">
          {event.registered_count > 0 ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-[#5d5854]">
              <Users className="h-3 w-3" />
              {event.registered_count} registered
            </span>
          ) : (
            <span className="text-[11px] text-[#77716b]">Registration open</span>
          )}
          <span className="text-xs font-bold text-[#171717]">
            {event.is_free ? (
              <span className="text-emerald-600">Free</span>
            ) : (
              `₹${event.price}`
            )}
          </span>
        </div>

        <Link
          href={`/events/${event.id}`}
          className="rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3.5 py-1.5 text-xs font-semibold text-[#171717] transition-all hover:border-[#0f4c81] hover:bg-[#0f4c81] hover:text-white active:scale-95"
        >
          View Event
        </Link>
      </div>
    </div>
  );
}
