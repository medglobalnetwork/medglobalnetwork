// ============================================================
// MGN Location Tracking & Suggestion Engine Verification Tests
// test/location-suggestion-engine.test.mjs
// ============================================================

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  distanceMeters,
  distanceKm,
  formatDistance,
  estimateWalkMinutes,
  estimateDriveMinutes,
  boundingBox,
  isValidLatLng,
  mapsUrl,
  findNearestCity,
  getCityCoordinates,
  MAJOR_CITIES,
} from "../lib/geo.ts";

describe("MGN Location Tracking & Geospatial Intelligence", () => {
  const MUMBAI = { lat: 19.0760, lng: 72.8777 };
  const PUNE = { lat: 18.5204, lng: 73.8567 };
  const DELHI = { lat: 28.6139, lng: 77.2090 };
  const BENGALURU = { lat: 12.9716, lng: 77.5946 };

  test("Distance calculations: Great-circle Haversine formula", () => {
    // Distance from point to itself is 0
    const zeroDist = distanceMeters(MUMBAI, MUMBAI);
    assert.equal(Math.round(zeroDist), 0, "Distance to self should be 0");

    // Mumbai to Pune is ~120 km (straight-line distance ~118-125 km)
    const mumbaiPuneKm = distanceKm(MUMBAI, PUNE);
    assert.ok(
      mumbaiPuneKm >= 115 && mumbaiPuneKm <= 130,
      `Mumbai to Pune distance should be ~120km, got ${mumbaiPuneKm} km`
    );

    // Delhi to Bengaluru is ~1740 km
    const delhiBlrKm = distanceKm(DELHI, BENGALURU);
    assert.ok(
      delhiBlrKm >= 1700 && delhiBlrKm <= 1800,
      `Delhi to Bengaluru distance should be ~1740km, got ${delhiBlrKm} km`
    );
  });

  test("Human-readable distance formatting & transit estimates", () => {
    assert.equal(formatDistance(450), "450 m");
    assert.equal(formatDistance(1200), "1.2 km");
    assert.equal(formatDistance(18500), "19 km");

    // Walking speed ~5 km/h -> 1000m should be ~12 mins
    const walk1km = estimateWalkMinutes(1000);
    assert.ok(walk1km >= 10 && walk1km <= 14, `1km walk should be ~12 mins, got ${walk1km}`);

    // Driving speed ~35 km/h -> 3500m should be ~6 mins
    const drive3_5km = estimateDriveMinutes(3500);
    assert.ok(drive3_5km >= 5 && drive3_5km <= 8, `3.5km drive should be ~6 mins, got ${drive3_5km}`);
  });

  test("Bounding box calculation covers radius correctly", () => {
    const center = MUMBAI;
    const radiusMeters = 20000; // 20 km
    const box = boundingBox(center, radiusMeters);

    assert.ok(box.minLat < center.lat, "minLat must be less than center lat");
    assert.ok(box.maxLat > center.lat, "maxLat must be greater than center lat");
    assert.ok(box.minLng < center.lng, "minLng must be less than center lng");
    assert.ok(box.maxLng > center.lng, "maxLng must be greater than center lng");

    // A point 5km north should be well inside the box
    const point5kmNorth = { lat: center.lat + (5000 / 111319), lng: center.lng };
    assert.ok(point5kmNorth.lat >= box.minLat && point5kmNorth.lat <= box.maxLat);
  });

  test("City centroid geocoding & nearest city resolution", () => {
    // City name lookup
    const mumbaiCoords = getCityCoordinates("Mumbai");
    assert.ok(mumbaiCoords, "Should resolve Mumbai coordinates");
    assert.equal(mumbaiCoords.lat, 19.0760);

    const lucknowCoords = getCityCoordinates("Lucknow");
    assert.ok(lucknowCoords, "Should resolve Lucknow coordinates");
    assert.equal(lucknowCoords.lat, 26.8467);

    // Nearest city matching for GPS points
    // A point in Bandra, Mumbai (19.0596, 72.8295)
    const bandra = { lat: 19.0596, lng: 72.8295 };
    const nearestToBandra = findNearestCity(bandra);
    assert.ok(nearestToBandra, "Should find nearest city for Bandra");
    assert.equal(nearestToBandra.name, "Mumbai");

    // A point in Whitefield, Bengaluru (12.9698, 77.7500)
    const whitefield = { lat: 12.9698, lng: 77.7500 };
    const nearestToWhitefield = findNearestCity(whitefield);
    assert.ok(nearestToWhitefield, "Should find nearest city for Whitefield");
    assert.equal(nearestToWhitefield.name, "Bengaluru");
  });

  test("Maps URL generation for navigation & directions", () => {
    const url = mapsUrl(MUMBAI, "Lilavati Hospital");
    assert.ok(url.startsWith("https://www.google.com/maps/search/?api=1&query="));
    assert.ok(url.includes("19.076,72.8777"));
    assert.ok(url.includes("Lilavati%20Hospital"));
  });

  test("Major healthcare hubs coverage in India", () => {
    assert.ok(MAJOR_CITIES.length >= 40, `Expected at least 40 major cities, got ${MAJOR_CITIES.length}`);
    const names = new Set(MAJOR_CITIES.map((c) => c.name));
    assert.ok(names.has("Mumbai"), "Mumbai present");
    assert.ok(names.has("Delhi"), "Delhi present");
    assert.ok(names.has("Bengaluru"), "Bengaluru present");
    assert.ok(names.has("Hyderabad"), "Hyderabad present");
    assert.ok(names.has("Chennai"), "Chennai present");
    assert.ok(names.has("Kolkata"), "Kolkata present");
    assert.ok(names.has("Pune"), "Pune present");
    assert.ok(names.has("Ahmedabad"), "Ahmedabad present");
    assert.ok(names.has("Jaipur"), "Jaipur present");
    assert.ok(names.has("Lucknow"), "Lucknow present");
  });
});

describe("MGN Suggestion Engine Candidate Scoring & Radius Filtering", () => {
  const userLoc = { lat: 19.0760, lng: 72.8777, city: "Mumbai", state: "Maharashtra" };

  const mockProfessionals = [
    {
      user_id: "u1",
      name: "Dr. Aarti Sharma",
      profession: "Cardiologist",
      city: "Mumbai",
      latitude: 19.0800,
      longitude: 72.8800, // ~500m away
    },
    {
      user_id: "u2",
      name: "Dr. Vikram Patil",
      profession: "Orthopedic Surgeon",
      city: "Mumbai",
      latitude: 19.1200,
      longitude: 72.8500, // ~5.5km away
    },
    {
      user_id: "u3",
      name: "Dr. Sneha Kulkarni",
      profession: "Physiotherapist",
      city: "Pune",
      latitude: 18.5204,
      longitude: 73.8567, // ~120km away
    },
    {
      user_id: "u4",
      name: "Dr. Rohan Verma",
      profession: "Neurologist",
      city: "Mumbai",
      latitude: null,
      longitude: null, // No GPS coords, but in Mumbai
    },
  ];

  test("Proximity filter correctly segments candidates by radius", () => {
    const radius5km = 5000;
    const radius15km = 15000;
    const radius150km = 150000;

    const scored = mockProfessionals.map((p) => {
      let dist = 5000;
      if (p.latitude != null && p.longitude != null) {
        dist = distanceMeters(userLoc, { lat: p.latitude, lng: p.longitude });
      } else if (p.city === userLoc.city) {
        dist = 4000; // estimated same-city fallback
      }
      return { ...p, distance_meters: dist };
    });

    const within5km = scored.filter((p) => p.distance_meters <= radius5km);
    assert.ok(within5km.some((p) => p.user_id === "u1"), "Dr. Aarti Sharma should be within 5km");
    assert.ok(!within5km.some((p) => p.user_id === "u3"), "Pune doctor should not be within 5km");

    const within15km = scored.filter((p) => p.distance_meters <= radius15km);
    assert.ok(within15km.some((p) => p.user_id === "u2"), "Dr. Vikram Patil should be within 15km");

    const within150km = scored.filter((p) => p.distance_meters <= radius150km);
    assert.ok(within150km.some((p) => p.user_id === "u3"), "Pune doctor should be within 150km");
  });

  test("Fallback to city matching when candidate GPS coordinates are null", () => {
    const candidateWithoutGps = mockProfessionals.find((p) => p.user_id === "u4");
    assert.ok(candidateWithoutGps);

    // Coordinate is null, but city matches user city
    const isSameCity = candidateWithoutGps.city.toLowerCase() === userLoc.city.toLowerCase();
    assert.equal(isSameCity, true, "Candidate should match via city name");

    const resolvedCoords = getCityCoordinates(candidateWithoutGps.city);
    assert.ok(resolvedCoords, "City coordinates should resolve from centroid");
    const estimatedDistance = distanceMeters(userLoc, resolvedCoords);
    assert.ok(estimatedDistance < 1000, "City centroid distance to user location in same city is very close");
  });

  test("Bounding box bounds multi-entity queries strictly without false globals", () => {
    const radiusMeters = 30000; // 30 km
    const box = boundingBox(userLoc, radiusMeters);

    // Point in Navi Mumbai (~22 km from Mumbai center)
    const naviMumbai = { lat: 19.0330, lng: 73.0297 };
    const insideBox =
      naviMumbai.lat >= box.minLat &&
      naviMumbai.lat <= box.maxLat &&
      naviMumbai.lng >= box.minLng &&
      naviMumbai.lng <= box.maxLng;
    assert.equal(insideBox, true, "Navi Mumbai (22km) must be inside 30km bounding box");

    // Point in Pune (~120 km from Mumbai)
    const pune = { lat: 18.5204, lng: 73.8567 };
    const puneInsideBox =
      pune.lat >= box.minLat &&
      pune.lat <= box.maxLat &&
      pune.lng >= box.minLng &&
      pune.lng <= box.maxLng;
    assert.equal(puneInsideBox, false, "Pune (120km) must NOT be inside 30km bounding box");
  });
});


