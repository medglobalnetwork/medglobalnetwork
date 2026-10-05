"use client";

// ============================================================
// MGN Location Suggestion Engine Hub
// app/(app)/suggestions/page.tsx
//
// Complete suggestion engine interface providing personalized,
// geospatial recommendations for People (Log), Contents, Events,
// Camps, Opportunities (Jobs), and Healthcare Facilities.
// ============================================================

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Navigation,
  Compass,
  RefreshCw,
  Search,
  Filter,
  Users,
  FileText,
  Calendar,
  Briefcase,
  Building2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Car,
  Footprints,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useLocationTracking } from "@/lib/use-location-tracking";
import { CitySelectorModal } from "@/components/location/CitySelectorModal";
import type {
  LocationSuggestionResult,
  SuggestedPerson,
  SuggestedContent,
  SuggestedEvent,
  SuggestedOpportunity,
  SuggestedFacility,
} from "@/modules/recommendations/lib/location-suggestion-engine";
import { CityLocation } from "@/lib/geo";

type ActiveTab = "all" | "people" | "contents" | "events" | "opportunities" | "facilities";

const RADIUS_OPTIONS = [5, 15, 30, 50, 100, 250];

export default function SuggestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ActiveTab) || "all";

  const {
    location,
    isLoading: isGpsLoading,
    error: gpsError,
    requestLocation,
    setManualCity,
  } = useLocationTracking();

  const [activeTab, setActiveTab] = React.useState<ActiveTab>(initialTab);
  const [radiusKm, setRadiusKm] = React.useState<number>(50);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isCityModalOpen, setIsCityModalOpen] = React.useState<boolean>(false);
  const [data, setData] = React.useState<LocationSuggestionResult | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Fetch suggestions when location or radius changes
  const fetchSuggestions = React.useCallback(
    async (lat?: number, lng?: number, radius = radiusKm) => {
      setIsLoading(true);
      try {
        const qp = new URLSearchParams();
        if (lat != null && lng != null) {
          qp.set("lat", String(lat));
          qp.set("lng", String(lng));
        }
        qp.set("radiusKm", String(radius));
        qp.set("limit", "25");

        const res = await fetch(`/api/location/suggestions?${qp.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.warn("Failed to load suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [radiusKm]
  );

  React.useEffect(() => {
    if (location?.lat && location?.lng) {
      fetchSuggestions(location.lat, location.lng, radiusKm);
    } else {
      fetchSuggestions(undefined, undefined, radiusKm);
    }
  }, [location?.lat, location?.lng, radiusKm, fetchSuggestions]);

  const handleCitySelect = (city: CityLocation) => {
    setManualCity(city.name, city.state, city.lat, city.lng);
    fetchSuggestions(city.lat, city.lng, radiusKm);
  };

  const currentCity = location?.city || data?.location.city || "Mumbai";
  const currentState = location?.state || data?.location.state || "Maharashtra";

  // Filter items by client search query
  const query = searchQuery.trim().toLowerCase();

  const filteredPeople = React.useMemo(() => {
    if (!data?.people) return [];
    if (!query) return data.people;
    return data.people.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.profession?.toLowerCase().includes(query) ||
        p.specialization?.toLowerCase().includes(query) ||
        p.organization?.toLowerCase().includes(query)
    );
  }, [data?.people, query]);

  const filteredContents = React.useMemo(() => {
    if (!data?.contents) return [];
    if (!query) return data.contents;
    return data.contents.filter(
      (c) =>
        c.content.toLowerCase().includes(query) ||
        c.author_name.toLowerCase().includes(query) ||
        c.author_profession?.toLowerCase().includes(query)
    );
  }, [data?.contents, query]);

  const filteredEvents = React.useMemo(() => {
    if (!data?.events) return [];
    if (!query) return data.events;
    return data.events.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.venue_name.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
    );
  }, [data?.events, query]);

  const filteredOpportunities = React.useMemo(() => {
    if (!data?.opportunities) return [];
    if (!query) return data.opportunities;
    return data.opportunities.filter(
      (o) =>
        o.title.toLowerCase().includes(query) ||
        o.organization_name.toLowerCase().includes(query) ||
        o.profession?.toLowerCase().includes(query)
    );
  }, [data?.opportunities, query]);

  const filteredFacilities = React.useMemo(() => {
    if (!data?.facilities) return [];
    if (!query) return data.facilities;
    return data.facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.organization_type.toLowerCase().includes(query) ||
        f.specialties?.some((s) => s.toLowerCase().includes(query))
    );
  }, [data?.facilities, query]);

  return (
    <div className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
      {/* Top Banner & Location Control Center */}
      <div className="bg-white dark:bg-[#161b22] border-b border-[#ded8d1] dark:border-[#30363d] sticky top-0 z-30 shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Location Title & GPS Info */}
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f4c81] to-[#16804d] text-white shadow-sm">
                <Compass className="size-6 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold text-[#171717] dark:text-[#f0f6fc] tracking-tight">
                    Nearby Suggestion Engine
                  </h1>
                  <span className="rounded-md bg-[#0f4c81]/10 text-[#0f4c81] dark:bg-[#0f4c81]/25 dark:text-blue-400 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                    Live Geo
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#5d5854] dark:text-[#8b949e] mt-0.5">
                  <MapPin className="size-3.5 text-[#0f4c81] shrink-0" />
                  <span className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    {currentCity}, {currentState}
                  </span>
                  {location?.accuracy && (
                    <span className="text-[10px] text-[#77716b]">
                      (±{Math.round(location.accuracy)}m)
                    </span>
                  )}
                  {location?.source === "gps" && (
                    <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                      GPS Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Location Actions: Update GPS & Change City */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => requestLocation()}
                disabled={isGpsLoading || isLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3.5 py-2 text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f8f7f6] dark:hover:bg-[#30363d] shadow-2xs transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 text-[#0f4c81] ${isGpsLoading ? "animate-spin" : ""}`} />
                {isGpsLoading ? "Detecting..." : "Update GPS"}
              </button>

              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition active:scale-95"
              >
                <MapPin className="size-3.5" />
                Change City
              </button>
            </div>
          </div>

          {/* Search bar & Radius Pills */}
          <div className="mt-4 pt-3 border-t border-[#ded8d1]/60 dark:border-[#30363d]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#77716b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search doctors, camps, jobs in ${currentCity}...`}
                className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] py-2 pl-9 pr-3 text-xs text-[#171717] dark:text-[#f0f6fc] placeholder-[#77716b] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
              />
            </div>

            {/* Radius Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-[#77716b] dark:text-[#8b949e] shrink-0 mr-1">
                Radius:
              </span>
              {RADIUS_OPTIONS.map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setRadiusKm(km)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition shrink-0 ${
                    radiusKm === km
                      ? "bg-[#0f4c81] text-white shadow-2xs"
                      : "bg-white dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f2efe9]"
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[#ded8d1] dark:border-[#30363d] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === "all"
                ? "bg-[#0f4c81] text-white shadow-xs"
                : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Sparkles className="size-3.5" />
            All Suggestions
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("people")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === "people"
                ? "bg-[#0f4c81] text-white shadow-xs"
                : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Users className="size-3.5" />
            Log / People ({filteredPeople.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contents")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === "contents"
                ? "bg-[#0f4c81] text-white shadow-xs"
                : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <FileText className="size-3.5" />
            Contents ({filteredContents.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === "events"
                ? "bg-[#0f4c81] text-white shadow-xs"
                : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Calendar className="size-3.5" />
            Events & Camps ({filteredEvents.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("opportunities")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === "opportunities"
                ? "bg-[#0f4c81] text-white shadow-xs"
                : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Briefcase className="size-3.5" />
            Opportunities ({filteredOpportunities.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("facilities")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
              activeTab === "facilities"
                ? "bg-[#0f4c81] text-white shadow-xs"
                : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Building2 className="size-3.5" />
            Facilities ({filteredFacilities.length})
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <div className="inline-block size-8 animate-spin rounded-full border-3 border-[#0f4c81] border-t-transparent" />
            <p className="text-sm font-semibold text-[#5d5854] dark:text-[#8b949e]">
              Calculating geospatial proximity and suggestions for {currentCity}...
            </p>
          </div>
        )}

        {/* Suggestions Content */}
        {!isLoading && (
          <div className="space-y-8">
            {/* 1. PEOPLE / LOG SECTION */}
            {(activeTab === "all" || activeTab === "people") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-[#0f4c81]" />
                    <h2 className="font-extrabold text-sm sm:text-base text-[#171717] dark:text-[#f0f6fc]">
                      Nearby Healthcare Professionals ({filteredPeople.length})
                    </h2>
                  </div>
                  {activeTab === "all" && filteredPeople.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("people")}
                      className="text-xs font-bold text-[#0f4c81] dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View all ({filteredPeople.length}) <ChevronRight className="size-3.5" />
                    </button>
                  )}
                </div>

                {filteredPeople.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#ded8d1] dark:border-[#30363d] p-6 text-center bg-white dark:bg-[#161b22]">
                    <p className="text-xs text-[#77716b]">No clinicians found within {radiusKm} km.</p>
                    <button
                      type="button"
                      onClick={() => setRadiusKm(100)}
                      className="mt-2 text-xs font-bold text-[#0f4c81] hover:underline"
                    >
                      Expand search radius to 100 km →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {(activeTab === "all" ? filteredPeople.slice(0, 4) : filteredPeople).map((person) => (
                      <div
                        key={person.user_id}
                        className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {person.image ? (
                                <img
                                  src={person.image}
                                  alt={person.name}
                                  className="size-11 rounded-full object-cover shrink-0 ring-2 ring-[#0f4c81]/20"
                                />
                              ) : (
                                <div className="size-11 rounded-full bg-[#0f4c81]/15 text-[#0f4c81] flex items-center justify-center font-bold text-sm shrink-0">
                                  {person.name.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1 truncate">
                                  <h3 className="font-bold text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] truncate">
                                    {person.name}
                                  </h3>
                                  {person.identity_verified && (
                                    <CheckCircle2 className="size-3.5 text-blue-500 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] font-semibold text-[#0f4c81] dark:text-blue-400 truncate">
                                  {person.profession || "Doctor"}
                                  {person.specialization ? ` · ${person.specialization}` : ""}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                            {person.organization && (
                              <p className="truncate">🏥 {person.organization}</p>
                            )}
                            {person.primary_degree && (
                              <p className="truncate">🎓 {person.primary_degree}</p>
                            )}
                          </div>

                          {/* Proximity Badge */}
                          <div className="rounded-xl bg-[#faf9f8] dark:bg-[#0d1117] p-2 flex items-center justify-between text-[11px] border border-[#ded8d1]/60 dark:border-[#30363d]/60">
                            <span className="font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1">
                              <MapPin className="size-3.5 text-emerald-600" />
                              {person.distance_label} away
                            </span>
                            <span className="text-[#77716b] flex items-center gap-1">
                              <Car className="size-3" /> ~{person.drive_minutes}m
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#ded8d1]/60 dark:border-[#30363d]/60 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/network?target=${person.user_id}`)}
                            className="flex-1 rounded-xl bg-[#0f4c81] py-1.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition"
                          >
                            Connect
                          </button>
                          <a
                            href={person.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] p-1.5 text-[#5d5854] hover:bg-[#f8f7f6] dark:hover:bg-[#21262d]"
                            title="Open directions in Google Maps"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. CONTENTS SECTION */}
            {(activeTab === "all" || activeTab === "contents") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-[#0f4c81]" />
                    <h2 className="font-extrabold text-sm sm:text-base text-[#171717] dark:text-[#f0f6fc]">
                      Nearby Clinical Posts & Discussions ({filteredContents.length})
                    </h2>
                  </div>
                  {activeTab === "all" && filteredContents.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("contents")}
                      className="text-xs font-bold text-[#0f4c81] dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View all ({filteredContents.length}) <ChevronRight className="size-3.5" />
                    </button>
                  )}
                </div>

                {filteredContents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#ded8d1] dark:border-[#30363d] p-6 text-center bg-white dark:bg-[#161b22]">
                    <p className="text-xs text-[#77716b]">No posts found from clinicians within {radiusKm} km.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab === "all" ? filteredContents.slice(0, 3) : filteredContents).map((post) => (
                      <div
                        key={post.id}
                        className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {post.author_image ? (
                                <img
                                  src={post.author_image}
                                  alt={post.author_name}
                                  className="size-8 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="size-8 rounded-full bg-[#0f4c81]/15 text-[#0f4c81] flex items-center justify-center text-xs font-bold shrink-0">
                                  {post.author_name.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] truncate">
                                  {post.author_name}
                                </h4>
                                <p className="text-[10px] text-[#77716b] dark:text-[#8b949e] truncate">
                                  {post.author_profession || "Clinician"}
                                </p>
                              </div>
                            </div>
                            <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0f4c81] dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold shrink-0">
                              📍 {post.distance_label}
                            </span>
                          </div>

                          <p className="text-xs text-[#2b2723] dark:text-[#c9d1d9] line-clamp-3 leading-relaxed">
                            {post.content}
                          </p>

                          {post.media_urls && post.media_urls.length > 0 && (
                            <div className="h-32 rounded-xl overflow-hidden bg-black/5">
                              <img
                                src={post.media_urls[0]}
                                alt="Post media"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#ded8d1]/60 dark:border-[#30363d]/60 flex items-center justify-between text-xs text-[#77716b]">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className="size-3.5" /> {post.reaction_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="size-3.5" /> {post.comment_count}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => router.push(`/feed?post=${post.id}`)}
                            className="font-bold text-[#0f4c81] dark:text-blue-400 hover:underline"
                          >
                            Open Discussion →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. EVENTS & MEDICAL CAMPS */}
            {(activeTab === "all" || activeTab === "events") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-emerald-600" />
                    <h2 className="font-extrabold text-sm sm:text-base text-[#171717] dark:text-[#f0f6fc]">
                      Nearby Medical Camps & CME Seminars ({filteredEvents.length})
                    </h2>
                  </div>
                  {activeTab === "all" && filteredEvents.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("events")}
                      className="text-xs font-bold text-[#0f4c81] dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View all ({filteredEvents.length}) <ChevronRight className="size-3.5" />
                    </button>
                  )}
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#ded8d1] dark:border-[#30363d] p-6 text-center bg-white dark:bg-[#161b22]">
                    <p className="text-xs text-[#77716b]">No camps or CME conferences found in this radius.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab === "all" ? filteredEvents.slice(0, 3) : filteredEvents).map((event) => (
                      <div
                        key={event.id}
                        className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                event.type === "camp"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              }`}
                            >
                              {event.type === "camp" ? "Health Camp" : "CME Seminar"}
                            </span>
                            <span className="font-bold text-xs text-emerald-600 flex items-center gap-1">
                              📍 {event.distance_label}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-[#171717] dark:text-[#f0f6fc] leading-snug">
                            {event.title}
                          </h3>

                          <div className="space-y-1 text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                            <p className="flex items-center gap-1.5">
                              <Clock className="size-3 text-[#77716b]" />
                              {new Date(event.start_time).toLocaleDateString([], {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="flex items-center gap-1.5 truncate">
                              <MapPin className="size-3 text-[#77716b]" />
                              {event.venue_name}, {event.city}
                            </p>
                          </div>

                          {event.services && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {event.services.slice(0, 3).map((s, idx) => (
                                <span
                                  key={idx}
                                  className="rounded bg-[#faf9f8] dark:bg-[#0d1117] border border-[#ded8d1]/60 px-1.5 py-0.5 text-[10px] text-[#5d5854]"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#ded8d1]/60 dark:border-[#30363d]/60 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(event.type === "camp" ? `/camps/${event.slug}` : `/events/${event.slug}`)
                            }
                            className="flex-1 rounded-xl bg-emerald-700 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
                          >
                            {event.type === "camp" ? "Volunteer / Register" : "Register"}
                          </button>
                          <a
                            href={event.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] p-1.5 text-[#5d5854] hover:bg-[#f8f7f6]"
                            title="Directions"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. OPPORTUNITIES & JOBS */}
            {(activeTab === "all" || activeTab === "opportunities") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-4 text-purple-600" />
                    <h2 className="font-extrabold text-sm sm:text-base text-[#171717] dark:text-[#f0f6fc]">
                      Nearby Hospital Openings & Internships ({filteredOpportunities.length})
                    </h2>
                  </div>
                  {activeTab === "all" && filteredOpportunities.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("opportunities")}
                      className="text-xs font-bold text-[#0f4c81] dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View all ({filteredOpportunities.length}) <ChevronRight className="size-3.5" />
                    </button>
                  )}
                </div>

                {filteredOpportunities.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#ded8d1] dark:border-[#30363d] p-6 text-center bg-white dark:bg-[#161b22]">
                    <p className="text-xs text-[#77716b]">No openings found in this radius.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab === "all" ? filteredOpportunities.slice(0, 3) : filteredOpportunities).map((job) => (
                      <div
                        key={job.id}
                        className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 text-[9px] font-extrabold uppercase">
                              {job.opportunity_type}
                            </span>
                            <span className="font-bold text-xs text-purple-700 flex items-center gap-1">
                              📍 {job.distance_label}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-[#171717] dark:text-[#f0f6fc]">
                            {job.title}
                          </h3>
                          <p className="text-xs text-[#5d5854] dark:text-[#8b949e]">
                            🏥 {job.organization_name} · {job.city || currentCity}
                          </p>

                          {job.salary_min != null && job.salary_max != null && (
                            <p className="text-xs font-bold text-emerald-600">
                              ₹{job.salary_min.toLocaleString()} - ₹{job.salary_max.toLocaleString()} / mo
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#ded8d1]/60 dark:border-[#30363d]/60 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/opportunities?id=${job.id}`)}
                            className="w-full rounded-xl bg-purple-700 py-1.5 text-xs font-bold text-white hover:bg-purple-800 transition"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. FACILITIES SECTION */}
            {(activeTab === "all" || activeTab === "facilities") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-blue-600" />
                    <h2 className="font-extrabold text-sm sm:text-base text-[#171717] dark:text-[#f0f6fc]">
                      Nearby Hospitals, Clinics & Diagnostic Labs ({filteredFacilities.length})
                    </h2>
                  </div>
                  {activeTab === "all" && filteredFacilities.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("facilities")}
                      className="text-xs font-bold text-[#0f4c81] dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      View all ({filteredFacilities.length}) <ChevronRight className="size-3.5" />
                    </button>
                  )}
                </div>

                {filteredFacilities.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#ded8d1] dark:border-[#30363d] p-6 text-center bg-white dark:bg-[#161b22]">
                    <p className="text-xs text-[#77716b]">No institutions listed in this radius.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab === "all" ? filteredFacilities.slice(0, 3) : filteredFacilities).map((fac) => (
                      <div
                        key={fac.id}
                        className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="rounded-md bg-blue-50 text-[#0f4c81] dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-[9px] font-bold uppercase">
                              {fac.organization_type}
                            </span>
                            <span className="font-bold text-xs text-[#0f4c81] flex items-center gap-1">
                              📍 {fac.distance_label}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-[#171717] dark:text-[#f0f6fc]">
                            {fac.name}
                          </h3>
                          <p className="text-xs text-[#77716b] truncate">
                            {fac.address || `${fac.city}, ${fac.state}`}
                          </p>

                          {fac.specialties && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {fac.specialties.slice(0, 3).map((sp, idx) => (
                                <span
                                  key={idx}
                                  className="rounded bg-[#faf9f8] dark:bg-[#0d1117] border border-[#ded8d1]/60 px-1.5 py-0.5 text-[10px] text-[#5d5854]"
                                >
                                  {sp}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#ded8d1]/60 dark:border-[#30363d]/60 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/organizations/${fac.slug}`)}
                            className="flex-1 rounded-xl bg-white dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] py-1.5 text-xs font-bold text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f8f7f6]"
                          >
                            View Facility
                          </button>
                          <a
                            href={fac.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] p-1.5 text-[#5d5854] hover:bg-[#f8f7f6]"
                            title="Directions"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentCity={currentCity}
        onSelectCity={handleCitySelect}
      />
    </div>
  );
}

