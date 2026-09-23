// app/(app)/camps/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tent,
  Search,
  PlusCircle,
  MapPin,
  Stethoscope,
  HeartHandshake,
  Users,
  CheckCircle2,
} from "lucide-react";
import { CampCard } from "@/components/camps/CampCard";
import { CampRecord } from "@/modules/camps/domain/types";

const CAMP_TYPES = [
  { id: "all", label: "All Camps" },
  { id: "health_screening", label: "Health Screening" },
  { id: "physiotherapy", label: "Physiotherapy & Rehab" },
  { id: "rehabilitation", label: "Rehabilitation" },
  { id: "rural_health", label: "Rural Health Outreach" },
  { id: "awareness", label: "Health Awareness" },
  { id: "blood_donation", label: "Blood Donation" },
];

export default function CampsDiscoveryPage() {
  const [camps, setCamps] = useState<CampRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [cityFilter, setCityFilter] = useState("");
  const [volunteerOnly, setVolunteerOnly] = useState(false);

  const fetchCamps = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (selectedType !== "all") query.set("type", selectedType);
      if (cityFilter) query.set("city", cityFilter);
      if (volunteerOnly) query.set("volunteer", "true");

      const res = await fetch(`/api/camps?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCamps(data.items || []);
      }
    } catch (err) {
      console.error("Error loading camps:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, [selectedType, cityFilter, volunteerOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCamps();
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Top Header Banner ── */}
      <div className="rounded-3xl border border-[#e8e6e3] bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <Tent className="h-4 w-4" />
              <span>Operational Healthcare Outreach & Camps</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-[#171717] sm:text-3xl">
              Medical & Rehabilitation Camps
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-[#5d5854]">
              Deliver clinical impact on the ground. Volunteer as verified healthcare professionals, coordinate medical camps, and screen local communities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/camps/my"
              className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2.5 text-xs font-semibold text-[#171717] shadow-xs transition hover:bg-[#f8f7f6] active:scale-95"
            >
              My Camps & Volunteer
            </Link>

            <Link
              href="/camps/create"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-800 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Organize a Camp</span>
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
              placeholder="Search medical camps, screening services, or venues..."
              className="w-full rounded-2xl border border-[#ded8d1] bg-white py-3 pr-4 pl-10 text-sm text-[#171717] placeholder:text-[#77716b] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-[#171717] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#333] active:scale-95"
          >
            Search Camps
          </button>
        </form>
      </div>

      {/* ── Camp Type Tabs & Volunteer Filter ── */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CAMP_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedType(type.id)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedType === type.id
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#e8e6e3] py-2.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#171717] cursor-pointer">
            <input
              type="checkbox"
              checked={volunteerOnly}
              onChange={(e) => setVolunteerOnly(e.target.checked)}
              className="rounded"
            />
            <HeartHandshake className="h-4 w-4 text-emerald-700" />
            <span>Show Open Volunteer Opportunities Only</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#77716b]">{camps.length} Medical Camps Found</span>
          </div>
        </div>
      </div>

      {/* ── Camps Grid / Authentic Empty State ── */}
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
        ) : camps.length === 0 ? (
          /* Strictly zero dummy cards policy */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Tent className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#171717]">No healthcare camps scheduled yet</h3>
            <p className="mt-1.5 max-w-md text-xs text-[#5d5854]">
              {selectedType !== "all" || search
                ? "No camps currently match your filter selection. Try broadening your criteria."
                : "Verified hospitals, clinics, NGOs, and healthcare organizations will list screening camps, physiotherapy outreach, and volunteer roles here."}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/camps/create"
                className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                Organize a Camp
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {camps.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
