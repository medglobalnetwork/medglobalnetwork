// app/(app)/calendar/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Tent,
  FlaskConical,
  ExternalLink,
} from "lucide-react";
import { CalendarEntry } from "@/modules/shared/scheduling/calendar-service";

export default function CentralCalendarPage() {
  const [agenda, setAgenda] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchAgenda = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shared/calendar");
      if (res.ok) {
        const data = await res.json();
        setAgenda(data.agenda || []);
      }
    } catch (err) {
      console.error("Error loading calendar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, []);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "camp":
        return <Tent className="h-4 w-4 text-emerald-700" />;
      case "research_meeting":
        return <FlaskConical className="h-4 w-4 text-purple-700" />;
      default:
        return <CalendarIcon className="h-4 w-4 text-[#1769c2]" />;
    }
  };

  const getSourceLink = (type: string, id: string) => {
    switch (type) {
      case "camp":
        return `/camps/${id}`;
      case "research_meeting":
        return `/research/projects/${id}`;
      default:
        return `/events/${id}`;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1769c2]">
            <CalendarIcon className="h-4 w-4" />
            <span>MedGlobalNetwork Central Calendar</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-[#171717]">
            My Healthcare Schedule & Agenda
          </h1>
          <p className="text-xs text-[#5d5854]">
            Unified timeline for your registered CME conferences, medical camps, clinical webinars, and research meetings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/events"
            className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-[#f8f7f6]"
          >
            Browse Events
          </Link>
          <Link
            href="/camps"
            className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
          >
            Browse Camps
          </Link>
        </div>
      </div>

      {/* Main Agenda Timeline */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#f0efee]" />
            ))}
          </div>
        ) : agenda.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5fc] text-[#1769c2]">
              <CalendarIcon className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#171717]">Your calendar is clear</h3>
            <p className="mt-1 max-w-sm text-xs text-[#5d5854]">
              When you register for conferences, volunteer for medical camps, or join research studies, they will automatically sync here.
            </p>
            <div className="mt-5 flex gap-2">
              <Link
                href="/events"
                className="rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-semibold text-white hover:bg-[#145ca8]"
              >
                Discover Conferences
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#f0efee] rounded-3xl border border-[#e8e6e3] bg-white p-6">
            {agenda.map((item) => {
              const start = new Date(item.start_time);
              const end = new Date(item.end_time);
              const dateStr = start.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const timeStr = `${start.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })} – ${end.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}`;

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f7f6]">
                      {getSourceIcon(item.source_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#f0efee] px-2 py-0.5 text-[10px] font-bold text-[#5d5854] uppercase">
                          {item.source_type.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs font-bold text-[#171717]">{dateStr}</span>
                      </div>
                      <Link
                        href={getSourceLink(item.source_type, item.source_id)}
                        className="mt-0.5 text-sm font-bold text-[#171717] hover:text-[#1769c2]"
                      >
                        {item.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-[#5d5854]">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#77716b]" />
                          <span>{timeStr}</span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-rose-600" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.meeting_link && (
                      <a
                        href={item.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Join Session</span>
                      </a>
                    )}
                    <Link
                      href={getSourceLink(item.source_type, item.source_id)}
                      className="rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3.5 py-1.5 text-xs font-semibold text-[#171717] hover:bg-white"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
