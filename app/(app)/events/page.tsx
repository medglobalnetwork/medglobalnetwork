// app/(app)/events/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  PlusCircle,
  Video,
  MapPin,
  Sparkles,
  Award,
  Filter,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { EventRecord } from "@/modules/events/domain/types";

const CATEGORIES = [
  "All Categories",
  "CME & Accreditation",
  "Conference",
  "Workshop",
  "Webinar",
  "Seminar",
  "Symposium",
  "Rehabilitation & Physio",
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "General Medicine",
];

const FORMATS = [
  { id: "all", label: "All Formats" },
  { id: "online", label: "Online (Webinars)" },
  { id: "in_person", label: "In-Person" },
  { id: "hybrid", label: "Hybrid" },
];

export default function EventsDiscoveryPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [timeframe, setTimeframe] = useState<"upcoming" | "past">("upcoming");
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (selectedCategory !== "All Categories") {
        if (selectedCategory === "CME & Accreditation") {
          query.set("type", "cme");
        } else if (selectedCategory === "Conference") {
          query.set("type", "conference");
        } else if (selectedCategory === "Workshop") {
          query.set("type", "workshop");
        } else if (selectedCategory === "Webinar") {
          query.set("type", "webinar");
        } else {
          query.set("category", selectedCategory);
        }
      }
      if (selectedFormat !== "all") query.set("format", selectedFormat);
      query.set("timeframe", timeframe);

      const res = await fetch(`/api/events?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.items || []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, selectedFormat, timeframe]);

  useEffect(() => {
    fetch("/api/shared/eligibility?type=event")
      .then((r) => r.json())
      .then((d) => setEligibility(d))
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Top Header Banner ── */}
      <div className="rounded-3xl border border-[#e8e6e3] bg-gradient-to-r from-[#1769c2]/5 via-white to-emerald-500/5 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1769c2]">
              <Calendar className="h-4 w-4" />
              <span>Healthcare Events & CME Platform</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-[#171717] sm:text-3xl">
              Discover Healthcare Events
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-[#5d5854]">
              Connect, learn, and earn verified CME credits across medical conferences, hands-on clinical workshops, and interactive webinars.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/events/my"
              className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2.5 text-xs font-semibold text-[#171717] shadow-xs transition hover:bg-[#f8f7f6] active:scale-95"
            >
              My Events
            </Link>

            <Link
              href="/events/create"
              className="flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#145ca8] active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Organize Event</span>
            </Link>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#77716b]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conferences, topics, specialties, or cities..."
              className="w-full rounded-2xl border border-[#ded8d1] bg-white py-3 pr-4 pl-10 text-sm text-[#171717] placeholder:text-[#77716b] focus:border-[#1769c2] focus:ring-2 focus:ring-[#1769c2]/10 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-[#171717] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#333] active:scale-95"
          >
            Search
          </button>
        </form>
      </div>

      {/* ── Filters & Category Strip ── */}
      <div className="mt-6 space-y-3">
        {/* Category tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-[#1769c2] text-white shadow-xs"
                  : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Format & Timeframe controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#e8e6e3] py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setSelectedFormat(fmt.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  selectedFormat === fmt.id
                    ? "bg-[#eef5fc] text-[#1769c2] font-bold"
                    : "text-[#5d5854] hover:bg-[#f8f7f6]"
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setTimeframe("upcoming")}
              className={`px-2 py-1 font-semibold ${
                timeframe === "upcoming" ? "text-[#1769c2] underline" : "text-[#77716b]"
              }`}
            >
              Upcoming
            </button>
            <span className="text-[#ded8d1]">|</span>
            <button
              type="button"
              onClick={() => setTimeframe("past")}
              className={`px-2 py-1 font-semibold ${
                timeframe === "past" ? "text-[#1769c2] underline" : "text-[#77716b]"
              }`}
            >
              Past Events
            </button>
          </div>
        </div>
      </div>

      {/* ── Events Grid / Clean Empty State ── */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl border border-[#e8e6e3] bg-[#f8f7f6] p-5"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          /* Strictly adhering to real data policy — no dummy items */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5fc] text-[#1769c2]">
              <Calendar className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#171717]">No events found</h3>
            <p className="mt-1.5 max-w-md text-xs text-[#5d5854]">
              {selectedCategory !== "All Categories" || search
                ? "No published events match your current filter criteria. Try resetting search filters."
                : "Verified healthcare organizations and professionals will appear here when they publish upcoming conferences and CME workshops."}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {(selectedCategory !== "All Categories" || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All Categories");
                    setSelectedFormat("all");
                  }}
                  className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-[#f8f7f6]"
                >
                  Reset Filters
                </button>
              )}

              <Link
                href="/events/create"
                className="rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#145ca8]"
              >
                Organize First Event
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
