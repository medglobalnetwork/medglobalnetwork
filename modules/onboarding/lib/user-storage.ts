// ============================================================
// MGN User Storage & Dossier Manager
// modules/onboarding/lib/user-storage.ts
//
// Manages dedicated per-user storage directories (private_storage/users/<userId>/)
// with serverless environment compatibility (Vercel /tmp fallback).
// ============================================================

import path from "path";
import os from "os";
import { mkdir, writeFile } from "fs/promises";
import { verifDb } from "./verification-db";

export interface UserStoragePaths {
  rootDir: string;
  documentsDir: string;
  profileDir: string;
  metadataJsonPath: string;
  summaryTxtPath: string;
}

/**
 * Returns filesystem paths for a user's dedicated storage workspace.
 * Automatically selects /tmp on Vercel/Serverless environments to prevent read-only filesystem errors.
 */
export function getUserStoragePaths(userId: string): UserStoragePaths {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const baseStorageDir = isServerless
    ? path.join(os.tmpdir(), "mgn_private_storage")
    : path.join(process.cwd(), "private_storage");

  const rootDir = path.join(baseStorageDir, "users", userId);
  const documentsDir = path.join(rootDir, "documents");
  const profileDir = path.join(rootDir, "profile");
  const metadataJsonPath = path.join(rootDir, "metadata.json");
  const summaryTxtPath = path.join(rootDir, "summary.txt");

  return {
    rootDir,
    documentsDir,
    profileDir,
    metadataJsonPath,
    summaryTxtPath,
  };
}

/**
 * Ensures that the user's root, documents, and profile directories exist.
 */
export async function ensureUserStorage(userId: string): Promise<UserStoragePaths> {
  const paths = getUserStoragePaths(userId);
  try {
    await mkdir(paths.documentsDir, { recursive: true });
    await mkdir(paths.profileDir, { recursive: true });
  } catch (err) {
    console.warn(`Warning: Could not create local storage directory for user ${userId}:`, err);
  }
  return paths;
}

/**
 * Compiles a complete dossier for the user and writes `metadata.json` and `summary.txt`
 * to the user's dedicated storage folder.
 */
export async function syncUserDossier(userId: string): Promise<void> {
  try {
    const paths = await ensureUserStorage(userId);

    const user = await verifDb
      .selectFrom("user")
      .select(["id", "name", "email", "image", "role"])
      .where("id", "=", userId)
      .executeTakeFirst();

    const identity = await verifDb
      .selectFrom("mgn_identities")
      .selectAll()
      .where("user_id", "=", userId)
      .executeTakeFirst();

    const documents = await verifDb
      .selectFrom("mgn_verification_documents")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();

    const titles = await verifDb
      .selectFrom("mgn_professional_titles")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();

    const qualifications = await verifDb
      .selectFrom("mgn_qualifications")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();

    const registrations = await verifDb
      .selectFrom("mgn_registrations")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();

    const auditLogs = await verifDb
      .selectFrom("mgn_verification_audit_logs")
      .selectAll()
      .where("target_user_id", "=", userId)
      .orderBy("created_at", "desc")
      .execute();

    const dossier = {
      generated_at: new Date().toISOString(),
      user: user || { id: userId },
      identity: identity || null,
      claimed_titles: titles || [],
      qualifications: qualifications || [],
      council_registrations: registrations || [],
      documents: documents.map((doc) => ({
        id: doc.id,
        document_type: doc.document_type,
        original_filename: doc.file_name,
        file_path: doc.file_path,
        file_size_bytes: doc.file_size,
        mime_type: doc.mime_type,
        status: doc.status,
        uploaded_at: doc.uploaded_at,
      })),
      audit_history: auditLogs || [],
    };

    // 1. Write structured JSON metadata (graceful on serverless)
    try {
      await writeFile(paths.metadataJsonPath, JSON.stringify(dossier, null, 2), "utf-8");
    } catch (writeErr) {
      console.warn("Could not write metadata.json to disk:", writeErr);
    }

    // 2. Write human-readable summary text file
    const fullName = [identity?.legal_first_name, identity?.legal_last_name].filter(Boolean).join(" ") || user?.name || "N/A";
    const summaryText = `================================================================================
MGN.LIFE USER PROFILE & VERIFICATION DOSSIER
User ID: ${userId}
Generated: ${new Date().toLocaleString()}
================================================================================

1. ACCOUNT & IDENTITY
--------------------------------------------------------------------------------
- Full Name:           ${fullName}
- Display Name:        ${identity?.display_name || "N/A"}
- Email:               ${user?.email || identity?.official_email || "N/A"}
- Account Type:        ${identity?.account_type || "N/A"}
- Category:            ${identity?.category || "N/A"}
- Profession/Type:     ${identity?.profession_or_type || "N/A"}
- Location:            ${[identity?.city, identity?.state, identity?.country].filter(Boolean).join(", ") || "N/A"}
- Organization:        ${identity?.current_organization || "N/A"}
- Specialization:      ${identity?.specialization || "N/A"}
- Experience (Years):  ${identity?.experience_years ?? "N/A"}

2. VERIFICATION STATUS
--------------------------------------------------------------------------------
- Current Status:      ${identity?.verification_status || "PENDING"}
- Enrolled At:         ${identity?.enrolled_at ? new Date(identity.enrolled_at).toLocaleString() : "N/A"}
- 72h Deadline:        ${identity?.verification_deadline ? new Date(identity.verification_deadline).toLocaleString() : "N/A"}
- Submitted At:        ${identity?.submitted_at ? new Date(identity.submitted_at).toLocaleString() : "N/A"}
- Reviewed At:         ${identity?.reviewed_at ? new Date(identity.reviewed_at).toLocaleString() : "N/A"}
- Reviewed By (Admin): ${identity?.reviewed_by || "N/A"}
- Correction Notes:    ${identity?.correction_reason || "None"}
- Rejection Notes:     ${identity?.rejection_reason || "None"}

3. PROFESSIONAL TITLES & CREDENTIALS
--------------------------------------------------------------------------------
${titles.length > 0 ? titles.map((t) => `- [${t.status}] ${t.title_type}: ${t.claimed_title} (Verified: ${t.verified_title || "Pending"})`).join("\n") : "None claimed."}

4. REGULATORY / MEDICAL COUNCIL REGISTRATIONS
--------------------------------------------------------------------------------
${registrations.length > 0 ? registrations.map((r) => `- [${r.status}] Council: ${r.council_name} | Number: ${r.registration_number} | State: ${r.state_or_jurisdiction || "National"}`).join("\n") : "None provided."}

5. EDUCATIONAL QUALIFICATIONS
--------------------------------------------------------------------------------
${qualifications.length > 0 ? qualifications.map((q) => `- [${q.status}] ${q.degree} (${q.graduation_year || "N/A"}) - ${q.institution}`).join("\n") : "None provided."}

6. STORED KYC DOCUMENTS (Folder: private_storage/users/${userId}/documents/)
--------------------------------------------------------------------------------
${documents.length > 0 ? documents.map((d) => `- [${d.status}] ${d.document_type}: ${d.file_name} (${(d.file_size / 1024 / 1024).toFixed(2)} MB)\n  Path: ${d.file_path}`).join("\n") : "No documents uploaded."}

7. RECENT AUDIT TRAIL
--------------------------------------------------------------------------------
${auditLogs.slice(0, 10).map((l) => `[${new Date(l.created_at).toLocaleString()}] ${l.action} (by ${l.actor_id}): ${l.reason || "N/A"}`).join("\n")}
================================================================================
`;

    try {
      await writeFile(paths.summaryTxtPath, summaryText, "utf-8");
    } catch (writeErr) {
      console.warn("Could not write summary.txt to disk:", writeErr);
    }
  } catch (err) {
    console.error(`Error syncing user dossier for ${userId}:`, err);
  }
}
