// ============================================================
// MGN Onboarding & Verification System — Configuration & Schema Registry
// modules/onboarding/config/schemas.ts
//
// Type-safe registry defining dynamic fields, document requirements,
// and title rules for every profession and organisation type.
// ============================================================

export type AccountType = "INDIVIDUAL" | "ORGANISATION";

export type VerificationStatus =
  | "DRAFT"
  | "ENROLLED"
  | "VERIFICATION_INCOMPLETE"
  | "READY_FOR_REVIEW"
  | "UNDER_REVIEW"
  | "CORRECTION_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export interface DynamicFormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  mandatory: boolean;
  acceptedFormats: string[]; // e.g. ["application/pdf", "image/jpeg", "image/png"]
  maxSizeMB: number;
}

export interface ProfessionSchema {
  id: string;
  name: string;
  category: string;
  allowedPrefixes: string[]; // e.g. ["Dr.", "Prof."]
  allowedSuffixes: string[]; // e.g. ["PT", "RN", "MD", "PharmD"]
  fields: DynamicFormField[];
  documents: DocumentRequirement[];
}

export interface OrganisationSchema {
  id: string;
  name: string;
  fields: DynamicFormField[];
  documents: DocumentRequirement[];
}

// ─────────────────────────────────────────────
// INDIVIDUAL CATEGORIES & PROFESSIONS
// ─────────────────────────────────────────────

export const INDIVIDUAL_CATEGORIES = [
  { id: "healthcare_professional", label: "Healthcare Professional" },
  { id: "student", label: "Medical / Health Science Student" },
  { id: "researcher", label: "Researcher / Academic" },
  { id: "educator", label: "Medical Educator / Faculty" },
  { id: "healthcare_worker", label: "Allied Healthcare Worker" },
  { id: "other", label: "Other Health Professional" },
];

export const PROFESSION_SCHEMAS: Record<string, ProfessionSchema> = {
  doctor: {
    id: "doctor",
    name: "Doctor / Medical Practitioner",
    category: "healthcare_professional",
    allowedPrefixes: ["Dr.", "Prof."],
    allowedSuffixes: ["MD", "MS", "MBBS", "DM", "MCh", "DNB"],
    fields: [
      {
        name: "primary_degree",
        label: "Primary Medical Qualification",
        type: "select",
        required: true,
        options: [
          { value: "MBBS", label: "MBBS" },
          { value: "MD", label: "MD (Doctor of Medicine)" },
          { value: "MS", label: "MS (Master of Surgery)" },
          { value: "DM", label: "DM (Doctorate of Medicine)" },
          { value: "MCh", label: "MCh (Magister Chirurgiae)" },
          { value: "DNB", label: "DNB (Diplomate of National Board)" },
          { value: "Other", label: "Other Equivalent International Degree" },
        ],
      },
      {
        name: "specialization",
        label: "Primary Specialization",
        type: "select",
        required: true,
        options: [
          { value: "General Medicine", label: "General Medicine" },
          { value: "Cardiology", label: "Cardiology" },
          { value: "Orthopedics", label: "Orthopedics" },
          { value: "Neurology", label: "Neurology" },
          { value: "Pediatrics", label: "Pediatrics" },
          { value: "Surgery", label: "General Surgery" },
          { value: "Dermatology", label: "Dermatology" },
          { value: "Radiology", label: "Radiology" },
          { value: "Anesthesiology", label: "Anesthesiology" },
          { value: "Psychiatry", label: "Psychiatry" },
          { value: "Oncology", label: "Oncology" },
          { value: "Other", label: "Other Specialization" },
        ],
      },
      {
        name: "medical_council",
        label: "Medical Council / Licensing Authority",
        type: "text",
        placeholder: "e.g. National Medical Commission (NMC) / State Council",
        required: true,
      },
      {
        name: "registration_number",
        label: "Medical Council Registration Number",
        type: "text",
        placeholder: "e.g. MCI/NMC-123456",
        required: true,
      },
      {
        name: "registration_state",
        label: "Registration State / Jurisdiction",
        type: "text",
        placeholder: "e.g. Maharashtra, Delhi, Karnataka",
        required: true,
      },
      {
        name: "institution",
        label: "Graduating Medical College / University",
        type: "text",
        placeholder: "e.g. AIIMS New Delhi / KEM Hospital Mumbai",
        required: true,
      },
      {
        name: "graduation_year",
        label: "Year of Graduation",
        type: "number",
        placeholder: "e.g. 2018",
        required: true,
      },
      {
        name: "current_organization",
        label: "Current Hospital / Clinic / Practice",
        type: "text",
        placeholder: "e.g. Apollo Hospital / Private Practice",
        required: false,
      },
      {
        name: "experience_years",
        label: "Years of Clinical Experience",
        type: "number",
        placeholder: "e.g. 7",
        required: true,
      },
    ],
    documents: [
      {
        id: "GOVT_ID",
        name: "Government Photo ID Proof",
        description: "Passport, National ID, Aadhaar, or Driver's License",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "COUNCIL_REGISTRATION",
        name: "Medical Council Registration Certificate",
        description: "Official certificate issued by State or National Medical Council",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "DEGREE_CERTIFICATE",
        name: "MBBS / MD Degree Certificate",
        description: "Degree or provisional passing certificate from university",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },

  physiotherapist: {
    id: "physiotherapist",
    name: "Physiotherapist / Physical Therapist",
    category: "healthcare_professional",
    allowedPrefixes: ["Dr.", "PT"],
    allowedSuffixes: ["PT", "BPT", "MPT", "DPT"],
    fields: [
      {
        name: "primary_degree",
        label: "Physiotherapy Qualification",
        type: "select",
        required: true,
        options: [
          { value: "BPT", label: "Bachelor of Physiotherapy (BPT)" },
          { value: "MPT", label: "Master of Physiotherapy (MPT)" },
          { value: "DPT", label: "Doctor of Physical Therapy (DPT)" },
          { value: "PhD", label: "PhD in Physiotherapy" },
          { value: "Other", label: "Other Certified Equivalent" },
        ],
      },
      {
        name: "specialization",
        label: "Clinical Specialization",
        type: "select",
        required: true,
        options: [
          { value: "Musculoskeletal / Ortho", label: "Musculoskeletal & Orthopedics" },
          { value: "Neuro Physiotherapy", label: "Neurological Rehabilitation" },
          { value: "Cardiorespiratory", label: "Cardiopulmonary & ICU Rehab" },
          { value: "Sports Rehab", label: "Sports Injury & Fitness" },
          { value: "Pediatric Rehab", label: "Pediatric Physiotherapy" },
          { value: "Geriatric Rehab", label: "Geriatric Care" },
          { value: "General Physiotherapy", label: "General Clinical Physiotherapy" },
        ],
      },
      {
        name: "medical_council",
        label: "Physiotherapy Council / Association / Authority",
        type: "text",
        placeholder: "e.g. Delhi Council for Physiotherapy / IAP / State Council",
        required: true,
      },
      {
        name: "registration_number",
        label: "Registration / License / Member Number",
        type: "text",
        placeholder: "e.g. DCP-PT-10492",
        required: true,
      },
      {
        name: "institution",
        label: "College / University",
        type: "text",
        placeholder: "e.g. Jamia Hamdard / Manipal College of Health Professions",
        required: true,
      },
      {
        name: "graduation_year",
        label: "Graduation Year",
        type: "number",
        placeholder: "e.g. 2020",
        required: true,
      },
      {
        name: "current_organization",
        label: "Current Clinic / Hospital / Rehab Center",
        type: "text",
        placeholder: "e.g. Max Healthcare / Self-employed Clinic",
        required: false,
      },
      {
        name: "experience_years",
        label: "Years of Experience",
        type: "number",
        placeholder: "e.g. 4",
        required: true,
      },
    ],
    documents: [
      {
        id: "GOVT_ID",
        name: "Government Photo ID Proof",
        description: "Passport, National ID, Aadhaar, or Driver's License",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "DEGREE_CERTIFICATE",
        name: "BPT / MPT Degree Certificate",
        description: "University degree or mark sheet verifying qualification",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "COUNCIL_REGISTRATION",
        name: "Council Registration / Association Proof",
        description: "State council registration card or professional association certificate",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },

  nurse: {
    id: "nurse",
    name: "Nursing Professional",
    category: "healthcare_professional",
    allowedPrefixes: ["RN"],
    allowedSuffixes: ["RN", "BSc Nursing", "MSc Nursing", "NP"],
    fields: [
      {
        name: "primary_degree",
        label: "Nursing Qualification",
        type: "select",
        required: true,
        options: [
          { value: "GNM", label: "General Nursing & Midwifery (GNM)" },
          { value: "BSc Nursing", label: "B.Sc Nursing" },
          { value: "Post Basic BSc", label: "Post Basic B.Sc Nursing" },
          { value: "MSc Nursing", label: "M.Sc Nursing" },
          { value: "Nurse Practitioner", label: "Nurse Practitioner (NP)" },
        ],
      },
      {
        name: "medical_council",
        label: "Nursing Council / Board",
        type: "text",
        placeholder: "e.g. Indian Nursing Council (INC) / State Board",
        required: true,
      },
      {
        name: "registration_number",
        label: "Nursing Registration Number (RN / RM)",
        type: "text",
        placeholder: "e.g. RN-98234",
        required: true,
      },
      {
        name: "institution",
        label: "College / School of Nursing",
        type: "text",
        placeholder: "e.g. College of Nursing, CMC Vellore",
        required: true,
      },
      {
        name: "graduation_year",
        label: "Graduation Year",
        type: "number",
        placeholder: "e.g. 2021",
        required: true,
      },
      {
        name: "specialization",
        label: "Clinical Area / Unit",
        type: "select",
        required: false,
        options: [
          { value: "Critical Care / ICU", label: "Critical Care / ICU" },
          { value: "Emergency / Trauma", label: "Emergency & Trauma" },
          { value: "Operation Theatre", label: "Operation Theatre (OT)" },
          { value: "Pediatrics & Neonatal", label: "Pediatrics & NICU" },
          { value: "Oncology", label: "Oncology" },
          { value: "General Ward", label: "General Clinical Ward" },
        ],
      },
    ],
    documents: [
      {
        id: "GOVT_ID",
        name: "Government Photo ID Proof",
        description: "Passport, National ID, Aadhaar",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "COUNCIL_REGISTRATION",
        name: "State Nursing Council Registration",
        description: "Registered Nurse (RN) / Registered Midwife (RM) Certificate",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "DEGREE_CERTIFICATE",
        name: "Nursing Degree / Diploma Certificate",
        description: "B.Sc Nursing / GNM Passing Certificate",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },

  student: {
    id: "student",
    name: "Medical / Healthcare Student",
    category: "student",
    allowedPrefixes: [],
    allowedSuffixes: ["Student"],
    fields: [
      {
        name: "primary_degree",
        label: "Current Degree / Course Pursuing",
        type: "select",
        required: true,
        options: [
          { value: "MBBS Student", label: "MBBS" },
          { value: "BPT Student", label: "Bachelor of Physiotherapy (BPT)" },
          { value: "BSc Nursing Student", label: "B.Sc Nursing" },
          { value: "BDS Student", label: "BDS (Dental)" },
          { value: "B.Pharm Student", label: "B.Pharm / Pharm.D" },
          { value: "Allied Health Student", label: "Allied Health Sciences" },
        ],
      },
      {
        name: "institution",
        label: "College / University Enrolled In",
        type: "text",
        placeholder: "e.g. King George's Medical University",
        required: true,
      },
      {
        name: "current_organization",
        label: "Current Year / Semester of Study",
        type: "select",
        required: true,
        options: [
          { value: "1st Year", label: "1st Year" },
          { value: "2nd Year", label: "2nd Year" },
          { value: "3rd Year", label: "3rd Year" },
          { value: "4th Year / Final Year", label: "4th Year / Final Year" },
          { value: "Intern / Resident", label: "Rotatory Internship / Resident" },
        ],
      },
      {
        name: "graduation_year",
        label: "Expected Year of Graduation",
        type: "number",
        placeholder: "e.g. 2026",
        required: true,
      },
    ],
    documents: [
      {
        id: "GOVT_ID",
        name: "Government Photo ID Proof",
        description: "Passport, National ID, Aadhaar",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "DEGREE_CERTIFICATE",
        name: "Student ID Card or College Enrollment Letter",
        description: "Valid College Identity Card or Bonafide Letter from Dean/Principal",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },

  researcher: {
    id: "researcher",
    name: "Medical Researcher / Scientist",
    category: "researcher",
    allowedPrefixes: ["Dr.", "Prof."],
    allowedSuffixes: ["PhD", "MSc", "PostDoc"],
    fields: [
      {
        name: "primary_degree",
        label: "Highest Academic Degree",
        type: "select",
        required: true,
        options: [
          { value: "PhD", label: "PhD / Doctorate" },
          { value: "MD-PhD", label: "MD-PhD" },
          { value: "MSc", label: "M.Sc / Master of Science" },
          { value: "PostDoc", label: "Post-Doctoral Fellow" },
        ],
      },
      {
        name: "specialization",
        label: "Research Field / Domain",
        type: "text",
        placeholder: "e.g. Clinical Immunology, Molecular Oncology, Genomics",
        required: true,
      },
      {
        name: "institution",
        label: "Affiliated Research Institute / University",
        type: "text",
        placeholder: "e.g. ICMR, CSIR, Harvard Medical School, IISc",
        required: true,
      },
      {
        name: "current_organization",
        label: "ORCID / Google Scholar ID (Optional)",
        type: "text",
        placeholder: "e.g. 0000-0002-1825-0097",
        required: false,
      },
    ],
    documents: [
      {
        id: "GOVT_ID",
        name: "Government Photo ID Proof",
        description: "Passport or National ID",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "DEGREE_CERTIFICATE",
        name: "Doctoral / Masters Certificate or Institutional ID",
        description: "PhD degree certificate or official research appointment letter",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },
};

// ─────────────────────────────────────────────
// ORGANISATION TYPES & SCHEMAS
// ─────────────────────────────────────────────

export const ORGANISATION_TYPES = [
  { id: "hospital", label: "Hospital / Multi-specialty Healthcare Center" },
  { id: "clinic", label: "Clinic / Specialized Practice / Rehab Center" },
  { id: "diagnostic_center", label: "Diagnostic Laboratory / Imaging Center" },
  { id: "medical_college", label: "Medical / Health Science College / University" },
  { id: "research_institute", label: "Research Institute / Biotech Lab" },
  { id: "pharma_device", label: "Pharmaceutical / Medical Device Company" },
  { id: "ngo_healthcare", label: "Healthcare NGO / Trust / Foundation" },
  { id: "healthtech_startup", label: "HealthTech / Digital Health Company" },
  { id: "other_org", label: "Other Healthcare Organization" },
];

export const ORGANISATION_SCHEMAS: Record<string, OrganisationSchema> = {
  hospital: {
    id: "hospital",
    name: "Hospital / Healthcare Facility",
    fields: [
      {
        name: "registration_number",
        label: "Hospital Clinical Establishment Registration #",
        type: "text",
        placeholder: "e.g. CEA/HOSP/2022/9482",
        required: true,
      },
      {
        name: "tax_id",
        label: "Tax / GSTIN / PAN Number",
        type: "text",
        placeholder: "e.g. 27AAAAA0000A1Z5",
        required: true,
      },
      {
        name: "year_established",
        label: "Year Established",
        type: "number",
        placeholder: "e.g. 2005",
        required: true,
      },
      {
        name: "website",
        label: "Official Website URL",
        type: "text",
        placeholder: "https://www.hospital.org",
        required: true,
      },
      {
        name: "auth_rep_name",
        label: "Authorized Representative Full Name",
        type: "text",
        placeholder: "e.g. Dr. Rajesh Sharma",
        required: true,
      },
      {
        name: "auth_rep_designation",
        label: "Designation of Representative",
        type: "text",
        placeholder: "e.g. Medical Director / Chief Medical Officer",
        required: true,
      },
    ],
    documents: [
      {
        id: "HOSPITAL_LICENSE",
        name: "Clinical Establishment Registration / State Health License",
        description: "Govt license authorizing medical operation",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "TAX_DOCUMENT",
        name: "GST / Incorporation Certificate / PAN",
        description: "Official business registration document",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "GOVT_ID",
        name: "Authorized Signatory Govt ID & Authorization Letter",
        description: "ID of Medical Director or signed board resolution",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },

  clinic: {
    id: "clinic",
    name: "Clinic / Outpatient Practice / Rehab Center",
    fields: [
      {
        name: "registration_number",
        label: "Clinic Registration / Trade License #",
        type: "text",
        placeholder: "e.g. CLN/2021/8291",
        required: true,
      },
      {
        name: "year_established",
        label: "Year Established",
        type: "number",
        placeholder: "e.g. 2018",
        required: true,
      },
      {
        name: "auth_rep_name",
        label: "Practitioner / Owner Name",
        type: "text",
        placeholder: "e.g. Dr. Priya Verma",
        required: true,
      },
      {
        name: "auth_rep_designation",
        label: "Designation",
        type: "text",
        placeholder: "e.g. Lead Consultant / Clinic Director",
        required: true,
      },
    ],
    documents: [
      {
        id: "HOSPITAL_LICENSE",
        name: "Clinic Registration / Municipal Health License",
        description: "Clinical Establishment or Trade Certificate",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "GOVT_ID",
        name: "Doctor / Owner Professional Council Registration",
        description: "Registration certificate of clinic owner/director",
        mandatory: true,
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },
};

// Fallback generic schema for any other profession / org type
export const GENERIC_PROFESSION_SCHEMA: ProfessionSchema = {
  id: "other",
  name: "Healthcare Professional",
  category: "healthcare_professional",
  allowedPrefixes: [],
  allowedSuffixes: [],
  fields: [
    {
      name: "primary_degree",
      label: "Highest Qualification",
      type: "text",
      placeholder: "e.g. B.Sc Medical Technology",
      required: true,
    },
    {
      name: "specialization",
      label: "Area of Expertise",
      type: "text",
      placeholder: "e.g. Clinical Diagnostics",
      required: true,
    },
    {
      name: "institution",
      label: "College / University",
      type: "text",
      placeholder: "e.g. University of Health Sciences",
      required: true,
    },
  ],
  documents: [
    {
      id: "GOVT_ID",
      name: "Government Photo ID Proof",
      description: "Passport, National ID, Aadhaar",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 5,
    },
    {
      id: "DEGREE_CERTIFICATE",
      name: "Professional Degree / Diploma Certificate",
      description: "Degree or passing certificate",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 5,
    },
  ],
};

export function getProfessionSchema(professionId?: string): ProfessionSchema {
  if (!professionId) return PROFESSION_SCHEMAS.doctor;
  const key = professionId.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return PROFESSION_SCHEMAS[key] || GENERIC_PROFESSION_SCHEMA;
}

export function getOrganisationSchema(orgTypeId?: string): OrganisationSchema {
  if (!orgTypeId) return ORGANISATION_SCHEMAS.hospital;
  const key = orgTypeId.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return ORGANISATION_SCHEMAS[key] || ORGANISATION_SCHEMAS.hospital;
}
