"use client";

// ============================================================
// MGN Global Location Tracker Component
// components/location/LocationTracker.tsx
//
// Automatically keeps user location fresh in background when
// permission is granted, restores location from cookies/database,
// and broadcasts location change events across the application.
// ============================================================

import * as React from "react";
import { useLocationTracking } from "@/lib/use-location-tracking";

export function LocationTracker() {
  const { location, permissionStatus, requestLocation } = useLocationTracking();

  // Perform a silent background sync on application mount if granted
  React.useEffect(() => {
    if (permissionStatus === "granted" && !location) {
      void requestLocation();
    }
  }, [permissionStatus, location, requestLocation]);

  return null;
}
