// components/camps/CampCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Tent, MapPin, Calendar, Users, Stethoscope, CheckCircle2 } from "lucide-react";
import { CampRecord } from "@/modules/camps/domain/types";

interface CampCardProps {
  camp: CampRecord;
}

export function CampCard({ camp }: CampCardProps) {
  const startDate = new Date(camp.start_date);
  const formattedDate = startDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const campTypeLabels: Record<string, string> = {
    health_screening: "Health Screening Camp",
    physiotherapy: "Physiotherapy & Rehab Camp",
    rehabilitation: "Rehabilitation Camp",
    rural_health: "Rural Health Outreach",
    awareness: "Health Awareness Camp",
    preventive_health: "Preventive Health Camp",
    community_outreach: "Community Outreach",
    blood_donation: "Blood Donation Camp",
    other: "Medical Camp",
  };

  const totalSlotsNeeded = camp.required_roles?.reduce((sum, r) => sum + (r.slots_needed || 0), 0) || 0;
  const totalSlotsFilled = camp.required_roles?.reduce((sum, r) => sum + (r.slots_filled || 0), 0) || 0;
  const openSlots = Math.max(0, totalSlotsNeeded - totalSlotsFilled);

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs transition-all hover:border-[#ded8d1] hover:shadow-md">
      <div>
        {/* Cover or Accent header */}
        <div className="relative mb-4 h-36 w-full overflow-hidden rounded-xl bg-[#eef5fc]">
          {camp.cover_url ? (
            <img
              src={camp.cover_url}
              alt={camp.title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center p-4 text-center">
              <Tent className="mb-1 size-7 text-[#1769c2]" />
              <span className="text-xs font-bold uppercase text-[#1769c2]">
                {campTypeLabels[camp.camp_type] || "Medical Outreach"}
              </span>
            </div>
          )}

          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-bold text-[#1769c2] shadow-xs backdrop-blur-xs">
              {campTypeLabels[camp.camp_type] || "Camp"}
            </span>
          </div>

          {camp.user_volunteer_status && (
            <div className="absolute top-2.5 right-2.5 rounded-md bg-[#1769c2] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
              Volunteer ({camp.user_volunteer_status})
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={`/camps/${camp.id}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] rounded">
          <h3 className="line-clamp-2 text-base font-bold text-[#171717] transition-colors group-hover:text-[#1769c2] text-balance">
            {camp.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-1 line-clamp-2 text-xs text-[#5d5854] text-pretty">
          {camp.description}
        </p>

        {/* Meta details */}
        <div className="mt-3 space-y-1.5 text-xs text-[#5d5854]">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 text-[#77716b]" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 text-[#1769c2]" />
            <span className="truncate">{camp.venue_name}, {camp.city}</span>
          </div>
        </div>

        {/* Services pill list */}
        {camp.services && camp.services.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {camp.services.slice(0, 3).map((service, idx) => (
              <span
                key={idx}
                className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800"
              >
                {service}
              </span>
            ))}
            {camp.services.length > 3 && (
              <span className="rounded-md bg-[#f8f7f6] px-1.5 py-0.5 text-[10px] text-[#77716b]">
                +{camp.services.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Organizer */}
        <div className="mt-4 flex items-center gap-2 border-t border-[#f0efee] pt-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0efee] text-[11px] font-bold text-[#171717]">
            {(camp.organization_name || camp.organizer_name || "M")[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-xs font-semibold text-[#171717]">
                {camp.organization_name || camp.organizer_name || "Medical Outreach"}
              </span>
              {(camp.organization_verification === "verified" || camp.organizer_verified) && (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f0efee] pt-3">
        <div>
          {openSlots > 0 ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <Stethoscope className="h-3 w-3" />
              {openSlots} volunteer slot{openSlots > 1 ? "s" : ""} open
            </span>
          ) : (
            <span className="text-[11px] text-[#77716b]">Volunteer team full</span>
          )}
        </div>

        <Link
          href={`/camps/${camp.id}`}
          className="rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3.5 py-1.5 text-xs font-semibold text-[#171717] transition-all hover:border-emerald-600 hover:bg-emerald-600 hover:text-white active:scale-95"
        >
          View Camp
        </Link>
      </div>
    </div>
  );
}
