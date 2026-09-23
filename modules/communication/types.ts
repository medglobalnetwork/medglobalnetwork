// ============================================================
// MGN Communication Engine — Type Definitions
// modules/communication/types.ts
//
// Shared types for messaging, meetings, calls, rich entities,
// permissions, and canonical identity across the MGN ecosystem.
// ============================================================

export type ConversationType =
  | "DIRECT"
  | "GROUP"
  | "COMMUNITY"
  | "ORGANIZATION"
  | "EVENT"
  | "CAMP"
  | "RESEARCH"
  | "JOB"
  | "MARKETPLACE"
  | "SUPPORT"
  | "SYSTEM";

export type ConversationStatus =
  | "ACTIVE"
  | "ARCHIVED"
  | "MUTED"
  | "LOCKED"
  | "SUSPENDED"
  | "DELETED"
  | "READ_ONLY";

export type ConversationPrivacy = "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE";

export type GroupRole = "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER";

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "VOICE"
  | "DOCUMENT"
  | "LINK"
  | "PROFILE"
  | "POST"
  | "COURSE"
  | "JOB"
  | "EVENT"
  | "CAMP"
  | "RESEARCH"
  | "PRODUCT"
  | "POLL"
  | "SYSTEM"
  | "MEETING";

export type MessageStatus = "SENT" | "DELIVERED" | "READ" | "FAILED";

export type CallType = "VOICE" | "VIDEO" | "MEETING";

export type CallStatus =
  | "INITIATED"
  | "RINGING"
  | "ACTIVE"
  | "ENDED"
  | "REJECTED"
  | "MISSED";

export type MessageRequestStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED";

export interface CommunicationIdentity {
  userId: string;
  name: string;
  image: string | null;
  profession: string | null;
  specialization: string | null;
  designation: string | null;
  organization: string | null;
  memberId: string | null;
  isFoundingMember: boolean;
  verificationStatus: string | null;
  identityVerified: boolean;
  councilNumber?: string | null;
  onlineStatus?: "ONLINE" | "OFFLINE" | "AWAY" | "IN_MEETING";
  lastActive?: string | null;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  role: GroupRole;
  joinedAt: string;
  lastReadAt: string;
  lastReadMessageId?: string | null;
  isMuted: boolean;
  mutedUntil?: string | null;
  identity?: CommunicationIdentity;
}

export interface ConversationContextDetails {
  eventId?: string | null;
  eventTitle?: string | null;
  campId?: string | null;
  campTitle?: string | null;
  researchProjectId?: string | null;
  researchTitle?: string | null;
  jobId?: string | null;
  jobTitle?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  communityId?: string | null;
  communityName?: string | null;
  marketplaceOrderId?: string | null;
}

export interface ConversationSummary {
  id: string;
  type: ConversationType;
  name: string | null;
  avatarUrl: string | null;
  createdBy: string | null;
  status: ConversationStatus;
  privacy: ConversationPrivacy;
  settings?: Record<string, unknown>;
  lastMessageContent: string | null;
  lastMessageAt: string | null;
  lastSenderId?: string | null;
  unreadCount: number;
  peerIdentity?: CommunicationIdentity | null;
  context: ConversationContextDetails;
  memberCount?: number;
  userRole?: GroupRole;
  isMuted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageReactionItem {
  reaction: string;
  count: number;
  userIds: string[];
  hasReacted: boolean;
}

export interface RichEntitySharePayload {
  entityType:
    | "event"
    | "camp"
    | "job"
    | "research"
    | "profile"
    | "post"
    | "course"
    | "product"
    | "meeting";
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  badge?: string | null;
  url: string;
  dateOrLocation?: string | null;
  meta?: Record<string, unknown>;
}

export interface CommunicationMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  clientMessageId?: string | null;
  sequenceNumber: number;
  type: MessageType;
  content: string;
  replyToId?: string | null;
  replyToSnippet?: {
    id: string;
    senderName: string;
    content: string;
  } | null;
  forwardedFromId?: string | null;
  mediaUrls?: string[] | null;
  metadata?: {
    entity?: RichEntitySharePayload;
    voice?: {
      durationSeconds: number;
      waveform?: number[];
    };
    poll?: {
      question: string;
      options: { id: string; text: string; votes: number }[];
      totalVotes: number;
      userVotedOptionId?: string;
    };
    meeting?: {
      title: string;
      startTime: string;
      endTime: string;
      meetingLink?: string;
      calendarEventId?: string;
      status: string;
    };
    [key: string]: unknown;
  } | null;
  status: MessageStatus;
  isPinned: boolean;
  editedAt?: string | null;
  editVersion: number;
  deletedAt?: string | null;
  deletedForAll: boolean;
  createdAt: string;
  updatedAt: string;
  senderIdentity?: CommunicationIdentity;
  reactions: MessageReactionItem[];
}

export interface CommunicationCallSession {
  id: string;
  conversationId: string;
  callerId: string;
  callType: CallType;
  status: CallStatus;
  startedAt: string;
  endedAt?: string | null;
  durationSeconds: number;
  meetingId?: string | null;
  participants: {
    userId: string;
    status: string;
    identity?: CommunicationIdentity;
  }[];
}

export interface MessageRequestItem {
  id: string;
  senderId: string;
  receiverId: string;
  initialMessage?: string | null;
  status: MessageRequestStatus;
  createdAt: string;
  senderIdentity: CommunicationIdentity;
}

export interface ScheduleMeetingInput {
  conversationId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  meetingLink?: string;
  reminderMinutes?: number;
}
