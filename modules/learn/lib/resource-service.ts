// ============================================================
// MGN.life Phase 4: Learning Content & Resource Platform Service
// modules/learn/lib/resource-service.ts
// ============================================================

import { resourceDb, ensureResourceTables } from "./resource-db";
import {
  LearningResource,
  ResourceType,
  ResourceLifecycleStatus,
  ResourcePermission,
  ResourceVersion,
  ResourceAccessSession,
  ResourceAnalyticsSummary,
  ResourceNativeNotePayload,
} from "../types";
import { generateId } from "@/modules/network/lib/network-db";
import { sql } from "kysely";
import crypto from "crypto";
import { r2Client, isR2Configured, getR2PublicUrl } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { serverConfig } from "@/lib/env";

const bucketName = serverConfig.r2.bucketName;

export interface CreateResourceInput {
  instructorId: string;
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  title: string;
  description?: string | null;
  resourceType: ResourceType;
  category?: string;
  tags?: string[];
  status?: ResourceLifecycleStatus;
  fileUrl?: string | null;
  storageKey?: string | null;
  fileSizeBytes?: number | null;
  mimeType?: string | null;
  originalFilename?: string | null;
  pageCount?: number | null;
  durationSeconds?: number | null;
  dimensions?: { width: number; height: number } | null;
  thumbnailUrl?: string | null;
  isPinned?: boolean;
  isPublic?: boolean;
  copyrightDeclared?: boolean;
  nativeContent?: ResourceNativeNotePayload | null;
  availableFrom?: string | null;
  availableUntil?: string | null;
  permissions?: Partial<ResourcePermission>;
}

export interface UpdateResourceInput {
  title?: string;
  description?: string | null;
  category?: string;
  tags?: string[];
  status?: ResourceLifecycleStatus;
  thumbnailUrl?: string | null;
  isPinned?: boolean;
  isPublic?: boolean;
  availableFrom?: string | null;
  availableUntil?: string | null;
  pageCount?: number | null;
  durationSeconds?: number | null;
  nativeContent?: ResourceNativeNotePayload | null;
}

export interface CreateVersionInput {
  fileUrl?: string | null;
  storageKey?: string | null;
  fileSizeBytes?: number | null;
  mimeType?: string | null;
  changeNote: string;
  nativeContent?: ResourceNativeNotePayload | null;
  pageCount?: number | null;
  durationSeconds?: number | null;
}

// ─────────────────────────────────────────────
// 1. RESOURCE CREATION & LIFECYCLE
// ─────────────────────────────────────────────

export async function createResource(input: CreateResourceInput): Promise<LearningResource> {
  await ensureResourceTables();

  const id = generateId();
  const versionId = generateId();
  const permId = generateId();
  const now = new Date();

  const status: ResourceLifecycleStatus = input.status || "PUBLISHED";
  const tagsJson = input.tags ? JSON.stringify(input.tags) : null;
  const dimensionsJson = input.dimensions ? JSON.stringify(input.dimensions) : null;
  const nativeContentJson = input.nativeContent ? JSON.stringify(input.nativeContent) : null;

  // Insert main resource record
  await resourceDb
    .insertInto("learning_resources")
    .values({
      id,
      instructor_id: input.instructorId,
      course_id: input.courseId || null,
      module_id: input.moduleId || null,
      lesson_id: input.lessonId || null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      resource_type: input.resourceType,
      category: input.category || "Medical",
      tags: tagsJson,
      status,
      current_version: 1,
      file_url: input.fileUrl || null,
      storage_key: input.storageKey || null,
      file_size_bytes: input.fileSizeBytes ? BigInt(input.fileSizeBytes) : null,
      mime_type: input.mimeType || null,
      original_filename: input.originalFilename || null,
      page_count: input.pageCount || (input.resourceType === "pdf" ? 1 : null),
      duration_seconds: input.durationSeconds || null,
      dimensions_json: dimensionsJson,
      thumbnail_url: input.thumbnailUrl || null,
      is_pinned: input.isPinned ?? false,
      is_public: input.isPublic ?? false,
      copyright_declared: input.copyrightDeclared ?? true,
      native_content: nativeContentJson,
      available_from: input.availableFrom ? new Date(input.availableFrom) : null,
      available_until: input.availableUntil ? new Date(input.availableUntil) : null,
      created_at: now,
      updated_at: now,
    })
    .execute();

  // Create Version 1 record
  await resourceDb
    .insertInto("resource_versions")
    .values({
      id: versionId,
      resource_id: id,
      version_number: 1,
      storage_key: input.storageKey || null,
      file_url: input.fileUrl || null,
      file_size_bytes: input.fileSizeBytes ? BigInt(input.fileSizeBytes) : null,
      mime_type: input.mimeType || null,
      change_note: "Initial version release",
      native_content: nativeContentJson,
      created_by: input.instructorId,
      status: "published",
      created_at: now,
    })
    .execute();

  // Create Resource Permissions
  const perm = input.permissions || {};
  await resourceDb
    .insertInto("resource_permissions")
    .values({
      id: permId,
      resource_id: id,
      course_id: input.courseId || null,
      module_id: input.moduleId || null,
      lesson_id: input.lessonId || null,
      allow_view: perm.allow_view ?? true,
      allow_download: perm.allow_download ?? false,
      allow_print: perm.allow_print ?? false,
      allow_copy: perm.allow_copy ?? false,
      allow_offline: perm.allow_offline ?? false,
      access_duration_type: perm.access_duration_type || "while_enrolled",
      access_valid_until: perm.access_valid_until ? new Date(perm.access_valid_until) : null,
      access_days: perm.access_days || null,
      created_at: now,
      updated_at: now,
    })
    .execute();

  // Audit Log
  await logResourceAudit(id, input.instructorId, "CREATE", {
    title: input.title,
    resourceType: input.resourceType,
    status,
    initialPermissions: perm,
  });

  return getResourceById(id) as Promise<LearningResource>;
}

// ─────────────────────────────────────────────
// 2. RESOURCE RETRIEVAL & MAPPING
// ─────────────────────────────────────────────

export async function getResourceById(
  resourceId: string,
  userId?: string
): Promise<LearningResource | null> {
  await ensureResourceTables();

  const row = await resourceDb
    .selectFrom("learning_resources")
    .selectAll()
    .where("id", "=", resourceId)
    .executeTakeFirst();

  if (!row) return null;

  // Fetch permissions
  const permRow = await resourceDb
    .selectFrom("resource_permissions")
    .selectAll()
    .where("resource_id", "=", resourceId)
    .executeTakeFirst();

  // Check if bookmarked by userId
  let isBookmarked = false;
  if (userId) {
    const bm = await resourceDb
      .selectFrom("resource_bookmarks")
      .select("id")
      .where("resource_id", "=", resourceId)
      .where("user_id", "=", userId)
      .executeTakeFirst();
    isBookmarked = !!bm;
  }

  // Instructor profile
  const instructor = await resourceDb
    .selectFrom("user")
    .select(["id", "name", "email", "image"])
    .where("id", "=", row.instructor_id)
    .executeTakeFirst();

  // Policy evaluation if user provided
  let effectivePolicy;
  if (userId) {
    effectivePolicy = await evaluateEffectivePermission(userId, resourceId);
  }

  let tags: string[] = [];
  if (row.tags) {
    try {
      tags = JSON.parse(row.tags);
    } catch {
      tags = [];
    }
  }

  let dimensions = null;
  if (row.dimensions_json) {
    try {
      dimensions = JSON.parse(row.dimensions_json);
    } catch {
      dimensions = null;
    }
  }

  let nativeContent = null;
  if (row.native_content) {
    try {
      nativeContent = JSON.parse(row.native_content);
    } catch {
      nativeContent = null;
    }
  }

  return {
    id: row.id,
    instructor_id: row.instructor_id,
    course_id: row.course_id,
    module_id: row.module_id,
    lesson_id: row.lesson_id,
    title: row.title,
    description: row.description,
    resource_type: row.resource_type as ResourceType,
    category: row.category,
    tags,
    status: row.status as ResourceLifecycleStatus,
    current_version: row.current_version,
    file_url: row.file_url,
    storage_key: row.storage_key,
    file_size_bytes: row.file_size_bytes ? Number(row.file_size_bytes) : null,
    mime_type: row.mime_type,
    original_filename: row.original_filename,
    page_count: row.page_count,
    duration_seconds: row.duration_seconds,
    dimensions,
    thumbnail_url: row.thumbnail_url,
    is_pinned: row.is_pinned,
    is_public: row.is_public,
    copyright_declared: row.copyright_declared,
    native_content: nativeContent,
    available_from: row.available_from ? new Date(row.available_from).toISOString() : null,
    available_until: row.available_until ? new Date(row.available_until).toISOString() : null,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString(),
    instructor: instructor ? { ...instructor, image: instructor.image || null } : undefined,
    permissions: permRow
      ? {
          id: permRow.id,
          resource_id: permRow.resource_id,
          course_id: permRow.course_id,
          module_id: permRow.module_id,
          lesson_id: permRow.lesson_id,
          allow_view: permRow.allow_view,
          allow_download: permRow.allow_download,
          allow_print: permRow.allow_print,
          allow_copy: permRow.allow_copy,
          allow_offline: permRow.allow_offline,
          access_duration_type: permRow.access_duration_type as any,
          access_valid_until: permRow.access_valid_until
            ? new Date(permRow.access_valid_until).toISOString()
            : null,
          access_days: permRow.access_days,
        }
      : undefined,
    effective_policy: effectivePolicy,
    is_bookmarked: isBookmarked,
  };
}

// ─────────────────────────────────────────────
// 3. ACCESS CONTROL ENGINE & PERMISSION INHERITANCE
// ─────────────────────────────────────────────

export interface EffectivePolicyResult {
  canView: boolean;
  canDownload: boolean;
  canPrint: boolean;
  canCopy: boolean;
  canOffline: boolean;
  reason?: string;
  isInstructor?: boolean;
}

export async function evaluateEffectivePermission(
  userId: string,
  resourceId: string
): Promise<EffectivePolicyResult> {
  await ensureResourceTables();

  const resource = await resourceDb
    .selectFrom("learning_resources")
    .selectAll()
    .where("id", "=", resourceId)
    .executeTakeFirst();

  if (!resource) {
    return {
      canView: false,
      canDownload: false,
      canPrint: false,
      canCopy: false,
      canOffline: false,
      reason: "Resource not found",
    };
  }

  // Check if user is the resource creator
  const isCreator = resource.instructor_id === userId;
  if (isCreator) {
    return {
      canView: true,
      canDownload: true,
      canPrint: true,
      canCopy: true,
      canOffline: true,
      isInstructor: true,
      reason: "Resource creator full access",
    };
  }

  // Check if user is the course instructor
  if (resource.course_id) {
    const course = await resourceDb
      .selectFrom("courses")
      .select("instructor_id")
      .where("id", "=", resource.course_id)
      .executeTakeFirst();

    if (course && course.instructor_id === userId) {
      return {
        canView: true,
        canDownload: true,
        canPrint: true,
        canCopy: true,
        canOffline: true,
        isInstructor: true,
        reason: "Course instructor full access",
      };
    }
  }

  // Quarantined / Rejected / Processing Failed resources cannot be viewed by general users
  if (
    ["QUARANTINED", "REJECTED", "PROCESSING_FAILED", "SCAN_FAILED", "ARCHIVED"].includes(
      resource.status
    )
  ) {
    return {
      canView: false,
      canDownload: false,
      canPrint: false,
      canCopy: false,
      canOffline: false,
      reason: `Resource is currently ${resource.status.toLowerCase()}`,
    };
  }

  // Check Resource Availability Window
  const now = new Date();
  if (resource.available_from && new Date(resource.available_from) > now) {
    return {
      canView: false,
      canDownload: false,
      canPrint: false,
      canCopy: false,
      canOffline: false,
      reason: `Resource will be available starting ${new Date(resource.available_from).toLocaleDateString()}`,
    };
  }

  if (resource.available_until && new Date(resource.available_until) < now) {
    return {
      canView: false,
      canDownload: false,
      canPrint: false,
      canCopy: false,
      canOffline: false,
      reason: `Resource expired on ${new Date(resource.available_until).toLocaleDateString()}`,
    };
  }

  // Check Course Enrollment if attached to a course and not marked public
  let userEnrollment: { id: string; status: string; created_at?: Date } | null = null;
  if (resource.course_id && !resource.is_public) {
    const enrollment = await resourceDb
      .selectFrom("course_enrollments")
      .select(["id", "status", "created_at"])
      .where("course_id", "=", resource.course_id)
      .where("user_id", "=", userId)
      .executeTakeFirst();

    if (!enrollment || enrollment.status !== "active") {
      return {
        canView: false,
        canDownload: false,
        canPrint: false,
        canCopy: false,
        canOffline: false,
        reason: "Course enrollment required",
      };
    }
    userEnrollment = enrollment;
  }

  // Resolve Permission Hierarchy:
  // 1. Resource Specific Policy
  // 2. Lesson Default Policy
  // 3. Module Default Policy
  // 4. Course Default Policy
  // 5. System Fallback: View=true, Download=false

  let policy = await resourceDb
    .selectFrom("resource_permissions")
    .selectAll()
    .where("resource_id", "=", resourceId)
    .executeTakeFirst();

  if (!policy && resource.lesson_id) {
    policy = await resourceDb
      .selectFrom("resource_permissions")
      .selectAll()
      .where("lesson_id", "=", resource.lesson_id)
      .where("resource_id", "is", null)
      .executeTakeFirst();
  }

  if (!policy && resource.module_id) {
    policy = await resourceDb
      .selectFrom("resource_permissions")
      .selectAll()
      .where("module_id", "=", resource.module_id)
      .where("resource_id", "is", null)
      .executeTakeFirst();
  }

  if (!policy && resource.course_id) {
    policy = await resourceDb
      .selectFrom("resource_permissions")
      .selectAll()
      .where("course_id", "=", resource.course_id)
      .where("resource_id", "is", null)
      .executeTakeFirst();
  }

  // Check policy duration restrictions if specified
  if (policy) {
    if (
      policy.access_duration_type === "until_date" &&
      policy.access_valid_until &&
      new Date(policy.access_valid_until) < now
    ) {
      return {
        canView: false,
        canDownload: false,
        canPrint: false,
        canCopy: false,
        canOffline: false,
        reason: `Resource access expired on ${new Date(policy.access_valid_until).toLocaleDateString()}`,
      };
    }

    if (
      policy.access_duration_type === "custom_days" &&
      policy.access_days &&
      userEnrollment?.created_at
    ) {
      const enrollmentDate = new Date(userEnrollment.created_at);
      const accessExpireDate = new Date(
        enrollmentDate.getTime() + policy.access_days * 24 * 60 * 60 * 1000
      );
      if (now > accessExpireDate) {
        return {
          canView: false,
          canDownload: false,
          canPrint: false,
          canCopy: false,
          canOffline: false,
          reason: `Your ${policy.access_days}-day resource access window has expired`,
        };
      }
    }
  }

  const allowView = policy ? policy.allow_view : true;
  const allowDownload = policy ? policy.allow_download : false;
  const allowPrint = policy ? policy.allow_print : false;
  const allowCopy = policy ? policy.allow_copy : false;
  const allowOffline = policy ? policy.allow_offline : false;

  return {
    canView: allowView,
    canDownload: allowDownload,
    canPrint: allowPrint,
    canCopy: allowCopy,
    canOffline: allowOffline,
    isInstructor: false,
  };
}

// ─────────────────────────────────────────────
// 4. SECURE VIEW SESSIONS & CLOUDFLARE R2 SIGNED ACCESS
// ─────────────────────────────────────────────

export async function createViewSession(
  userId: string,
  resourceId: string,
  lessonId?: string | null,
  courseId?: string | null
): Promise<ResourceAccessSession> {
  await ensureResourceTables();

  const resource = await resourceDb
    .selectFrom("learning_resources")
    .selectAll()
    .where("id", "=", resourceId)
    .executeTakeFirst();

  if (!resource) throw new Error("Resource not found");

  const policy = await evaluateEffectivePermission(userId, resourceId);
  if (!policy.canView) {
    throw new Error(policy.reason || "You do not have permission to view this resource.");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour session
  const sessionId = generateId();

  await resourceDb
    .insertInto("resource_access_sessions")
    .values({
      id: sessionId,
      user_id: userId,
      resource_id: resourceId,
      lesson_id: lessonId || resource.lesson_id || null,
      course_id: courseId || resource.course_id || null,
      session_token_hash: tokenHash,
      access_type: "VIEW",
      created_at: new Date(),
      expires_at: expiresAt,
    })
    .execute();

  // Record initial view event
  await resourceDb
    .insertInto("resource_views")
    .values({
      id: generateId(),
      resource_id: resourceId,
      user_id: userId,
      lesson_id: lessonId || resource.lesson_id || null,
      course_id: courseId || resource.course_id || null,
      view_duration_seconds: 0,
      page_reached: 1,
      completed: false,
      created_at: new Date(),
    })
    .execute();

  // Generate short-lived signed R2 URL if storageKey exists
  let signedUrl: string | null = null;
  if (resource.storage_key && bucketName) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: resource.storage_key,
      });
      signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    } catch (err) {
      console.warn("Signed URL generation fallback:", err);
      signedUrl = resource.file_url || null;
    }
  } else {
    signedUrl = resource.file_url || null;
  }

  return {
    id: sessionId,
    sessionToken: rawToken,
    resourceId: resource.id,
    accessType: "VIEW",
    expiresAt: expiresAt.toISOString(),
    signedUrl,
    permissions: {
      allowView: policy.canView,
      allowDownload: policy.canDownload,
      allowPrint: policy.canPrint,
      allowCopy: policy.canCopy,
      allowOffline: policy.canOffline,
    },
  };
}

// ─────────────────────────────────────────────
// 5. SECURE DOWNLOAD AUTHORIZATION & TRACKING
// ─────────────────────────────────────────────

export async function authorizeDownload(
  userId: string,
  resourceId: string,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<{ downloadUrl: string; fileName: string; mimeType: string }> {
  await ensureResourceTables();

  const resource = await resourceDb
    .selectFrom("learning_resources")
    .selectAll()
    .where("id", "=", resourceId)
    .executeTakeFirst();

  if (!resource) throw new Error("Resource not found");

  const policy = await evaluateEffectivePermission(userId, resourceId);
  if (!policy.canDownload) {
    throw new Error("403: Download is not permitted for this learning resource.");
  }

  // Record Download Analytics Event
  await resourceDb
    .insertInto("resource_downloads")
    .values({
      id: generateId(),
      resource_id: resourceId,
      user_id: userId,
      lesson_id: resource.lesson_id || null,
      course_id: resource.course_id || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      created_at: new Date(),
    })
    .execute();

  // Audit Log
  await logResourceAudit(resourceId, userId, "DOWNLOAD", {
    ipAddress,
  });

  const fileName = resource.original_filename || `${resource.title.replace(/[^a-z0-9]/gi, "_")}.${resource.resource_type === "pdf" ? "pdf" : "dat"}`;
  const mimeType = resource.mime_type || "application/octet-stream";

  let downloadUrl = resource.file_url || "";
  if (resource.storage_key && bucketName) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: resource.storage_key,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
      });
      downloadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });
    } catch {
      downloadUrl = resource.file_url || "";
    }
  }

  return { downloadUrl, fileName, mimeType };
}

// ─────────────────────────────────────────────
// 6. VERSIONING SYSTEM
// ─────────────────────────────────────────────

export async function createNewVersion(
  resourceId: string,
  input: CreateVersionInput,
  userId: string
): Promise<ResourceVersion> {
  await ensureResourceTables();

  const resource = await resourceDb
    .selectFrom("learning_resources")
    .selectAll()
    .where("id", "=", resourceId)
    .executeTakeFirst();

  if (!resource) throw new Error("Resource not found");

  const newVersionNumber = (resource.current_version || 1) + 1;
  const versionId = generateId();
  const now = new Date();
  const nativeContentJson = input.nativeContent ? JSON.stringify(input.nativeContent) : null;

  // Insert version entry
  await resourceDb
    .insertInto("resource_versions")
    .values({
      id: versionId,
      resource_id: resourceId,
      version_number: newVersionNumber,
      storage_key: input.storageKey || resource.storage_key,
      file_url: input.fileUrl || resource.file_url,
      file_size_bytes: input.fileSizeBytes ? BigInt(input.fileSizeBytes) : resource.file_size_bytes,
      mime_type: input.mimeType || resource.mime_type,
      change_note: input.changeNote.trim(),
      native_content: nativeContentJson || resource.native_content,
      created_by: userId,
      status: "published",
      created_at: now,
    })
    .execute();

  // Update learning_resources with new active version
  await resourceDb
    .updateTable("learning_resources")
    .set({
      current_version: newVersionNumber,
      file_url: input.fileUrl || resource.file_url,
      storage_key: input.storageKey || resource.storage_key,
      file_size_bytes: input.fileSizeBytes ? BigInt(input.fileSizeBytes) : resource.file_size_bytes,
      mime_type: input.mimeType || resource.mime_type,
      page_count: input.pageCount || resource.page_count,
      duration_seconds: input.durationSeconds || resource.duration_seconds,
      native_content: nativeContentJson || resource.native_content,
      status: "PUBLISHED",
      updated_at: now,
    })
    .where("id", "=", resourceId)
    .execute();

  // Audit Log
  await logResourceAudit(resourceId, userId, "PUBLISH", {
    version: newVersionNumber,
    changeNote: input.changeNote,
  });

  return {
    id: versionId,
    resource_id: resourceId,
    version_number: newVersionNumber,
    storage_key: input.storageKey || resource.storage_key,
    file_url: input.fileUrl || resource.file_url,
    file_size_bytes: input.fileSizeBytes || (resource.file_size_bytes ? Number(resource.file_size_bytes) : null),
    mime_type: input.mimeType || resource.mime_type,
    change_note: input.changeNote,
    native_content: nativeContentJson,
    created_by: userId,
    status: "published",
    created_at: now.toISOString(),
  };
}

export async function getResourceVersions(resourceId: string): Promise<ResourceVersion[]> {
  await ensureResourceTables();

  const rows = await resourceDb
    .selectFrom("resource_versions")
    .selectAll()
    .where("resource_id", "=", resourceId)
    .orderBy("version_number", "desc")
    .execute();

  return rows.map((r: any) => ({
    id: r.id,
    resource_id: r.resource_id,
    version_number: r.version_number,
    storage_key: r.storage_key,
    file_url: r.file_url,
    file_size_bytes: r.file_size_bytes ? Number(r.file_size_bytes) : null,
    mime_type: r.mime_type,
    change_note: r.change_note,
    native_content: r.native_content,
    created_by: r.created_by,
    status: r.status,
    created_at: new Date(r.created_at).toISOString(),
  }));
}

// ─────────────────────────────────────────────
// 7. PERMISSION MATRIX MANAGEMENT
// ─────────────────────────────────────────────

export async function updateResourcePermissions(
  resourceId: string,
  perm: Partial<ResourcePermission>,
  userId: string
): Promise<ResourcePermission> {
  await ensureResourceTables();

  const existing = await resourceDb
    .selectFrom("resource_permissions")
    .selectAll()
    .where("resource_id", "=", resourceId)
    .executeTakeFirst();

  const now = new Date();

  if (existing) {
    await resourceDb
      .updateTable("resource_permissions")
      .set({
        allow_view: perm.allow_view ?? existing.allow_view,
        allow_download: perm.allow_download ?? existing.allow_download,
        allow_print: perm.allow_print ?? existing.allow_print,
        allow_copy: perm.allow_copy ?? existing.allow_copy,
        allow_offline: perm.allow_offline ?? existing.allow_offline,
        access_duration_type: perm.access_duration_type || existing.access_duration_type,
        access_valid_until: perm.access_valid_until ? new Date(perm.access_valid_until) : existing.access_valid_until,
        access_days: perm.access_days ?? existing.access_days,
        updated_at: now,
      })
      .where("resource_id", "=", resourceId)
      .execute();
  } else {
    await resourceDb
      .insertInto("resource_permissions")
      .values({
        id: generateId(),
        resource_id: resourceId,
        allow_view: perm.allow_view ?? true,
        allow_download: perm.allow_download ?? false,
        allow_print: perm.allow_print ?? false,
        allow_copy: perm.allow_copy ?? false,
        allow_offline: perm.allow_offline ?? false,
        access_duration_type: perm.access_duration_type || "while_enrolled",
        access_valid_until: perm.access_valid_until ? new Date(perm.access_valid_until) : null,
        access_days: perm.access_days || null,
        created_at: now,
        updated_at: now,
      })
      .execute();
  }

  await logResourceAudit(resourceId, userId, "PERMISSION_CHANGE", perm);

  const updated = await resourceDb
    .selectFrom("resource_permissions")
    .selectAll()
    .where("resource_id", "=", resourceId)
    .executeTakeFirst();

  if (!updated) {
    throw new Error("Failed to update resource permissions");
  }

  return {
    id: updated.id,
    resource_id: updated.resource_id,
    allow_view: updated.allow_view,
    allow_download: updated.allow_download,
    allow_print: updated.allow_print,
    allow_copy: updated.allow_copy,
    allow_offline: updated.allow_offline,
    access_duration_type: updated.access_duration_type as any,
    access_valid_until: updated.access_valid_until ? new Date(updated.access_valid_until).toISOString() : null,
    access_days: updated.access_days,
  };
}

// ─────────────────────────────────────────────
// 8. RESOURCE UPDATES & PINNING & ARCHIVING
// ─────────────────────────────────────────────

export async function updateResource(
  resourceId: string,
  input: UpdateResourceInput,
  userId: string
): Promise<LearningResource> {
  await ensureResourceTables();

  const updates: any = {
    updated_at: new Date(),
  };

  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description?.trim() || null;
  if (input.category !== undefined) updates.category = input.category;
  if (input.tags !== undefined) updates.tags = JSON.stringify(input.tags);
  if (input.status !== undefined) updates.status = input.status;
  if (input.thumbnailUrl !== undefined) updates.thumbnail_url = input.thumbnailUrl;
  if (input.isPinned !== undefined) updates.is_pinned = input.isPinned;
  if (input.isPublic !== undefined) updates.is_public = input.isPublic;
  if (input.pageCount !== undefined) updates.page_count = input.pageCount;
  if (input.durationSeconds !== undefined) updates.duration_seconds = input.durationSeconds;
  if (input.availableFrom !== undefined)
    updates.available_from = input.availableFrom ? new Date(input.availableFrom) : null;
  if (input.availableUntil !== undefined)
    updates.available_until = input.availableUntil ? new Date(input.availableUntil) : null;
  if (input.nativeContent !== undefined)
    updates.native_content = input.nativeContent ? JSON.stringify(input.nativeContent) : null;

  await resourceDb
    .updateTable("learning_resources")
    .set(updates)
    .where("id", "=", resourceId)
    .execute();

  await logResourceAudit(resourceId, userId, "UPDATE", updates);

  return (await getResourceById(resourceId, userId))!;
}

export async function archiveResource(resourceId: string, userId: string): Promise<void> {
  await ensureResourceTables();

  await resourceDb
    .updateTable("learning_resources")
    .set({
      status: "ARCHIVED",
      updated_at: new Date(),
    })
    .where("id", "=", resourceId)
    .execute();

  await logResourceAudit(resourceId, userId, "ARCHIVE", {});
}

// ─────────────────────────────────────────────
// 9. LISTING, SEARCH & LESSON ATTACHMENTS
// ─────────────────────────────────────────────

export interface ListResourcesParams {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  resourceType?: ResourceType;
  query?: string;
  category?: string;
  isPinned?: boolean;
  instructorId?: string;
  userId?: string;
  status?: string;
}

export async function listResources(params: ListResourcesParams): Promise<LearningResource[]> {
  await ensureResourceTables();

  let query = resourceDb.selectFrom("learning_resources").selectAll();

  if (params.courseId) query = query.where("course_id", "=", params.courseId);
  if (params.moduleId) query = query.where("module_id", "=", params.moduleId);
  if (params.lessonId) query = query.where("lesson_id", "=", params.lessonId);
  if (params.resourceType) query = query.where("resource_type", "=", params.resourceType);
  if (params.category) query = query.where("category", "=", params.category);
  if (params.isPinned !== undefined) query = query.where("is_pinned", "=", params.isPinned);
  if (params.instructorId) query = query.where("instructor_id", "=", params.instructorId);
  if (params.status) query = query.where("status", "=", params.status);
  else query = query.where("status", "!=", "ARCHIVED");

  if (params.query?.trim()) {
    const q = `%${params.query.trim()}%`;
    query = query.where((eb) =>
      eb.or([
        eb("title", "ilike", q),
        eb("description", "ilike", q),
        eb("category", "ilike", q),
        eb("tags", "ilike", q),
      ])
    );
  }

  const rows = await query.orderBy("is_pinned", "desc").orderBy("created_at", "desc").execute();

  // Map to full models
  const results: LearningResource[] = [];
  for (const row of rows) {
    const full = await getResourceById(row.id, params.userId);
    if (full) results.push(full);
  }

  return results;
}

// ─────────────────────────────────────────────
// 10. BOOKMARKS & MY BOX INTEGRATION
// ─────────────────────────────────────────────

export async function toggleResourceBookmark(
  userId: string,
  resourceId: string,
  collectionId?: string | null,
  notes?: string | null
): Promise<{ bookmarked: boolean }> {
  await ensureResourceTables();

  const existing = await resourceDb
    .selectFrom("resource_bookmarks")
    .select("id")
    .where("user_id", "=", userId)
    .where("resource_id", "=", resourceId)
    .executeTakeFirst();

  if (existing) {
    await resourceDb
      .deleteFrom("resource_bookmarks")
      .where("id", "=", existing.id)
      .execute();
    return { bookmarked: false };
  } else {
    await resourceDb
      .insertInto("resource_bookmarks")
      .values({
        id: generateId(),
        user_id: userId,
        resource_id: resourceId,
        collection_id: collectionId || null,
        notes: notes?.trim() || null,
        created_at: new Date(),
      })
      .execute();
    return { bookmarked: true };
  }
}

export async function getMyBoxSavedResources(userId: string): Promise<LearningResource[]> {
  await ensureResourceTables();

  const rows = await resourceDb
    .selectFrom("resource_bookmarks")
    .innerJoin("learning_resources", "learning_resources.id", "resource_bookmarks.resource_id")
    .selectAll("learning_resources")
    .where("resource_bookmarks.user_id", "=", userId)
    .where("learning_resources.status", "!=", "ARCHIVED")
    .orderBy("resource_bookmarks.created_at", "desc")
    .execute();

  const results: LearningResource[] = [];
  for (const row of rows) {
    const full = await getResourceById(row.id, userId);
    if (full) results.push(full);
  }
  return results;
}

// ─────────────────────────────────────────────
// 11. MODERATION & REPORTS
// ─────────────────────────────────────────────

export async function reportResource(
  userId: string,
  resourceId: string,
  reason: "copyright" | "inappropriate" | "incorrect" | "malware" | "broken" | "other",
  details?: string | null
): Promise<{ reportId: string }> {
  await ensureResourceTables();

  const reportId = generateId();
  await resourceDb
    .insertInto("resource_reports")
    .values({
      id: reportId,
      resource_id: resourceId,
      user_id: userId,
      reason,
      details: details?.trim() || null,
      status: "pending",
      created_at: new Date(),
    })
    .execute();

  await logResourceAudit(resourceId, userId, "MODERATE", {
    reason,
    details,
  });

  return { reportId };
}

// ─────────────────────────────────────────────
// 12. RESOURCE ANALYTICS
// ─────────────────────────────────────────────

export async function getResourceAnalytics(
  resourceId: string
): Promise<ResourceAnalyticsSummary> {
  await ensureResourceTables();

  const resource = await resourceDb
    .selectFrom("learning_resources")
    .selectAll()
    .where("id", "=", resourceId)
    .executeTakeFirst();

  if (!resource) throw new Error("Resource not found");

  // Total views & unique viewers
  const viewStats = await resourceDb
    .selectFrom("resource_views")
    .select([
      sql<number>`count(id)::int`.as("total_views"),
      sql<number>`count(distinct user_id)::int`.as("unique_viewers"),
      sql<number>`coalesce(avg(view_duration_seconds), 0)::int`.as("avg_view_duration_seconds"),
      sql<number>`coalesce(avg(page_reached), 1)::int`.as("avg_reading_depth_page"),
    ])
    .where("resource_id", "=", resourceId)
    .executeTakeFirst();

  // Downloads
  const downloadStats = await resourceDb
    .selectFrom("resource_downloads")
    .select([
      sql<number>`count(id)::int`.as("total_downloads"),
      sql<number>`count(distinct user_id)::int`.as("unique_downloaders"),
    ])
    .where("resource_id", "=", resourceId)
    .executeTakeFirst();

  // Bookmarks
  const bookmarkStats = await resourceDb
    .selectFrom("resource_bookmarks")
    .select([sql<number>`count(id)::int`.as("total_bookmarks")])
    .where("resource_id", "=", resourceId)
    .executeTakeFirst();

  return {
    resource_id: resourceId,
    title: resource.title,
    resource_type: resource.resource_type as ResourceType,
    total_views: viewStats?.total_views || 0,
    unique_viewers: viewStats?.unique_viewers || 0,
    avg_view_duration_seconds: viewStats?.avg_view_duration_seconds || 0,
    total_downloads: downloadStats?.total_downloads || 0,
    unique_downloaders: downloadStats?.unique_downloaders || 0,
    total_bookmarks: bookmarkStats?.total_bookmarks || 0,
    avg_reading_depth_page: viewStats?.avg_reading_depth_page || 1,
    views_by_day: [],
    downloads_by_day: [],
  };
}

// ─────────────────────────────────────────────
// AUDIT LOGGER HELPER
// ─────────────────────────────────────────────

async function logResourceAudit(
  resourceId: string,
  userId: string,
  action: string,
  details: any
) {
  try {
    await resourceDb
      .insertInto("resource_audit_logs")
      .values({
        id: generateId(),
        resource_id: resourceId,
        user_id: userId,
        action,
        details_json: JSON.stringify(details),
        created_at: new Date(),
      })
      .execute();
  } catch (err) {
    console.error("Resource audit log failed:", err);
  }
}
