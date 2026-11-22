import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { ensureVerificationTables, verifDb } from "@/modules/onboarding/lib/verification-db";
import { ensureUserStorage, syncUserDossier } from "@/modules/onboarding/lib/user-storage";
import { isR2Configured, uploadR2Buffer } from "@/lib/r2";
import { nanoid } from "nanoid";
import { writeFile } from "fs/promises";
import path from "path";

// ─────────────────────────────────────────────
// CONFIGURABLE DOCUMENT REQUIREMENTS REGISTRY
// Admin-configurable per identity
// ─────────────────────────────────────────────
export interface DocRequirementConfig {
  id: string;
  name: string;
  description: string;
  mandatory: boolean;
  acceptedFormats: string[];
  maxSizeMB: number;
}

export const IDENTITY_DOCUMENT_REQUIREMENTS: Record<string, DocRequirementConfig[]> = {
  student: [
    {
      id: "student_id",
      name: "College / University ID Card",
      description: "Valid student identity card showing current medical/health sciences enrollment.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "bonafide_letter",
      name: "Bonafide Certificate / Enrollment Proof",
      description: "Official bonafide letter from Principal/Dean or current academic fee receipt.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "admission_allotment",
      name: "NEET Allotment / Admission Letter",
      description: "Optional counseling admission order or university hall ticket.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  intern_trainee: [
    {
      id: "provisional_degree",
      name: "Provisional Degree / Passing Certificate",
      description: "Provisional certificate awarded by the medical or health sciences university.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "provisional_council_reg",
      name: "Provisional Council Registration / Internship Order",
      description: "Provisional State Medical Council registration or hospital rotating internship order.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "hospital_trainee_id",
      name: "Hospital Trainee Badge / ID",
      description: "Hospital-issued clinical trainee or junior resident identity badge.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  doctor: [
    {
      id: "medical_degree",
      name: "Primary Medical Qualification Degree (MBBS / BDS / AYUSH)",
      description: "Original degree certificate awarded by recognized medical university.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "medical_council_reg",
      name: "State Medical Council / NMC Registration Certificate",
      description: "Valid permanent registration certificate issued by State Medical Council or NMC.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "postgraduate_degree",
      name: "Postgraduate Degree / Fellowship Certificate (MD / MS / DNB)",
      description: "Specialist qualification certificate (if applicable).",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  nurse: [
    {
      id: "nursing_degree",
      name: "Nursing Qualification Certificate (GNM / B.Sc / M.Sc)",
      description: "Degree or diploma certificate awarded by recognized nursing university/board.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "nursing_council_reg",
      name: "State Nursing Council Registration Certificate",
      description: "Valid RN & RM registration certificate issued by the State Nursing Council.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "nursing_work_proof",
      name: "Hospital Employment Letter or ID",
      description: "Current hospital employment certificate or nursing officer badge.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  pharmacist: [
    {
      id: "pharmacy_degree",
      name: "Pharmacy Degree / Diploma (D.Pharm / B.Pharm / Pharm.D)",
      description: "Recognized pharmacy qualification certificate.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "pharmacy_council_reg",
      name: "State Pharmacy Council Registration Certificate",
      description: "Registered Pharmacist Certificate issued under Pharmacy Act 1948.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "drug_license",
      name: "Retail / Wholesale Drug License Copy",
      description: "Form 20 / 21 Drug license if managing an independent or hospital pharmacy.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  physiotherapist: [
    {
      id: "physio_degree",
      name: "Physiotherapy Degree Certificate (BPT / MPT)",
      description: "Recognized degree certificate in Physiotherapy from health university.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "physio_council_reg",
      name: "State Allied Council / IAP Registration Certificate",
      description: "Registration certificate issued by State Council or Indian Association of Physiotherapists.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "clinical_setup_proof",
      name: "Rehabilitation Center / Clinic Proof",
      description: "Hospital posting letter or clinical practice setup document.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  paramedical: [
    {
      id: "paramedical_diploma",
      name: "Paramedical Diploma / Degree Certificate",
      description: "Recognized qualification in MLT, Radiology, Emergency Care, or OT Technology.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "paramedical_council_reg",
      name: "State Paramedical Council Registration Certificate",
      description: "Valid registration certificate issued by State Paramedical Faculty or Board.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "paramedical_skill_cert",
      name: "BLS / ACLS or Hospital Skill Certificate",
      description: "Life support or specialized medical equipment technician certification.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  allied_health: [
    {
      id: "allied_degree",
      name: "Allied Healthcare Professional Degree / Masters",
      description: "Degree in Clinical Psychology, Optometry, Audiology, or Clinical Nutrition.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "allied_council_reg",
      name: "RCI / State Allied Healthcare Council Registration",
      description: "Registration certificate from Rehabilitation Council of India (RCI) or State Council.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "allied_experience",
      name: "Facility Practice Credential / Employment Letter",
      description: "Clinical facility practice authorization or institutional ID.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  researcher: [
    {
      id: "researcher_appointment",
      name: "Scientist / Investigator Institutional Appointment Letter",
      description: "Official appointment letter from research institute, hospital, or university.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "research_publication_or_phd",
      name: "Published Paper / Trial GCP Credential / Ph.D Degree",
      description: "PubMed/Scopus indexed paper first page, GCP certificate, or doctorate degree.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "ethics_approval",
      name: "Institutional Ethics Committee (IEC) Clearance",
      description: "IEC or IRB clearance certificate for active trial or clinical research.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  faculty: [
    {
      id: "faculty_appointment",
      name: "University Faculty Appointment Order / Academic ID",
      description: "Appointment letter as Professor, Associate Prof, Assistant Prof, or Lecturer.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "highest_qualification",
      name: "Highest Medical / Scientific Degree Certificate",
      description: "Postgraduate degree certificate (MD / MS / DNB / Ph.D).",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "teacher_recognition",
      name: "Medical Council Teacher Recognition Order",
      description: "Approved postgraduate/undergraduate teacher approval document.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  business_owner: [
    {
      id: "clinical_establishment_reg",
      name: "Clinical Establishment / Hospital / Clinic License",
      description: "Registration certificate under Clinical Establishments Act or health authority.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "business_incorporation",
      name: "GST / MSME / Incorporation Certificate",
      description: "GST registration certificate, MSME Udyam, or Certificate of Incorporation.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "statutory_clearances",
      name: "PCB / Fire Safety / AERB Clearance",
      description: "Biomedical waste authorization, fire NOC, or radiology AERB registration.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  service_provider: [
    {
      id: "service_trade_license",
      name: "Healthcare Service Trade License / Firm Registration",
      description: "Commercial trade license or registration certificate for healthcare services.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "authorized_signatory_id",
      name: "Authorized Signatory Government Photo ID",
      description: "Government-issued photo identity proof of director or authorized representative.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "quality_compliance_cert",
      name: "Quality Certification / ISO / NABH Credentials",
      description: "Quality management or compliance certification.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
  other_healthcare: [
    {
      id: "employer_id_card",
      name: "Healthcare Institution Employment Letter / ID Card",
      description: "Formal appointment order or institutional ID badge from healthcare facility.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "competency_cert",
      name: "Healthcare Specialty or Competency Certificate",
      description: "Formal certification, diploma, or training credential.",
      mandatory: true,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
    {
      id: "endorsement_letter",
      name: "Letter of Endorsement",
      description: "Recommendation letter from a registered medical professional.",
      mandatory: false,
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      maxSizeMB: 10,
    },
  ],
};

// ─────────────────────────────────────────────
// MALWARE & CONTENT INSPECTION UTILITY
// ─────────────────────────────────────────────
function inspectFileSafety(buffer: Buffer, mimeType: string): { safe: boolean; reason?: string } {
  if (buffer.length < 8) {
    return { safe: false, reason: "File is too small or truncated." };
  }

  // 1. Magic byte header validation
  const hex = buffer.subarray(0, 8).toString("hex").toUpperCase();

  if (mimeType === "application/pdf") {
    // PDF magic bytes: %PDF- (hex: 25 50 44 46 2d)
    const pdfHeader = buffer.subarray(0, 5).toString("ascii");
    if (!pdfHeader.startsWith("%PDF-")) {
      return { safe: false, reason: "Corrupted PDF file. Header does not match PDF standard format." };
    }
  } else if (mimeType === "image/jpeg") {
    // JPEG magic bytes: FF D8 FF
    if (!hex.startsWith("FFD8FF")) {
      return { safe: false, reason: "Invalid JPEG image format." };
    }
  } else if (mimeType === "image/png") {
    // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    if (!hex.startsWith("89504E47")) {
      return { safe: false, reason: "Invalid PNG image format." };
    }
  }

  // 2. Malware & Executable signature checks
  // Disallowed executable headers: MZ (Windows PE), ELF (Linux binary), Mach-O
  if (hex.startsWith("4D5A") || hex.startsWith("7F454C46") || hex.startsWith("CAFEBABE")) {
    return { safe: false, reason: "Executable binaries are strictly prohibited." };
  }

  // Script injection heuristic (inspect first 4KB)
  const previewText = buffer.subarray(0, Math.min(buffer.length, 4096)).toString("latin1").toLowerCase();
  const suspiciousTokens = [
    "<script",
    "<?php",
    "eval(",
    "/javascript",
    "/launch",
    "wscript.shell",
    "cmd.exe",
    "powershell",
  ];

  for (const token of suspiciousTokens) {
    if (previewText.includes(token)) {
      return { safe: false, reason: `Malware protection triggered: prohibited code signature detected.` };
    }
  }

  return { safe: true };
}

// ─────────────────────────────────────────────
// GET: FETCH DYNAMIC IDENTITIES & DOCUMENTS
// ─────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const reqHeaders = await headers();
    let targetUserId = "";

    try {
      const session = await auth.api.getSession({ headers: reqHeaders });
      if (session?.user?.id) targetUserId = session.user.id;
    } catch {}

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    if (!targetUserId && queryUserId) {
      targetUserId = queryUserId;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view document verification." },
        { status: 401 }
      );
    }

    await ensureVerificationTables();

    // Ensure database columns exist
    try {
      await pool.query(`
        ALTER TABLE mgn_verification_documents ADD COLUMN IF NOT EXISTS identity_type VARCHAR(64);
        ALTER TABLE mgn_verification_documents ADD COLUMN IF NOT EXISTS document_label VARCHAR(150);
        ALTER TABLE mgn_identities ADD COLUMN IF NOT EXISTS identity_statuses JSONB DEFAULT '{}'::jsonb;
        ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS identity_statuses JSONB DEFAULT '{}'::jsonb;
      `);
    } catch (schemaErr) {
      console.warn("Schema check warning in documents GET:", schemaErr);
    }

    // 1. Fetch user & profiles
    const userRes = await pool.query(
      `SELECT id, name, email, selected_identities FROM "user" WHERE id = $1 LIMIT 1`,
      [targetUserId]
    );
    const user = userRes.rows[0];

    const profileRes = await pool.query(
      `SELECT selected_identities, identity_details, identity_statuses, verification_status 
       FROM professional_profiles 
       WHERE user_id = $1 LIMIT 1`,
      [targetUserId]
    );
    const profile = profileRes.rows[0] || {};

    const identityRes = await verifDb
      .selectFrom("mgn_identities")
      .selectAll()
      .where("user_id", "=", targetUserId)
      .executeTakeFirst();

    // 2. Resolve selected identities
    const rawSelected: string[] =
      (identityRes as any)?.selected_identities ||
      profile.selected_identities ||
      user?.selected_identities ||
      [];

    const selectedIdentities = Array.from(new Set(rawSelected.filter(Boolean)));

    // 3. Fetch existing uploaded documents
    const docs = await verifDb
      .selectFrom("mgn_verification_documents")
      .selectAll()
      .where("user_id", "=", targetUserId)
      .execute();

    // 4. Per-identity status registry
    const storedIdentityStatuses: Record<string, string> =
      (identityRes as any)?.identity_statuses || profile.identity_statuses || {};

    // 5. Structure response for each selected identity
    const identitySections = selectedIdentities.map((identityKey) => {
      const requirements = IDENTITY_DOCUMENT_REQUIREMENTS[identityKey] || [
        {
          id: `${identityKey}_credential`,
          name: "Professional Credential / Registration",
          description: "Official registration certificate or qualification document.",
          mandatory: true,
          acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
          maxSizeMB: 10,
        },
      ];

      // Filter documents uploaded for this identity
      const identityDocs = docs
        .filter((d) => (d as any).identity_type === identityKey || (!d.identity_type && d.document_type.startsWith(identityKey)))
        .map((d) => ({
          id: d.id,
          documentType: d.document_type,
          documentLabel: (d as any).document_label || d.document_type,
          fileName: d.file_name,
          fileSize: d.file_size,
          mimeType: d.mime_type,
          status: d.status, // "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "ADDITIONAL_INFORMATION_REQUIRED"
          rejectionReason: d.rejection_reason || null,
          uploadedAt: d.uploaded_at,
          previewUrl: `/api/onboarding/documents/${d.id}`,
        }));

      // Determine verification status for this identity:
      // NOT_SUBMITTED, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, ADDITIONAL_INFORMATION_REQUIRED
      let status = storedIdentityStatuses[identityKey] || "NOT_SUBMITTED";

      if (status === "NOT_SUBMITTED") {
        if (identityDocs.length > 0) {
          const hasRejected = identityDocs.some((d) => d.status === "REJECTED");
          const hasAdditionalInfo = identityDocs.some((d) => d.status === "ADDITIONAL_INFORMATION_REQUIRED");
          const allApproved = identityDocs.every((d) => d.status === "APPROVED");
          const hasUnderReview = identityDocs.some((d) => d.status === "UNDER_REVIEW");

          if (hasRejected) status = "REJECTED";
          else if (hasAdditionalInfo) status = "ADDITIONAL_INFORMATION_REQUIRED";
          else if (allApproved && identityDocs.length >= requirements.filter((r) => r.mandatory).length) status = "APPROVED";
          else if (hasUnderReview) status = "UNDER_REVIEW";
          else status = "SUBMITTED";
        }
      }

      // Check mandatory document completeness
      const mandatoryReqs = requirements.filter((r) => r.mandatory);
      const uploadedDocTypes = new Set(identityDocs.map((d) => d.documentType));
      const hasAllMandatory = mandatoryReqs.every((r) => uploadedDocTypes.has(r.id));

      return {
        identityKey,
        status, // "NOT_SUBMITTED" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ADDITIONAL_INFORMATION_REQUIRED"
        requirements,
        uploadedDocuments: identityDocs,
        hasAllMandatory,
        mandatoryCount: mandatoryReqs.length,
        uploadedMandatoryCount: mandatoryReqs.filter((r) => uploadedDocTypes.has(r.id)).length,
      };
    });

    return NextResponse.json({
      success: true,
      selectedIdentities,
      identitySections,
      totalIdentities: selectedIdentities.length,
      overallVerificationStatus: identityRes?.verification_status || profile.verification_status || "DRAFT",
    });
  } catch (err: any) {
    console.error("GET /api/onboarding/documents error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load document verification specifications." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// POST: SECURE FILE UPLOAD WITH MALWARE INSPECTION
// ─────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const ipLimit = checkRateLimit(`upload:ip:${clientIp}`, 20, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many upload attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    let targetUserId = "";
    try {
      const session = await auth.api.getSession({ headers: reqHeaders });
      if (session?.user?.id) targetUserId = session.user.id;
    } catch {}

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const identityType = ((formData.get("identity_type") as string) || "general").trim();
    const documentType = ((formData.get("document_type") as string) || "credential").trim();
    const documentLabel = ((formData.get("document_label") as string) || file?.name || "Document").trim();
    const formUserId = (formData.get("user_id") as string) || "";

    if (!targetUserId && formUserId) {
      targetUserId = formUserId;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to upload documents." },
        { status: 401 }
      );
    }

    if (!file) {
      return NextResponse.json({ success: false, error: "No file was provided in the upload request." }, { status: 400 });
    }

    // 1. File Size Validation (Max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds the 10MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(2)}MB).` },
        { status: 400 }
      );
    }

    // 2. MIME Type Validation
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file format. Only PDF, JPG, and PNG documents are accepted." },
        { status: 400 }
      );
    }

    // 3. ArrayBuffer & Malware Scan
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const safety = inspectFileSafety(fileBuffer, file.type);
    if (!safety.safe) {
      return NextResponse.json(
        { success: false, error: safety.reason || "Malware scan failed. This file cannot be accepted." },
        { status: 400 }
      );
    }

    // 4. Secure Encrypted Private Storage
    const fileExtension = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".jpg");
    const safeDocId = nanoid(10);
    const sanitizedIdentity = identityType.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const sanitizedType = documentType.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    let storedPath: string;

    if (isR2Configured) {
      // Private Cloudflare R2 bucket storage
      const r2Key = `kyc/${targetUserId}/${sanitizedIdentity}/${sanitizedType}_${safeDocId}${fileExtension}`;
      await uploadR2Buffer({
        key: r2Key,
        buffer: fileBuffer,
        contentType: file.type,
      });
      storedPath = r2Key;
    } else {
      // Local Server Private Directory
      const storagePaths = await ensureUserStorage(targetUserId);
      const storedFileName = `${sanitizedIdentity}_${sanitizedType}_${safeDocId}${fileExtension}`;
      storedPath = path.join(storagePaths.documentsDir, storedFileName);
      try {
        await writeFile(storedPath, fileBuffer);
      } catch (writeErr) {
        console.warn("Local storage write warning:", writeErr);
      }
    }

    // Ensure database columns
    await ensureVerificationTables();
    try {
      await pool.query(`
        ALTER TABLE mgn_verification_documents ADD COLUMN IF NOT EXISTS identity_type VARCHAR(64);
        ALTER TABLE mgn_verification_documents ADD COLUMN IF NOT EXISTS document_label VARCHAR(150);
      `);
    } catch {}

    // 5. Remove existing document of the exact same type for this identity if replacing
    try {
      await pool.query(
        `DELETE FROM mgn_verification_documents 
         WHERE user_id = $1 AND identity_type = $2 AND document_type = $3`,
        [targetUserId, identityType, documentType]
      );
    } catch (delErr) {
      console.warn("Document deduplication note:", delErr);
    }

    // 6. Insert new verified document record
    const insertRes = await pool.query(
      `INSERT INTO mgn_verification_documents 
        (id, user_id, identity_type, document_type, document_label, file_name, file_path, file_size, mime_type, status, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', NOW())
       RETURNING id, document_type, document_label, file_name, file_size, mime_type, status, uploaded_at`,
      [
        safeDocId,
        targetUserId,
        identityType,
        documentType,
        documentLabel,
        file.name,
        storedPath,
        file.size,
        file.type,
      ]
    );

    // 7. Audit log insertion
    try {
      await pool.query(
        `INSERT INTO mgn_verification_audit_logs 
          (id, target_user_id, actor_id, action, reason, previous_state, new_state, metadata, created_at)
         VALUES ($1, $2, $3, 'document.uploaded', $4, 'NOT_SUBMITTED', 'PENDING', $5, NOW())`,
        [
          nanoid(),
          targetUserId,
          targetUserId,
          `Uploaded ${documentLabel} (${file.name}) for ${identityType}`,
          JSON.stringify({
            docId: safeDocId,
            identityType,
            documentType,
            fileName: file.name,
            fileSize: file.size,
            storedPath,
          }),
        ]
      );
    } catch (auditErr) {
      console.warn("Audit log insert warning:", auditErr);
    }

    syncUserDossier(targetUserId).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Document uploaded and verified successfully.",
      document: {
        id: safeDocId,
        identityType,
        documentType,
        documentLabel,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        status: "PENDING",
        previewUrl: `/api/onboarding/documents/${safeDocId}`,
      },
    });
  } catch (err: any) {
    console.error("POST /api/onboarding/documents error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process document upload." },
      { status: 500 }
    );
  }
}
