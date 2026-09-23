// ============================================================
// MGN Events Request Validation
// modules/events/validation/events-validation.ts
// ============================================================

import { CreateEventInput } from "../domain/types";

export function validateCreateEventInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.title || typeof input.title !== "string" || input.title.trim().length < 5) {
    errors.push("Event title must be at least 5 characters long.");
  }

  if (!input.event_type) {
    errors.push("Event type is required (e.g. conference, cme, webinar, workshop).");
  }

  if (!input.description || typeof input.description !== "string" || input.description.trim().length < 20) {
    errors.push("Event description must be at least 20 characters long.");
  }

  if (!input.start_time) {
    errors.push("Start date and time are required.");
  }

  if (!input.end_time) {
    errors.push("End date and time are required.");
  }

  if (input.start_time && input.end_time) {
    const start = new Date(input.start_time);
    const end = new Date(input.end_time);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.push("Invalid start or end date/time.");
    } else if (end <= start) {
      errors.push("End time must be after the start time.");
    }
  }

  if (input.format === "in_person" || input.format === "hybrid") {
    if (!input.venue_name && !input.address) {
      errors.push("Venue name or physical address is required for in-person/hybrid events.");
    }
    if (!input.city) {
      errors.push("City is required for in-person/hybrid events.");
    }
  }

  if (input.format === "online" && !input.online_meeting_url && input.submit_for_review) {
    // optional during draft, recommended for published
  }

  if (input.is_free === false) {
    if (typeof input.price !== "number" || input.price <= 0) {
      errors.push("Paid events must have a valid positive ticket price.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
