// app/(app)/camps/my/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tent,
  HeartHandshake,
  Award,
  ArrowLeft,
  PlusCircle,
  Calendar,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { CampRecord } from "@/modules/camps/domain/types";

export default function MyCampsPage() {
  const [activeTab, setActiveTab] = useState<"volunteer" | "organized">("volunteer");
  const [volunteerCamps, setVolunteerCamps] = useState<any[]>([]);
  const [organizedCamps, setOrganizedCamps] = useState<CampRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/camps?limit=50")
      .then((r) => r.json())
      .then((d) => {
        const items = d.items || [];
        setVolunteerCamps(items.filter((i: any) => i.user_volunteer_status));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/camps"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d5854] hover:text-[#171717]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Discover Medical Camps</span>
          </Link>
          <h1 className="mt-1 text-2xl font-black text-[#171717]">My Medical Camps & Volunteering</h1>
          <p className="text-xs text-[#5d5854]">
            Track your clinical volunteer service records, volunteer certificates, and organized camps.
          </p>
        </div>

        <Link
          href="/camps/create"
          className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Organize a Camp</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e8e6e3] gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("volunteer")}
          className={`pb-3 transition ${
            activeTab === "volunteer"
              ? "border-b-2 border-emerald-700 text-emerald-800"
              : "text-[#77716b] hover:text-[#171717]"
          }`}
        >
          Volunteer Service ({volunteerCamps.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("organized")}
          className={`pb-3 transition ${
            activeTab === "organized"
              ? "border-b-2 border-emerald-700 text-emerald-800"
              : "text-[#77716b] hover:text-[#171717]"
          }`}
        >
          Organized by Me
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#f0efee]" />
            ))}
          </div>
        ) : activeTab === "volunteer" ? (
          volunteerCamps.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
              <HeartHandshake className="mx-auto h-10 w-10 text-emerald-700" />
              <h3 className="mt-3 text-sm font-bold text-[#171717]">No active volunteer applications</h3>
              <p className="mt-1 text-xs text-[#5d5854]">
                You have not applied for any medical camp volunteer slots yet.
              </p>
              <Link
                href="/camps"
                className="mt-5 inline-block rounded-xl bg-emerald-700 px-5 py-2 text-xs font-semibold text-white"
              >
                Browse Volunteer Camps
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {volunteerCamps.map((camp) => (
                <div
                  key={camp.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e8e6e3] bg-white p-5 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Status: {camp.user_volunteer_status}
                      </span>
                    </div>
                    <Link href={`/camps/${camp.id}`}>
                      <h3 className="text-base font-bold text-[#171717] hover:text-emerald-700">
                        {camp.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-[#5d5854]">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                        <span>{camp.venue_name}, {camp.city}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/camps/${camp.id}`}
                    className="rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-white text-center"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
            <Tent className="mx-auto h-10 w-10 text-emerald-700" />
            <h3 className="mt-3 text-sm font-bold text-[#171717]">Camp Organizer Hub</h3>
            <p className="mt-1 text-xs text-[#5d5854]">
              Manage patient screening queues, review volunteer applicants, and submit official outcome reports.
            </p>
            <Link
              href="/camps/create"
              className="mt-5 inline-block rounded-xl bg-emerald-700 px-5 py-2 text-xs font-semibold text-white"
            >
              Organize New Camp
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
