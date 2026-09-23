// ============================================================
// MGN Research Request Validation
// modules/research/validation/research-validation.ts
// ============================================================

export function validateCreateProjectInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.title || typeof input.title !== "string" || input.title.trim().length < 5) {
    errors.push("Project title must be at least 5 characters long.");
  }

  if (!input.research_area || typeof input.research_area !== "string" || input.research_area.trim().length < 2) {
    errors.push("Research area / domain is required (e.g. Cardiology, Neuro-Rehab, Digital Health).");
  }

  if (!input.abstract || typeof input.abstract !== "string" || input.abstract.trim().length < 30) {
    errors.push("Research abstract must be at least 30 characters long.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateCreateOpportunityInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.title || typeof input.title !== "string" || input.title.trim().length < 5) {
    errors.push("Opportunity title must be at least 5 characters long.");
  }

  if (!input.opportunity_type) {
    errors.push("Opportunity type is required.");
  }

  if (!input.description || typeof input.description !== "string" || input.description.trim().length < 20) {
    errors.push("Description must be at least 20 characters long.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateAddPublicationInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.title || typeof input.title !== "string" || input.title.trim().length < 5) {
    errors.push("Publication title must be at least 5 characters long.");
  }

  if (!Array.isArray(input.authors) || input.authors.length === 0) {
    errors.push("At least one author is required.");
  }

  if (!input.journal_or_conference || typeof input.journal_or_conference !== "string") {
    errors.push("Journal, conference, or publisher name is required.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
