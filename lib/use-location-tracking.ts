"use client";

// ============================================================
// MGN Client-Side Location Tracking Hook
// lib/use-location-tracking.ts
//
// Tracks user's actual GPS position via Capacitor Geolocation on
// mobile or HTML5 Geolocation API on web, reverse-geocodes,
// and syncs with the MGN Suggestion Engine.
// ============================================================

import * as React from "react";
import { isNativePlatform } from "./native-mobile";
import { reverseGeocodeLocation, LatLng } from "./geo";

export interface TrackedLocation {
  lat: number;
  lng: number;
  accuracy?: number | null;
  city: string;
  state: string;
  country: string;
  locality?: string | null;
  formatted_address?: string | null;
  source: "gps" | "ip" | "manual" | "browser";
  timestamp: number;
}

export type LocationPermissionState = "prompt" | "granted" | "denied" | "unavailable";

const STORAGE_KEY = "mgn_user_location";

export function useLocationTracking() {
  const [location, setLocation] = React.useState<TrackedLocation | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = React.useState<LocationPermissionState>("prompt");

  // Load cached location on mount or restore from database
  React.useEffect(() => {
    let hasLoaded = false;
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as TrackedLocation;
        // Valid for up to 24 hours
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setLocation(parsed);
          setPermissionStatus(parsed.source === "gps" ? "granted" : "prompt");
          hasLoaded = true;
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    // If not found in localStorage, restore from backend user_locations/cookies
    if (!hasLoaded) {
      fetch("/api/location/track")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.location?.lat && d?.location?.lng) {
            const restored: TrackedLocation = {
              lat: Number(d.location.lat),
              lng: Number(d.location.lng),
              accuracy: d.location.accuracy_meters || null,
              city: d.location.city || "Mumbai",
              state: d.location.state || "Maharashtra",
              country: d.location.country || "India",
              locality: d.location.locality || null,
              formatted_address: d.location.formatted_address || `${d.location.city || ""}, ${d.location.state || ""}`,
              source: d.location.source || "gps",
              timestamp: Date.now(),
            };
            setLocation(restored);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
            } catch {}
          }
        })
        .catch(() => {});
    }

    // Check navigator permissions API if supported
    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          if (status.state === "granted") setPermissionStatus("granted");
          else if (status.state === "denied") setPermissionStatus("denied");
          else setPermissionStatus("prompt");

          status.onchange = () => {
            if (status.state === "granted") setPermissionStatus("granted");
            else if (status.state === "denied") setPermissionStatus("denied");
            else setPermissionStatus("prompt");
          };
        })
        .catch(() => {});
    }
  }, []);

  // Listen for external location updates (e.g. city selector)
  React.useEffect(() => {
    const handleLocationEvent = (e: Event) => {
      const customEvent = e as CustomEvent<TrackedLocation>;
      if (customEvent.detail) {
        setLocation(customEvent.detail);
      }
    };
    window.addEventListener("mgn-location-changed", handleLocationEvent);
    return () => window.removeEventListener("mgn-location-changed", handleLocationEvent);
  }, []);

  /**
   * Syncs position to server & localStorage
   */
  const persistLocation = React.useCallback(async (loc: TrackedLocation) => {
    setLocation(loc);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch {}

    // Dispatch global event for other components to react
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mgn-location-changed", { detail: loc }));
    }

    // Sync to backend /api/location/track in background
    try {
      await fetch("/api/location/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: loc.lat,
          lng: loc.lng,
          accuracy: loc.accuracy,
          city: loc.city,
          state: loc.state,
          country: loc.country,
          locality: loc.locality,
          formattedAddress: loc.formatted_address,
          source: loc.source,
        }),
      });
    } catch (err) {
      console.warn("Location sync warning:", err);
    }
  }, []);

  /**
   * Request actual GPS coordinates from device
   */
  const requestLocation = React.useCallback(async (): Promise<TrackedLocation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let coords: { lat: number; lng: number; accuracy?: number } | null = null;

      if (isNativePlatform()) {
        const { Geolocation } = await import("@capacitor/geolocation");
        const perm = await Geolocation.requestPermissions();
        if (perm.location === "granted" || perm.coarseLocation === "granted") {
          setPermissionStatus("granted");
          const pos = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
          });
          coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
        } else {
          setPermissionStatus("denied");
          setError("Location permission denied. You can select your city manually.");
          setIsLoading(false);
          return null;
        }
      } else if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setPermissionStatus("granted");
              resolve({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              });
            },
            (err) => {
              if (err.code === err.PERMISSION_DENIED) {
                setPermissionStatus("denied");
                reject(new Error("Location permission was denied."));
              } else if (err.code === err.POSITION_UNAVAILABLE) {
                setPermissionStatus("unavailable");
                reject(new Error("GPS position is currently unavailable."));
              } else {
                reject(new Error("Location request timed out."));
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 12000,
              maximumAge: 60000,
            }
          );
        });
      } else {
        setPermissionStatus("unavailable");
        setError("Geolocation is not supported by your browser.");
        setIsLoading(false);
        return null;
      }

      if (!coords) {
        setIsLoading(false);
        return null;
      }

      // Reverse geocode to city/state
      const geo = await reverseGeocodeLocation({ lat: coords.lat, lng: coords.lng });

      const newLocation: TrackedLocation = {
        lat: coords.lat,
        lng: coords.lng,
        accuracy: coords.accuracy || null,
        city: geo.city,
        state: geo.state,
        country: geo.country,
        locality: geo.locality || null,
        formatted_address: geo.formatted_address || `${geo.city}, ${geo.state}`,
        source: "gps",
        timestamp: Date.now(),
      };

      await persistLocation(newLocation);
      setIsLoading(false);
      return newLocation;
    } catch (err: any) {
      console.warn("Location tracking error:", err);
      setError(err?.message || "Could not detect location.");
      setIsLoading(false);
      return null;
    }
  }, [persistLocation]);

  // Auto-refresh when GPS permission is granted and location is not yet detected or stale
  React.useEffect(() => {
    if (permissionStatus === "granted") {
      const shouldRefresh = !location || (Date.now() - location.timestamp > 30 * 60 * 1000);
      if (shouldRefresh && !isLoading) {
        void requestLocation();
      }
    }
  }, [permissionStatus, location, isLoading, requestLocation]);

  /**
   * Set city manually (for users who decline GPS or want to explore another region)
   */
  const setManualCity = React.useCallback(
    async (cityName: string, stateName = "", lat?: number, lng?: number) => {
      setIsLoading(true);
      setError(null);

      let finalLat = lat;
      let finalLng = lng;

      if (finalLat == null || finalLng == null) {
        const { getCityCoordinates } = await import("./geo");
        const found = getCityCoordinates(cityName);
        if (found) {
          finalLat = found.lat;
          finalLng = found.lng;
        } else {
          // Default fallback
          finalLat = 19.0760;
          finalLng = 72.8777;
        }
      }

      const manualLoc: TrackedLocation = {
        lat: finalLat,
        lng: finalLng,
        accuracy: null,
        city: cityName,
        state: stateName,
        country: "India",
        locality: null,
        formatted_address: stateName ? `${cityName}, ${stateName}` : cityName,
        source: "manual",
        timestamp: Date.now(),
      };

      await persistLocation(manualLoc);
      setIsLoading(false);
      return manualLoc;
    },
    [persistLocation]
  );

  return {
    location,
    isLoading,
    error,
    permissionStatus,
    requestLocation,
    setManualCity,
    refreshLocation: requestLocation,
  };
}

