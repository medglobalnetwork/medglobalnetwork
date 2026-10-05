// ============================================================
// MGN Geo helpers & Geospatial Intelligence
// lib/geo.ts
//
// Plain math, no heavy dependencies — used by nearby discovery,
// camp geofence check-in, and the MGN Suggestion Engine.
// ============================================================

export type LatLng = { lat: number; lng: number };

export interface CityLocation {
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  popular?: boolean;
}

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

/** Distance in kilometers between two points */
export function distanceKm(a: LatLng, b: LatLng): number {
  return distanceMeters(a, b) / 1000;
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

/** Rough driving estimate at ~35 km/h (city traffic). */
export function estimateDriveMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / (35000 / 60)));
}

/** Opens any coordinate in the platform map app. */
export function mapsUrl(point: LatLng, label?: string | null): string {
  const q = label ? `${point.lat},${point.lng}(${encodeURIComponent(label)})` : `${point.lat},${point.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/**
 * Curated list of major healthcare hub cities across India & global regions.
 * Used for fast centroid geocoding, reverse matching, and city pickers.
 */
export const MAJOR_CITIES: CityLocation[] = [
  // Metro Cities
  { name: "Mumbai", state: "Maharashtra", country: "India", lat: 19.0760, lng: 72.8777, popular: true },
  { name: "Delhi", state: "Delhi", country: "India", lat: 28.6139, lng: 77.2090, popular: true },
  { name: "Bengaluru", state: "Karnataka", country: "India", lat: 12.9716, lng: 77.5946, popular: true },
  { name: "Hyderabad", state: "Telangana", country: "India", lat: 17.3850, lng: 78.4867, popular: true },
  { name: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lng: 80.2707, popular: true },
  { name: "Kolkata", state: "West Bengal", country: "India", lat: 22.5726, lng: 88.3639, popular: true },
  { name: "Pune", state: "Maharashtra", country: "India", lat: 18.5204, lng: 73.8567, popular: true },
  { name: "Ahmedabad", state: "Gujarat", country: "India", lat: 23.0225, lng: 72.5714, popular: true },
  
  // Tier 1 & 2 Medical Hubs
  { name: "Jaipur", state: "Rajasthan", country: "India", lat: 26.9124, lng: 75.7873, popular: true },
  { name: "Lucknow", state: "Uttar Pradesh", country: "India", lat: 26.8467, lng: 80.9462, popular: true },
  { name: "Chandigarh", state: "Chandigarh", country: "India", lat: 30.7333, lng: 76.7794, popular: true },
  { name: "Indore", state: "Madhya Pradesh", country: "India", lat: 22.7196, lng: 75.8577, popular: true },
  { name: "Kochi", state: "Kerala", country: "India", lat: 9.9312, lng: 76.2673, popular: true },
  { name: "Bhopal", state: "Madhya Pradesh", country: "India", lat: 23.2599, lng: 77.4126 },
  { name: "Nagpur", state: "Maharashtra", country: "India", lat: 21.1458, lng: 79.0882 },
  { name: "Patna", state: "Bihar", country: "India", lat: 25.5941, lng: 85.1376 },
  { name: "Vadodara", state: "Gujarat", country: "India", lat: 22.3072, lng: 73.1812 },
  { name: "Surat", state: "Gujarat", country: "India", lat: 21.1702, lng: 72.8311 },
  { name: "Coimbatore", state: "Tamil Nadu", country: "India", lat: 11.0168, lng: 76.9558 },
  { name: "Thiruvananthapuram", state: "Kerala", country: "India", lat: 8.5241, lng: 76.9366 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", country: "India", lat: 17.6868, lng: 83.2185 },
  { name: "Bhubaneswar", state: "Odisha", country: "India", lat: 20.2961, lng: 85.8245 },
  { name: "Guwahati", state: "Assam", country: "India", lat: 26.1445, lng: 91.7362 },
  { name: "Dehradun", state: "Uttarakhand", country: "India", lat: 30.3165, lng: 78.0322 },
  { name: "Varanasi", state: "Uttar Pradesh", country: "India", lat: 25.3176, lng: 82.9739 },
  { name: "Agra", state: "Uttar Pradesh", country: "India", lat: 27.1767, lng: 78.0081 },
  { name: "Kanpur", state: "Uttar Pradesh", country: "India", lat: 26.4499, lng: 80.3319 },
  { name: "Nashik", state: "Maharashtra", country: "India", lat: 19.9975, lng: 73.7898 },
  { name: "Aurangabad", state: "Maharashtra", country: "India", lat: 19.8762, lng: 75.3433 },
  { name: "Thane", state: "Maharashtra", country: "India", lat: 19.2183, lng: 72.9781 },
  { name: "Navi Mumbai", state: "Maharashtra", country: "India", lat: 19.0330, lng: 73.0297 },
  { name: "Noida", state: "Uttar Pradesh", country: "India", lat: 28.5355, lng: 77.3910 },
  { name: "Gurugram", state: "Haryana", country: "India", lat: 28.4595, lng: 77.0266 },
  { name: "Faridabad", state: "Haryana", country: "India", lat: 28.4089, lng: 77.3178 },
  { name: "Ludhiana", state: "Punjab", country: "India", lat: 30.9010, lng: 75.8573 },
  { name: "Amritsar", state: "Punjab", country: "India", lat: 31.6340, lng: 74.8723 },
  { name: "Ranchi", state: "Jharkhand", country: "India", lat: 23.3441, lng: 85.3096 },
  { name: "Jamshedpur", state: "Jharkhand", country: "India", lat: 22.8046, lng: 86.2029 },
  { name: "Raipur", state: "Chhattisgarh", country: "India", lat: 21.2514, lng: 81.6296 },
  { name: "Jodhpur", state: "Rajasthan", country: "India", lat: 26.2389, lng: 73.0243 },
  { name: "Udaipur", state: "Rajasthan", country: "India", lat: 24.5854, lng: 73.7125 },
  { name: "Madurai", state: "Tamil Nadu", country: "India", lat: 9.9252, lng: 78.1198 },
  { name: "Mangalore", state: "Karnataka", country: "India", lat: 12.9141, lng: 74.8560 },
  { name: "Mysore", state: "Karnataka", country: "India", lat: 12.2958, lng: 76.6394 },
  { name: "Vijayawada", state: "Andhra Pradesh", country: "India", lat: 16.5062, lng: 80.6480 },
  { name: "Gwalior", state: "Madhya Pradesh", country: "India", lat: 26.2183, lng: 78.1828 },
  { name: "Jabalpur", state: "Madhya Pradesh", country: "India", lat: 23.1815, lng: 79.9864 },
  { name: "Jammu", state: "Jammu & Kashmir", country: "India", lat: 32.7266, lng: 74.8570 },
  { name: "Srinagar", state: "Jammu & Kashmir", country: "India", lat: 34.0837, lng: 74.7973 },
  { name: "Shimla", state: "Himachal Pradesh", country: "India", lat: 31.1048, lng: 77.1734 },
  { name: "Puducherry", state: "Puducherry", country: "India", lat: 11.9416, lng: 79.8083 },
  { name: "Goa (Panaji)", state: "Goa", country: "India", lat: 15.4909, lng: 73.8278 },

  // International Fallbacks
  { name: "London", state: "Greater London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { name: "Dubai", state: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  { name: "Singapore", state: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "New York", state: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
];

/**
 * Finds the nearest known city to a given coordinate point.
 */
export function findNearestCity(point: LatLng, maxDistanceMeters = 75000): {
  name: string;
  state: string;
  country: string;
  distanceMeters: number;
} | null {
  if (!isValidLatLng(point)) return null;

  let bestCity: CityLocation | null = null;
  let minDistance = Infinity;

  for (const city of MAJOR_CITIES) {
    const dist = distanceMeters(point, { lat: city.lat, lng: city.lng });
    if (dist < minDistance) {
      minDistance = dist;
      bestCity = city;
    }
  }

  if (bestCity && minDistance <= maxDistanceMeters) {
    return {
      name: bestCity.name,
      state: bestCity.state,
      country: bestCity.country,
      distanceMeters: minDistance,
    };
  }

  // If outside threshold, still return the closest known city as reference fallback
  if (bestCity) {
    return {
      name: bestCity.name,
      state: bestCity.state,
      country: bestCity.country,
      distanceMeters: minDistance,
    };
  }

  return null;
}

/**
 * Returns centroid coordinates for a city name.
 */
export function getCityCoordinates(cityName: string): LatLng | null {
  if (!cityName) return null;
  const clean = cityName.trim().toLowerCase();
  
  const found = MAJOR_CITIES.find(
    (c) => c.name.toLowerCase() === clean || clean.includes(c.name.toLowerCase())
  );
  if (found) {
    return { lat: found.lat, lng: found.lng };
  }
  return null;
}

/**
 * Resolves a coordinate to human-readable address/city with graceful fallback.
 */
export async function reverseGeocodeLocation(point: LatLng): Promise<{
  city: string;
  state: string;
  country: string;
  locality?: string;
  formatted_address?: string;
}> {
  const nearest = findNearestCity(point);
  let resolvedCity = nearest?.name || "Local Area";
  let resolvedState = nearest?.state || "India";
  let resolvedCountry = nearest?.country || "India";
  let locality: string | undefined = undefined;
  let formatted_address: string | undefined = undefined;

  // Try OpenStreetMap Nominatim with very short timeout (1200ms) for high-accuracy locality if available
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${point.lat}&lon=${point.lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          "User-Agent": "MGN-Life-Healthcare-App/1.0",
          "Accept-Language": "en",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.address) {
        const addr = data.address;
        resolvedCity =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.city_district ||
          addr.suburb ||
          addr.state_district ||
          addr.county ||
          addr.municipality ||
          resolvedCity;
        resolvedState = addr.state || resolvedState;
        resolvedCountry = addr.country || resolvedCountry;
        locality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.village;
        formatted_address = data.display_name;
      }
    }
  } catch {
    // Offline or network timeout — fallback to nearest centroid is already prepared!
  }

  return {
    city: resolvedCity,
    state: resolvedState,
    country: resolvedCountry,
    locality,
    formatted_address,
  };
}

