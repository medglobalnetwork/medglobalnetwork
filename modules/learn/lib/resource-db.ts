// ============================================================
// MGN.life Phase 4: Learn Ecosystem — Resource Database Layer
// modules/learn/lib/resource-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { Kysely, sql } from "kysely";
import { generateId } from "@/modules/network/lib/network-db";

const db = database as Kysely<any>;

// ─────────────────────────────────────────────
// DATABASE TABLE DEFINITIONS & INTERFACES
// ─────────────────────────────────────────────

export interface LearningResourceTable {
  id: string;
  instructor_id: string;
  course_id: string | null;
  module_id: string | null;
  lesson_id: string | null;
  title: string;
  description: string | null;
  resource_type: string; // 'pdf' | 'image' | 'notes' | 'presentation' | 'document' | 'case_study' | 'infographic' | 'audio' | 'link'
  category: string;
  tags: string | null; // JSON string array
  status: string; // 'UPLOAD' | 'VALIDATING' | 'SCANNING' | 'PROCESSING' | 'READY' | 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'UPDATED' | 'ARCHIVED' | 'PROCESSING_FAILED' | 'SCAN_FAILED' | 'REJECTED' | 'QUARANTINED'
  current_version: number;
  file_url: string | null;
  storage_key: string | null;
  file_size_bytes: bigint | number | null;
  mime_type: string | null;
  original_filename: string | null;
  page_count: number | null;
  duration_seconds: number | null;
  dimensions_json: string | null;
  thumbnail_url: string | null;
  is_pinned: boolean;
  is_public: boolean;
  copyright_declared: boolean;
  native_content: string | null; // JSON string for MGN Native Notes
  available_from: Date | null;
  available_until: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ResourceVersionTable {
  id: string;
  resource_id: string;
  version_number: number;
  storage_key: string | null;
  file_url: string | null;
  file_size_bytes: bigint | number | null;
  mime_type: string | null;
  change_note: string | null;
  native_content: string | null;
  created_by: string;
  status: string; // 'draft' | 'published' | 'archived'
  created_at: Date;
}

export interface ResourcePermissionTable {
  id: string;
  resource_id: string | null;
  course_id: string | null;
  lesson_id: string | null;
  module_id: string | null;
  allow_view: boolean;
  allow_download: boolean;
  allow_print: boolean;
  allow_copy: boolean;
  allow_offline: boolean;
  access_duration_type: string; // 'lifetime' | 'while_enrolled' | 'until_date' | 'custom_days'
  access_valid_until: Date | null;
  access_days: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface ResourceAccessSessionTable {
  id: string;
  user_id: string;
  resource_id: string;
  lesson_id: string | null;
  course_id: string | null;
  session_token_hash: string;
  access_type: string; // 'VIEW' | 'DOWNLOAD' | 'OFFLINE'
  created_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
}

export interface ResourceViewTable {
  id: string;
  resource_id: string;
  user_id: string;
  lesson_id: string | null;
  course_id: string | null;
  view_duration_seconds: number;
  page_reached: number;
  completed: boolean;
  created_at: Date;
}

export interface ResourceDownloadTable {
  id: string;
  resource_id: string;
  user_id: string;
  lesson_id: string | null;
  course_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export interface ResourceBookmarkTable {
  id: string;
  user_id: string;
  resource_id: string;
  collection_id: string | null;
  notes: string | null;
  created_at: Date;
}

export interface ResourceReportTable {
  id: string;
  resource_id: string;
  user_id: string;
  reason: string; // 'copyright' | 'inappropriate' | 'incorrect' | 'malware' | 'broken' | 'other'
  details: string | null;
  status: string; // 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  resolution_action: string | null;
  resolved_by: string | null;
  created_at: Date;
  resolved_at: Date | null;
}

export interface ResourceAuditLogTable {
  id: string;
  resource_id: string;
  user_id: string;
  action: string; // 'CREATE' | 'UPDATE' | 'UPLOAD' | 'PUBLISH' | 'ARCHIVE' | 'PERMISSION_CHANGE' | 'MODERATE' | 'DOWNLOAD'
  details_json: string | null;
  created_at: Date;
}

// ─────────────────────────────────────────────
// AUTOMATIC SCHEMA INITIALIZER
// ─────────────────────────────────────────────

let resourceTablesInitialized = false;

export async function ensureResourceTables(): Promise<void> {
  if (resourceTablesInitialized) return;

  try {
    // 1. learning_resources
    await db.schema
      .createTable("learning_resources")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col) => col.primaryKey())
      .addColumn("instructor_id", "text", (col) => col.notNull())
      .addColumn("course_id", "varchar(64)")
      .addColumn("module_id", "varchar(64)")
      .addColumn("lesson_id", "varchar(64)")
      .addColumn("title", "varchar(255)", (col) => col.notNull())
      .addColumn("description", "text")
      .addColumn("resource_type", "varchar(32)", (col) => col.notNull().defaultTo("pdf"))
      .addColumn("category", "varchar(64)", (col) => col.notNull().defaultTo("Medical"))
      .addColumn("tags", "text")
      .addColumn("status", "varchar(32)", (col) => col.notNull().defaultTo("DRAFT"))
      .addColumn("current_version", "integer", (col) => col.notNull().defaultTo(1))
      .addColumn("file_url", "text")
      .addColumn("storage_key", "text")
      .addColumn("file_size_bytes", "bigint")
      .addColumn("mime_type", "varchar(128)")
      .addColumn("original_filename", "varchar(255)")
      .addColumn("page_count", "integer")
      .addColumn("duration_seconds", "integer")
      .addColumn("dimensions_json", "text")
      .addColumn("thumbnail_url", "text")
      .addColumn("is_pinned", "boolean", (col) => col.notNull().defaultTo(false))
      .addColumn("is_public", "boolean", (col) => col.notNull().defaultTo(false))
      .addColumn("copyright_declared", "boolean", (col) => col.notNull().defaultTo(true))
      .addColumn("native_content", "text")
      .addColumn("available_from", "timestamptz")
      .addColumn("available_until", "timestamptz")
      .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`NOW()`))
      .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`NOW()`))
      .execute();

    // 2. resource_versions
    await db.schema
      .createTable("resource_versions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col) => col.primaryKey())
      .addColumn("resource_id", "varchar(64)", (col) => col.notNull())
      .addColumn("version_number", "integer", (col) => col.notNull())
      .addColumn("storage_key", "text")
      .addColumn("file_url", "text")
      .addColumn("file_size_bytes", "bigint")
      .addColumn("mime_type", "varchar(128)")
      .addColumn("change_note", "text")
      .addColumn("native_content", "text")
      .addColumn("created_by", "text", (col) => col.notNull())
      .addColumn("status", "varchar(32)", (col) => col.notNull().defaultTo("published"))
      .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`NOW()`))
      .execute();

    // 3. resource_permissions
    await db.schema
      .createTable("resource_permissions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col) => col.primaryKey())
      .addColumn("resource_id", "varchar(64)")
      .addColumn("course_id", "varchar(64)")
      .addColumn("module_id", "varchar(64)")
      .addColumn("lesson_id", "varchar(64)")
      .addColumn("allow_view", "boolean", (col) => col.notNull().defaultTo(true))
      .addColumn("allow_download", "boolean", (col) => col.notNull().defaultTo(false))
      .addColumn("allow_print", "boolean", (col) => col.notNull().defaultTo(false))
      .addColumn("allow_copy", "boolean", (col) => col.notNull().defaultTo(false))
      .addColumn("allow_offline", "boolean", (col) => col.notNull().defaultTo(false))
      .addColumn("access_duration_type", "varchar(32)", (col) => col.notNull().defaultTo("while_enrolled"))
      .addColumn("access_valid_until", "timestamptz")
      .addColumn("access_days", "integer")
      .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`NOW()`))
      .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`NOW()`))
      .execute();

    // 4. resource_access_sessions
    await db.schema
      .createTable("resource_access_sessions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col) => col.primaryKey())
      .addColumn("user_id", "text", (col) => col.notNull())
      .addColumn("resource_id", "varchar(64)", (col) => col.notNull())
      .addColumn("lesson_id", "varchar(64)")
      .addColumn("course_id", "varchar(64)")
      .addColumn("session_token_hash", "varchar(128)", (col) => col.notNull())
      .addColumn("access_type", "varchar(32)", (col) => col.notNull().defaultTo("VIEW"))
      .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`NOW()`))
      .addColumn("expires_at", "timestamptz", (col) => col.notNull())
      .addColumn("revoked_at", "timestamptz")
      .execute();

    // 5. resource_views
    await db.schema
      .createTable("resource_views")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col) => col.primaryKey())
      .addColumn("resource_id", "varchar(64)", (col) => col.notNull())
      .addColumn("user_id", "text", (col) => col.notNull())
      .addColumn("lesson_id", "varchar(64)")
      .addColumn("course_id", "varchar(64)")
      .addColumn("view_duration_seconds", "integer", (col) => col.notNull().defaultTo(0))
      .addColumn("page_reached", "integer", (col) => col.notNull().defaultTo(1))
      .addColumn("completed", "boolean", (col) => col.notNull().defaultTo(false))
      .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`NOW()`))
      .execute();

    // 6. resource_downloads
    await db.schema
      .createTable("resource_downloads")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col) => col.primaryKey())
      .addColumn("resource_id", "varchar(64)", (col) => col.notNull())
      .addColumn("user_id", "text", (col) => col.notNull())
      .addColumn("lesson_id", "varchar(64)")
      .addColumn("course_id", "varchar(64)")
      .addColumn("ip_address", "varchar(64)")
      .addColumn("user_agent", "text")
      .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`NOW()`))
      .execute();

    // 7. resource_bookmarks
    await db.schema
      .createTable("resource_bookmarks")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col) => col.primaryKey())
      .addColumn("user_id", "text", (col) => col.notNull())
      .addColumn("resource_id", "varchar(64)", (col) => col.notNull())
      .addColumn("collection_id", "varchar(64)")
      .addColumn("notes", "text")
      .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`NOW()`))
      .execute();

    // 8. resource_reports
    await db.schema
      .createTable("resource_reports")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col) => col.primaryKey())
      .addColumn("resource_id", "varchar(64)", (col) => col.notNull())
      .addColumn("user_id", "text", (col) => col.notNull())
      .addColumn("reason", "varchar(64)", (col) => col.notNull())
      .addColumn("details", "text")
      .addColumn("status", "varchar(32)", (col) => col.notNull().defaultTo("pending"))
      .addColumn("resolution_action", "varchar(64)")
      .addColumn("resolved_by", "text")
      .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`NOW()`))
      .addColumn("resolved_at", "timestamptz")
      .execute();

    // 9. resource_audit_logs
    await db.schema
      .createTable("resource_audit_logs")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col) => col.primaryKey())
      .addColumn("resource_id", "varchar(64)", (col) => col.notNull())
      .addColumn("user_id", "text", (col) => col.notNull())
      .addColumn("action", "varchar(64)", (col) => col.notNull())
      .addColumn("details_json", "text")
      .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`NOW()`))
      .execute();

    // Create helpful indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_learning_resources_course ON learning_resources(course_id);`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_learning_resources_lesson ON learning_resources(lesson_id);`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_resource_versions_res ON resource_versions(resource_id);`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_resource_perm_res ON resource_permissions(resource_id);`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_resource_sessions_token ON resource_access_sessions(session_token_hash);`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_user ON resource_bookmarks(user_id);`.execute(db);

    resourceTablesInitialized = true;
  } catch (error) {
    console.error("ensureResourceTables error:", error);
  }
}

export { db as resourceDb };
