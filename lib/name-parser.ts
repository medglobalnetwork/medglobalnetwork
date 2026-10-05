/**
 * Smart Name Parser for Healthcare Professionals & Users
 * Extracts honorific/claimed titles (e.g. Dr., Prof., PT, RN, Mr., Ms.),
 * legal first & middle name, and legal last name / surname.
 */
export interface ParsedFullName {
  claimedTitle: string;
  legalFirstName: string;
  legalMiddleName: string;
  legalLastName: string;
}

export function parseFullName(rawName: string): ParsedFullName {
  let cleaned = (rawName || "").trim();
  let claimedTitle = "Dr.";

  const titleMatch = cleaned.match(/^(dr\.|dr|prof\.|prof|pt\.|pt|rn\.|rn|mr\.|mr|ms\.|ms|mrs\.|mrs)\s+/i);
  if (titleMatch) {
    const matched = titleMatch[1].toLowerCase().replace(/\./g, "");
    if (matched === "dr") claimedTitle = "Dr.";
    else if (matched === "prof") claimedTitle = "Prof.";
    else if (matched === "pt") claimedTitle = "PT";
    else if (matched === "rn") claimedTitle = "RN";
    else if (matched === "mr") claimedTitle = "Mr.";
    else if (matched === "ms") claimedTitle = "Ms.";
    else if (matched === "mrs") claimedTitle = "Ms.";
    cleaned = cleaned.slice(titleMatch[0].length).trim();
  }

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { claimedTitle, legalFirstName: "", legalMiddleName: "", legalLastName: "" };
  }
  if (parts.length === 1) {
    return { claimedTitle, legalFirstName: parts[0], legalMiddleName: "", legalLastName: "" };
  }
  if (parts.length === 2) {
    return { claimedTitle, legalFirstName: parts[0], legalMiddleName: "", legalLastName: parts[1] };
  }
  
  // 3 or more parts: First part -> first name, Last part -> last name, Middle parts -> middle name
  const legalFirstName = parts[0];
  const legalLastName = parts[parts.length - 1];
  const legalMiddleName = parts.slice(1, -1).join(" ");
  
  return { claimedTitle, legalFirstName, legalMiddleName, legalLastName };
}
