// ============================================================
// MedGlobalNetwork (MGN) — DPDP Constants & Types
// modules/dpdp/lib/dpdp-constants.ts
//
// Safe for both client and server components (no DB drivers)
// ============================================================

export interface UserNominee {
  id: string;
  user_id: string;
  full_name: string;
  relationship: string;
  email: string;
  phone: string | null;
  identity_proof_type: string | null;
  identity_proof_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPrivacyConsent {
  id: string;
  user_id: string;
  consent_key: string;
  granted: boolean;
  granted_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

export const DPDP_OFFICER_INFO = {
  officerName: "Data Protection & Grievance Officer",
  organization: "MedGlobalNetwork (MGN)",
  email: "privacy@mgn.life",
  supportEmail: "support@mgn.life",
  address: "MedGlobalNetwork Compliance Desk, Mumbai & New Delhi, India",
  responseWindowDays: 30,
  actReference: "Digital Personal Data Protection Act, 2023 (DPDP Act) & DPDP Rules 2025",
};

export const DEFAULT_CONSENT_ITEMS = [
  {
    key: "public_search_indexing",
    title: "Public Profile Discovery & AI Search Indexing",
    description: "Allow your verified clinical profile to be discovered on Google, MGN Public Directory, and AI Knowledge Graphs.",
    category: "discovery",
    defaultGranted: true,
  },
  {
    key: "cme_accreditation_sharing",
    title: "CME Credits & Accrediting Board Verification",
    description: "Share completed course transcripts and credit hours with medical colleges and CME accreditation councils.",
    category: "education",
    defaultGranted: true,
  },
  {
    key: "recruiter_inquiries",
    title: "Hospital & Healthcare Recruiter Inquiries",
    description: "Allow verified hospitals and healthcare organizations to contact you regarding relevant clinical job openings and fellowships.",
    category: "career",
    defaultGranted: true,
  },
  {
    key: "research_collaboration",
    title: "Clinical Research & Multi-Center Trial Invites",
    description: "Receive invitations from clinical researchers and institutions for peer reviews, papers, and multi-center clinical trials.",
    category: "research",
    defaultGranted: true,
  },
  {
    key: "clinical_newsletter",
    title: "Continuing Medical Education & Practice Updates",
    description: "Receive clinical summaries, medical conference notices, and journal highlights via email.",
    category: "communications",
    defaultGranted: true,
  },
];
