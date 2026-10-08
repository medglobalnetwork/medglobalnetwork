/**
 * lib/contact-emails.ts
 * MGN.LIFE EMAIL ARCHITECTURE & SPECIFICATION
 * 
 * Canonical email definitions and routing rules for MedGlobalNetwork.
 * 
 * INITIAL CANONICAL EMAILS:
 * 1. admin@mgn.life    - PRIVATE / INTERNAL ONLY (Never exposed publicly)
 * 2. support@mgn.life  - PUBLIC (Customer & user support, default routing)
 * 3. info@mgn.life     - PUBLIC (General company enquiries & information)
 * 4. business@mgn.life - PUBLIC (B2B, partnerships, hospitals, colleges, enterprise)
 * 5. security@mgn.life - PUBLIC (Security vulnerabilities, disclosure, abuse)
 * 6. privacy@mgn.life  - PUBLIC (Privacy requests, DPDP data governance, deletion)
 * 7. legal@mgn.life    - PUBLIC (Legal notices, contracts, copyright/DMCA, IP)
 */

export const MGN_EMAILS = {
  /** Internal / Administrative only — NEVER display publicly */
  admin: "admin@mgn.life",

  /** Primary user and customer support */
  support: "support@mgn.life",

  /** General company enquiries and public info */
  info: "info@mgn.life",

  /** B2B, enterprise, hospital, college & organisation partnerships */
  business: "business@mgn.life",

  /** Security vulnerabilities, disclosure, account security & abuse */
  security: "security@mgn.life",

  /** DPDP 2023, data access/deletion, and privacy requests */
  privacy: "privacy@mgn.life",

  /** Legal notices, terms, contracts, DMCA and IP complaints */
  legal: "legal@mgn.life",
} as const;

export type MgnEmailKey = keyof typeof MGN_EMAILS;

/**
 * Publicly displayable emails with their metadata, purpose, and mailto links.
 * Note: admin@mgn.life is strictly excluded from public contact lists.
 */
export const PUBLIC_CONTACT_DEPARTMENTS = [
  {
    id: "support",
    name: "User Support",
    email: MGN_EMAILS.support,
    mailto: `mailto:${MGN_EMAILS.support}`,
    description: "Account access, CME courses, verification assistance, and general platform help.",
    actionLabel: "Contact Support",
    context: "Customer & User Support",
  },
  {
    id: "info",
    name: "General Enquiries",
    email: MGN_EMAILS.info,
    mailto: `mailto:${MGN_EMAILS.info}`,
    description: "General company information, public queries, and media inquiries.",
    actionLabel: "General Enquiry",
    context: "General Enquiries & Information",
  },
  {
    id: "business",
    name: "Business & Enterprise",
    email: MGN_EMAILS.business,
    mailto: `mailto:${MGN_EMAILS.business}`,
    description: "Hospital partnerships, university onboarding, CME accreditations, and enterprise plans.",
    actionLabel: "Business Enquiry",
    context: "Business & Enterprise Partnerships",
  },
  {
    id: "security",
    name: "Security & Trust",
    email: MGN_EMAILS.security,
    mailto: `mailto:${MGN_EMAILS.security}`,
    description: "Responsible disclosure, vulnerability reports, security incidents, and abuse alerts.",
    actionLabel: "Report Security Issue",
    context: "Security & Vulnerability Disclosure",
  },
  {
    id: "privacy",
    name: "Privacy & Data Protection",
    email: MGN_EMAILS.privacy,
    mailto: `mailto:${MGN_EMAILS.privacy}`,
    description: "DPDP Act 2023 compliance, data access, correction, nominee queries, and data deletion.",
    actionLabel: "Privacy Request",
    context: "Privacy & Personal Data Governance",
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    email: MGN_EMAILS.legal,
    mailto: `mailto:${MGN_EMAILS.legal}`,
    description: "Formal legal notices, contract administration, Terms of Service, and DMCA / IP claims.",
    actionLabel: "Contact Legal",
    context: "Legal & Statutory Compliance",
  },
] as const;

/**
 * Helper to get the canonical email for a specific context
 */
export function getEmailForContext(context: "login" | "general" | "business" | "security" | "privacy" | "legal" | "support"): string {
  switch (context) {
    case "login":
    case "support":
      return MGN_EMAILS.support;
    case "general":
      return MGN_EMAILS.info;
    case "business":
      return MGN_EMAILS.business;
    case "security":
      return MGN_EMAILS.security;
    case "privacy":
      return MGN_EMAILS.privacy;
    case "legal":
      return MGN_EMAILS.legal;
    default:
      return MGN_EMAILS.support;
  }
}
