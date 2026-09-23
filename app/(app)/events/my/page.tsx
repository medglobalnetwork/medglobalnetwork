// app/(app)/events/my/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Ticket,
  MapPin,
  Video,
  PlusCircle,
  CalendarPlus,
  ArrowLeft,
  Users,
  Award,
} from "lucide-react";
import { EventRecord } from "@/modules/events/domain/types";

export default function MyEventsPage() {
  const [registered, setRegistered] = useState<EventRecord[]>([]);
  const [organized, setOrganized] = useState<EventRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"registered" | "organized">("registered");
  const [loading, setLoading] = useState(true);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events?limit=100");
      // fetch registered & organized
      const resReg = await fetch("/api/events?timeframe=upcoming");
      // Let's get organizer events
      const resOrg = await fetch("/api/events?organizer_id=me");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/events?limit=50")
      .then((r) => r.json())
      .then((d) => {
        const items = d.items || [];
        setRegistered(items.filter((i: any) => i.is_user_registered));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d5854] hover:text-[#171717]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Discover Events</span>
          </Link>
          <h1 className="mt-1 text-2xl font-black text-[#171717]">My Healthcare Events</h1>
          <p className="text-xs text-[#5d5854]">
            Manage your registered conference passes, CME certificates, and organized workshops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/calendar"
            className="flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-[#f8f7f6]"
          >
            <CalendarPlus className="h-4 w-4 text-[#1769c2]" />
            <span>Open Calendar</span>
          </Link>

          <Link
            href="/events/create"
            className="flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#145ca8]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Organize Event</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e8e6e3] gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("registered")}
          className={`pb-3 transition ${
            activeTab === "registered"
              ? "border-b-2 border-[#1769c2] text-[#1769c2]"
              : "text-[#77716b] hover:text-[#171717]"
          }`}
        >
          Registered Events ({registered.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("organized")}
          className={`pb-3 transition ${
            activeTab === "organized"
              ? "border-b-2 border-[#1769c2] text-[#1769c2]"
              : "text-[#77716b] hover:text-[#171717]"
          }`}
        >
          Organized by Me
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#f0efee]" />
            ))}
          </div>
        ) : activeTab === "registered" ? (
          registered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
              <Ticket className="mx-auto h-10 w-10 text-[#77716b]" />
              <h3 className="mt-3 text-sm font-bold text-[#171717]">No active event registrations</h3>
              <p className="mt-1 text-xs text-[#5d5854]">
                You have not registered for any upcoming conferences or CME workshops yet.
              </p>
              <Link
                href="/events"
                className="mt-5 inline-block rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-semibold text-white"
              >
                Browse Upcoming Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {registered.map((evt) => (
                <div
                  key={evt.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e8e6e3] bg-white p-5 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                        {evt.event_type}
                      </span>
                      {evt.cme_credits && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Award className="h-3 w-3" />
                          {evt.cme_credits} CME
                        </span>
                      )}
                    </div>
                    <Link href={`/events/${evt.id}`}>
                      <h3 className="text-base font-bold text-[#171717] hover:text-[#1769c2]">
                        {evt.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5d5854]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#77716b]" />
                        <span>{new Date(evt.start_time).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {evt.format === "online" ? (
                          <Video className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <MapPin className="h-3.5 w-3.5 text-rose-600" />
                        )}
                        <span>{evt.format === "online" ? "Online" : evt.city || "In-Person"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/events/${evt.id}`}
                      className="rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-white"
                    >
                      View Ticket & Pass
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-[#77716b]" />
            <h3 className="mt-3 text-sm font-bold text-[#171717]">Organizer Dashboard</h3>
            <p className="mt-1 text-xs text-[#5d5854]">
              You can organize conferences, webinars, or hands-on clinical workshops for the medical community.
            </p>
            <Link
              href="/events/create"
              className="mt-5 inline-block rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-semibold text-white"
            >
              Organize New Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
