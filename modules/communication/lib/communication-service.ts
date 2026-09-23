// ============================================================
// MGN Communication Engine — Core Service Layer
// modules/communication/lib/communication-service.ts
//
// Canonical message delivery, conversation orchestration,
// context bridging, reactions, scheduling, and moderation.
// ============================================================

import { database } from "@/lib/auth";
import { sql } from "kysely";
import { ensureCommunicationTables, generateCommId } from "./communication-db";
import { CommunicationPermissionService } from "./communication-permissions";
import { CentralCalendarService } from "@/modules/shared/scheduling/calendar-service";
import {
  ConversationType,
  ConversationStatus,
  GroupRole,
  CommunicationIdentity,
  ConversationSummary,
  CommunicationMessageItem,
  ScheduleMeetingInput,
  RichEntitySharePayload,
  MessageRequestItem,
} from "../types";

export class CommunicationService {
  /**
   * Resolves authoritative canonical MGN identity for any user ID.
   */
  static async getCanonicalIdentity(userId: string): Promise<CommunicationIdentity> {
    await ensureCommunicationTables();

    const res: any = await sql`
      SELECT 
        u.id as user_id,
        u.name,
        u.image,
        prof.profession,
        prof.specialization,
        prof.designation,
        prof.organization,
        prof.member_id,
        prof.is_founding_member,
        prof.registration_number,
        prof.identity_verified,
        COALESCE(ident.verification_status, CASE WHEN prof.identity_verified = true THEN 'VERIFIED' ELSE 'UNVERIFIED' END) as verification_status
      FROM "user" u
      LEFT JOIN professional_profiles prof ON prof.user_id = u.id
      LEFT JOIN mgn_identities ident ON ident.user_id = u.id
      WHERE u.id = ${userId}
      LIMIT 1;
    `.execute(database);

    const row = res.rows?.[0];
    if (!row) {
      return {
        userId,
        name: "Medical Professional",
        image: null,
        profession: "Healthcare Clinician",
        specialization: null,
        designation: null,
        organization: null,
        memberId: null,
        isFoundingMember: false,
        verificationStatus: "UNVERIFIED",
        identityVerified: false,
        onlineStatus: "OFFLINE",
      };
    }

    return {
      userId: row.user_id,
      name: row.name || "Medical Professional",
      image: row.image || null,
      profession: row.profession || "Healthcare Clinician",
      specialization: row.specialization || null,
      designation: row.designation || null,
      organization: row.organization || null,
      memberId: row.member_id || null,
      isFoundingMember: Boolean(row.is_founding_member),
      verificationStatus: row.verification_status || "UNVERIFIED",
      identityVerified: Boolean(row.identity_verified || row.verification_status === "VERIFIED"),
      councilNumber: row.registration_number || null,
      onlineStatus: "ONLINE",
    };
  }

  /**
   * Lists conversations for a user with rich context details.
   */
  static async listConversations(
    userId: string,
    filters?: {
      type?: ConversationType;
      search?: string;
      status?: ConversationStatus;
      unreadOnly?: boolean;
    }
  ): Promise<ConversationSummary[]> {
    await ensureCommunicationTables();

    // 1. Fetch conversations the user is a member of
    let query = sql`
      SELECT 
        c.id,
        c.type,
        c.name,
        c.avatar_url,
        c.created_by,
        c.event_id,
        c.camp_id,
        c.research_project_id,
        c.job_id,
        c.organization_id,
        c.marketplace_order_id,
        c.community_id,
        c.status,
        c.privacy,
        c.settings,
        c.last_message_content,
        c.last_message_at,
        c.last_sender_id,
        c.created_at,
        c.updated_at,
        m.role as user_role,
        m.is_muted,
        m.last_read_at,
        (
          SELECT COUNT(*)::INT 
          FROM communication_messages cm 
          WHERE cm.conversation_id = c.id 
            AND cm.sender_id != ${userId} 
            AND cm.created_at > COALESCE(m.last_read_at, '1970-01-01'::timestamptz)
            AND cm.deleted_for_all = false
        ) AS unread_count,
        (
          SELECT COUNT(*)::INT 
          FROM conversation_members cm2 
          WHERE cm2.conversation_id = c.id
        ) AS member_count,
        -- Context names
        ev.title as event_title,
        mc.title as camp_title,
        rp.title as research_title,
        j.title as job_title,
        org.name as org_name,
        comm.name as community_name
      FROM conversations c
      JOIN conversation_members m ON m.conversation_id = c.id AND m.user_id = ${userId}
      LEFT JOIN events ev ON ev.id = c.event_id
      LEFT JOIN medical_camps mc ON mc.id = c.camp_id
      LEFT JOIN research_projects rp ON rp.id = c.research_project_id
      LEFT JOIN jobs j ON j.id = c.job_id
      LEFT JOIN organizations org ON org.id = c.organization_id
      LEFT JOIN communities comm ON comm.id = c.community_id
      WHERE c.status != 'DELETED'
    `;

    if (filters?.type) {
      query = sql`${query} AND c.type = ${filters.type}`;
    }
    if (filters?.status) {
      query = sql`${query} AND c.status = ${filters.status}`;
    }

    query = sql`${query} ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC`;

    const convsRes: any = await query.execute(database);
    const rawConvs = convsRes.rows || [];

    // 2. Direct conversation peer identity resolution
    const directPeerMap = new Map<string, string>();
    const directConvIds = rawConvs
      .filter((c: any) => c.type === "DIRECT")
      .map((c: any) => c.id);

    if (directConvIds.length > 0) {
      const peersRes: any = await sql`
        SELECT conversation_id, user_id 
        FROM conversation_members 
        WHERE conversation_id = ANY(${directConvIds}) AND user_id != ${userId};
      `.execute(database);

      for (const p of peersRes.rows || []) {
        directPeerMap.set(p.conversation_id, p.user_id);
      }
    }

    const summaries: ConversationSummary[] = [];

    for (const c of rawConvs) {
      let peerIdentity: CommunicationIdentity | null = null;
      if (c.type === "DIRECT") {
        const peerId = directPeerMap.get(c.id);
        if (peerId) {
          peerIdentity = await this.getCanonicalIdentity(peerId);
        }
      }

      summaries.push({
        id: c.id,
        type: c.type as ConversationType,
        name: c.name || (peerIdentity ? peerIdentity.name : "Conversation"),
        avatarUrl: c.avatar_url || (peerIdentity ? peerIdentity.image : null),
        createdBy: c.created_by,
        status: c.status as ConversationStatus,
        privacy: c.privacy,
        settings: c.settings || {},
        lastMessageContent: c.last_message_content,
        lastMessageAt: c.last_message_at ? new Date(c.last_message_at).toISOString() : null,
        lastSenderId: c.last_sender_id,
        unreadCount: Number(c.unread_count || 0),
        peerIdentity,
        context: {
          eventId: c.event_id,
          eventTitle: c.event_title,
          campId: c.camp_id,
          campTitle: c.camp_title,
          researchProjectId: c.research_project_id,
          researchTitle: c.research_title,
          jobId: c.job_id,
          jobTitle: c.job_title,
          organizationId: c.organization_id,
          organizationName: c.org_name,
          communityId: c.community_id,
          communityName: c.community_name,
          marketplaceOrderId: c.marketplace_order_id,
        },
        memberCount: Number(c.member_count || 0),
        userRole: c.user_role as GroupRole,
        isMuted: Boolean(c.is_muted),
        createdAt: new Date(c.created_at).toISOString(),
        updatedAt: new Date(c.updated_at).toISOString(),
      });
    }

    // 3. Search and unread filtering
    let results = summaries;
    if (filters?.unreadOnly) {
      results = results.filter((c) => c.unreadCount > 0);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((c) => {
        return (
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.lastMessageContent && c.lastMessageContent.toLowerCase().includes(q)) ||
          (c.peerIdentity?.name && c.peerIdentity.name.toLowerCase().includes(q)) ||
          (c.peerIdentity?.profession && c.peerIdentity.profession.toLowerCase().includes(q)) ||
          (c.peerIdentity?.specialization && c.peerIdentity.specialization.toLowerCase().includes(q)) ||
          (c.context.eventTitle && c.context.eventTitle.toLowerCase().includes(q)) ||
          (c.context.campTitle && c.context.campTitle.toLowerCase().includes(q)) ||
          (c.context.jobTitle && c.context.jobTitle.toLowerCase().includes(q)) ||
          (c.context.researchTitle && c.context.researchTitle.toLowerCase().includes(q))
        );
      });
    }

    return results;
  }

  /**
   * Retrieves or creates a canonical 1-to-1 DIRECT conversation between two clinicians.
   */
  static async getOrCreateDirectConversation(userId: string, peerId: string): Promise<string> {
    await ensureCommunicationTables();

    // Check if blocked
    const blocked = await CommunicationPermissionService.isBlocked(userId, peerId);
    if (blocked) {
      throw new Error("Unable to create conversation due to privacy or block restrictions");
    }

    // Find existing direct conversation
    const existing: any = await sql`
      SELECT c.id 
      FROM conversations c
      JOIN conversation_members m1 ON m1.conversation_id = c.id AND m1.user_id = ${userId}
      JOIN conversation_members m2 ON m2.conversation_id = c.id AND m2.user_id = ${peerId}
      WHERE c.type = 'DIRECT'
      LIMIT 1;
    `.execute(database);

    if (existing.rows?.[0]?.id) {
      return existing.rows[0].id;
    }

    // Create new direct conversation
    const convId = generateCommId("conv_dm");
    await sql`
      INSERT INTO conversations (id, type, status, privacy, created_by, created_at, updated_at)
      VALUES (${convId}, 'DIRECT', 'ACTIVE', 'PRIVATE', ${userId}, now(), now());
    `.execute(database);

    await sql`
      INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at)
      VALUES 
        (${generateCommId("mbr")}, ${convId}, ${userId}, 'MEMBER', now()),
        (${generateCommId("mbr")}, ${convId}, ${peerId}, 'MEMBER', now())
      ON CONFLICT DO NOTHING;
    `.execute(database);

    return convId;
  }

  /**
   * Creates or retrieves a contextual conversation (Event, Camp, Research, Job, Organization, Community).
   */
  static async getOrCreateContextConversation(
    userId: string,
    params: {
      type: "EVENT" | "CAMP" | "RESEARCH" | "JOB" | "ORGANIZATION" | "COMMUNITY";
      contextId: string;
      name?: string;
      memberIds?: string[];
    }
  ): Promise<string> {
    await ensureCommunicationTables();

    let checkQuery = sql`SELECT id FROM conversations WHERE type = ${params.type}`;
    if (params.type === "EVENT") checkQuery = sql`${checkQuery} AND event_id = ${params.contextId}`;
    else if (params.type === "CAMP") checkQuery = sql`${checkQuery} AND camp_id = ${params.contextId}`;
    else if (params.type === "RESEARCH") checkQuery = sql`${checkQuery} AND research_project_id = ${params.contextId}`;
    else if (params.type === "JOB") checkQuery = sql`${checkQuery} AND job_id = ${params.contextId}`;
    else if (params.type === "ORGANIZATION") checkQuery = sql`${checkQuery} AND organization_id = ${params.contextId}`;
    else if (params.type === "COMMUNITY") checkQuery = sql`${checkQuery} AND community_id = ${params.contextId}`;

    const existing: any = await checkQuery.execute(database);
    if (existing.rows?.[0]?.id) {
      const convId = existing.rows[0].id;
      // Ensure calling user is a member
      await sql`
        INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at)
        VALUES (${generateCommId("mbr")}, ${convId}, ${userId}, 'MEMBER', now())
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
      `.execute(database);
      return convId;
    }

    // Create new context conversation
    const convId = generateCommId(`conv_${params.type.toLowerCase()}`);
    const convName = params.name || `${params.type} Collaboration`;

    await sql`
      INSERT INTO conversations (
        id, type, name, status, privacy, created_by,
        event_id, camp_id, research_project_id, job_id, organization_id, community_id,
        created_at, updated_at
      ) VALUES (
        ${convId}, ${params.type}, ${convName}, 'ACTIVE', 'MEMBERS_ONLY', ${userId},
        ${params.type === "EVENT" ? params.contextId : null},
        ${params.type === "CAMP" ? params.contextId : null},
        ${params.type === "RESEARCH" ? params.contextId : null},
        ${params.type === "JOB" ? params.contextId : null},
        ${params.type === "ORGANIZATION" ? params.contextId : null},
        ${params.type === "COMMUNITY" ? params.contextId : null},
        now(), now()
      );
    `.execute(database);

    // Add creator as OWNER
    await sql`
      INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at)
      VALUES (${generateCommId("mbr")}, ${convId}, ${userId}, 'OWNER', now());
    `.execute(database);

    // Add any specified extra members
    if (params.memberIds && params.memberIds.length > 0) {
      for (const mId of params.memberIds) {
        if (mId !== userId) {
          await sql`
            INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at)
            VALUES (${generateCommId("mbr")}, ${convId}, ${mId}, 'MEMBER', now())
            ON CONFLICT (conversation_id, user_id) DO NOTHING;
          `.execute(database);
        }
      }
    }

    return convId;
  }

  /**
   * Creates a custom Group conversation.
   */
  static async createGroupConversation(
    userId: string,
    params: {
      name: string;
      description?: string;
      avatarUrl?: string;
      memberIds: string[];
    }
  ): Promise<string> {
    await ensureCommunicationTables();

    const convId = generateCommId("conv_grp");
    const settings = { description: params.description || "" };

    await sql`
      INSERT INTO conversations (
        id, type, name, avatar_url, settings, status, privacy, created_by, created_at, updated_at
      ) VALUES (
        ${convId}, 'GROUP', ${params.name.trim()}, ${params.avatarUrl || null},
        ${JSON.stringify(settings)}::jsonb, 'ACTIVE', 'MEMBERS_ONLY', ${userId}, now(), now()
      );
    `.execute(database);

    // Creator is OWNER
    await sql`
      INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at)
      VALUES (${generateCommId("mbr")}, ${convId}, ${userId}, 'OWNER', now());
    `.execute(database);

    // Other members
    for (const mId of params.memberIds) {
      if (mId !== userId) {
        await sql`
          INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at)
          VALUES (${generateCommId("mbr")}, ${convId}, ${mId}, 'MEMBER', now())
          ON CONFLICT (conversation_id, user_id) DO NOTHING;
        `.execute(database);
      }
    }

    return convId;
  }

  /**
   * Retrieves full details for a conversation including members, roles, and context.
   */
  static async getConversationDetails(userId: string, conversationId: string): Promise<any> {
    await ensureCommunicationTables();

    const convRes: any = await sql`
      SELECT 
        c.*,
        ev.title as event_title,
        mc.title as camp_title,
        rp.title as research_title,
        j.title as job_title,
        org.name as org_name,
        comm.name as community_name
      FROM conversations c
      LEFT JOIN events ev ON ev.id = c.event_id
      LEFT JOIN medical_camps mc ON mc.id = c.camp_id
      LEFT JOIN research_projects rp ON rp.id = c.research_project_id
      LEFT JOIN jobs j ON j.id = c.job_id
      LEFT JOIN organizations org ON org.id = c.organization_id
      LEFT JOIN communities comm ON comm.id = c.community_id
      WHERE c.id = ${conversationId}
      LIMIT 1;
    `.execute(database);

    const conv = convRes.rows?.[0];
    if (!conv) throw new Error("Conversation not found");

    // Fetch members with canonical identity
    const membersRes: any = await sql`
      SELECT 
        cm.id,
        cm.conversation_id,
        cm.user_id,
        cm.role,
        cm.joined_at,
        cm.last_read_at,
        cm.is_muted
      FROM conversation_members cm
      WHERE cm.conversation_id = ${conversationId}
      ORDER BY cm.joined_at ASC;
    `.execute(database);

    const membersWithIdentities = await Promise.all(
      (membersRes.rows || []).map(async (m: any) => ({
        ...m,
        identity: await this.getCanonicalIdentity(m.user_id),
      }))
    );

    // Fetch pinned messages
    const pinsRes: any = await sql`
      SELECT 
        p.pinned_at,
        p.pinned_by,
        m.id,
        m.content,
        m.sender_id,
        m.type,
        m.created_at
      FROM communication_pins p
      JOIN communication_messages m ON m.id = p.message_id
      WHERE p.conversation_id = ${conversationId}
      ORDER BY p.pinned_at DESC;
    `.execute(database);

    return {
      conversation: conv,
      members: membersWithIdentities,
      pinnedMessages: pinsRes.rows || [],
    };
  }

  /**
   * Fetches a single message by ID with full metadata, sender identity, reactions, and reply snippet.
   */
  static async getMessageById(userId: string, messageId: string): Promise<CommunicationMessageItem | null> {
    await ensureCommunicationTables();

    const res: any = await sql`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.client_message_id,
        m.sequence_number,
        m.type,
        m.content,
        m.reply_to_id,
        m.forwarded_from_id,
        m.media_urls,
        m.metadata,
        m.status,
        m.is_pinned,
        m.edited_at,
        m.edit_version,
        m.deleted_at,
        m.deleted_for_all,
        m.created_at,
        m.updated_at,
        rm.content as reply_content,
        ru.name as reply_sender_name
      FROM communication_messages m
      LEFT JOIN communication_messages rm ON rm.id = m.reply_to_id
      LEFT JOIN "user" ru ON ru.id = rm.sender_id
      WHERE m.id = ${messageId}
        AND NOT (${userId} = ANY(COALESCE(m.deleted_for_user_ids, '{}')))
      LIMIT 1;
    `.execute(database);

    const row = res.rows?.[0];
    if (!row) return null;

    // Reactions
    const rxRes: any = await sql`
      SELECT message_id, reaction, user_id
      FROM communication_reactions
      WHERE message_id = ${messageId};
    `.execute(database);

    const reactionGroupMap = new Map<string, { count: number; userIds: string[]; hasReacted: boolean }>();
    for (const r of rxRes.rows || []) {
      if (!reactionGroupMap.has(r.reaction)) {
        reactionGroupMap.set(r.reaction, { count: 0, userIds: [], hasReacted: false });
      }
      const g = reactionGroupMap.get(r.reaction)!;
      g.count++;
      g.userIds.push(r.user_id);
      if (r.user_id === userId) g.hasReacted = true;
    }

    const reactions = Array.from(reactionGroupMap.entries()).map(([reaction, data]) => ({
      reaction,
      count: data.count,
      userIds: data.userIds,
      hasReacted: data.hasReacted,
    }));

    const senderIdentity = await this.getCanonicalIdentity(row.sender_id);

    return {
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      clientMessageId: row.client_message_id,
      sequenceNumber: Number(row.sequence_number),
      type: row.type,
      content: row.content || "",
      replyToId: row.reply_to_id,
      replyToSnippet: row.reply_to_id
        ? {
            id: row.reply_to_id,
            senderName: row.reply_sender_name || "Clinician",
            content: row.reply_content || "",
          }
        : null,
      forwardedFromId: row.forwarded_from_id,
      mediaUrls: row.media_urls,
      metadata: row.metadata,
      status: row.status,
      isPinned: Boolean(row.is_pinned),
      editedAt: row.edited_at ? new Date(row.edited_at).toISOString() : null,
      editVersion: Number(row.edit_version || 0),
      deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : null,
      deletedForAll: Boolean(row.deleted_for_all),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      senderIdentity,
      reactions,
    };
  }

  /**
   * Fetches messages in a conversation.
   */
  static async getMessages(
    userId: string,
    conversationId: string,
    options?: { limit?: number; beforeSequence?: number }
  ): Promise<CommunicationMessageItem[]> {
    await ensureCommunicationTables();

    // Verify membership
    const member = await CommunicationPermissionService.getMemberRecord(userId, conversationId);
    if (!member?.isMember) {
      throw new Error("You are not a member of this conversation");
    }

    const limit = Math.min(options?.limit || 50, 100);

    let query = sql`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.client_message_id,
        m.sequence_number,
        m.type,
        m.content,
        m.reply_to_id,
        m.forwarded_from_id,
        m.media_urls,
        m.metadata,
        m.status,
        m.is_pinned,
        m.edited_at,
        m.edit_version,
        m.deleted_at,
        m.deleted_for_all,
        m.created_at,
        m.updated_at,
        -- Reply snippet
        rm.content as reply_content,
        ru.name as reply_sender_name
      FROM communication_messages m
      LEFT JOIN communication_messages rm ON rm.id = m.reply_to_id
      LEFT JOIN "user" ru ON ru.id = rm.sender_id
      WHERE m.conversation_id = ${conversationId}
        AND NOT (${userId} = ANY(COALESCE(m.deleted_for_user_ids, '{}')))
    `;

    if (options?.beforeSequence) {
      query = sql`${query} AND m.sequence_number < ${options.beforeSequence}`;
    }

    query = sql`${query} ORDER BY m.sequence_number ASC LIMIT ${limit}`;

    const res: any = await query.execute(database);
    const rows = res.rows || [];

    // Fetch reactions for these messages
    const messageIds = rows.map((r: any) => r.id);
    const reactionsMap = new Map<string, any[]>();

    if (messageIds.length > 0) {
      const rxRes: any = await sql`
        SELECT message_id, reaction, user_id
        FROM communication_reactions
        WHERE message_id = ANY(${messageIds});
      `.execute(database);

      for (const rx of rxRes.rows || []) {
        if (!reactionsMap.has(rx.message_id)) {
          reactionsMap.set(rx.message_id, []);
        }
        reactionsMap.get(rx.message_id)!.push(rx);
      }
    }

    // Sender identities cache
    const identityCache = new Map<string, CommunicationIdentity>();

    const items: CommunicationMessageItem[] = [];

    for (const row of rows) {
      if (!identityCache.has(row.sender_id)) {
        const iden = await this.getCanonicalIdentity(row.sender_id);
        identityCache.set(row.sender_id, iden);
      }

      // Group reactions
      const rawRx = reactionsMap.get(row.id) || [];
      const reactionGroupMap = new Map<string, { count: number; userIds: string[]; hasReacted: boolean }>();

      for (const r of rawRx) {
        if (!reactionGroupMap.has(r.reaction)) {
          reactionGroupMap.set(r.reaction, { count: 0, userIds: [], hasReacted: false });
        }
        const g = reactionGroupMap.get(r.reaction)!;
        g.count++;
        g.userIds.push(r.user_id);
        if (r.user_id === userId) g.hasReacted = true;
      }

      const reactions = Array.from(reactionGroupMap.entries()).map(([reaction, data]) => ({
        reaction,
        count: data.count,
        userIds: data.userIds,
        hasReacted: data.hasReacted,
      }));

      items.push({
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        clientMessageId: row.client_message_id,
        sequenceNumber: Number(row.sequence_number),
        type: row.type,
        content: row.content || "",
        replyToId: row.reply_to_id,
        replyToSnippet: row.reply_to_id
          ? {
              id: row.reply_to_id,
              senderName: row.reply_sender_name || "Clinician",
              content: row.reply_content || "",
            }
          : null,
        forwardedFromId: row.forwarded_from_id,
        mediaUrls: row.media_urls,
        metadata: row.metadata,
        status: row.status,
        isPinned: Boolean(row.is_pinned),
        editedAt: row.edited_at ? new Date(row.edited_at).toISOString() : null,
        editVersion: Number(row.edit_version || 0),
        deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : null,
        deletedForAll: Boolean(row.deleted_for_all),
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
        senderIdentity: identityCache.get(row.sender_id),
        reactions,
      });
    }

    return items;
  }

  /**
   * Sends a message with sequential sequence numbering and idempotency.
   */
  static async sendMessage(
    userId: string,
    conversationId: string,
    payload: {
      content?: string;
      type?: string;
      clientMessageId?: string;
      replyToId?: string;
      mediaUrls?: string[];
      metadata?: Record<string, unknown>;
    }
  ): Promise<CommunicationMessageItem> {
    await ensureCommunicationTables();

    // Permission check
    const check = await CommunicationPermissionService.canSendMessage(userId, conversationId);
    if (!check.allowed) {
      throw new Error(check.reason || "Unable to send message");
    }

    // Idempotency: Check if client_message_id already exists
    if (payload.clientMessageId) {
      const existingRes: any = await sql`
        SELECT id FROM communication_messages
        WHERE client_message_id = ${payload.clientMessageId}
        LIMIT 1;
      `.execute(database);

      if (existingRes.rows?.[0]?.id) {
        const existing = await this.getMessageById(userId, existingRes.rows[0].id);
        if (existing) return existing;
      }
    }

    const messageId = generateCommId("msg");
    const now = new Date();
    const msgType = payload.type || "TEXT";
    const content = (payload.content || "").trim();

    // Mentions safety check: Prevent @everyone notification abuse by non-moderators
    if (content.includes("@everyone")) {
      const canEveryone = await CommunicationPermissionService.canMentionEveryone(userId, conversationId);
      if (!canEveryone) {
        throw new Error("Only group administrators or moderators can mention @everyone");
      }
    }

    // Atomic next sequence number for this conversation with row-level lock
    await sql`SELECT id FROM conversations WHERE id = ${conversationId} FOR UPDATE;`.execute(database);

    const seqRes: any = await sql`
      SELECT COALESCE(MAX(sequence_number), 0) + 1 AS next_seq
      FROM communication_messages
      WHERE conversation_id = ${conversationId};
    `.execute(database);

    const sequenceNumber = Number(seqRes.rows?.[0]?.next_seq || 1);

    await sql`
      INSERT INTO communication_messages (
        id, conversation_id, sender_id, client_message_id, sequence_number,
        type, content, reply_to_id, media_urls, metadata, status, created_at, updated_at
      ) VALUES (
        ${messageId}, ${conversationId}, ${userId}, ${payload.clientMessageId || null},
        ${sequenceNumber}, ${msgType}, ${content}, ${payload.replyToId || null},
        ${payload.mediaUrls && payload.mediaUrls.length > 0 ? payload.mediaUrls : null},
        ${JSON.stringify(payload.metadata || {})}::jsonb,
        'SENT', ${now}, ${now}
      );
    `.execute(database);

    // Record mentions
    const mentionMatches = content.match(/@([a-zA-Z0-9_-]+)/g);
    if (mentionMatches && mentionMatches.length > 0) {
      for (const rawMention of mentionMatches) {
        const handle = rawMention.slice(1).toLowerCase();
        if (handle === "everyone") {
          await sql`
            INSERT INTO communication_mentions (id, message_id, user_id, mention_type, created_at)
            VALUES (${generateCommId("mnt")}, ${messageId}, null, 'EVERYONE', now());
          `.execute(database);
        } else {
          const userRes: any = await sql`
            SELECT id FROM "user" WHERE LOWER(name) LIKE ${`%${handle}%`} LIMIT 1;
          `.execute(database);
          if (userRes.rows?.[0]?.id) {
            await sql`
              INSERT INTO communication_mentions (id, message_id, user_id, mention_type, created_at)
              VALUES (${generateCommId("mnt")}, ${messageId}, ${userRes.rows[0].id}, 'USER', now());
            `.execute(database);
          }
        }
      }
    }

    // Update conversation metadata
    const snippet = content || (payload.mediaUrls && payload.mediaUrls.length > 0 ? "📎 Attachment" : msgType);
    await sql`
      UPDATE conversations
      SET 
        last_message_content = ${snippet},
        last_message_at = ${now},
        last_sender_id = ${userId},
        updated_at = ${now}
      WHERE id = ${conversationId};
    `.execute(database);

    // Update sender's read pointer
    await sql`
      UPDATE conversation_members
      SET last_read_at = ${now}, last_read_message_id = ${messageId}
      WHERE conversation_id = ${conversationId} AND user_id = ${userId};
    `.execute(database);

    const senderIdentity = await this.getCanonicalIdentity(userId);

    return {
      id: messageId,
      conversationId,
      senderId: userId,
      clientMessageId: payload.clientMessageId || null,
      sequenceNumber,
      type: msgType as any,
      content,
      replyToId: payload.replyToId || null,
      mediaUrls: payload.mediaUrls || null,
      metadata: payload.metadata as any,
      status: "SENT",
      isPinned: false,
      editVersion: 0,
      deletedForAll: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      senderIdentity,
      reactions: [],
    };
  }

  /**
   * Marks a conversation as read by the user.
   */
  static async markConversationRead(userId: string, conversationId: string): Promise<void> {
    await ensureCommunicationTables();
    const now = new Date();

    await sql`
      UPDATE conversation_members
      SET last_read_at = ${now}
      WHERE conversation_id = ${conversationId} AND user_id = ${userId};
    `.execute(database);

    // Mark messages sent to this conversation as READ
    await sql`
      UPDATE communication_messages
      SET status = 'READ'
      WHERE conversation_id = ${conversationId}
        AND sender_id != ${userId}
        AND status != 'READ';
    `.execute(database);
  }

  /**
   * Edits a message's content.
   */
  static async editMessage(userId: string, messageId: string, newContent: string): Promise<void> {
    const check = await CommunicationPermissionService.canEditMessage(userId, messageId);
    if (!check.allowed) {
      throw new Error(check.reason || "Cannot edit message");
    }

    const now = new Date();
    await sql`
      UPDATE communication_messages
      SET 
        content = ${newContent.trim()},
        edited_at = ${now},
        edit_version = edit_version + 1,
        updated_at = ${now}
      WHERE id = ${messageId};
    `.execute(database);
  }

  /**
   * Soft deletes a message.
   */
  static async deleteMessage(userId: string, messageId: string, deleteForAll = false): Promise<void> {
    const check = await CommunicationPermissionService.canDeleteMessage(userId, messageId, deleteForAll);
    if (!check.allowed) {
      throw new Error(check.reason || "Cannot delete message");
    }

    const now = new Date();
    if (deleteForAll) {
      await sql`
        UPDATE communication_messages
        SET 
          deleted_at = ${now},
          deleted_for_all = true,
          content = '[Message deleted]',
          media_urls = null,
          updated_at = ${now}
        WHERE id = ${messageId};
      `.execute(database);
    } else {
      await sql`
        UPDATE communication_messages
        SET 
          deleted_for_user_ids = array_append(COALESCE(deleted_for_user_ids, '{}'), ${userId}),
          updated_at = ${now}
        WHERE id = ${messageId};
      `.execute(database);
    }
  }

  /**
   * Reacts or toggles reaction on a message.
   */
  static async reactToMessage(userId: string, messageId: string, reaction: string): Promise<void> {
    await ensureCommunicationTables();

    // Check if user already gave this reaction
    const existingRes: any = await sql`
      SELECT id FROM communication_reactions
      WHERE message_id = ${messageId} AND user_id = ${userId} AND reaction = ${reaction}
      LIMIT 1;
    `.execute(database);

    if (existingRes.rows?.[0]?.id) {
      // Toggle off
      await sql`
        DELETE FROM communication_reactions
        WHERE id = ${existingRes.rows[0].id};
      `.execute(database);
    } else {
      // Insert reaction
      await sql`
        INSERT INTO communication_reactions (id, message_id, user_id, reaction, created_at)
        VALUES (${generateCommId("rx")}, ${messageId}, ${userId}, ${reaction}, now())
        ON CONFLICT (message_id, user_id, reaction) DO NOTHING;
      `.execute(database);
    }
  }

  /**
   * Pins or unpins a message.
   */
  static async togglePinMessage(userId: string, conversationId: string, messageId: string): Promise<boolean> {
    await ensureCommunicationTables();

    const canPin = await CommunicationPermissionService.canPinMessage(userId, conversationId);
    if (!canPin) throw new Error("Permission denied to pin messages in this conversation");

    const existing: any = await sql`
      SELECT id FROM communication_pins
      WHERE conversation_id = ${conversationId} AND message_id = ${messageId}
      LIMIT 1;
    `.execute(database);

    if (existing.rows?.[0]?.id) {
      await sql`DELETE FROM communication_pins WHERE id = ${existing.rows[0].id};`.execute(database);
      await sql`UPDATE communication_messages SET is_pinned = false WHERE id = ${messageId};`.execute(database);
      return false; // unpinned
    } else {
      await sql`
        INSERT INTO communication_pins (id, conversation_id, message_id, pinned_by, pinned_at)
        VALUES (${generateCommId("pin")}, ${conversationId}, ${messageId}, ${userId}, now());
      `.execute(database);
      await sql`UPDATE communication_messages SET is_pinned = true WHERE id = ${messageId};`.execute(database);
      return true; // pinned
    }
  }

  /**
   * Schedules a meeting and embeds it into the conversation, automatically syncing with central calendar.
   */
  static async scheduleMeeting(userId: string, input: ScheduleMeetingInput): Promise<CommunicationMessageItem> {
    await ensureCommunicationTables();

    const canCall = await CommunicationPermissionService.canStartCall(userId, input.conversationId);
    if (!canCall) throw new Error("Permission denied to schedule meeting in this conversation");

    // 1. Add to central calendar service
    let calendarEventId = "";
    try {
      const entry = await CentralCalendarService.addOrUpdateEntry({
        userId,
        sourceType: "meeting",
        sourceId: input.conversationId,
        title: input.title,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        timezone: input.timezone || "Asia/Kolkata",
        meetingLink: input.meetingLink || `https://meet.mgn.life/${input.conversationId}`,
        reminderMinutesBefore: input.reminderMinutes || 15,
      });
      calendarEventId = entry.id;
    } catch (e) {
      console.warn("CentralCalendarService sync warning:", e);
    }

    // 2. Post MEETING rich message into conversation
    const meetingPayload: RichEntitySharePayload = {
      entityType: "meeting",
      id: calendarEventId || input.conversationId,
      title: input.title,
      subtitle: `${new Date(input.startTime).toLocaleDateString([], { month: "short", day: "numeric" })} at ${new Date(input.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      description: input.description,
      url: input.meetingLink || `/calendar?meeting=${input.conversationId}`,
      badge: "Scheduled Clinical Meeting",
      meta: {
        startTime: input.startTime,
        endTime: input.endTime,
        meetingLink: input.meetingLink || `https://meet.mgn.life/${input.conversationId}`,
        calendarEventId,
      },
    };

    return await this.sendMessage(userId, input.conversationId, {
      type: "MEETING",
      content: `📅 Clinical Meeting Scheduled: ${input.title}`,
      metadata: {
        entity: meetingPayload,
        meeting: {
          title: input.title,
          startTime: input.startTime,
          endTime: input.endTime,
          meetingLink: input.meetingLink || `https://meet.mgn.life/${input.conversationId}`,
          calendarEventId,
          status: "confirmed",
        },
      },
    });
  }

  /**
   * Blocks a user from direct communications.
   */
  static async blockUser(blockerId: string, blockedId: string): Promise<void> {
    await ensureCommunicationTables();

    await sql`
      INSERT INTO communication_user_blocks (id, blocker_id, blocked_id, created_at)
      VALUES (${generateCommId("blk")}, ${blockerId}, ${blockedId}, now())
      ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
    `.execute(database);

    // Audit log
    await sql`
      INSERT INTO communication_audit_logs (id, actor_id, action, target_type, target_id, created_at)
      VALUES (${generateCommId("aud")}, ${blockerId}, 'user.blocked', 'user', ${blockedId}, now());
    `.execute(database);
  }

  /**
   * Unblocks a user.
   */
  static async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await ensureCommunicationTables();

    await sql`
      DELETE FROM communication_user_blocks
      WHERE blocker_id = ${blockerId} AND blocked_id = ${blockedId};
    `.execute(database);

    await sql`
      INSERT INTO communication_audit_logs (id, actor_id, action, target_type, target_id, created_at)
      VALUES (${generateCommId("aud")}, ${blockerId}, 'user.unblocked', 'user', ${blockedId}, now());
    `.execute(database);
  }

  /**
   * Reports a message, conversation, or user for moderation.
   */
  static async submitReport(
    reporterId: string,
    params: {
      reportedUserId?: string;
      conversationId?: string;
      messageId?: string;
      reason: string;
      details?: string;
    }
  ): Promise<string> {
    await ensureCommunicationTables();

    const reportId = generateCommId("rep");

    await sql`
      INSERT INTO communication_reports (
        id, reporter_id, reported_user_id, conversation_id, message_id,
        reason, details, status, created_at
      ) VALUES (
        ${reportId}, ${reporterId}, ${params.reportedUserId || null},
        ${params.conversationId || null}, ${params.messageId || null},
        ${params.reason}, ${params.details || null}, 'PENDING', now()
      );
    `.execute(database);

    return reportId;
  }

  /**
   * Creates a message request between non-connected users.
   */
  static async createMessageRequest(
    senderId: string,
    receiverId: string,
    initialMessage?: string
  ): Promise<{ id: string; status: string; conversationId?: string }> {
    await ensureCommunicationTables();

    if (senderId === receiverId) {
      throw new Error("Cannot send message request to yourself");
    }

    const blocked = await CommunicationPermissionService.isBlocked(senderId, receiverId);
    if (blocked) {
      throw new Error("Unable to send request due to privacy settings or block restrictions");
    }

    // Check if direct conversation already exists
    const existingConv: any = await sql`
      SELECT c.id 
      FROM conversations c
      JOIN conversation_members m1 ON m1.conversation_id = c.id AND m1.user_id = ${senderId}
      JOIN conversation_members m2 ON m2.conversation_id = c.id AND m2.user_id = ${receiverId}
      WHERE c.type = 'DIRECT'
      LIMIT 1;
    `.execute(database);

    if (existingConv.rows?.[0]?.id) {
      return { id: "", status: "EXISTING_CONVERSATION", conversationId: existingConv.rows[0].id };
    }

    const reqId = generateCommId("req");
    const now = new Date();

    await sql`
      INSERT INTO communication_message_requests (
        id, sender_id, receiver_id, initial_message, status, created_at, updated_at
      ) VALUES (
        ${reqId}, ${senderId}, ${receiverId}, ${initialMessage ? initialMessage.trim() : null}, 'PENDING', ${now}, ${now}
      )
      ON CONFLICT (sender_id, receiver_id) DO UPDATE
      SET initial_message = EXCLUDED.initial_message, status = 'PENDING', updated_at = ${now};
    `.execute(database);

    return { id: reqId, status: "PENDING" };
  }

  /**
   * Lists pending message requests for a user (as receiver).
   */
  static async listMessageRequests(userId: string): Promise<MessageRequestItem[]> {
    await ensureCommunicationTables();

    const res: any = await sql`
      SELECT id, sender_id, receiver_id, initial_message, status, created_at
      FROM communication_message_requests
      WHERE receiver_id = ${userId} AND status = 'PENDING'
      ORDER BY created_at DESC;
    `.execute(database);

    const items: MessageRequestItem[] = [];
    for (const r of res.rows || []) {
      const senderIdentity = await this.getCanonicalIdentity(r.sender_id);
      items.push({
        id: r.id,
        senderId: r.sender_id,
        receiverId: r.receiver_id,
        initialMessage: r.initial_message,
        status: r.status,
        createdAt: new Date(r.created_at).toISOString(),
        senderIdentity,
      });
    }

    return items;
  }

  /**
   * Responds to a message request (ACCEPT, DECLINE, BLOCK).
   */
  static async respondToMessageRequest(
    requestId: string,
    userId: string,
    action: "ACCEPT" | "DECLINE" | "BLOCK"
  ): Promise<{ success: boolean; conversationId?: string }> {
    await ensureCommunicationTables();

    const reqRes: any = await sql`
      SELECT id, sender_id, receiver_id, initial_message, status
      FROM communication_message_requests
      WHERE id = ${requestId} AND receiver_id = ${userId}
      LIMIT 1;
    `.execute(database);

    const req = reqRes.rows?.[0];
    if (!req) {
      throw new Error("Message request not found");
    }

    const now = new Date();

    if (action === "ACCEPT") {
      const convId = await this.getOrCreateDirectConversation(req.sender_id, userId);
      if (req.initial_message) {
        await this.sendMessage(req.sender_id, convId, {
          content: req.initial_message,
          type: "TEXT",
        });
      }
      await sql`
        UPDATE communication_message_requests
        SET status = 'ACCEPTED', updated_at = ${now}
        WHERE id = ${requestId};
      `.execute(database);

      return { success: true, conversationId: convId };
    }

    if (action === "DECLINE") {
      await sql`
        UPDATE communication_message_requests
        SET status = 'DECLINED', updated_at = ${now}
        WHERE id = ${requestId};
      `.execute(database);

      return { success: true };
    }

    if (action === "BLOCK") {
      await sql`
        UPDATE communication_message_requests
        SET status = 'BLOCKED', updated_at = ${now}
        WHERE id = ${requestId};
      `.execute(database);

      await this.blockUser(userId, req.sender_id);
      return { success: true };
    }

    throw new Error("Invalid request action");
  }

  /**
   * Search conversations and messages across the user's accessible scope.
   */
  static async searchCommunication(
    userId: string,
    query: string
  ): Promise<{
    conversations: ConversationSummary[];
    messages: CommunicationMessageItem[];
  }> {
    await ensureCommunicationTables();
    const q = query.trim().toLowerCase();
    if (!q) return { conversations: [], messages: [] };

    // Search conversations
    const convs = await this.listConversations(userId, { search: q });

    // Search messages in user's conversations
    const msgRes: any = await sql`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.client_message_id,
        m.sequence_number,
        m.type,
        m.content,
        m.reply_to_id,
        m.forwarded_from_id,
        m.media_urls,
        m.metadata,
        m.status,
        m.is_pinned,
        m.edited_at,
        m.edit_version,
        m.deleted_at,
        m.deleted_for_all,
        m.created_at,
        m.updated_at
      FROM communication_messages m
      JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = ${userId}
      WHERE LOWER(m.content) LIKE ${`%${q}%`}
        AND (m.deleted_for_all = false OR m.deleted_for_all IS NULL)
        AND NOT (${userId} = ANY(COALESCE(m.deleted_for_user_ids, '{}')))
      ORDER BY m.created_at DESC
      LIMIT 30;
    `.execute(database);

    const messages: CommunicationMessageItem[] = [];
    for (const row of msgRes.rows || []) {
      const iden = await this.getCanonicalIdentity(row.sender_id);
      messages.push({
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        clientMessageId: row.client_message_id,
        sequenceNumber: Number(row.sequence_number),
        type: row.type,
        content: row.content || "",
        replyToId: row.reply_to_id,
        replyToSnippet: null,
        forwardedFromId: row.forwarded_from_id,
        mediaUrls: row.media_urls,
        metadata: row.metadata,
        status: row.status,
        isPinned: Boolean(row.is_pinned),
        editedAt: row.edited_at ? new Date(row.edited_at).toISOString() : null,
        editVersion: Number(row.edit_version || 0),
        deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : null,
        deletedForAll: Boolean(row.deleted_for_all),
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
        senderIdentity: iden,
        reactions: [],
      });
    }

    return { conversations: convs, messages };
  }

  /**
   * Get user communication settings
   */
  static async getSettings(userId: string) {
    await ensureCommunicationTables();
    const res: any = await sql`
      SELECT * FROM communication_settings WHERE user_id = ${userId} LIMIT 1;
    `.execute(database);
    if (res.rows?.[0]) return res.rows[0];

    return {
      user_id: userId,
      show_online_status: true,
      show_last_active: true,
      show_read_receipts: true,
      show_typing_status: true,
      allow_messages_from: "EVERYONE",
      notifications_enabled: true,
      push_enabled: true,
      email_enabled: false,
    };
  }

  /**
   * Update user communication settings
   */
  static async updateSettings(
    userId: string,
    data: {
      showOnlineStatus?: boolean;
      showLastActive?: boolean;
      showReadReceipts?: boolean;
      showTypingStatus?: boolean;
      allowMessagesFrom?: string;
      notificationsEnabled?: boolean;
      pushEnabled?: boolean;
      emailEnabled?: boolean;
    }
  ) {
    await ensureCommunicationTables();
    const now = new Date();
    await sql`
      INSERT INTO communication_settings (
        user_id, show_online_status, show_last_active, show_read_receipts,
        show_typing_status, allow_messages_from, notifications_enabled,
        push_enabled, email_enabled, updated_at
      ) VALUES (
        ${userId},
        ${data.showOnlineStatus ?? true},
        ${data.showLastActive ?? true},
        ${data.showReadReceipts ?? true},
        ${data.showTypingStatus ?? true},
        ${data.allowMessagesFrom || "EVERYONE"},
        ${data.notificationsEnabled ?? true},
        ${data.pushEnabled ?? true},
        ${data.emailEnabled ?? false},
        ${now}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        show_online_status = EXCLUDED.show_online_status,
        show_last_active = EXCLUDED.show_last_active,
        show_read_receipts = EXCLUDED.show_read_receipts,
        show_typing_status = EXCLUDED.show_typing_status,
        allow_messages_from = EXCLUDED.allow_messages_from,
        notifications_enabled = EXCLUDED.notifications_enabled,
        push_enabled = EXCLUDED.push_enabled,
        email_enabled = EXCLUDED.email_enabled,
        updated_at = ${now};
    `.execute(database);
  }

  /**
   * Initiate and log a call session
   */
  static async logCallSession(
    callerId: string,
    params: {
      conversationId: string;
      callType: "VOICE" | "VIDEO" | "MEETING";
      participantIds: string[];
    }
  ): Promise<string> {
    await ensureCommunicationTables();
    const callId = generateCommId("call");
    const now = new Date();

    await sql`
      INSERT INTO communication_calls (
        id, conversation_id, caller_id, call_type, status, started_at, created_at
      ) VALUES (
        ${callId}, ${params.conversationId}, ${callerId}, ${params.callType}, 'INITIATED', ${now}, ${now}
      );
    `.execute(database);

    await sql`
      INSERT INTO communication_call_participants (id, call_id, user_id, status, joined_at)
      VALUES (${generateCommId("cp")}, ${callId}, ${callerId}, 'JOINED', ${now});
    `.execute(database);

    for (const pId of params.participantIds) {
      if (pId !== callerId) {
        await sql`
          INSERT INTO communication_call_participants (id, call_id, user_id, status)
          VALUES (${generateCommId("cp")}, ${callId}, ${pId}, 'INVITED')
          ON CONFLICT DO NOTHING;
        `.execute(database);
      }
    }

    return callId;
  }

  /**
   * End call session
   */
  static async endCallSession(callId: string, durationSeconds = 0): Promise<void> {
    await ensureCommunicationTables();
    const now = new Date();
    await sql`
      UPDATE communication_calls
      SET status = 'ENDED', ended_at = ${now}, duration_seconds = ${durationSeconds}
      WHERE id = ${callId};
    `.execute(database);
  }
}
