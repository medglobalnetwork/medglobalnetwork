// ============================================================
// MGN Creation Pricing Configuration
// lib/pricing-config.ts
//
// Defines 1-free-upload policy and category-wise pay-per-post pricing.
// ============================================================

export type CreationCategory =
  | "jobs"
  | "conferences"
  | "events"
  | "courses"
  | "camps"
  | "research";

export interface CategoryPricing {
  category: CreationCategory;
  name: string;
  priceINR: number;
  pricePaise: number;
  freeTierLimit: number;
  description: string;
}

export const CREATION_PRICING: Record<CreationCategory, CategoryPricing> = {
  jobs: {
    category: "jobs",
    name: "Job & Fellowship Opening",
    priceINR: 499,
    pricePaise: 49900,
    freeTierLimit: 1,
    description: "Post a verified healthcare opening, fellowship, or clinical residency.",
  },
  conferences: {
    category: "conferences",
    name: "Conference & Academic Summit",
    priceINR: 999,
    pricePaise: 99900,
    freeTierLimit: 1,
    description: "Host an academic conference, multi-session medical summit, or congress.",
  },
  events: {
    category: "events",
    name: "Medical Event & CME Webinar",
    priceINR: 499,
    pricePaise: 49900,
    freeTierLimit: 1,
    description: "Host an accredited continuing medical education webinar or clinical workshop.",
  },
  courses: {
    category: "courses",
    name: "Clinical Course & CME Academy",
    priceINR: 499,
    pricePaise: 49900,
    freeTierLimit: 1,
    description: "Publish a structured clinical training program or credentialed course.",
  },
  camps: {
    category: "camps",
    name: "Health & Clinical Screening Camp",
    priceINR: 299,
    pricePaise: 29900,
    freeTierLimit: 1,
    description: "Coordinate a community health screening, diagnostic camp, or rural drive.",
  },
  research: {
    category: "research",
    name: "Clinical Research Project",
    priceINR: 399,
    pricePaise: 39900,
    freeTierLimit: 1,
    description: "Initiate an observational study, clinical trial, or investigator project.",
  },
};

/**
 * Normalizes input category string or alias to a canonical CreationCategory.
 */
export function normalizeCategory(raw: string): CreationCategory {
  const c = (raw || "").trim().toLowerCase();
  if (c === "job" || c === "jobs" || c === "opportunity" || c === "opportunities") {
    return "jobs";
  }
  if (c === "conference" || c === "conferences") {
    return "conferences";
  }
  if (c === "event" || c === "events" || c === "webinar" || c === "webinars") {
    return "events";
  }
  if (c === "course" || c === "courses" || c === "cme" || c === "learn") {
    return "courses";
  }
  if (c === "camp" || c === "camps" || c === "screening" || c === "health_camp") {
    return "camps";
  }
  if (c === "research" || c === "project" || c === "projects" || c === "trial") {
    return "research";
  }
  return "events";
}

/**
 * Gets pricing details for a given category.
 */
export function getCategoryPricing(category: string): CategoryPricing {
  const key = normalizeCategory(category);
  return CREATION_PRICING[key];
}
