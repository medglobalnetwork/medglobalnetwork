// ============================================================
// MGN Communication Permission Engine
// modules/communication/lib/communication-permissions.ts
//
// Centralized permission checks for messaging, group management,
// calls, meetings, moderation, and role-based access control.
// ============================================================

import { database } from "@/lib/auth";
import { sql } from "kysely";
import { GroupRole, ConversationStatus } from "../types";

export class CommunicationPermissionService {
  /**
   * Check if user is blocked or has blocked another user.
   */
  static async isBlocked(userA: string, userB: string): Promise<boolean> {
    const res: any = await sql`
      SELECT 1 FROM communication_user_blocks
      WHERE (blocker_id = ${userA} AND blocked_id = ${userB})
         OR (blocker_id = ${userB} AND blocked_id = ${userA})
      LIMIT 1;
    `.execute(database);

    return (res.rows?.length || 0) > 0;
  }

  /**
   * Get user's membership and role in a conversation.
   */
  static async getMemberRecord(userId: string, conversationId: string): Promise<{
    isMember: boolean;
    role: GroupRole | null;
    isMuted: boolean;
    conversationStatus: ConversationStatus;
    conversationType: string;
  } | null> {
    const res: any = await sql`
      SELECT 
        m.role,
        m.is_muted,
        c.status as conversation_status,
        c.type as conversation_type
      FROM conversations c
      LEFT JOIN conversation_members m ON m.conversation_id = c.id AND m.user_id = ${userId}
      WHERE c.id = ${conversationId}
      LIMIT 1;
    `.execute(database);

    const row = res.rows?.[0];
    if (!row) return null;

    return {
      isMember: Boolean(row.role),
      role: (row.role as GroupRole) || null,
      isMuted: Boolean(row.is_muted),
      conversationStatus: (row.conversation_status as ConversationStatus) || "ACTIVE",
      conversationType: row.conversation_type,
    };
  }

  /**
   * Check if user can send a message to a conversation.
   */
  static async canSendMessage(userId: string, conversationId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const record = await this.getMemberRecord(userId, conversationId);
    if (!record) {
      return { allowed: false, reason: "Conversation does not exist" };
    }

    if (!record.isMember) {
      return { allowed: false, reason: "You are not a member of this conversation" };
    }

    if (["SUSPENDED", "DELETED", "LOCKED"].includes(record.conversationStatus)) {
      return { allowed: false, reason: `Conversation is ${record.conversationStatus.toLowerCase()}` };
    }

    if (record.conversationStatus === "READ_ONLY") {
      const isPrivileged = record.role === "OWNER" || record.role === "ADMIN";
      if (!isPrivileged) {
        return { allowed: false, reason: "This conversation has concluded and is read-only" };
      }
    }

    // In direct conversations, check block status
    if (record.conversationType === "DIRECT") {
      const otherMemberRes: any = await sql`
        SELECT user_id FROM conversation_members
        WHERE conversation_id = ${conversationId} AND user_id != ${userId}
        LIMIT 1;
      `.execute(database);

      const peerId = otherMemberRes.rows?.[0]?.user_id;
      if (peerId) {
        const blocked = await this.isBlocked(userId, peerId);
        if (blocked) {
          return { allowed: false, reason: "Communication between these accounts is unavailable" };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Check if user can edit a message.
   */
  static async canEditMessage(userId: string, messageId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const res: any = await sql`
      SELECT sender_id, deleted_at, created_at FROM communication_messages
      WHERE id = ${messageId}
      LIMIT 1;
    `.execute(database);

    const msg = res.rows?.[0];
    if (!msg) return { allowed: false, reason: "Message not found" };

    if (msg.sender_id !== userId) {
      return { allowed: false, reason: "You can only edit your own messages" };
    }

    if (msg.deleted_at) {
      return { allowed: false, reason: "Cannot edit a deleted message" };
    }

    // Optional 24-hour edit window
    const ageHours = (Date.now() - new Date(msg.created_at).getTime()) / (1000 * 60 * 60);
    if (ageHours > 24) {
      return { allowed: false, reason: "Messages can only be edited within 24 hours of sending" };
    }

    return { allowed: true };
  }

  /**
   * Check if user can delete a message.
   */
  static async canDeleteMessage(
    userId: string,
    messageId: string,
    deleteForAll: boolean
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const res: any = await sql`
      SELECT m.sender_id, m.conversation_id, cm.role
      FROM communication_messages m
      LEFT JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = ${userId}
      WHERE m.id = ${messageId}
      LIMIT 1;
    `.execute(database);

    const row = res.rows?.[0];
    if (!row) return { allowed: false, reason: "Message not found" };

    if (!deleteForAll) {
      return { allowed: true };
    }

    // Sender can always delete for all
    if (row.sender_id === userId) {
      return { allowed: true };
    }

    // Owners, Admins, and Moderators of group conversations can delete others' messages
    if (["OWNER", "ADMIN", "MODERATOR"].includes(row.role)) {
      return { allowed: true };
    }

    return { allowed: false, reason: "Insufficient permissions to delete this message for everyone" };
  }

  /**
   * Check if user can pin/unpin messages in a conversation.
   */
  static async canPinMessage(userId: string, conversationId: string): Promise<boolean> {
    const record = await this.getMemberRecord(userId, conversationId);
    if (!record || !record.isMember) return false;

    if (record.conversationType === "DIRECT") return true;
    return ["OWNER", "ADMIN", "MODERATOR"].includes(record.role || "");
  }

  /**
   * Check if user can add members to a conversation.
   */
  static async canAddMember(userId: string, conversationId: string): Promise<boolean> {
    const record = await this.getMemberRecord(userId, conversationId);
    if (!record || !record.isMember) return false;

    if (record.conversationType === "DIRECT") return false; // Direct chats cannot have extra members
    return ["OWNER", "ADMIN", "MODERATOR"].includes(record.role || "");
  }

  /**
   * Check if user can remove target member from a conversation.
   */
  static async canRemoveMember(
    userId: string,
    conversationId: string,
    targetUserId: string
  ): Promise<boolean> {
    if (userId === targetUserId) return true; // User can always leave

    const userRecord = await this.getMemberRecord(userId, conversationId);
    const targetRecord = await this.getMemberRecord(targetUserId, conversationId);

    if (!userRecord || !targetRecord || !userRecord.isMember || !targetRecord.isMember) {
      return false;
    }

    const roleRank: Record<GroupRole, number> = {
      OWNER: 4,
      ADMIN: 3,
      MODERATOR: 2,
      MEMBER: 1,
    };

    const userRank = roleRank[userRecord.role || "MEMBER"] || 0;
    const targetRank = roleRank[targetRecord.role || "MEMBER"] || 0;

    return userRank > targetRank && userRank >= 2;
  }

  /**
   * Check if user can initiate a call or meeting.
   */
  static async canStartCall(userId: string, conversationId: string): Promise<boolean> {
    const check = await this.canSendMessage(userId, conversationId);
    return check.allowed;
  }

  /**
   * Check if user can mention @everyone in a conversation.
   * Restricted to OWNER, ADMIN, MODERATOR to prevent notification spam.
   */
  static async canMentionEveryone(userId: string, conversationId: string): Promise<boolean> {
    const record = await this.getMemberRecord(userId, conversationId);
    if (!record || !record.isMember) return false;
    if (record.conversationType === "DIRECT") return true;
    return ["OWNER", "ADMIN", "MODERATOR"].includes(record.role || "");
  }
}

