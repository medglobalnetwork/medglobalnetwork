// ============================================================
// MGN Location Tracking Service
// lib/location-tracking.ts
//
// Handles recording, updating, and querying user GPS coordinates,
// reverse geocoding, and updating professional profile coordinates.
// ============================================================

import { database } from "@/lib/auth";
import { sql } from "kysely";
import {
  LatLng,
  isValidLatLng,
  reverseGeocodeLocation,
  MAJOR_CITIES,
  CityLocation,
  getCityCoordinates,
} from "./geo";

const db = database as any;

let tablesInitialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureLocationTables(): Promise<void> {
  if (tablesInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 1. User Locations Table
      await sql`
        CREATE TABLE IF NOT EXISTS user_locations (
          id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
          user_id             TEXT REFERENCES "user"(id) ON DELETE CASCADE,
          session_id          TEXT,
          latitude            DOUBLE PRECISION NOT NULL,
          longitude           DOUBLE PRECISION NOT NULL,
          accuracy_meters     REAL,
          altitude            REAL,
          heading             REAL,
          speed               REAL,
          city                TEXT,
          state               TEXT,
          country             TEXT DEFAULT 'India',
          locality            TEXT,
          postal_code         TEXT,
          formatted_address   TEXT,
          source              TEXT DEFAULT 'gps',
          is_active           BOOLEAN DEFAULT true,
          created_at          TIMESTAMPTZ DEFAULT now(),
          updated_at          TIMESTAMPTZ DEFAULT now()
        );
      `.execute(db);

      await sql`CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);`.execute(db);
      await sql`CREATE INDEX IF NOT EXISTS idx_user_locations_session ON user_locations(session_id);`.execute(db);
      await sql`CREATE INDEX IF NOT EXISTS idx_user_locations_coords ON user_locations(latitude, longitude);`.execute(db);
      await sql`CREATE INDEX IF NOT EXISTS idx_user_locations_city ON user_locations(city);`.execute(db);
      await sql`CREATE INDEX IF NOT EXISTS idx_user_locations_updated ON user_locations(updated_at DESC);`.execute(db);

      // 2. Coordinates on Professional Profiles
      await sql`
        ALTER TABLE professional_profiles
          ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
          ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
          ADD COLUMN IF NOT EXISTS locality TEXT;
      `.execute(db);
      await sql`
        CREATE INDEX IF NOT EXISTS idx_professional_profiles_coords ON professional_profiles(latitude, longitude)
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
      `.execute(db);

      // 3. Coordinates on Events
      await sql`
        ALTER TABLE events
          ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
          ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
      `.execute(db);
      await sql`
        CREATE INDEX IF NOT EXISTS idx_events_coords ON events(latitude, longitude)
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
      `.execute(db);

      // 4. Coordinates on Jobs
      await sql`
        ALTER TABLE jobs
          ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
          ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
      `.execute(db);

      // 5. Coordinates on Organizations
      await sql`
        ALTER TABLE organizations
          ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
          ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
      `.execute(db);

      // 6. Coordinates on Camps
      await sql`
        ALTER TABLE camps
          ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
          ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
      `.execute(db);

      tablesInitialized = true;
    } catch (err) {
      console.warn("Location tables initialization warning:", err);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export interface TrackLocationInput {
  userId?: string | null;
  sessionId?: string | null;
  lat: number;
  lng: number;
  accuracyMeters?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  locality?: string | null;
  postalCode?: string | null;
  formattedAddress?: string | null;
  source?: "gps" | "ip" | "manual" | "browser";
}

export interface UserLocationRecord {
  id: string;
  user_id: string | null;
  session_id: string | null;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  locality: string | null;
  postal_code: string | null;
  formatted_address: string | null;
  source: string;
  is_active: boolean;
  updated_at: Date;
}

/**
 * Persists the user's latest tracked coordinates.
 * Resolves city, state, and locality via reverse geocoding if omitted.
 */
export async function saveTrackedLocation(
  input: TrackLocationInput
): Promise<UserLocationRecord> {
  await ensureLocationTables();

  const point: LatLng = { lat: input.lat, lng: input.lng };
  if (!isValidLatLng(point)) {
    throw new Error("Invalid GPS coordinates provided");
  }

  let city = input.city?.trim() || null;
  let state = input.state?.trim() || null;
  let country = input.country?.trim() || "India";
  let locality = input.locality?.trim() || null;
  let formattedAddress = input.formattedAddress?.trim() || null;

  // If city/state is missing, reverse geocode using nearest centroid / geocoder
  if (!city || !state) {
    const geo = await reverseGeocodeLocation(point);
    city = city || geo.city;
    state = state || geo.state;
    country = country || geo.country;
    locality = locality || geo.locality || null;
    formattedAddress = formattedAddress || geo.formatted_address || `${city}, ${state}`;
  }

  const userId = input.userId || null;
  const sessionId = input.sessionId || null;
  const accuracy = input.accuracyMeters ?? null;
  const source = input.source || "gps";

  // Check if a record already exists for this user or session
  let existingId: string | null = null;
  if (userId) {
    const existing = await db
      .selectFrom("user_locations")
      .select("id")
      .where("user_id", "=", userId)
      .orderBy("updated_at", "desc")
      .executeTakeFirst();
    if (existing) existingId = existing.id;
  } else if (sessionId) {
    const existing = await db
      .selectFrom("user_locations")
      .select("id")
      .where("session_id", "=", sessionId)
      .orderBy("updated_at", "desc")
      .executeTakeFirst();
    if (existing) existingId = existing.id;
  }

  let record: UserLocationRecord;

  if (existingId) {
    // Update existing location row
    const updated = await db
      .updateTable("user_locations")
      .set({
        latitude: point.lat,
        longitude: point.lng,
        accuracy_meters: accuracy,
        city,
        state,
        country,
        locality,
        postal_code: input.postalCode || null,
        formatted_address: formattedAddress,
        source,
        is_active: true,
        updated_at: new Date(),
      })
      .where("id", "=", existingId)
      .returningAll()
      .executeTakeFirst();
    record = updated;
  } else {
    // Insert new location row
    const inserted = await db
      .insertInto("user_locations")
      .values({
        user_id: userId,
        session_id: sessionId,
        latitude: point.lat,
        longitude: point.lng,
        accuracy_meters: accuracy,
        altitude: input.altitude ?? null,
        heading: input.heading ?? null,
        speed: input.speed ?? null,
        city,
        state,
        country,
        locality,
        postal_code: input.postalCode || null,
        formatted_address: formattedAddress,
        source,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returningAll()
      .executeTakeFirst();
    record = inserted;
  }

  // If user is authenticated, synchronize their professional profile coordinates
  if (userId) {
    try {
      await db
        .updateTable("professional_profiles")
        .set({
          latitude: point.lat,
          longitude: point.lng,
          locality: locality || undefined,
          city: city || undefined,
          state: state || undefined,
        })
        .where("user_id", "=", userId)
        .execute();
    } catch {
      // Non-fatal if profile update fails
    }
  }

  return record;
}

/**
 * Retrieves the most recent tracked location for a user or session.
 */
export async function getLatestUserLocation(
  userId?: string | null,
  sessionId?: string | null
): Promise<UserLocationRecord | null> {
  await ensureLocationTables();

  let query = db.selectFrom("user_locations").selectAll().where("is_active", "=", true);

  if (userId) {
    query = query.where("user_id", "=", userId);
  } else if (sessionId) {
    query = query.where("session_id", "=", sessionId);
  } else {
    return null;
  }

  const row = await query.orderBy("updated_at", "desc").limit(1).executeTakeFirst();
  return row || null;
}

/**
 * Searches curated cities for manual selection or autocomplete.
 */
export function searchCities(query?: string, limit = 20): CityLocation[] {
  if (!query || !query.trim()) {
    return MAJOR_CITIES.filter((c) => c.popular).slice(0, limit);
  }
  const q = query.trim().toLowerCase();
  return MAJOR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
  ).slice(0, limit);
}

