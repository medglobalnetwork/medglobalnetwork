// ============================================================
// MGN Onboarding & Verification System — Configuration & Schema Registry
// modules/onboarding/config/schemas.ts
//
// Dynamic Verification Requirement Engine based on the 7 major categories:
// 1. Clinical Practitioner
// 2. Allied Health Professional
// 3. Nursing
// 4. Medical Student
// 5. Administration & Operations
// 6. Pharma & Industry
// 7. Healthcare Organization
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

export type RequirementLevel = "REQUIRED" | "CONDITIONAL" | "OPTIONAL" | "RECOMMENDED" | "NOT_REQUIRED";

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
  level: RequirementLevel;
  acceptedFormats: string[]; // ["application/pdf", "image/jpeg", "image/png"]
  maxSizeMB: number;
}

export interface ProfessionSchema {
  id: string;
  name: string;
  category: string;
  allowedPrefixes: string[];
  allowedSuffixes: string[];
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
// 1. 7 MAJOR CATEGORIES (PDF-based)
// ─────────────────────────────────────────────

export const INDIVIDUAL_CATEGORIES = [
  {
    id: "clinical_practitioner",
    label: "Clinical Practitioner",
    description: "MBBS, MD, MS, Super-specialists, Surgeons, Dentists & AYUSH Doctors",
    badge: "Medical Doctor / Surgeon",
  },
  {
    id: "allied_health",
    label: "Allied Health Professional",
    description: "Physiotherapists, Occupational Therapists, Lab Technicians, Pharmacists & Rehab Specialists",
    badge: "Allied Health Specialist",
  },
  {
    id: "nursing",
    label: "Nursing Professional",
    description: "Registered Nurses (RN/RM), Critical Care, OT Nurses, Nursing Officers & Educators",
    badge: "Registered Nurse",
  },
  {
    id: "medical_student",
    label: "Medical & Health Sciences Student",
    description: "MBBS, BDS, BPT, Nursing, Pharmacy undergraduates, Interns & Residents",
    badge: "Medical Student / Resident",
  },
  {
    id: "admin_operations",
    label: "Healthcare Administration & Operations",
    description: "Hospital Administrators, Operations Managers, Quality/NABH, HR & Billing Officers",
    badge: "Hospital Administration",
  },
  {
    id: "pharma_industry",
    label: "Pharma, Biotech & Medical Devices",
    description: "Pharmacy Owners, Distributors, Medical Representatives, CRA/CRO & Regulatory Scientists",
    badge: "Pharma & Industry",
  },
];

export const ORGANISATION_CATEGORIES = [
  {
    id: "healthcare_organization",
    label: "Healthcare Organization",
    description: "Hospitals, Clinics, Diagnostic Labs, Blood Banks, Nursing Homes & Medical Colleges",
    badge: "Healthcare Institution",
  },
];

// ─────────────────────────────────────────────
// 2. SUB-ROLES PER CATEGORY
// ─────────────────────────────────────────────

export const CATEGORY_PROFESSIONS: Record<string, { id: string; label: string; specialtyGroup?: string }[]> = {
  clinical_practitioner: [
    { id: "general_physician", label: "General Physician / MBBS Doctor" },
    { id: "md_general_medicine", label: "MD - General Medicine / Consultant Physician" },
    { id: "ms_general_surgery", label: "MS - General Surgeon" },
    { id: "cardiologist", label: "Cardiologist / Interventional Cardiologist (DM / DNB)" },
    { id: "neurologist", label: "Neurologist / Neurosurgeon (DM / MCh)" },
    { id: "orthopaedic_surgeon", label: "Orthopaedic Surgeon / Joint Replacement (MS / DNB)" },
    { id: "dermatologist", label: "Dermatologist / Cosmetologist (MD / DNB / DVD)" },
    { id: "psychiatrist", label: "Psychiatrist & Mental Health Specialist (MD / DNB)" },
    { id: "pediatrician", label: "Pediatrician / Neonatologist (MD / DCH / DNB)" },
    { id: "obgyn", label: "Obstetrician & Gynecologist (MS / DGO / DNB)" },
    { id: "ophthalmologist", label: "Ophthalmologist / Eye Surgeon (MS / DO)" },
    { id: "urologist", label: "Urologist / Andrologist (MCh / DNB)" },
    { id: "oncologist", label: "Oncologist (Medical / Surgical / Radiation)" },
    { id: "anesthesiologist", label: "Anesthesiologist & Critical Care (MD / DA)" },
    { id: "radiologist", label: "Radiologist / Diagnostic Imaging (MD / DMRD / DNB)" },
    { id: "dentist", label: "Dental Surgeon / Maxillofacial Specialist (BDS / MDS)" },
    { id: "ayush_practitioner", label: "AYUSH Practitioner (Ayurveda, Homeopathy, Unani, Yoga)" },
    { id: "other_clinical", label: "Other Clinical Specialty / Sub-specialist" },
  ],

  allied_health: [
    { id: "physiotherapist", label: "Physiotherapist / Physical Therapist (BPT / MPT / DPT)" },
    { id: "occupational_therapist", label: "Occupational Therapist (BOT / MOT)" },
    { id: "speech_therapist", label: "Speech & Language Pathologist / Audiologist (BASLP / MASLP)" },
    { id: "clinical_psychologist", label: "Clinical Psychologist (M.Phil / Psy.D / PhD)" },
    { id: "medical_lab_technician", label: "Medical Laboratory Technologist (DMLT / BMLT / MMLT)" },
    { id: "radiology_technician", label: "Radiology & Imaging Technologist (B.Sc MIT / DRIT)" },
    { id: "ot_technician", label: "Operation Theatre (OT) Technologist" },
    { id: "dialysis_technician", label: "Dialysis & Renal Care Technologist" },
    { id: "respiratory_therapist", label: "Respiratory Care Therapist (B.Sc RT)" },
    { id: "emt_paramedic", label: "Emergency Medical Technician (EMT) / Paramedic" },
    { id: "pharmacist", label: "Registered Pharmacist (B.Pharm / M.Pharm / Pharm.D)" },
    { id: "nutritionist_dietitian", label: "Clinical Nutritionist & Dietitian (M.Sc / RD)" },
    { id: "prosthetist_orthotist", label: "Prosthetist & Orthotist (BPO / MPO)" },
    { id: "ecg_cath_lab_tech", label: "ECG / Cardiac Cath Lab Technologist" },
    { id: "other_allied", label: "Other Allied Health Specialist" },
  ],

  nursing: [
    { id: "staff_nurse", label: "Staff Nurse / Nursing Officer (RN / RM)" },
    { id: "critical_care_nurse", label: "ICU / Critical Care Specialist Nurse" },
    { id: "ot_nurse", label: "Operation Theatre (OT) Nurse" },
    { id: "pediatric_nurse", label: "Pediatric & Neonatal (NICU) Nurse" },
    { id: "community_nurse", label: "Community Health Nurse / Public Health Nurse" },
    { id: "nurse_practitioner", label: "Nurse Practitioner (NP / M.Sc NP)" },
    { id: "anm", label: "Auxiliary Nurse Midwife (ANM)" },
    { id: "gnm", label: "General Nursing & Midwifery (GNM)" },
    { id: "bsc_nursing", label: "B.Sc Nursing Graduate" },
    { id: "msc_nursing", label: "M.Sc Nursing / Clinical Nurse Specialist" },
    { id: "other_nursing", label: "Other Nursing Professional" },
  ],

  medical_student: [
    { id: "mbbs_student", label: "MBBS Student (Medicine & Surgery)" },
    { id: "bds_student", label: "BDS Student (Dental Surgery)" },
    { id: "bpt_student", label: "Physiotherapy Student (BPT / MPT)" },
    { id: "nursing_student", label: "Nursing Student (B.Sc / GNM / M.Sc)" },
    { id: "pharmacy_student", label: "Pharmacy Student (B.Pharm / Pharm.D)" },
    { id: "allied_health_student", label: "Allied Health Sciences Student (BMLT / BMIT / BOT)" },
    { id: "ayush_student", label: "AYUSH Student (BAMS / BHMS / BUMS)" },
    { id: "public_health_student", label: "Public Health / Healthcare Mgmt Student (MPH / MHA)" },
    { id: "other_student", label: "Other Health Sciences Student" },
  ],

  admin_operations: [
    { id: "hospital_administrator", label: "Hospital Administrator / Medical Superintendent" },
    { id: "operations_manager", label: "Healthcare Operations Manager" },
    { id: "healthcare_hr", label: "Healthcare HR & Talent Acquisition Manager" },
    { id: "facility_biomedical", label: "Facility & Biomedical Engineering Manager" },
    { id: "quality_compliance", label: "Quality & Accreditation Officer (NABH / NABL / JCI)" },
    { id: "medical_billing_tpa", label: "Medical Billing & Insurance / TPA Coordinator" },
    { id: "healthcare_finance", label: "Healthcare Finance & Accounts Executive" },
    { id: "patient_relations", label: "Patient Relationship & Front Office Executive" },
    { id: "medical_records_officer", label: "Medical Records Officer (MRO) / Health Informatics" },
    { id: "hospital_it", label: "Hospital IT & Electronic Medical Records (EMR) Lead" },
    { id: "other_admin", label: "Other Healthcare Administration Role" },
  ],

  pharma_industry: [
    { id: "retail_pharmacist_owner", label: "Retail Medical Store / Community Pharmacy Owner" },
    { id: "wholesale_distributor", label: "Wholesale Pharmaceutical & Surgical Distributor" },
    { id: "device_distributor", label: "Medical Equipment & Diagnostics Distribution Partner" },
    { id: "pharma_manufacturer", label: "Pharmaceutical Formulation / API Manufacturer" },
    { id: "device_manufacturer", label: "Medical Device & Consumables Manufacturer" },
    { id: "medical_rep", label: "Medical Representative (MR) / Territory Executive" },
    { id: "product_manager", label: "Pharma Product & Marketing Manager" },
    { id: "regulatory_affairs", label: "Regulatory Affairs & Quality Compliance Executive" },
    { id: "pharmacovigilance", label: "Pharmacovigilance & Drug Safety Scientist" },
    { id: "cro_cra", label: "Clinical Research Associate (CRA) / CRO Project Lead" },
    { id: "other_pharma", label: "Other Pharma & Healthcare Industry Role" },
  ],

  healthcare_organization: [
    { id: "hospital", label: "Hospital (Multi-specialty, Super-specialty, General)" },
    { id: "clinic", label: "Clinic / Specialized Outpatient & Therapy Center" },
    { id: "diagnostic_center", label: "Diagnostic Pathology & Imaging Center" },
    { id: "blood_bank", label: "Blood Bank & Transfusion Center" },
    { id: "nursing_home", label: "Nursing Home & Daycare Surgery Center" },
    { id: "rehab_center", label: "Rehabilitation & Physical Therapy Institute" },
    { id: "ambulance_service", label: "Ambulance & Emergency Medical Response Service" },
    { id: "telemedicine", label: "Telemedicine & Digital Health Platform" },
    { id: "medical_college", label: "Medical College & Health Sciences University" },
    { id: "ngo_healthcare", label: "Healthcare NGO / Trust / Charitable Hospital" },
    { id: "pharma_enterprise", label: "Pharmaceutical / Medical Device Enterprise" },
    { id: "healthtech_startup", label: "HealthTech / AI Healthcare Startup" },
    { id: "other_org", label: "Other Healthcare Organization" },
  ],
};

// ─────────────────────────────────────────────
// 3. STUDENT STAGES LIST
// ─────────────────────────────────────────────

export const STUDENT_STAGES = [
  { value: "ug_1", label: "1st Year Undergraduate" },
  { value: "ug_2", label: "2nd Year Undergraduate" },
  { value: "ug_3", label: "3rd Year / Pre-final Undergraduate" },
  { value: "ug_final", label: "Final Year Undergraduate" },
  { value: "intern", label: "Compulsory Rotatory Resident Intern" },
  { value: "pg_resident", label: "PG Resident (MD / MS / DNB / MPT / MDS / M.Pharm)" },
  { value: "ss_resident", label: "Super-specialty Resident (DM / MCh / DNB-SS)" },
  { value: "fellow", label: "Clinical / Research Fellow" },
];

// ─────────────────────────────────────────────
// 4. DYNAMIC SCHEMAS REGISTRY
// ─────────────────────────────────────────────

export const PROFESSION_SCHEMAS: Record<string, ProfessionSchema> = {
  // Clinical Practitioner Default
  clinical_practitioner: {
    id: "clinical_practitioner",
    name: "Doctor / Medical Practitioner",
    category: "clinical_practitioner",
    allowedPrefixes: ["Dr.", "Prof."],
    allowedSuffixes: ["MBBS", "MD", "MS", "DM", "MCh", "DNB", "BDS", "MDS", "BAMS", "BHMS"],
    fields: [
      {
        name: "primary_degree",
        label: "Primary Clinical Qualification",
        type: "select",
        required: true,
        options: [
          { value: "MBBS", label: "MBBS (Bachelor of Medicine & Surgery)" },
          { value: "MD", label: "MD (Doctor of Medicine)" },
          { value: "MS", label: "MS (Master of Surgery)" },
          { value: "DM", label: "DM (Doctorate of Medicine)" },
          { value: "MCh", label: "MCh (Magister Chirurgiae)" },
          { value: "DNB", label: "DNB (Diplomate of National Board)" },
          { value: "BDS", label: "BDS (Bachelor of Dental Surgery)" },
          { value: "MDS", label: "MDS (Master of Dental Surgery)" },
          { value: "BAMS", label: "BAMS (Ayurvedic Medicine & Surgery)" },
          { value: "BHMS", label: "BHMS (Homeopathic Medicine & Surgery)" },
          { value: "Other", label: "Other Equivalent Medical Degree" },
        ],
      },
      {
        name: "specialization",
        label: "Primary Specialization",
        type: "text",
        placeholder: "e.g. Cardiology, Orthopedics, Pediatrics, General Medicine",
        required: true,
      },
      {
        name: "medical_council",
        label: "State / National Medical Council",
        type: "text",
        placeholder: "e.g. National Medical Commission (NMC) / Delhi Medical Council",
        required: true,
      },
      {
        name: "registration_number",
        label: "Medical Council Registration Number",
        type: "text",
        placeholder: "e.g. NMC/MCI/DMC-123456",
        required: true,
      },
      {
        name: "registration_state",
        label: "Registration State / Jurisdiction",
        type: "text",
        placeholder: "e.g. Delhi, Maharashtra, Karnataka",
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
        placeholder: "e.g. 6",
        required: true,
      },
    ],
    documents: [
      {
        id: "GOVT_ID",
        name: "Government Photo ID Proof",
        description: "Passport, National ID, Aadhaar, or Driver's License",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "DEGREE_CERTIFICATE",
        name: "Primary Medical Degree Certificate",
        description: "Official MBBS / MD / MS / BDS Degree or Passing Certificate",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "COUNCIL_REGISTRATION",
        name: "Medical Council Registration Certificate",
        description: "Valid certificate issued by State or National Medical Council",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "EMPLOYMENT_PROOF",
        name: "Current Hospital / Clinic ID or Letter (Optional)",
        description: "Staff ID Card, Appointment Letter, or Practice Letterhead",
        mandatory: false,
        level: "OPTIONAL",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "SELFIE_WITH_ID",
        name: "Selfie Holding Council / Govt ID (Recommended)",
        description: "Clear photo holding your ID card for biometric liveness verification",
        mandatory: false,
        level: "RECOMMENDED",
        acceptedFormats: ["image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },

  // Allied Health Professional
  allied_health: {
    id: "allied_health",
    name: "Allied Health Professional",
    category: "allied_health",
    allowedPrefixes: ["Dr.", "PT", "OT"],
    allowedSuffixes: ["PT", "BPT", "MPT", "BOT", "PharmD", "BMLT", "RD"],
    fields: [
      {
        name: "primary_degree",
        label: "Allied Health Qualification",
        type: "select",
        required: true,
        options: [
          { value: "BPT", label: "Bachelor of Physiotherapy (BPT)" },
          { value: "MPT", label: "Master of Physiotherapy (MPT)" },
          { value: "BOT", label: "Bachelor of Occupational Therapy (BOT)" },
          { value: "B.Pharm", label: "Bachelor of Pharmacy (B.Pharm)" },
          { value: "Pharm.D", label: "Doctor of Pharmacy (Pharm.D)" },
          { value: "BMLT", label: "B.Sc Medical Laboratory Technology (BMLT)" },
          { value: "BMIT", label: "B.Sc Medical Imaging Technology (BMIT)" },
          { value: "BASLP", label: "Audiology & Speech-Language Pathology (BASLP)" },
          { value: "M.Sc Nutrition", label: "M.Sc Clinical Nutrition & Dietetics" },
          { value: "Other", label: "Other Certified Allied Degree/Diploma" },
        ],
      },
      {
        name: "specialization",
        label: "Clinical Specialization / Focus Area",
        type: "text",
        placeholder: "e.g. Musculoskeletal Rehab, Neuro Rehab, Clinical Biochemistry",
        required: true,
      },
      {
        name: "medical_council",
        label: "Professional Council / Association (If applicable)",
        type: "text",
        placeholder: "e.g. Delhi Council for Physiotherapy / IAP / Pharmacy Council (PCI)",
        required: false,
      },
      {
        name: "registration_number",
        label: "Registration / License / Membership Number",
        type: "text",
        placeholder: "e.g. DCP-PT-10492 or PCI-49281 (if applicable)",
        required: false,
      },
      {
        name: "institution",
        label: "College / University",
        type: "text",
        placeholder: "e.g. Manipal College of Health Professions / Jamia Hamdard",
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
        label: "Current Clinic / Hospital / Rehab Practice",
        type: "text",
        placeholder: "e.g. Max Healthcare / Self-employed Clinic",
        required: false,
      },
      {
        name: "experience_years",
        label: "Years of Professional Experience",
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
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "DEGREE_CERTIFICATE",
        name: "Degree / Diploma Passing Certificate",
        description: "University degree or mark sheet verifying qualification",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "COUNCIL_REGISTRATION",
        name: "Council Registration / Association Proof (If applicable)",
        description: "State council registration card or professional association certificate",
        mandatory: false,
        level: "CONDITIONAL",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "EMPLOYMENT_PROOF",
        name: "Employment Proof / Clinic Letterhead (Optional)",
        description: "Work ID card or experience letter from employer",
        mandatory: false,
        level: "OPTIONAL",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },

  // Nursing Professional
  nursing: {
    id: "nursing",
    name: "Nursing Professional",
    category: "nursing",
    allowedPrefixes: ["RN"],
    allowedSuffixes: ["RN", "RM", "BSc Nursing", "MSc Nursing", "NP"],
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
          { value: "ANM", label: "Auxiliary Nurse Midwife (ANM)" },
        ],
      },
      {
        name: "medical_council",
        label: "State Nursing Council / INC",
        type: "text",
        placeholder: "e.g. Indian Nursing Council / Maharashtra Nursing Council",
        required: true,
      },
      {
        name: "registration_number",
        label: "Nursing Registration Number (RN / RM)",
        type: "text",
        placeholder: "e.g. RN-98234 / RM-82910",
        required: true,
      },
      {
        name: "specialization",
        label: "Clinical Department / Ward",
        type: "select",
        required: false,
        options: [
          { value: "Critical Care / ICU", label: "Critical Care / ICU" },
          { value: "Emergency / Trauma", label: "Emergency & Trauma" },
          { value: "Operation Theatre", label: "Operation Theatre (OT)" },
          { value: "Pediatrics & NICU", label: "Pediatrics & NICU" },
          { value: "Oncology", label: "Oncology" },
          { value: "General Ward", label: "General Clinical Ward" },
          { value: "Community Health", label: "Community & Public Health" },
        ],
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
        name: "current_organization",
        label: "Current Hospital / Healthcare Facility",
        type: "text",
        placeholder: "e.g. Fortis Healthcare / AIIMS",
        required: false,
      },
      {
        name: "experience_years",
        label: "Years of Nursing Experience",
        type: "number",
        placeholder: "e.g. 3",
        required: true,
      },
    ],
    documents: [
      {
        id: "GOVT_ID",
        name: "Government Photo ID Proof",
        description: "Passport, National ID, Aadhaar, or Driver's License",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "DEGREE_CERTIFICATE",
        name: "Nursing Degree / GNM Diploma Certificate",
        description: "Official B.Sc Nursing / GNM Passing Certificate",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "COUNCIL_REGISTRATION",
        name: "State Nursing Council Registration Certificate",
        description: "Registered Nurse (RN) / Registered Midwife (RM) Certificate",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "EMPLOYMENT_PROOF",
        name: "Hospital ID Card / Employment Letter (Optional)",
        description: "Current nursing staff ID card or appointment letter",
        mandatory: false,
        level: "OPTIONAL",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },

  // Medical Student
  medical_student: {
    id: "medical_student",
    name: "Medical & Health Sciences Student",
    category: "medical_student",
    allowedPrefixes: [],
    allowedSuffixes: ["Student", "Resident", "Intern"],
    fields: [
      {
        name: "primary_degree",
        label: "Degree Program Pursuing",
        type: "select",
        required: true,
        options: [
          { value: "MBBS", label: "MBBS (Bachelor of Medicine & Surgery)" },
          { value: "BDS", label: "BDS (Bachelor of Dental Surgery)" },
          { value: "BPT", label: "BPT (Bachelor of Physiotherapy)" },
          { value: "BSc Nursing", label: "B.Sc Nursing" },
          { value: "B.Pharm", label: "B.Pharm / Pharm.D" },
          { value: "Allied Health", label: "Allied Health Sciences (BMLT/BMIT/BOT)" },
          { value: "MD/MS Resident", label: "MD / MS / DNB Resident (Postgraduate)" },
          { value: "MPT Resident", label: "MPT Resident (Postgraduate)" },
          { value: "AYUSH", label: "AYUSH Program (BAMS / BHMS)" },
        ],
      },
      {
        name: "current_organization",
        label: "Current Academic Stage / Year",
        type: "select",
        required: true,
        options: [
          { value: "1st Year", label: "1st Year Undergraduate" },
          { value: "2nd Year", label: "2nd Year Undergraduate" },
          { value: "3rd Year", label: "3rd Year / Pre-final Undergraduate" },
          { value: "Final Year", label: "Final Year Undergraduate" },
          { value: "Intern", label: "Rotatory Resident Intern" },
          { value: "Junior Resident (PG)", label: "Junior Resident (PG - 1st/2nd/3rd Year)" },
          { value: "Senior Resident / Fellow", label: "Senior Resident / Clinical Fellow" },
        ],
      },
      {
        name: "institution",
        label: "College / University Enrolled In",
        type: "text",
        placeholder: "e.g. King George's Medical University / AFMC Pune",
        required: true,
      },
      {
        name: "registration_number",
        label: "College Enrollment / Roll Number",
        type: "text",
        placeholder: "e.g. KGMU-MBBS-2022-094",
        required: true,
      },
      {
        name: "graduation_year",
        label: "Expected Year of Graduation / Completion",
        type: "number",
        placeholder: "e.g. 2027",
        required: true,
      },
    ],
    documents: [
      {
        id: "GOVT_ID",
        name: "Government Photo ID Proof",
        description: "Passport, National ID, Aadhaar, or Driver's License",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "DEGREE_CERTIFICATE",
        name: "Valid College / University ID Card",
        description: "Clear photo or scan of your official student identity card",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "ENROLLMENT_PROOF",
        name: "Admission Letter / Fee Receipt / Bonafide Certificate",
        description: "Latest tuition fee receipt, admission allotment letter, or dean's bonafide letter",
        mandatory: false,
        level: "RECOMMENDED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "SELFIE_WITH_ID",
        name: "Selfie Holding Student ID (Recommended)",
        description: "Selfie holding your student ID card for quick verification",
        mandatory: false,
        level: "RECOMMENDED",
        acceptedFormats: ["image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },

  // Administration & Operations
  admin_operations: {
    id: "admin_operations",
    name: "Healthcare Administration & Operations",
    category: "admin_operations",
    allowedPrefixes: [],
    allowedSuffixes: ["MHA", "MBA-HM", "FACHE"],
    fields: [
      {
        name: "primary_degree",
        label: "Highest Qualification",
        type: "select",
        required: true,
        options: [
          { value: "MHA", label: "Master of Hospital Administration (MHA)" },
          { value: "MBA Healthcare", label: "MBA in Hospital & Healthcare Management" },
          { value: "PGDHM", label: "Post Graduate Diploma in Hospital Management" },
          { value: "BHA", label: "Bachelor of Hospital Administration (BHA)" },
          { value: "Other Master", label: "Other Master's Degree" },
          { value: "Other Bachelor", label: "Other Bachelor's Degree" },
        ],
      },
      {
        name: "specialization",
        label: "Department / Operational Focus",
        type: "select",
        required: true,
        options: [
          { value: "Hospital Administration", label: "General Hospital Administration" },
          { value: "Clinical Operations", label: "Clinical & Ward Operations" },
          { value: "Quality & NABH", label: "Quality Assurance & NABH/JCI Compliance" },
          { value: "HR & Talent", label: "Healthcare HR & Staffing" },
          { value: "Medical Billing & TPA", label: "Medical Billing, Insurance & TPA" },
          { value: "Biomedical & Facility", label: "Biomedical & Facility Management" },
          { value: "Health IT & EMR", label: "Hospital IT, EMR & Digital Systems" },
          { value: "Patient Experience", label: "Patient Relations & Front Desk" },
        ],
      },
      {
        name: "current_organization",
        label: "Current Hospital / Healthcare Organization",
        type: "text",
        placeholder: "e.g. Medanta The Medicity / Narayana Health",
        required: true,
      },
      {
        name: "institution",
        label: "Current Designation / Title",
        type: "text",
        placeholder: "e.g. Assistant General Manager - Operations",
        required: true,
      },
      {
        name: "experience_years",
        label: "Years in Healthcare Administration",
        type: "number",
        placeholder: "e.g. 5",
        required: true,
      },
    ],
    documents: [
      {
        id: "GOVT_ID",
        name: "Government Photo ID Proof",
        description: "Passport, National ID, Aadhaar, or Driver's License",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "DEGREE_CERTIFICATE",
        name: "Degree / Management Certificate",
        description: "Degree certificate or post-graduate diploma",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "EMPLOYMENT_PROOF",
        name: "Official Hospital Staff ID / Employment Letter",
        description: "Organization identity card or signed appointment letter",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },

  // Pharma & Industry
  pharma_industry: {
    id: "pharma_industry",
    name: "Pharma, Biotech & Medical Device Professional",
    category: "pharma_industry",
    allowedPrefixes: [],
    allowedSuffixes: ["B.Pharm", "M.Pharm", "PharmD", "CRA"],
    fields: [
      {
        name: "primary_degree",
        label: "Registration Track",
        type: "select",
        required: true,
        options: [
          { value: "Corporate / Executive", label: "Corporate / Industry Professional (MR, Brand, CRA, Regulatory)" },
          { value: "Retail / Community Pharmacy", label: "Retail Medical Store / Community Pharmacy Owner" },
          { value: "Wholesale Distribution", label: "Wholesale Medicine & Surgical Distributor" },
          { value: "Manufacturing Enterprise", label: "Pharmaceutical / Medical Device Manufacturer" },
        ],
      },
      {
        name: "current_organization",
        label: "Company / Enterprise / Store Name",
        type: "text",
        placeholder: "e.g. Sun Pharma / MedLife Surgical Distributors / Apollo Pharmacy",
        required: true,
      },
      {
        name: "specialization",
        label: "Designation / Role",
        type: "text",
        placeholder: "e.g. Area Business Manager / Regulatory Specialist / Pharmacy Owner",
        required: true,
      },
      {
        name: "registration_number",
        label: "Drug License / GSTIN / Reg Number (If applicable)",
        type: "text",
        placeholder: "e.g. 20B/21B Drug License # or Employee ID",
        required: false,
      },
      {
        name: "experience_years",
        label: "Years in Pharma / Healthcare Industry",
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
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "EMPLOYMENT_PROOF",
        name: "Company Staff ID / Employment Letter or Drug License",
        description: "Employee ID card for corporate roles, or 20B/21B Drug License for pharmacy owners",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "DEGREE_CERTIFICATE",
        name: "Pharmacy / Science Degree or GST Certificate (Optional)",
        description: "B.Pharm/M.Pharm degree or Business Registration Certificate",
        mandatory: false,
        level: "OPTIONAL",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },
};

// ─────────────────────────────────────────────
// 5. HEALTHCARE ORGANISATION SCHEMAS
// ─────────────────────────────────────────────

export const ORGANISATION_TYPES = [
  { id: "hospital", label: "Hospital (Multi-specialty / Super-specialty / General)" },
  { id: "clinic", label: "Clinic / Specialized Outpatient & Therapy Center" },
  { id: "diagnostic_center", label: "Diagnostic Pathology & Imaging Center" },
  { id: "blood_bank", label: "Blood Bank & Transfusion Center" },
  { id: "nursing_home", label: "Nursing Home & Maternity Center" },
  { id: "rehab_center", label: "Rehabilitation & Physical Therapy Institute" },
  { id: "ambulance_service", label: "Ambulance & Emergency Medical Response Service" },
  { id: "telemedicine", label: "Telemedicine & Digital Health Platform" },
  { id: "medical_college", label: "Medical College & Health Sciences University" },
  { id: "ngo_healthcare", label: "Healthcare NGO / Trust / Charitable Hospital" },
  { id: "pharma_enterprise", label: "Pharmaceutical / Medical Device Enterprise" },
  { id: "healthtech_startup", label: "HealthTech / AI Healthcare Startup" },
  { id: "other_org", label: "Other Healthcare Organization" },
];

export const ORGANISATION_SCHEMAS: Record<string, OrganisationSchema> = {
  healthcare_organization: {
    id: "healthcare_organization",
    name: "Healthcare Organization",
    fields: [
      {
        name: "registration_number",
        label: "Clinical Establishment Act / State Health License #",
        type: "text",
        placeholder: "e.g. CEA/HOSP/2023/9482 or Trade License",
        required: true,
      },
      {
        name: "tax_id",
        label: "GSTIN / PAN / Registration Number",
        type: "text",
        placeholder: "e.g. 27AAAAA0000A1Z5",
        required: true,
      },
      {
        name: "year_established",
        label: "Year Established",
        type: "number",
        placeholder: "e.g. 2008",
        required: true,
      },
      {
        name: "website",
        label: "Official Organization Website URL",
        type: "text",
        placeholder: "https://www.hospital.org",
        required: false,
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
        placeholder: "e.g. Medical Director / Chief Medical Officer / Managing Trustee",
        required: true,
      },
      {
        name: "auth_rep_email",
        label: "Official Representative Email",
        type: "text",
        placeholder: "director@hospital.org",
        required: true,
      },
    ],
    documents: [
      {
        id: "HOSPITAL_LICENSE",
        name: "Clinical Establishment Registration / State Health Operating License",
        description: "Official government health authority license authorizing clinical operations",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "TAX_DOCUMENT",
        name: "GST Certificate / Certificate of Incorporation / PAN",
        description: "Official business registration or trust deed document",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "AUTH_REP_ID",
        name: "Authorized Representative Govt ID & Board Authorization Letter",
        description: "ID of Medical Director / Trustee along with signed authorization resolution",
        mandatory: true,
        level: "REQUIRED",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
      {
        id: "NABH_ACCREDITATION",
        name: "NABH / NABL / JCI Accreditation Certificate (Optional)",
        description: "Hospital/Lab accreditation certificate demonstrating quality standards",
        mandatory: false,
        level: "OPTIONAL",
        acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
        maxSizeMB: 5,
      },
    ],
  },
};

// ─────────────────────────────────────────────
// 6. HELPER RESOLVER FUNCTIONS
// ─────────────────────────────────────────────

export function getProfessionSchema(categoryIdOrProfessionId?: string): ProfessionSchema {
  if (!categoryIdOrProfessionId) return PROFESSION_SCHEMAS.clinical_practitioner;
  
  const key = categoryIdOrProfessionId.toLowerCase().replace(/[^a-z0-9]/g, "_");
  
  // Direct match
  if (PROFESSION_SCHEMAS[key]) {
    return PROFESSION_SCHEMAS[key];
  }

  // Category mapping
  if (key.includes("student")) return PROFESSION_SCHEMAS.medical_student;
  if (key.includes("nurse") || key.includes("nursing")) return PROFESSION_SCHEMAS.nursing;
  if (key.includes("physio") || key.includes("allied") || key.includes("therap") || key.includes("lab") || key.includes("radiolog")) {
    return PROFESSION_SCHEMAS.allied_health;
  }
  if (key.includes("admin") || key.includes("operations") || key.includes("hr") || key.includes("billing")) {
    return PROFESSION_SCHEMAS.admin_operations;
  }
  if (key.includes("pharma") || key.includes("industry") || key.includes("distributor") || key.includes("rep")) {
    return PROFESSION_SCHEMAS.pharma_industry;
  }
  if (key.includes("doctor") || key.includes("practitioner") || key.includes("physician") || key.includes("surgeon") || key.includes("dentist")) {
    return PROFESSION_SCHEMAS.clinical_practitioner;
  }

  return PROFESSION_SCHEMAS.clinical_practitioner;
}

export function getOrganisationSchema(orgTypeId?: string): OrganisationSchema {
  return ORGANISATION_SCHEMAS.healthcare_organization;
}
