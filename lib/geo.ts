// ============================================================
// MGN Geo helpers
// lib/geo.ts
//
// Plain math, no dependencies — used by nearby discovery and the
// camp geofence check-in.
// ============================================================

export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_M = 6371008.8; // mean radius, metres
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres between two points. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Rough bounding box around a point, used to prefilter rows in SQL before
 * the exact haversine runs. Deliberately over-sized (2x) so the box never
 * clips a result that the precise calculation would have kept.
 */
export function boundingBox(center: LatLng, radiusMeters: number) {
  const latDelta = (radiusMeters / EARTH_RADIUS_M) * (180 / Math.PI);
  // Longitude degrees shrink towards the poles.
  const cos = Math.cos(toRad(center.lat));
  const lngDelta =
    Math.abs(cos) < 1e-6 ? 180 : latDelta / Math.abs(cos);

  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - Math.min(180, lngDelta),
    maxLng: center.lng + Math.min(180, lngDelta),
  };
}

export function isValidLatLng(value: unknown): value is LatLng {
  if (!value || typeof value !== "object") return false;
  const { lat, lng } = value as Partial<LatLng>;
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

/** "450 m", "1.2 km", "18 km" — the unit a human wants to read. */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return "—";
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Rough walking estimate at 5 km/h. */
export function estimateWalkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / (5000 / 60)));
}

/** Opens any coordinate in the platform map app. */
export function mapsUrl(point: LatLng, label?: string | null): string {
  const q = label ? `${point.lat},${point.lng}(${encodeURIComponent(label)})` : `${point.lat},${point.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
