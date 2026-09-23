// ============================================================
// MGN Medical Camps Validation
// modules/camps/validation/camps-validation.ts
// ============================================================

export function validateCreateCampInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.title || typeof input.title !== "string" || input.title.trim().length < 5) {
    errors.push("Camp title must be at least 5 characters long.");
  }

  if (!input.camp_type) {
    errors.push("Camp type is required (e.g. health_screening, physiotherapy, rehabilitation).");
  }

  if (!input.description || typeof input.description !== "string" || input.description.trim().length < 20) {
    errors.push("Camp description must be at least 20 characters long.");
  }

  if (!input.start_date) {
    errors.push("Start date/time is required.");
  }

  if (!input.end_date) {
    errors.push("End date/time is required.");
  }

  if (input.start_date && input.end_date) {
    const start = new Date(input.start_date);
    const end = new Date(input.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.push("Invalid start or end date/time.");
    } else if (end <= start) {
      errors.push("End date must be after start date.");
    }
  }

  if (!input.venue_name || input.venue_name.trim().length < 2) {
    errors.push("Venue name is required.");
  }

  if (!input.address || input.address.trim().length < 2) {
    errors.push("Address is required.");
  }

  if (!input.city || input.city.trim().length < 2) {
    errors.push("City is required.");
  }

  if (!Array.isArray(input.services) || input.services.length === 0) {
    errors.push("Please list at least one healthcare service offered at this camp.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
