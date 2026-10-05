// ============================================================
// MGN Location-Aware Suggestion Engine
// modules/recommendations/lib/location-suggestion-engine.ts
//
// Complete multi-entity suggestion engine powered by geospatial
// proximity, haversine distance, city/state locality, and
// healthcare clinical affinity.
// ============================================================

import { database } from "@/lib/auth";
import { sql } from "kysely";
import {
  LatLng,
  distanceMeters,
  distanceKm,
  boundingBox,
  formatDistance,
  estimateWalkMinutes,
  estimateDriveMinutes,
  mapsUrl,
  findNearestCity,
  getCityCoordinates,
} from "@/lib/geo";
import { ensureLocationTables } from "@/lib/location-tracking";

const db = database as any;

export type SuggestionCategoryType =
  | "all"
  | "people"
  | "contents"
  | "events"
  | "opportunities"
  | "facilities";

export interface LocationSuggestionQueryOptions {
  lat: number;
  lng: number;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  radiusKm?: number; // e.g. 5, 15, 50, 100, 200
  categories?: SuggestionCategoryType[];
  limit?: number;
  offset?: number;
  userId?: string | null;
}

export interface SuggestedPerson {
  user_id: string;
  name: string;
  image: string | null;
  profession: string | null;
  specialization: string | null;
  sub_specialization: string | null;
  designation: string | null;
  organization: string | null;
  primary_degree: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  distance_meters: number;
  distance_km: number;
  distance_label: string;
  walk_minutes: number;
  drive_minutes: number;
  maps_url: string;
  identity_verified: boolean;
  registration_verified: boolean;
  experience_years: number;
  skills: string[] | null;
  suggestion_reason: string;
  is_connected?: boolean;
  connection_status?: "connected" | "pending_sent" | "pending_received" | "none";
}

export interface SuggestedContent {
  id: string;
  author_id: string;
  author_name: string;
  author_image: string | null;
  author_profession: string | null;
  author_specialization: string | null;
  author_verified: boolean;
  post_type: string;
  content: string;
  media_urls: string[] | null;
  city: string | null;
  distance_meters: number;
  distance_label: string;
  reaction_count: number;
  comment_count: number;
  created_at: string;
  suggestion_reason: string;
}

export interface SuggestedEvent {
  id: string;
  slug: string;
  title: string;
  type: "camp" | "event";
  category: string;
  venue_name: string;
  address: string;
  city: string;
  state: string;
  start_time: string;
  end_time: string;
  is_free: boolean;
  price?: number;
  cme_credits?: number;
  distance_meters: number;
  distance_km: number;
  distance_label: string;
  walk_minutes: number;
  drive_minutes: number;
  maps_url: string;
  cover_url: string | null;
  organizer_name?: string;
  services?: string[];
  capacity?: number;
  registered_count?: number;
  suggestion_reason: string;
}

export interface SuggestedOpportunity {
  id: string;
  title: string;
  slug: string;
  opportunity_type: string;
  employment_type: string;
  work_mode: string;
  organization_name: string;
  organization_slug?: string;
  organization_logo?: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  profession: string | null;
  specialization: string | null;
  distance_meters: number;
  distance_label: string;
  drive_minutes: number;
  suggestion_reason: string;
}

export interface SuggestedFacility {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  logo_url: string | null;
  cover_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  specialties: string[] | null;
  verification_status: string;
  distance_meters: number;
  distance_label: string;
  drive_minutes: number;
  maps_url: string;
  suggestion_reason: string;
}

export interface LocationSuggestionResult {
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    country: string;
  };
  radius_km: number;
  summary: {
    total_people: number;
    total_contents: number;
    total_events: number;
    total_opportunities: number;
    total_facilities: number;
  };
  people: SuggestedPerson[];
  contents: SuggestedContent[];
  events: SuggestedEvent[];
  opportunities: SuggestedOpportunity[];
  facilities: SuggestedFacility[];
}

/**
 * Master multi-entity location suggestion engine.
 */
export async function getLocationSuggestions(
  opts: LocationSuggestionQueryOptions
): Promise<LocationSuggestionResult> {
  await ensureLocationTables();

  const userPoint: LatLng = { lat: opts.lat, lng: opts.lng };
  const radiusKm = Math.min(Math.max(opts.radiusKm || 50, 1), 500);
  const radiusMeters = radiusKm * 1000;
  const limit = Math.min(Math.max(opts.limit || 10, 1), 50);
  const offset = Math.max(opts.offset || 0, 0);

  // Derive city/state if missing
  let city = opts.city || "";
  let state = opts.state || "";
  let country = opts.country || "India";

  if (!city || !state) {
    const nearest = findNearestCity(userPoint);
    if (nearest) {
      city = city || nearest.name;
      state = state || nearest.state;
      country = country || nearest.country;
    }
  }

  const requestedCategories = new Set<SuggestionCategoryType>(
    opts.categories && opts.categories.length > 0 ? opts.categories : ["all"]
  );
  const shouldFetchAll = requestedCategories.has("all");

  const [people, contents, events, opportunities, facilities] = await Promise.all([
    shouldFetchAll || requestedCategories.has("people")
      ? getNearbyProfessionals(userPoint, city, state, radiusMeters, limit, offset, opts.userId)
      : Promise.resolve({ items: [] as SuggestedPerson[], total: 0 }),

    shouldFetchAll || requestedCategories.has("contents")
      ? getNearbyContents(userPoint, city, state, radiusMeters, limit, offset, opts.userId)
      : Promise.resolve({ items: [] as SuggestedContent[], total: 0 }),

    shouldFetchAll || requestedCategories.has("events")
      ? getNearbyEventsAndCamps(userPoint, city, state, radiusMeters, limit, offset)
      : Promise.resolve({ items: [] as SuggestedEvent[], total: 0 }),

    shouldFetchAll || requestedCategories.has("opportunities")
      ? getNearbyOpportunities(userPoint, city, state, radiusMeters, limit, offset)
      : Promise.resolve({ items: [] as SuggestedOpportunity[], total: 0 }),

    shouldFetchAll || requestedCategories.has("facilities")
      ? getNearbyFacilities(userPoint, city, state, radiusMeters, limit, offset)
      : Promise.resolve({ items: [] as SuggestedFacility[], total: 0 }),
  ]);

  return {
    location: {
      lat: userPoint.lat,
      lng: userPoint.lng,
      city: city || "Current Location",
      state: state || "",
      country: country || "India",
    },
    radius_km: radiusKm,
    summary: {
      total_people: people.total,
      total_contents: contents.total,
      total_events: events.total,
      total_opportunities: opportunities.total,
      total_facilities: facilities.total,
    },
    people: people.items,
    contents: contents.items,
    events: events.items,
    opportunities: opportunities.items,
    facilities: facilities.items,
  };
}

/**
 * 1. NEARBY PROFESSIONALS (LOG)
 */
async function getNearbyProfessionals(
  center: LatLng,
  city: string,
  state: string,
  radiusMeters: number,
  limit: number,
  offset: number,
  currentUserId?: string | null
): Promise<{ items: SuggestedPerson[]; total: number }> {
  const box = boundingBox(center, radiusMeters);

  try {
    const raw: any = await sql`
      SELECT 
        u.id AS user_id,
        u.name,
        COALESCE(
          NULLIF(mi.profile_photo_url, ''),
          CASE WHEN u.image NOT LIKE '%googleusercontent%' AND u.image NOT LIKE '%ggpht.com%' THEN u.image ELSE NULL END,
          mi.profile_photo_url,
          u.image
        ) AS image,
        pp.profession,
        pp.specialization,
        pp.sub_specialization,
        pp.designation,
        pp.organization,
        pp.primary_degree,
        pp.city,
        pp.state,
        pp.country,
        pp.latitude,
        pp.longitude,
        pp.skills,
        pp.identity_verified,
        pp.registration_verified,
        pp.experience_years
      FROM "user" u
      JOIN professional_profiles pp ON pp.user_id = u.id
      LEFT JOIN mgn_identities mi ON mi.user_id = u.id
      WHERE (${currentUserId ? sql`u.id <> ${currentUserId}` : sql`1=1`})
        AND (pp.profile_visibility IS NULL OR pp.profile_visibility <> 'private')
        AND (
          (pp.latitude IS NOT NULL AND pp.longitude IS NOT NULL
            AND pp.latitude >= ${box.minLat} AND pp.latitude <= ${box.maxLat}
            AND pp.longitude >= ${box.minLng} AND pp.longitude <= ${box.maxLng})
          OR (${city} <> '' AND pp.city ILIKE ${'%' + city + '%'})
          OR (${state} <> '' AND pp.state ILIKE ${'%' + state + '%'})
        )
      LIMIT 100;
    `.execute(db);

    const rows = raw?.rows || [];

    // Calculate exact distance & sort closest first
    const candidates = rows.map((r: any) => {
      let coords: LatLng | null = null;
      if (r.latitude != null && r.longitude != null && !isNaN(Number(r.latitude))) {
        coords = { lat: Number(r.latitude), lng: Number(r.longitude) };
      } else if (r.city) {
        coords = getCityCoordinates(r.city);
      }

      // If still no coords, fall back to center plus small offset if same city
      let dist = radiusMeters * 1.5; // default beyond radius
      if (coords) {
        dist = distanceMeters(center, coords);
      } else if (r.city && city && r.city.toLowerCase() === city.toLowerCase()) {
        dist = 5000; // estimated ~5km within same city
      } else if (r.state && state && r.state.toLowerCase() === state.toLowerCase()) {
        dist = Math.max(radiusMeters + 10000, 80000); // regional within state
      }

      let reason = `Practicing in ${r.city || r.state || "nearby area"}`;
      if (dist <= 5000) {
        reason = `Within 5 km of you in ${r.city || "your area"}`;
      } else if (dist <= 25000) {
        reason = `Nearby healthcare professional in ${r.city || r.state}`;
      } else if (r.specialization) {
        reason = `Specialist in ${r.specialization} (${r.city || r.state})`;
      }

      const pointForMap = coords || center;

      return {
        user_id: r.user_id,
        name: r.name || "Healthcare Professional",
        image: r.image || null,
        profession: r.profession || "Doctor / Clinician",
        specialization: r.specialization || null,
        sub_specialization: r.sub_specialization || null,
        designation: r.designation || null,
        organization: r.organization || null,
        primary_degree: r.primary_degree || null,
        city: r.city || null,
        state: r.state || null,
        country: r.country || "India",
        distance_meters: Math.round(dist),
        distance_km: Math.round((dist / 1000) * 10) / 10,
        distance_label: formatDistance(dist),
        walk_minutes: estimateWalkMinutes(dist),
        drive_minutes: estimateDriveMinutes(dist),
        maps_url: mapsUrl(pointForMap, r.name),
        identity_verified: Boolean(r.identity_verified),
        registration_verified: Boolean(r.registration_verified),
        experience_years: Number(r.experience_years) || 0,
        skills: Array.isArray(r.skills) ? r.skills : null,
        suggestion_reason: reason,
      } as SuggestedPerson;
    });

    // Filter within radius (or include same city if coordinates were approximate)
    const filtered = candidates
      .filter((c: SuggestedPerson) => c.distance_meters <= radiusMeters * 1.25)
      .sort((a: SuggestedPerson, b: SuggestedPerson) => a.distance_meters - b.distance_meters);

    const paginated = filtered.slice(offset, offset + limit);
    return { items: paginated, total: filtered.length };
  } catch (err) {
    console.warn("getNearbyProfessionals error:", err);
    return { items: [], total: 0 };
  }
}

/**
 * 2. NEARBY CONTENTS (POSTS & FEED)
 */
async function getNearbyContents(
  center: LatLng,
  city: string,
  state: string,
  radiusMeters: number,
  limit: number,
  offset: number,
  currentUserId?: string | null
): Promise<{ items: SuggestedContent[]; total: number }> {
  const box = boundingBox(center, radiusMeters);

  try {
    const raw: any = await sql`
      SELECT 
        p.id,
        p.author_id,
        p.post_type,
        p.content,
        p.media_urls,
        p.reaction_count,
        p.comment_count,
        p.created_at,
        u.name AS author_name,
        u.image AS author_image,
        pp.profession AS author_profession,
        pp.specialization AS author_specialization,
        pp.city AS author_city,
        pp.state AS author_state,
        pp.latitude AS author_lat,
        pp.longitude AS author_lng,
        pp.identity_verified AS author_verified
      FROM network_posts p
      JOIN "user" u ON u.id = p.author_id
      LEFT JOIN professional_profiles pp ON pp.user_id = u.id
      WHERE (${currentUserId ? sql`p.author_id <> ${currentUserId}` : sql`1=1`})
        AND (p.visibility = 'public' OR p.visibility IS NULL)
        AND (
          (pp.latitude IS NOT NULL AND pp.longitude IS NOT NULL
            AND pp.latitude >= ${box.minLat} AND pp.latitude <= ${box.maxLat}
            AND pp.longitude >= ${box.minLng} AND pp.longitude <= ${box.maxLng})
          OR (${city} <> '' AND pp.city ILIKE ${'%' + city + '%'})
          OR (${state} <> '' AND pp.state ILIKE ${'%' + state + '%'})
        )
      ORDER BY p.created_at DESC
      LIMIT 60;
    `.execute(db);

    const rows = raw?.rows || [];

    const items: SuggestedContent[] = rows
      .map((r: any) => {
        let dist = radiusMeters;
        if (r.author_lat && r.author_lng && !isNaN(Number(r.author_lat))) {
          dist = distanceMeters(center, { lat: Number(r.author_lat), lng: Number(r.author_lng) });
        } else if (r.author_city) {
          const coords = getCityCoordinates(r.author_city);
          if (coords) dist = distanceMeters(center, coords);
          else if (city && r.author_city.toLowerCase() === city.toLowerCase()) dist = 4000;
        }

        let reason = `Posted by clinician in ${r.author_city || r.author_state || "your area"}`;
        if (dist <= 10000) {
          reason = `Local healthcare update (${formatDistance(dist)} away)`;
        }

        return {
          id: r.id,
          author_id: r.author_id,
          author_name: r.author_name || "Healthcare Professional",
          author_image: r.author_image || null,
          author_profession: r.author_profession || null,
          author_specialization: r.author_specialization || null,
          author_verified: Boolean(r.author_verified),
          post_type: r.post_type || "text",
          content: r.content,
          media_urls: Array.isArray(r.media_urls) ? r.media_urls : null,
          city: r.author_city || null,
          distance_meters: Math.round(dist),
          distance_label: formatDistance(dist),
          reaction_count: Number(r.reaction_count) || 0,
          comment_count: Number(r.comment_count) || 0,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          suggestion_reason: reason,
        };
      })
      .filter((c: SuggestedContent) => c.distance_meters <= radiusMeters * 1.5)
      .sort((a: SuggestedContent, b: SuggestedContent) => a.distance_meters - b.distance_meters);

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
    };
  } catch (err) {
    console.warn("getNearbyContents error:", err);
    return { items: [], total: 0 };
  }
}

/**
 * 3. NEARBY EVENTS & MEDICAL CAMPS
 */
async function getNearbyEventsAndCamps(
  center: LatLng,
  city: string,
  state: string,
  radiusMeters: number,
  limit: number,
  offset: number
): Promise<{ items: SuggestedEvent[]; total: number }> {
  const box = boundingBox(center, radiusMeters);

  try {
    // 3A. Nearby Camps
    const campsRaw: any = await sql`
      SELECT 
        c.id,
        c.slug,
        c.title,
        c.camp_type AS category,
        c.venue_name,
        c.address,
        c.city,
        c.state,
        c.start_date,
        c.end_date,
        c.cover_url,
        c.services,
        c.latitude,
        c.longitude,
        c.participant_capacity,
        c.participant_registered_count,
        u.name AS organizer_name
      FROM camps c
      LEFT JOIN "user" u ON u.id = c.organizer_id
      WHERE c.status IN ('published', 'approved', 'active')
        AND (
          (c.latitude IS NOT NULL AND c.longitude IS NOT NULL
            AND c.latitude >= ${box.minLat} AND c.latitude <= ${box.maxLat}
            AND c.longitude >= ${box.minLng} AND c.longitude <= ${box.maxLng})
          OR (${city} <> '' AND c.city ILIKE ${'%' + city + '%'})
          OR (${state} <> '' AND c.state ILIKE ${'%' + state + '%'})
        )
      ORDER BY c.start_date ASC
      LIMIT 40;
    `.execute(db);

    // 3B. Nearby Events (CME, Conferences, Workshops)
    const eventsRaw: any = await sql`
      SELECT 
        e.id,
        e.slug,
        e.title,
        e.event_type AS category,
        e.venue_name,
        e.address,
        e.city,
        e.state,
        e.start_time,
        e.end_time,
        e.cover_url,
        e.price,
        e.is_free,
        e.cme_credits,
        e.latitude,
        e.longitude,
        e.capacity,
        e.registered_count,
        u.name AS organizer_name
      FROM events e
      LEFT JOIN "user" u ON u.id = e.organizer_id
      WHERE e.status IN ('published', 'approved')
        AND (
          (e.latitude IS NOT NULL AND e.longitude IS NOT NULL
            AND e.latitude >= ${box.minLat} AND e.latitude <= ${box.maxLat}
            AND e.longitude >= ${box.minLng} AND e.longitude <= ${box.maxLng})
          OR (${city} <> '' AND e.city ILIKE ${'%' + city + '%'})
          OR (${state} <> '' AND e.state ILIKE ${'%' + state + '%'})
        )
      ORDER BY e.start_time ASC
      LIMIT 40;
    `.execute(db);

    const campList: SuggestedEvent[] = (campsRaw?.rows || []).map((c: any) => {
      let coords: LatLng | null = null;
      if (c.latitude != null && c.longitude != null && !isNaN(Number(c.latitude))) {
        coords = { lat: Number(c.latitude), lng: Number(c.longitude) };
      } else if (c.city) {
        coords = getCityCoordinates(c.city);
      }
      const dist = coords ? distanceMeters(center, coords) : 5000;
      const point = coords || center;

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        type: "camp",
        category: c.category || "Health Camp",
        venue_name: c.venue_name || "Community Venue",
        address: c.address || c.city || "",
        city: c.city,
        state: c.state,
        start_time: c.start_date ? new Date(c.start_date).toISOString() : new Date().toISOString(),
        end_time: c.end_date ? new Date(c.end_date).toISOString() : new Date().toISOString(),
        is_free: true,
        distance_meters: Math.round(dist),
        distance_km: Math.round((dist / 1000) * 10) / 10,
        distance_label: formatDistance(dist),
        walk_minutes: estimateWalkMinutes(dist),
        drive_minutes: estimateDriveMinutes(dist),
        maps_url: mapsUrl(point, c.venue_name || c.title),
        cover_url: c.cover_url || null,
        organizer_name: c.organizer_name || "MGN Health Foundation",
        services: Array.isArray(c.services) ? c.services : null,
        capacity: c.participant_capacity || undefined,
        registered_count: c.participant_registered_count || 0,
        suggestion_reason: `Medical Camp ${formatDistance(dist)} away in ${c.city}`,
      };
    });

    const eventList: SuggestedEvent[] = (eventsRaw?.rows || []).map((e: any) => {
      let coords: LatLng | null = null;
      if (e.latitude != null && e.longitude != null && !isNaN(Number(e.latitude))) {
        coords = { lat: Number(e.latitude), lng: Number(e.longitude) };
      } else if (e.city) {
        coords = getCityCoordinates(e.city);
      }
      const dist = coords ? distanceMeters(center, coords) : 6000;
      const point = coords || center;

      let reason = `Upcoming CME / Conference in ${e.city}`;
      if (Number(e.cme_credits) > 0) {
        reason = `${e.cme_credits} CME Credits event (${formatDistance(dist)} away)`;
      }

      return {
        id: e.id,
        slug: e.slug,
        title: e.title,
        type: "event",
        category: e.category || "Conference",
        venue_name: e.venue_name || "Conference Hall",
        address: e.address || e.city || "",
        city: e.city,
        state: e.state,
        start_time: e.start_time ? new Date(e.start_time).toISOString() : new Date().toISOString(),
        end_time: e.end_time ? new Date(e.end_time).toISOString() : new Date().toISOString(),
        is_free: Boolean(e.is_free),
        price: e.price ? Number(e.price) : 0,
        cme_credits: e.cme_credits ? Number(e.cme_credits) : undefined,
        distance_meters: Math.round(dist),
        distance_km: Math.round((dist / 1000) * 10) / 10,
        distance_label: formatDistance(dist),
        walk_minutes: estimateWalkMinutes(dist),
        drive_minutes: estimateDriveMinutes(dist),
        maps_url: mapsUrl(point, e.venue_name || e.title),
        cover_url: e.cover_url || null,
        organizer_name: e.organizer_name || "MGN Academy",
        capacity: e.capacity || undefined,
        registered_count: e.registered_count || 0,
        suggestion_reason: reason,
      };
    });

    const allEvents = [...campList, ...eventList]
      .filter((e) => e.distance_meters <= radiusMeters * 1.5)
      .sort((a, b) => a.distance_meters - b.distance_meters);

    return {
      items: allEvents.slice(offset, offset + limit),
      total: allEvents.length,
    };
  } catch (err) {
    console.warn("getNearbyEventsAndCamps error:", err);
    return { items: [], total: 0 };
  }
}

/**
 * 4. NEARBY OPPORTUNITIES & HEALTHCARE JOBS
 */
async function getNearbyOpportunities(
  center: LatLng,
  city: string,
  state: string,
  radiusMeters: number,
  limit: number,
  offset: number
): Promise<{ items: SuggestedOpportunity[]; total: number }> {
  const box = boundingBox(center, radiusMeters);

  try {
    const raw: any = await sql`
      SELECT 
        j.id,
        j.title,
        j.slug,
        j.opportunity_type,
        j.employment_type,
        j.work_mode,
        j.location,
        j.city,
        j.state,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.profession,
        j.specialization,
        j.latitude,
        j.longitude,
        o.name AS organization_name,
        o.slug AS organization_slug,
        o.logo_url AS organization_logo,
        o.city AS org_city,
        o.latitude AS org_lat,
        o.longitude AS org_lng
      FROM jobs j
      LEFT JOIN organizations o ON o.id = j.organization_id
      WHERE j.status = 'published'
        AND (
          (j.latitude IS NOT NULL AND j.longitude IS NOT NULL
            AND j.latitude >= ${box.minLat} AND j.latitude <= ${box.maxLat}
            AND j.longitude >= ${box.minLng} AND j.longitude <= ${box.maxLng})
          OR (o.latitude IS NOT NULL AND o.longitude IS NOT NULL
            AND o.latitude >= ${box.minLat} AND o.latitude <= ${box.maxLat}
            AND o.longitude >= ${box.minLng} AND o.longitude <= ${box.maxLng})
          OR (${city} <> '' AND (j.city ILIKE ${'%' + city + '%'} OR o.city ILIKE ${'%' + city + '%'}))
          OR (${state} <> '' AND (j.state ILIKE ${'%' + state + '%'} OR o.state ILIKE ${'%' + state + '%'}))
        )
      ORDER BY j.created_at DESC
      LIMIT 40;
    `.execute(db);

    const rows = raw?.rows || [];

    const items: SuggestedOpportunity[] = rows
      .map((r: any) => {
        let dist = radiusMeters;
        const lat = r.latitude || r.org_lat;
        const lng = r.longitude || r.org_lng;

        if (lat != null && lng != null && !isNaN(Number(lat))) {
          dist = distanceMeters(center, { lat: Number(lat), lng: Number(lng) });
        } else if (r.city || r.org_city) {
          const coords = getCityCoordinates(r.city || r.org_city);
          if (coords) dist = distanceMeters(center, coords);
          else if (city && (r.city?.toLowerCase() === city.toLowerCase() || r.org_city?.toLowerCase() === city.toLowerCase())) {
            dist = 4500;
          }
        }

        const orgName = r.organization_name || "Healthcare Institution";
        const reason = `Hiring near you at ${orgName} (${formatDistance(dist)})`;

        return {
          id: r.id,
          title: r.title,
          slug: r.slug,
          opportunity_type: r.opportunity_type || "job",
          employment_type: r.employment_type || "full_time",
          work_mode: r.work_mode || "onsite",
          organization_name: orgName,
          organization_slug: r.organization_slug,
          organization_logo: r.organization_logo || null,
          location: r.location || r.city || null,
          city: r.city || r.org_city || null,
          state: r.state || null,
          salary_min: r.salary_min != null ? Number(r.salary_min) : null,
          salary_max: r.salary_max != null ? Number(r.salary_max) : null,
          salary_currency: r.salary_currency || "INR",
          profession: r.profession || null,
          specialization: r.specialization || null,
          distance_meters: Math.round(dist),
          distance_label: formatDistance(dist),
          drive_minutes: estimateDriveMinutes(dist),
          suggestion_reason: reason,
        };
      })
      .filter((o: SuggestedOpportunity) => o.distance_meters <= radiusMeters * 1.5)
      .sort((a: SuggestedOpportunity, b: SuggestedOpportunity) => a.distance_meters - b.distance_meters);

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
    };
  } catch (err) {
    console.warn("getNearbyOpportunities error:", err);
    return { items: [], total: 0 };
  }
}

/**
 * 5. NEARBY FACILITIES & ORGANIZATIONS
 */
async function getNearbyFacilities(
  center: LatLng,
  city: string,
  state: string,
  radiusMeters: number,
  limit: number,
  offset: number
): Promise<{ items: SuggestedFacility[]; total: number }> {
  const box = boundingBox(center, radiusMeters);

  try {
    const raw: any = await sql`
      SELECT 
        o.id,
        o.name,
        o.slug,
        o.organization_type,
        o.logo_url,
        o.cover_url,
        o.address,
        o.city,
        o.state,
        o.specialties,
        o.verification_status,
        o.latitude,
        o.longitude
      FROM organizations o
      WHERE (
        (o.latitude IS NOT NULL AND o.longitude IS NOT NULL
          AND o.latitude >= ${box.minLat} AND o.latitude <= ${box.maxLat}
          AND o.longitude >= ${box.minLng} AND o.longitude <= ${box.maxLng})
        OR (${city} <> '' AND o.city ILIKE ${'%' + city + '%'})
        OR (${state} <> '' AND o.state ILIKE ${'%' + state + '%'})
      )
      LIMIT 30;
    `.execute(db);

    const rows = raw?.rows || [];

    const items: SuggestedFacility[] = rows
      .map((r: any) => {
        let coords: LatLng | null = null;
        if (r.latitude != null && r.longitude != null && !isNaN(Number(r.latitude))) {
          coords = { lat: Number(r.latitude), lng: Number(r.longitude) };
        } else if (r.city) {
          coords = getCityCoordinates(r.city);
        }

        const dist = coords ? distanceMeters(center, coords) : 5000;
        const point = coords || center;

        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          organization_type: r.organization_type || "Hospital",
          logo_url: r.logo_url || null,
          cover_url: r.cover_url || null,
          address: r.address || r.city || null,
          city: r.city || null,
          state: r.state || null,
          specialties: Array.isArray(r.specialties) ? r.specialties : null,
          verification_status: r.verification_status || "unverified",
          distance_meters: Math.round(dist),
          distance_label: formatDistance(dist),
          drive_minutes: estimateDriveMinutes(dist),
          maps_url: mapsUrl(point, r.name),
          suggestion_reason: `Nearby ${r.organization_type} in ${r.city || "your area"}`,
        };
      })
      .filter((f: SuggestedFacility) => f.distance_meters <= radiusMeters * 1.5)
      .sort((a: SuggestedFacility, b: SuggestedFacility) => a.distance_meters - b.distance_meters);

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
    };
  } catch (err) {
    console.warn("getNearbyFacilities error:", err);
    return { items: [], total: 0 };
  }
}
