/**
 * lib/seo.ts
 * MedGlobalNetwork (MGN - https://mgn.life)
 * Comprehensive SEO, GEO (Generative Engine Optimization), and AEO (Answer Engine Optimization)
 * Knowledge Graph & Schema.org Structured Data
 */

export const SITE_URL = "https://mgn.life";
export const SITE_NAME = "MedGlobalNetwork";
export const SITE_SHORT_NAME = "MGN";
export const SITE_TAGLINE =
  "Healthcare Professional Social & Continuous Medical Learning Ecosystem";
export const SITE_DESCRIPTION =
  "Connect with verified doctors, physical therapists, surgeons, and medical researchers on MedGlobalNetwork (MGN). Share clinical insights, enroll in accredited CME courses, publish research, organize health camps, and advance your healthcare career.";

export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/MedGlobalNet",
  linkedin: "https://www.linkedin.com/company/medglobalnetwork",
  youtube: "https://www.youtube.com/@MedGlobalNetwork",
  github: "https://github.com/medglobalnetwork",
};

export const DPDP_OFFICER_INFO = {
  officerName: "Data Protection & Grievance Officer",
  organization: "MedGlobalNetwork (MGN)",
  email: "privacy@mgn.life",
  supportEmail: "support@mgn.life",
  address: "MedGlobalNetwork Compliance Desk, Mumbai & New Delhi, India",
  responseWindowDays: 30,
  actReference: "Digital Personal Data Protection Act, 2023 (DPDP Act) & DPDP Rules 2025",
};

/**
 * 1. MedicalOrganization Schema
 * Establishes MedGlobalNetwork as an authoritative entity in the medical knowledge graph.
 */
export const medicalOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: [SITE_SHORT_NAME, "MGN.life", "Med Global Network"],
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/icon-512.png`,
    width: "512",
    height: "512",
  },
  image: `${SITE_URL}/auth-hero-3d.jpg`,
  description: SITE_DESCRIPTION,
  medicalSpecialty: [
    "Cardiovascular",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Oncology",
    "Physiotherapy",
    "Surgery",
    "Dermatology",
    "GeneralPractice",
    "Radiology",
    "Psychiatry",
    "Anesthesiology",
    "Endocrinology",
    "Gastroenterology",
  ],
  knowsAbout: [
    "Continuing Medical Education (CME)",
    "Clinical Case Discussion & Peer Consultation",
    "Surgical Masterclasses and Webinars",
    "Community Health Screening and Volunteer Camps",
    "Medical Research Publications and Clinical Trials",
    "Physiotherapy and Rehabilitation Protocols",
    "Healthcare Talent Recruitment and Hospital Jobs",
    "Verified Clinician Credentialing and Registration",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${SITE_URL}/help`,
      email: "support@mgn.life",
      availableLanguage: ["English", "Hindi"],
    },
  ],
  sameAs: [
    SOCIAL_LINKS.twitter,
    SOCIAL_LINKS.linkedin,
    SOCIAL_LINKS.youtube,
    SOCIAL_LINKS.github,
  ],
};

/**
 * 2. WebSite Schema with Sitelinks SearchBox
 * Signals site search capabilities to Googlebot and generative search engines.
 */
export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: "MGN.life",
  url: SITE_URL,
  description: SITE_TAGLINE,
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/home?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/**
 * 3. FAQPage Schema (Critical for AEO & GEO)
 * Perplexity, ChatGPT Search, Gemini, and Google AI Overviews leverage FAQPage
 * to provide direct answers and citation attribution for clinical queries.
 */
export const globalFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is MedGlobalNetwork (MGN)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MedGlobalNetwork (MGN - https://mgn.life) is a verified global social, clinical collaboration, and Continuing Medical Education (CME) ecosystem built exclusively for healthcare professionals including medical doctors (MD/MBBS), surgeons, physical therapists, nurses, and clinical researchers. It combines peer-to-peer case consultation, accredited CME courses, medical event and camp organizing, and verified healthcare career opportunities.",
      },
    },
    {
      "@type": "Question",
      name: "How do doctors and healthcare practitioners get verified on MGN?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every clinician on MGN undergoes strict credential verification. Doctors and medical practitioners submit their official Medical Council registration number, license certificates, and institutional affiliations. Our credentialing team cross-validates records against official state and national medical registries before granting the verified clinician badge.",
      },
    },
    {
      "@type": "Question",
      name: "Are CME courses on MedGlobalNetwork accredited?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, courses on MGN are developed in compliance with international medical education guidelines and accredited in partnership with recognized medical institutions, colleges, and healthcare societies. Healthcare practitioners earn verified Continuing Medical Education (CME) credits, digital badges, and verifiable certificates upon completing coursework and assessments.",
      },
    },
    {
      "@type": "Question",
      name: "How do hospitals and healthcare organizations recruit on MGN?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hospitals, medical centers, and clinical research institutions register verified enterprise profiles to post clinical job openings, fellowships, and residency slots. Recruiters can directly search and filter candidates by verified medical specialty, sub-specialty, clinical experience, and medical council verification status.",
      },
    },
    {
      "@type": "Question",
      name: "What kinds of medical events and health camps are hosted on MGN?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MGN supports physical, hybrid, and virtual medical events, including accredited conferences, surgical webinars, symposia, and community health camps (such as free screening, physiotherapy rehabilitation drives, and rural health outreach). Organizers can manage attendee registration, ticketing, and volunteer assignments on the platform.",
      },
    },
    {
      "@type": "Question",
      name: "Can medical researchers publish and collaborate on MGN?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, medical researchers and clinicians can initiate multi-center research projects, recruit qualified co-investigators, publish peer-reviewed clinical findings, and share preprints and clinical case studies with an international network of verified medical peers.",
      },
    },
  ],
};

/**
 * 4. HowTo Schema (Clinician Verification Workflow for AEO / Rich Snippets)
 */
export const howToVerificationSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How Doctors & Healthcare Professionals Get Verified on MedGlobalNetwork",
  description:
    "Step-by-step credentialing and registry verification process for medical doctors, surgeons, physical therapists, and researchers on MedGlobalNetwork (MGN).",
  image: `${SITE_URL}/auth-hero-3d.jpg`,
  totalTime: "P1D",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "USD",
    value: "0",
  },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Create Professional Profile",
      text: "Sign up at mgn.life/signup with your official professional email and basic details.",
      url: `${SITE_URL}/signup`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Select Medical Discipline & Specialty",
      text: "Specify your profession (Doctor, Surgeon, Physical Therapist, Nurse, or Researcher) and clinical specialty.",
      url: `${SITE_URL}/onboarding`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Enter Medical Council Registration",
      text: "Provide your national or state medical council registration number, issuing board, and hospital affiliation.",
      url: `${SITE_URL}/onboarding`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Upload Credential Documents",
      text: "Upload digital copies of your medical degree/diploma certificate, active practice license, and government ID.",
      url: `${SITE_URL}/onboarding`,
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Clinical Registry Cross-Validation",
      text: "MGN credentialing specialists cross-validate records against government and medical board registries.",
      url: `${SITE_URL}/verify`,
    },
    {
      "@type": "HowToStep",
      position: 6,
      name: "Receive Verified Clinician Badge",
      text: "Upon approval, the Verified Clinician badge is awarded, unlocking accredited CME courses and peer consultations.",
      url: `${SITE_URL}/feed`,
    },
  ],
};

/**
 * 4. Catalog Schemas for Public Hubs
 */

export const eventsPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Medical Conferences, CME Webinars & Clinical Symposia",
  description:
    "Explore upcoming medical conferences, surgical masterclasses, accredited CME webinars, and healthcare workshops hosted on MedGlobalNetwork.",
  url: `${SITE_URL}/events`,
  isPartOf: {
    "@id": `${SITE_URL}/#website`,
  },
  about: {
    "@type": "MedicalSpecialty",
    name: "Continuing Medical Education",
  },
};

export const campsPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Community Health Camps & Rural Medical Outreach",
  description:
    "Find, organize, and volunteer for free medical screening camps, physiotherapy rehabilitation drives, and rural healthcare initiatives on MedGlobalNetwork.",
  url: `${SITE_URL}/camps`,
  isPartOf: {
    "@id": `${SITE_URL}/#website`,
  },
};

export const jobsPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Healthcare Opportunities & Medical Jobs",
  description:
    "Explore verified medical job openings, hospital residencies, clinical fellowships, and healthcare consulting roles on MedGlobalNetwork.",
  url: `${SITE_URL}/opportunities/jobs`,
  isPartOf: {
    "@id": `${SITE_URL}/#website`,
  },
};

export const coursesCatalogSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Accredited Medical CME Courses & Clinical Training",
  description:
    "Earn CME credits with accredited medical courses, surgical tutorials, diagnostic modules, and clinical case studies for doctors and healthcare specialists.",
  url: `${SITE_URL}/learn/courses`,
  isPartOf: {
    "@id": `${SITE_URL}/#website`,
  },
};

/**
 * 5. Dynamic Schema Generators
 */

export function generateJobPostingSchema(job: {
  id: string;
  title: string;
  description: string;
  datePosted?: string;
  validThrough?: string;
  employmentType?: string;
  hiringOrganization?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.datePosted || new Date().toISOString(),
    validThrough:
      job.validThrough ||
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: job.employmentType || "FULL_TIME",
    occupationalCategory: "29-0000 Healthcare Practitioners and Technical Occupations",
    hiringOrganization: {
      "@type": "Organization",
      name: job.hiringOrganization || SITE_NAME,
      sameAs: SITE_URL,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Remote / Global",
      },
    },
    ...(job.salaryMin && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: job.currency || "USD",
        value: {
          "@type": "QuantitativeValue",
          minValue: job.salaryMin,
          maxValue: job.salaryMax || job.salaryMin,
          unitText: "YEAR",
        },
      },
    }),
  };
}

export function generateCourseSchema(course: {
  id: string;
  title: string;
  description: string;
  instructor?: string;
  cmeCredits?: number;
  url?: string;
  thumbnail?: string;
  price?: number;
  currency?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "MedicalOrganization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    url: course.url || `${SITE_URL}/learn/course/${course.id}`,
    image: course.thumbnail || `${SITE_URL}/auth-hero-3d.jpg`,
    educationalCredentialAwarded: course.cmeCredits
      ? `${course.cmeCredits} Accredited CME Credits`
      : "Verified Medical Certificate",
    offers: {
      "@type": "Offer",
      price: course.price !== undefined ? course.price : "0",
      priceCurrency: course.currency || "USD",
      category: course.price === 0 ? "Free" : "Paid",
    },
  };
}

export function generateEventSchema(event: {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  format?: "online" | "in_person" | "hybrid";
  location?: string;
  url?: string;
  organizer?: string;
  price?: number;
  currency?: string;
  isMedical?: boolean;
}) {
  const attendanceModeMap = {
    online: "https://schema.org/OnlineEventAttendanceMode",
    in_person: "https://schema.org/OfflineEventAttendanceMode",
    hybrid: "https://schema.org/MixedEventAttendanceMode",
  };

  return {
    "@context": "https://schema.org",
    "@type": event.isMedical ? ["Event", "MedicalEvent"] : "Event",
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      attendanceModeMap[event.format || "online"] ||
      "https://schema.org/OnlineEventAttendanceMode",
    location:
      event.format === "online"
        ? {
            "@type": "VirtualLocation",
            url: event.url || `${SITE_URL}/events/${event.id}`,
          }
        : {
            "@type": "Place",
            name: event.location || "Clinical Venue",
            address: {
              "@type": "PostalAddress",
              addressLocality: event.location || "Global",
            },
          },
    organizer: {
      "@type": "Organization",
      name: event.organizer || SITE_NAME,
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: event.price !== undefined ? event.price : "0",
      priceCurrency: event.currency || "USD",
      url: event.url || `${SITE_URL}/events/${event.id}`,
      availability: "https://schema.org/InStock",
    },
  };
}

export function generateMedicalBusinessSchema(org: {
  id: string;
  name: string;
  description?: string;
  specialty?: string;
  address?: string;
  phone?: string;
  url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: org.name,
    description: org.description || "Healthcare Organization on MedGlobalNetwork",
    url: org.url || `${SITE_URL}/organizations`,
    medicalSpecialty: org.specialty || "GeneralPractice",
    ...(org.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: org.address,
      },
    }),
    ...(org.phone && {
      telephone: org.phone,
    }),
  };
}
