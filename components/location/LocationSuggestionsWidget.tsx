"use client";

// ============================================================
// MGN Location Suggestions Widget
// components/location/LocationSuggestionsWidget.tsx
//
// Shows curated nearby suggestions (People, Camps, Posts, Jobs)
// on Home Feed or Network sidebar with location switcher.
// ============================================================

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Navigation,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Calendar,
  Briefcase,
  Users,
  Compass,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useLocationTracking } from "@/lib/use-location-tracking";
import { CitySelectorModal } from "./CitySelectorModal";
import { LocationPermissionBanner } from "./LocationPermissionBanner";
import type { LocationSuggestionResult } from "@/modules/recommendations/lib/location-suggestion-engine";
import { CityLocation } from "@/lib/geo";

interface LocationSuggestionsWidgetProps {
  currentUserId?: string;
  limit?: number;
  compact?: boolean;
}

export function LocationSuggestionsWidget({
  currentUserId,
  limit = 3,
  compact = false,
}: LocationSuggestionsWidgetProps) {
  const router = useRouter();
  const {
    location,
    isLoading: isLocationLoading,
    requestLocation,
    setManualCity,
  } = useLocationTracking();

  const [data, setData] = React.useState<LocationSuggestionResult | null>(null);
  const [isLoadingData, setIsLoadingData] = React.useState<boolean>(false);
  const [isCityModalOpen, setIsCityModalOpen] = React.useState<boolean>(false);
  const [radiusKm, setRadiusKm] = React.useState<number>(50);

  const fetchSuggestions = React.useCallback(async (lat?: number, lng?: number, radius = radiusKm) => {
    setIsLoadingData(true);
    try {
      const queryParams = new URLSearchParams();
      if (lat != null && lng != null) {
        queryParams.set("lat", String(lat));
        queryParams.set("lng", String(lng));
      }
      queryParams.set("radiusKm", String(radius));
      queryParams.set("limit", String(limit));

      const res = await fetch(`/api/location/suggestions?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn("Failed to fetch location suggestions:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [limit, radiusKm]);

  React.useEffect(() => {
    if (location?.lat && location?.lng) {
      fetchSuggestions(location.lat, location.lng);
    } else {
      fetchSuggestions();
    }
  }, [location?.lat, location?.lng, fetchSuggestions]);

  const handleCitySelect = (city: CityLocation) => {
    setManualCity(city.name, city.state, city.lat, city.lng);
    fetchSuggestions(city.lat, city.lng);
  };

  const currentCityName = location?.city || data?.location.city || "Nearby Area";
  const currentStateName = location?.state || data?.location.state || "";

  return (
    <div className="space-y-3">
      {/* If location has never been detected, show the non-intrusive prompt */}
      {!location && (
        <LocationPermissionBanner
          onEnableGps={requestLocation}
          onSelectCity={handleCitySelect}
          isLoading={isLocationLoading}
        />
      )}

      {/* Main Location Card */}
      <div className="overflow-hidden rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-2xs">
        {/* Header with detected location and controls */}
        <div className="border-b border-[#ded8d1] dark:border-[#30363d] p-3.5 sm:p-4 bg-[#faf9f8] dark:bg-[#0d1117] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-[#0f4c81]/10 text-[#0f4c81] dark:bg-[#0f4c81]/25 dark:text-blue-400">
              <Compass className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#f0f6fc] truncate">
                  Nearby in {currentCityName}
                </h3>
                {location?.source === "gps" && (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                    GPS
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] truncate">
                Within {radiusKm} km {currentStateName ? `· ${currentStateName}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsCityModalOpen(true)}
              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-[#0f4c81] dark:text-blue-400 hover:bg-[#0f4c81]/10 transition"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => requestLocation()}
              disabled={isLocationLoading || isLoadingData}
              title="Refresh GPS position"
              className="rounded-lg p-1 text-[#77716b] hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <RefreshCw className={`size-3.5 ${(isLocationLoading || isLoadingData) ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-3 sm:p-4 space-y-3">
          {isLoadingData && !data ? (
            <div className="space-y-2 py-4 text-center">
              <div className="inline-block size-5 animate-spin rounded-full border-2 border-[#0f4c81] border-t-transparent" />
              <p className="text-xs text-[#77716b]">Finding nearby healthcare suggestions...</p>
            </div>
          ) : (
            <>
              {/* Highlight 1: Nearby People */}
              {data?.people && data.people.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e] flex items-center gap-1">
                      <Users className="size-3 text-[#0f4c81]" /> Nearby Clinicians ({data.summary.total_people})
                    </span>
                    <Link
                      href="/suggestions?tab=people"
                      className="text-[11px] font-semibold text-[#0f4c81] dark:text-blue-400 hover:underline"
                    >
                      See all
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {data.people.slice(0, 2).map((person) => (
                      <div
                        key={person.user_id}
                        className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#faf9f8] dark:bg-[#0d1117] border border-[#ded8d1]/60 dark:border-[#30363d]/60"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {person.image ? (
                            <img
                              src={person.image}
                              alt={person.name}
                              className="size-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="size-8 rounded-full bg-[#0f4c81]/15 text-[#0f4c81] flex items-center justify-center text-xs font-bold shrink-0">
                              {person.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 truncate">
                              <span className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] truncate">
                                {person.name}
                              </span>
                              {person.identity_verified && (
                                <CheckCircle2 className="size-3 text-blue-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-[#77716b] dark:text-[#8b949e] truncate">
                              {person.profession || person.specialization || "Healthcare Professional"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          <span className="rounded-md bg-white dark:bg-[#161b22] border border-[#ded8d1] dark:border-[#30363d] px-1.5 py-0.5 text-[10px] font-semibold text-[#5d5854] dark:text-[#8b949e]">
                            📍 {person.distance_label}
                          </span>
                          <button
                            type="button"
                            onClick={() => router.push(`/network?target=${person.user_id}`)}
                            className="rounded-lg bg-[#0f4c81] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#0c3c66]"
                          >
                            Connect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlight 2: Nearby Medical Camps & Events */}
              {data?.events && data.events.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#ded8d1]/60 dark:border-[#30363d]/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e] flex items-center gap-1">
                      <Calendar className="size-3 text-emerald-600" /> Upcoming Camps & CME ({data.summary.total_events})
                    </span>
                    <Link
                      href="/suggestions?tab=events"
                      className="text-[11px] font-semibold text-[#0f4c81] dark:text-blue-400 hover:underline"
                    >
                      See all
                    </Link>
                  </div>

                  {data.events.slice(0, 1).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="rounded bg-emerald-600 text-white px-1.5 py-0.2 text-[9px] font-bold uppercase">
                            {ev.type === "camp" ? "Free Health Camp" : "CME Seminar"}
                          </span>
                          <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mt-1 truncate">
                            {ev.title}
                          </h4>
                          <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] mt-0.5">
                            📍 {ev.venue_name} · {ev.distance_label}
                          </p>
                        </div>
                        <a
                          href={ev.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-1.5 rounded-lg bg-white dark:bg-[#161b22] border border-[#ded8d1] dark:border-[#30363d] text-[#0f4c81] dark:text-blue-400 hover:bg-[#f8f7f6]"
                          title="Open Directions in Google Maps"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Highlight 3: Nearby Hospital Jobs */}
              {data?.opportunities && data.opportunities.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#ded8d1]/60 dark:border-[#30363d]/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#77716b] dark:text-[#8b949e] flex items-center gap-1">
                      <Briefcase className="size-3 text-purple-600" /> Nearby Openings ({data.summary.total_opportunities})
                    </span>
                    <Link
                      href="/suggestions?tab=opportunities"
                      className="text-[11px] font-semibold text-[#0f4c81] dark:text-blue-400 hover:underline"
                    >
                      See all
                    </Link>
                  </div>

                  {data.opportunities.slice(0, 1).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] truncate">
                          {job.title}
                        </h4>
                        <p className="text-[10px] text-[#77716b] dark:text-[#8b949e] truncate">
                          {job.organization_name} · {job.distance_label}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/opportunities?id=${job.id}`)}
                        className="shrink-0 rounded-lg bg-purple-700 px-2 py-1 text-[10px] font-bold text-white hover:bg-purple-800"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* View Full Suggestion Engine Hub CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/suggestions")}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#0f4c81]/10 text-[#0f4c81] dark:bg-[#0f4c81]/25 dark:text-blue-400 py-2 text-xs font-bold hover:bg-[#0f4c81]/20 transition"
                >
                  Explore All Suggestions <ArrowRight className="size-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentCity={currentCityName}
        onSelectCity={handleCitySelect}
      />
    </div>
  );
}

