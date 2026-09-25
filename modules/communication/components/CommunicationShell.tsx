"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  Image as ImageIcon,
  Check,
  CheckCheck,
  MoreVertical,
  User,
  Sparkles,
  Loader2,
  RefreshCw,
  ExternalLink,
  Phone,
  Video,
  Calendar,
  Share2,
  Mic,
  Pin,
  Smile,
  X,
  Plus,
  Users,
  AlertTriangle,
  FolderKanban,
  Heart,
  ThumbsUp,
  SmilePlus,
  Pencil,
  Trash2,
  Copy,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { getUserAvatarUrl } from "@/lib/avatar";
import { MemberBadge } from "@/modules/network/components/MemberBadge";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";
import { ImageSelectorModal } from "@/components/media/ImageSelectorModal";
import { VoiceMessagePlayer } from "./VoiceMessagePlayer";
import { RichEntityCard } from "./RichEntityCard";
import { ScheduleMeetingModal } from "./ScheduleMeetingModal";
import { ShareEntityModal } from "./ShareEntityModal";
import { CallModal } from "./CallModal";
import { ConversationDetailsDrawer } from "./ConversationDetailsDrawer";
import VoicePill from "@/components/ui/VoicePill";
import {
  ConversationSummary,
  CommunicationMessageItem,
  ConversationType,
  RichEntitySharePayload,
  MessageRequestItem,
  MessageType,
} from "../types";
import { authClient } from "@/lib/auth-client";

export function CommunicationShell() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("to") || searchParams.get("user");
  const targetConvId = searchParams.get("conversation") || searchParams.get("id");
  const targetType = searchParams.get("type");
  const targetContextId = searchParams.get("contextId");

  // State
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "DIRECT" | "GROUP" | "CONTEXT" | "REQUESTS" | "UNREAD">("ALL");

  // Message Requests State
  const [requests, setRequests] = useState<MessageRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [messages, setMessages] = useState<CommunicationMessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Edit Message State
  const [editingMessage, setEditingMessage] = useState<CommunicationMessageItem | null>(null);
  const [deleteConfirmMsgId, setDeleteConfirmMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Replying state
  const [replyingTo, setReplyingTo] = useState<CommunicationMessageItem | null>(null);

  // Modals & Panels
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<"VOICE" | "VIDEO">("VOICE");
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [detailsData, setDetailsData] = useState<{ members: any[]; pinnedMessages: any[] }>({
    members: [],
    pinnedMessages: [],
  });

  // New Group Modal
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Emoji picker quick reaction popup
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  // 1. Fetch Conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/communication/conversations");
      if (!res.ok) throw new Error("Failed to load conversations");
      const json = await res.json();
      const list: ConversationSummary[] = json.data || [];
      setConversations(list);

      // Handle query param autoselection
      if (targetConvId) {
        const found = list.find((c) => c.id === targetConvId);
        if (found) setSelectedConversation(found);
      } else if (targetUserId) {
        const found = list.find(
          (c) => c.type === "DIRECT" && c.peerIdentity?.userId === targetUserId
        );
        if (found) {
          setSelectedConversation(found);
        } else {
          // Initialize direct conversation via POST
          try {
            const createRes = await fetch("/api/v1/communication/conversations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "DIRECT", peerId: targetUserId }),
            });
            if (createRes.ok) {
              const cJson = await createRes.json();
              if (cJson.conversationId) {
                // Refresh list and select
                const refreshed = await fetch("/api/v1/communication/conversations");
                const rJson = await refreshed.json();
                setConversations(rJson.data || []);
                const created = (rJson.data || []).find((c: any) => c.id === cJson.conversationId);
                if (created) setSelectedConversation(created);
              }
            }
          } catch (e) {
            console.error("Failed to auto-create direct conversation:", e);
          }
        }
      } else if (targetType && targetContextId) {
        // Find or create contextual conversation
        const found = list.find(
          (c) =>
            c.type === targetType.toUpperCase() &&
            (c.context.eventId === targetContextId ||
              c.context.campId === targetContextId ||
              c.context.jobId === targetContextId ||
              c.context.researchProjectId === targetContextId)
        );
        if (found) {
          setSelectedConversation(found);
        } else {
          try {
            const createRes = await fetch("/api/v1/communication/conversations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: targetType.toUpperCase(),
                contextId: targetContextId,
                name: searchParams.get("title") || undefined,
              }),
            });
            if (createRes.ok) {
              const cJson = await createRes.json();
              const refreshed = await fetch("/api/v1/communication/conversations");
              const rJson = await refreshed.json();
              setConversations(rJson.data || []);
              const created = (rJson.data || []).find((c: any) => c.id === cJson.conversationId);
              if (created) setSelectedConversation(created);
            }
          } catch (e) {
            console.error("Failed to auto-create contextual conversation:", e);
          }
        }
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [targetConvId, targetUserId, targetType, targetContextId, searchParams]);

  // Fetch Message Requests
  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch("/api/v1/communication/requests");
      if (res.ok) {
        const json = await res.json();
        setRequests(json.data || []);
      }
    } catch (e) {
      console.error("Error loading message requests:", e);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchRequests();
  }, [fetchConversations, fetchRequests]);

  // 2. Fetch Messages for Selected Conversation
  const fetchMessages = useCallback(
    async (convId: string, isSilent = false) => {
      if (!isSilent) setLoadingMessages(true);
      try {
        const res = await fetch(`/api/v1/communication/conversations/${convId}/messages?limit=60`);
        if (!res.ok) throw new Error("Failed to load messages");
        const json = await res.json();
        const newMsgs: CommunicationMessageItem[] = json.data || [];

        setMessages((prev) => {
          if (
            prev.length !== newMsgs.length ||
            (newMsgs.length > 0 && prev[prev.length - 1]?.id !== newMsgs[newMsgs.length - 1]?.id)
          ) {
            setTimeout(() => scrollToBottom(prev.length > 0), 50);
          }
          return newMsgs;
        });

        // Mark as read
        fetch(`/api/v1/communication/conversations/${convId}/read`, { method: "POST" }).catch(
          () => {}
        );

        // Clear local unread
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        if (!isSilent) setLoadingMessages(false);
      }
    },
    [scrollToBottom]
  );

  // Fetch Conversation Details & Members
  const fetchConversationDetails = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/v1/communication/conversations/${convId}`);
      if (res.ok) {
        const json = await res.json();
        setDetailsData({
          members: json.data?.members || [],
          pinnedMessages: json.data?.pinnedMessages || [],
        });
      }
    } catch (e) {
      console.error("Error fetching conversation details:", e);
    }
  }, []);

  // When selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      fetchConversationDetails(selectedConversation.id);
      setReplyingTo(null);
    } else {
      setMessages([]);
      setDetailsData({ members: [], pinnedMessages: [] });
    }
  }, [selectedConversation, fetchMessages, fetchConversationDetails]);

  // Periodic polling for active conversation (every 4 seconds)
  useEffect(() => {
    if (!selectedConversation) return;
    const interval = setInterval(() => {
      fetchMessages(selectedConversation.id, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedConversation, fetchMessages]);

  // 3. Send Message
  const handleSendMessage = async (
    e?: React.FormEvent,
    overrideType?: string,
    overrideMetadata?: Record<string, unknown>
  ) => {
    if (e) e.preventDefault();
    if (!selectedConversation) return;

    const content = inputMessage.trim();
    if (!content && selectedAttachments.length === 0 && !overrideMetadata) return;

    setSending(true);
    const tempText = content;
    const tempMedia = [...selectedAttachments];
    const tempReplyTo = replyingTo;

    setInputMessage("");
    setSelectedAttachments([]);
    setReplyingTo(null);

    const clientMessageId = `cm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const optimisticMsg: CommunicationMessageItem = {
      id: clientMessageId,
      conversationId: selectedConversation.id,
      senderId: session?.user?.id || "",
      clientMessageId,
      sequenceNumber: 0,
      type: (overrideType || (tempMedia.length > 0 ? "IMAGE" : "TEXT")) as MessageType,
      content: tempText,
      replyToId: tempReplyTo?.id,
      replyToSnippet: tempReplyTo
        ? {
            id: tempReplyTo.id,
            senderName: "Clinician",
            content: tempReplyTo.content,
          }
        : null,
      mediaUrls: tempMedia.length > 0 ? tempMedia : undefined,
      metadata: overrideMetadata,
      status: "SENT",
      isPinned: false,
      editVersion: 0,
      deletedForAll: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactions: [],
      editedAt: null,
      deletedAt: null,
      forwardedFromId: null
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const res = await fetch(
        `/api/v1/communication/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: tempText,
            type: overrideType || (tempMedia.length > 0 ? "IMAGE" : "TEXT"),
            clientMessageId,
            replyToId: tempReplyTo?.id,
            mediaUrls: tempMedia.length > 0 ? tempMedia : undefined,
            metadata: overrideMetadata,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to send message");

      const json = await res.json();
      if (json.data) {
        setMessages((prev) => prev.map((m) => m.clientMessageId === clientMessageId ? json.data : m));
        setTimeout(() => scrollToBottom(true), 50);

        // Update last message in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? {
                  ...c,
                  lastMessageContent: tempText || "📎 Attachment",
                  lastMessageAt: new Date().toISOString(),
                  lastSenderId: json.data.senderId,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.clientMessageId !== clientMessageId));
      setInputMessage(tempText);
      setSelectedAttachments(tempMedia);
      setReplyingTo(tempReplyTo);
    } finally {
      setSending(false);
    }
  };

  // 4. Reactions
  const handleReact = async (messageId: string, reaction: string) => {
    try {
      await fetch(`/api/v1/communication/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      });
      if (selectedConversation) {
        fetchMessages(selectedConversation.id, true);
      }
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  // 5. Pin / Unpin
  const handleTogglePin = async (messageId: string) => {
    if (!selectedConversation) return;
    try {
      await fetch(`/api/v1/communication/conversations/${selectedConversation.id}/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      fetchConversationDetails(selectedConversation.id);
      fetchMessages(selectedConversation.id, true);
    } catch (err) {
      console.error("Pin error:", err);
    }
  };

  // 6. Delete Message
  const handleDeleteMessage = async (messageId: string, deleteForAll = false) => {
    try {
      await fetch(
        `/api/v1/communication/messages/${messageId}?deleteForAll=${deleteForAll ? "true" : "false"}`,
        { method: "DELETE" }
      );
      if (selectedConversation) {
        fetchMessages(selectedConversation.id, true);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // 6B. Edit Message
  const handleStartEdit = (msg: CommunicationMessageItem) => {
    setEditingMessage(msg);
    setInputMessage(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInputMessage("");
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !inputMessage.trim()) return;
    try {
      const res = await fetch(`/api/v1/communication/messages/${editingMessage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputMessage.trim() }),
      });
      if (res.ok) {
        setEditingMessage(null);
        setInputMessage("");
        if (selectedConversation) {
          fetchMessages(selectedConversation.id, true);
        }
      }
    } catch (e) {
      console.error("Error editing message:", e);
    }
  };

  // 6C. Copy Message Text
  const handleCopyMessage = (msg: CommunicationMessageItem) => {
    if (msg.content) {
      navigator.clipboard.writeText(msg.content);
      setCopiedMsgId(msg.id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  // 6D. Respond to Message Request
  const handleRespondRequest = async (requestId: string, action: "ACCEPT" | "DECLINE" | "BLOCK") => {
    try {
      const res = await fetch(`/api/v1/communication/requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const json = await res.json();
        await fetchRequests();
        await fetchConversations();
        if (action === "ACCEPT" && json.conversationId) {
          const resConvs = await fetch("/api/v1/communication/conversations");
          if (resConvs.ok) {
            const cj = await resConvs.json();
            const matched = (cj.data || []).find((c: any) => c.id === json.conversationId);
            if (matched) {
              setSelectedConversation(matched);
              setActiveTab("DIRECT");
            }
          }
        }
      }
    } catch (e) {
      console.error("Error responding to request:", e);
    }
  };

  // 6E. Calls
  const handleStartCall = async (type: "VOICE" | "VIDEO") => {
    if (!selectedConversation) return;
    setCallType(type);
    setShowCallModal(true);

    try {
      const res = await fetch("/api/v1/communication/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          callType: type,
          participantIds: detailsData.members.map((m) => m.userId),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setActiveCallId(json.callId || null);
      }
    } catch (e) {
      console.error("Error initiating call:", e);
    }
  };

  const handleEndCall = async () => {
    setShowCallModal(false);
    if (activeCallId) {
      fetch("/api/v1/communication/calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId: activeCallId, durationSeconds: 45 }),
      }).catch(() => {});
      setActiveCallId(null);
    }
  };

  // 7. Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);

    try {
      const res = await fetch("/api/v1/communication/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GROUP",
          name: newGroupName.trim(),
          memberIds: [],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setShowNewGroupModal(false);
        setNewGroupName("");
        await fetchConversations();
        if (json.conversationId) {
          const created = conversations.find((c) => c.id === json.conversationId);
          if (created) setSelectedConversation(created);
        }
      }
    } catch (e) {
      console.error("Create group error:", e);
    } finally {
      setCreatingGroup(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (activeTab === "DIRECT" && c.type !== "DIRECT") return false;
    if (activeTab === "GROUP" && c.type !== "GROUP") return false;
    if (
      activeTab === "CONTEXT" &&
      !["EVENT", "CAMP", "RESEARCH", "JOB", "ORGANIZATION", "COMMUNITY"].includes(c.type)
    )
      return false;
    if (activeTab === "UNREAD" && c.unreadCount === 0) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.peerIdentity?.name && c.peerIdentity.name.toLowerCase().includes(q)) ||
      (c.peerIdentity?.profession && c.peerIdentity.profession.toLowerCase().includes(q)) ||
      (c.peerIdentity?.specialization && c.peerIdentity.specialization.toLowerCase().includes(q)) ||
      (c.lastMessageContent && c.lastMessageContent.toLowerCase().includes(q)) ||
      (c.context.eventTitle && c.context.eventTitle.toLowerCase().includes(q)) ||
      (c.context.campTitle && c.context.campTitle.toLowerCase().includes(q)) ||
      (c.context.jobTitle && c.context.jobTitle.toLowerCase().includes(q)) ||
      (c.context.researchTitle && c.context.researchTitle.toLowerCase().includes(q))
    );
  });

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatConversationDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  // Active Peer Identity / Title
  const activeIsDirect = selectedConversation?.type === "DIRECT";
  const activePeer = selectedConversation?.peerIdentity;
  const activeTitle = activeIsDirect
    ? activePeer?.name || "Medical Clinician"
    : selectedConversation?.name || `${selectedConversation?.type} Collaboration`;

  const activeSubtitle = activeIsDirect
    ? activePeer?.designation ||
      activePeer?.specialization ||
      activePeer?.profession ||
      "Medical Professional"
    : `${selectedConversation?.type} · ${detailsData.members.length || 1} participants`;

  const mediaMessages = messages.filter((m) => m.mediaUrls && m.mediaUrls.length > 0);

  return (
    <div className="w-full h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] flex flex-col">
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* ============================================================ */}
        {/* LEFT SIDEBAR: CONVERSATION LIST */}
        {/* ============================================================ */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-[#e8e6e3] bg-white ${
            selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-[#e8e6e3] flex items-center justify-between bg-[#faf9f8]">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#1769c2]" />
              <h1 className="text-base sm:text-lg font-black text-[#171717]">Communication</h1>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowNewGroupModal(true)}
                className="p-1.5 text-[#77716b] hover:text-[#1769c2] hover:bg-[#efefef] rounded-lg transition"
                title="New Group Chat"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => fetchConversations()}
                className="p-1.5 text-[#77716b] hover:text-[#171717] hover:bg-[#efefef] rounded-lg transition"
                title="Refresh inbox"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-[#f0efee] overflow-x-auto text-xs font-bold scrollbar-none bg-[#faf9f8]">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
                activeTab === "ALL"
                  ? "bg-[#1769c2] text-white"
                  : "text-[#77716b] hover:text-[#171717] hover:bg-[#f0efee]"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("DIRECT")}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
                activeTab === "DIRECT"
                  ? "bg-[#1769c2] text-white"
                  : "text-[#77716b] hover:text-[#171717] hover:bg-[#f0efee]"
              }`}
            >
              Direct
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("GROUP")}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
                activeTab === "GROUP"
                  ? "bg-[#1769c2] text-white"
                  : "text-[#77716b] hover:text-[#171717] hover:bg-[#f0efee]"
              }`}
            >
              Groups
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("CONTEXT")}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
                activeTab === "CONTEXT"
                  ? "bg-[#1769c2] text-white"
                  : "text-[#77716b] hover:text-[#171717] hover:bg-[#f0efee]"
              }`}
            >
              Contextual
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("REQUESTS");
                fetchRequests();
              }}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "REQUESTS"
                  ? "bg-[#1769c2] text-white"
                  : "text-[#77716b] hover:text-[#171717] hover:bg-[#f0efee]"
              }`}
            >
              <span>Requests</span>
              {requests.length > 0 && (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("UNREAD")}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
                activeTab === "UNREAD"
                  ? "bg-[#1769c2] text-white"
                  : "text-[#77716b] hover:text-[#171717] hover:bg-[#f0efee]"
              }`}
            >
              Unread
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-[#f0efee]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9c958f]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clinician, group, or context..."
                className="w-full rounded-xl bg-[#f5f4f2] pl-9 pr-3 py-2 text-xs sm:text-sm text-[#171717] placeholder:text-[#9c958f] border-none focus:outline-none focus:ring-2 focus:ring-[#1769c2]/30"
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f5f4f2]">
            {activeTab === "REQUESTS" ? (
              loadingRequests ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-[#77716b]">
                  <Loader2 className="h-6 w-6 animate-spin text-[#1769c2] mb-2" />
                  <p className="text-xs">Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-8 text-center text-[#77716b]">
                  <MessageSquare className="h-10 w-10 text-[#ded8d1] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#171717]">No message requests</p>
                  <p className="text-xs text-[#77716b] mt-1">
                    Direct messages from healthcare professionals outside your network will appear here for review.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#f5f4f2] p-2 space-y-2">
                  {requests.map((req) => {
                    const avatar = getUserAvatarUrl(req.senderIdentity.image, req.senderIdentity.name);
                    return (
                      <div
                        key={req.id}
                        className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2.5"
                      >
                        <div className="flex items-start gap-2.5">
                          <img
                            src={avatar}
                            alt={req.senderIdentity.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {req.senderIdentity.name}
                              </span>
                              {req.senderIdentity.identityVerified && <VerificationBadge size="sm" />}
                              {req.senderIdentity.isFoundingMember && (
                                <MemberBadge
                                  isFoundingMember={true}
                                  memberId={req.senderIdentity.memberId}
                                  size="xs"
                                  showCopy={false}
                                />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {req.senderIdentity.designation ||
                                req.senderIdentity.profession ||
                                "Healthcare Professional"}
                              {req.senderIdentity.organization ? ` • ${req.senderIdentity.organization}` : ""}
                            </p>
                          </div>
                        </div>
                        {req.initialMessage && (
                          <div className="bg-slate-50 p-2 rounded-lg text-xs text-slate-700 italic border border-slate-100">
                            &ldquo;{req.initialMessage}&rdquo;
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleRespondRequest(req.id, "ACCEPT")}
                            className="flex-1 bg-[#1769c2] hover:bg-[#12569f] text-white text-xs font-bold py-1.5 rounded-lg transition text-center shadow-xs"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRespondRequest(req.id, "DECLINE")}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 rounded-lg transition text-center"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRespondRequest(req.id, "BLOCK")}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition"
                            title="Block User"
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : loadingConversations ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-[#77716b]">
                <Loader2 className="h-6 w-6 animate-spin text-[#1769c2] mb-2" />
                <p className="text-xs">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-[#77716b]">
                <MessageSquare className="h-10 w-10 text-[#ded8d1] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#171717]">No conversations yet</p>
                <p className="text-xs text-[#77716b] mt-1 mb-4">
                  Connect with verified healthcare professionals and start a professional conversation.
                </p>
                <Link
                  href="/network"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] text-white text-xs font-bold px-3 py-2 shadow-xs hover:bg-[#12569f] transition"
                >
                  <User className="h-3.5 w-3.5" /> Explore Network
                </Link>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                const isDir = conv.type === "DIRECT";
                const p = conv.peerIdentity;
                const convAvatar = getUserAvatarUrl(
                  isDir ? p?.image : conv.avatarUrl,
                  isDir ? p?.name : conv.name || "Group"
                );
                const convTitle = isDir
                  ? p?.name || "Clinician"
                  : conv.name || `${conv.type} Collaboration`;

                const subtitle = isDir
                  ? p?.designation || p?.specialization || p?.profession || "Medical Professional"
                  : `${conv.type} Chat`;

                // Context pill title
                const contextPill =
                  conv.context?.eventTitle ||
                  conv.context?.campTitle ||
                  conv.context?.jobTitle ||
                  conv.context?.researchTitle;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      router.replace(`/messages?id=${conv.id}`, { scroll: false });
                    }}
                    className={`w-full text-left p-3 sm:p-3.5 flex items-center gap-3 transition ${
                      isSelected
                        ? "bg-[#eef5fc] border-l-4 border-[#1769c2]"
                        : "hover:bg-[#f8f7f6]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={convAvatar}
                        alt={convTitle}
                        className="h-11 w-11 rounded-full object-cover border border-[#e8e6e3]"
                      />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1769c2] px-1 text-[10px] font-black text-white ring-2 ring-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-xs sm:text-sm text-[#171717] truncate flex items-center gap-1">
                          {convTitle}
                          {isDir && p?.isFoundingMember && (
                            <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                          )}
                        </span>
                        <span className="text-[10px] text-[#9c958f] shrink-0">
                          {formatConversationDate(conv.lastMessageAt)}
                        </span>
                      </div>

                      {/* Subtitle / Context label */}
                      {contextPill ? (
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.2 rounded truncate max-w-[200px]">
                            {conv.type}: {contextPill}
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#77716b] truncate mb-0.5">{subtitle}</p>
                      )}

                      <p
                        className={`text-xs truncate ${
                          conv.unreadCount > 0 ? "font-bold text-[#171717]" : "text-[#9c958f]"
                        }`}
                      >
                        {conv.lastMessageContent || "Start professional conversation"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER PANEL: ACTIVE CONVERSATION THREAD */}
        {/* ============================================================ */}
        <div
          className={`flex-1 flex flex-col bg-[#fbfbfa] min-w-0 ${
            !selectedConversation
              ? "hidden md:flex items-center justify-center"
              : showDetailsDrawer
              ? "hidden md:flex"
              : "flex"
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-[#e8e6e3] bg-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-1.5 -ml-1 text-[#5d5854] hover:bg-[#efefef] rounded-lg transition"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div
                    onClick={() => setShowDetailsDrawer((prev) => !prev)}
                    className="flex items-center gap-2.5 sm:gap-3 min-w-0 cursor-pointer group hover:opacity-85 transition select-none"
                    title="Click to view profile & chat details"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowDetailsDrawer((prev) => !prev);
                      }
                    }}
                  >
                    <img
                      src={getUserAvatarUrl(
                        activeIsDirect ? activePeer?.userId : selectedConversation.id,
                        activeIsDirect ? activePeer?.image : selectedConversation.avatarUrl
                      )}
                      alt={activeTitle}
                      className="h-10 w-10 rounded-full object-cover border border-[#e8e6e3] shrink-0 group-hover:ring-2 group-hover:ring-[#0f4c81]/40 transition"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-sm sm:text-base font-bold text-[#171717] group-hover:text-[#0f4c81] transition truncate">
                          {activeTitle}
                        </h2>
                        {activeIsDirect && activePeer && (
                          <MemberBadge
                            memberId={activePeer.memberId}
                            isFoundingMember={activePeer.isFoundingMember}
                            size="sm"
                            variant="pill"
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-[#77716b] truncate">{activeSubtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartCall("VOICE")}
                    className="p-2 text-[#77716b] hover:text-[#1769c2] hover:bg-[#f0f4f8] rounded-xl transition"
                    title="Audio Call"
                  >
                    <Phone className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartCall("VIDEO")}
                    className="p-2 text-[#77716b] hover:text-[#1769c2] hover:bg-[#f0f4f8] rounded-xl transition"
                    title="Video Call"
                  >
                    <Video className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(true)}
                    className="p-2 text-[#77716b] hover:text-[#1769c2] hover:bg-[#f0f4f8] rounded-xl transition hidden sm:flex"
                    title="Schedule Meeting"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDetailsDrawer(!showDetailsDrawer)}
                    className={`p-2 rounded-xl transition ${
                      showDetailsDrawer
                        ? "bg-[#1769c2] text-white"
                        : "text-[#77716b] hover:text-[#1769c2] hover:bg-[#f0f4f8]"
                    }`}
                    title="Conversation Details & Workspace"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Pinned Messages Notice if any */}
              {detailsData.pinnedMessages.length > 0 && (
                <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2 truncate">
                    <Pin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span className="font-semibold shrink-0">Pinned:</span>
                    <span className="truncate">{detailsData.pinnedMessages[0]?.content}</span>
                  </div>
                </div>
              )}

              {/* Messages Body */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3.5">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-[#77716b]">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1769c2] mb-2" />
                    <p className="text-xs">Loading message history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="h-14 w-14 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#1769c2] mb-3">
                      <MessageSquare className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-bold text-[#171717]">
                      {activeIsDirect ? `Direct conversation with ${activeTitle}` : activeTitle}
                    </h3>
                    <p className="text-xs text-[#77716b] max-w-sm mt-1 mb-4">
                      All communications on MGN are private, professional, and encrypted in transit.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          setInputMessage("Hello! Great to connect with you on Med Global Network.")
                        }
                        className="text-xs bg-white border border-[#ded8d1] rounded-full px-3 py-1.5 text-[#5d5854] hover:border-[#1769c2] hover:text-[#1769c2] transition"
                      >
                        👋 Hello! Great to connect.
                      </button>
                      <button
                        onClick={() =>
                          setInputMessage("Hi, I wanted to discuss a clinical case with you.")
                        }
                        className="text-xs bg-white border border-[#ded8d1] rounded-full px-3 py-1.5 text-[#5d5854] hover:border-[#1769c2] hover:text-[#1769c2] transition"
                      >
                        🩺 Discuss a clinical case
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = session?.user?.id === msg.senderId;

                    return (
                      <div
                        key={msg.id}
                        onMouseEnter={() => setHoveredMessageId(msg.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                        className={`flex flex-col relative group ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Sender name for groups */}
                        {!isMe && !activeIsDirect && (
                          <span className="text-[10px] font-bold text-slate-500 mb-1 ml-1">
                            {msg.senderIdentity?.name || "Clinician"}
                          </span>
                        )}

                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-2xs relative ${
                            isMe
                              ? "bg-[#1769c2] text-white rounded-br-xs"
                              : "bg-white text-[#171717] border border-[#e8e6e3] rounded-bl-xs"
                          }`}
                        >
                          {/* Reply to snippet */}
                          {msg.replyToSnippet && (
                            <div
                              className={`mb-2 p-2 rounded-lg text-xs border-l-3 ${
                                isMe
                                  ? "bg-blue-700/60 border-white/80 text-blue-100"
                                  : "bg-slate-100 border-[#1769c2] text-slate-700"
                              }`}
                            >
                              <span className="font-bold text-[10px] block">
                                {msg.replyToSnippet.senderName}
                              </span>
                              <p className="line-clamp-1">{msg.replyToSnippet.content}</p>
                            </div>
                          )}

                          {/* Image Attachments */}
                          {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                            <div className="mb-2 space-y-1.5">
                              {msg.mediaUrls.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block overflow-hidden rounded-xl"
                                >
                                  <img
                                    src={url}
                                    alt="attachment"
                                    className="max-h-60 w-auto rounded-xl object-cover hover:opacity-95 transition"
                                  />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Voice Message */}
                          {msg.type === "VOICE" && (
                            <div className="mb-1.5">
                              <VoiceMessagePlayer
                                durationSeconds={msg.metadata?.voice?.durationSeconds || 12}
                                isMe={isMe}
                              />
                            </div>
                          )}

                          {/* Rich Entity / Meeting Card */}
                          {msg.metadata?.entity && (
                            <div className="mb-2">
                              <RichEntityCard
                                entity={msg.metadata.entity as RichEntitySharePayload}
                                isMe={isMe}
                              />
                            </div>
                          )}

                          {/* Text Content */}
                          {msg.deletedForAll ? (
                            <div className="flex items-center gap-1.5 italic text-xs py-0.5 opacity-70">
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>This message was deleted</span>
                            </div>
                          ) : msg.content && msg.type !== "VOICE" ? (
                            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {msg.content}
                            </p>
                          ) : null}

                          {/* Footer: Time, Edited & Read Status */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isMe ? "text-blue-100" : "text-[#9c958f]"
                            }`}
                          >
                            {msg.editVersion > 0 && <span className="italic mr-1">Edited</span>}
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {isMe && (
                              <span>
                                {msg.status === "READ" ? (
                                  <CheckCheck className="h-3.5 w-3.5 text-blue-200" />
                                ) : (
                                  <Check className="h-3.5 w-3.5 text-blue-200/70" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Reactions Bar under message */}
                        {msg.reactions.length > 0 && !msg.deletedForAll && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {msg.reactions.map((rx) => (
                              <button
                                key={rx.reaction}
                                type="button"
                                onClick={() => handleReact(msg.id, rx.reaction)}
                                className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 border transition ${
                                  rx.hasReacted
                                    ? "bg-blue-50 border-blue-300 text-blue-800 font-bold"
                                    : "bg-white border-slate-200 text-slate-700"
                                }`}
                              >
                                <span>{rx.reaction}</span>
                                <span>{rx.count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Hover Quick Action Toolbar */}
                        {hoveredMessageId === msg.id && !msg.deletedForAll && (
                          <div
                            className={`absolute top-0 -translate-y-1/2 flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-md z-20 ${
                              isMe ? "right-2" : "left-2"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleReact(msg.id, "❤️")}
                              className="hover:scale-125 transition p-0.5 text-xs"
                              title="Love"
                            >
                              ❤️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReact(msg.id, "👍")}
                              className="hover:scale-125 transition p-0.5 text-xs"
                              title="Thumbs Up"
                            >
                              👍
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReact(msg.id, "👏")}
                              className="hover:scale-125 transition p-0.5 text-xs"
                              title="Applause"
                            >
                              👏
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600 relative"
                              title="Copy text"
                            >
                              {copiedMsgId === msg.id ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyingTo(msg)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600"
                              title="Reply"
                            >
                              <MessageSquare className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTogglePin(msg.id)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600"
                              title="Pin Message"
                            >
                              <Pin className="h-3 w-3" />
                            </button>
                            {isMe && (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(msg)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                title="Edit message"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                            )}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmMsgId(deleteConfirmMsgId === msg.id ? null : msg.id)
                                }
                                className="p-1 hover:bg-red-50 rounded text-red-500"
                                title="Delete message"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>

                              {/* Delete Confirmation Options Popover */}
                              {deleteConfirmMsgId === msg.id && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1 flex flex-col gap-0.5 min-w-[140px] z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteMessage(msg.id, false);
                                      setDeleteConfirmMsgId(null);
                                    }}
                                    className="text-left text-xs px-2.5 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700 font-medium"
                                  >
                                    Delete for me
                                  </button>
                                  {isMe && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleDeleteMessage(msg.id, true);
                                        setDeleteConfirmMsgId(null);
                                      }}
                                      className="text-left text-xs px-2.5 py-1.5 hover:bg-red-50 rounded-lg text-red-600 font-medium"
                                    >
                                      Delete for everyone
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Quote Banner */}
              {replyingTo && (
                <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
                  <div className="text-xs text-blue-900 truncate">
                    <span className="font-bold">Replying to: </span>
                    <span>{replyingTo.content || "Attachment"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="p-1 text-blue-700 hover:text-blue-950"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Edit Message Banner */}
              {editingMessage && (
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between">
                  <div className="text-xs text-amber-900 truncate flex items-center gap-1.5">
                    <Pencil className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span className="font-bold">Editing message: </span>
                    <span className="truncate">{editingMessage.content}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-1 text-amber-700 hover:text-amber-950 rounded-full"
                    title="Cancel edit"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Selected Attachments Preview */}
              {selectedAttachments.length > 0 && (
                <div className="p-2 px-4 bg-white border-t border-[#f0efee] flex items-center gap-2 overflow-x-auto">
                  {selectedAttachments.map((url, idx) => (
                    <div key={idx} className="relative group shrink-0">
                      <img
                        src={url}
                        alt="preview"
                        className="h-14 w-14 rounded-lg object-cover border border-[#ded8d1]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAttachments((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold shadow-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Composer */}
              <div className="p-2.5 sm:p-3.5 border-t border-[#e8e6e3] bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingMessage) {
                      handleSaveEdit();
                    } else {
                      handleSendMessage(e);
                    }
                  }}
                  className="flex items-end gap-1.5 sm:gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="p-2 text-[#77716b] hover:text-[#1769c2] hover:bg-[#f0f4f8] rounded-xl transition shrink-0"
                    title="Attach Image"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="p-2 text-[#77716b] hover:text-[#0f4c81] hover:bg-[#f0f4f8] rounded-xl transition shrink-0"
                    title="Share MGN Entity (Event/Camp/Job/Research)"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>

                  <VoicePill
                    accentColor="#0f4c81"
                    iconColor="#77716b"
                    background="#f5f4f2"
                    size={36}
                    shape="pill"
                    reach={8}
                    showTime
                    waveform
                    slideToCancel
                    cancelDistance={64}
                    attack={40}
                    release={240}
                    sensitivity={1.2}
                    floor={0.1}
                    openDuration={200}
                    pressScale={0.95}
                    mode="auto"
                    holdAfter={300}
                    reactive="mic"
                    ariaLabel="Record Voice Note"
                    onStop={({ reason, duration }: { reason: string; duration: number }) => {
                      if (reason !== "cancel" && reason !== "escape" && reason !== "blur" && duration >= 400) {
                        const durSec = Math.max(1, Math.round(duration / 1000));
                        handleSendMessage(undefined, "VOICE", {
                          voice: { durationSeconds: durSec },
                        });
                      }
                    }}
                    className="shrink-0 mb-0.5"
                  />

                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (editingMessage) {
                          handleSaveEdit();
                        } else {
                          handleSendMessage();
                        }
                      }
                    }}
                    placeholder={editingMessage ? "Edit your message..." : `Message ${activeTitle}...`}
                    rows={1}
                    className="flex-1 max-h-32 min-h-[40px] resize-none rounded-xl bg-[#f5f4f2] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] placeholder:text-[#9c958f] border-none focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30"
                  />

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      (!inputMessage.trim() && selectedAttachments.length === 0)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f4c81] text-white hover:bg-[#0c3d69] disabled:opacity-40 disabled:hover:bg-[#0f4c81] transition shrink-0 shadow-xs active:scale-95"
                    title={editingMessage ? "Save edit" : "Send"}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingMessage ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Desktop Empty State */
            <div className="flex flex-col items-center justify-center p-8 text-center text-[#77716b]">
              <div className="h-16 w-16 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#1769c2] mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold text-[#171717]">MGN Communication Engine</h2>
              <p className="text-xs sm:text-sm text-[#77716b] max-w-sm mt-1">
                Select a conversation or peer clinician from the left to start collaborating.
              </p>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT SIDEBAR: CONVERSATION DETAILS DRAWER */}
        {/* ============================================================ */}
        {selectedConversation && showDetailsDrawer && (
          <ConversationDetailsDrawer
            conversation={selectedConversation}
            members={detailsData.members}
            pinnedMessages={detailsData.pinnedMessages}
            mediaMessages={mediaMessages}
            isOpen={showDetailsDrawer}
            onClose={() => setShowDetailsDrawer(false)}
            onStartCall={(type) => {
              setCallType(type);
              setShowCallModal(true);
            }}
            onScheduleMeeting={() => setShowScheduleModal(true)}
            onBlockUser={async (blockedId) => {
              if (confirm("Are you sure you want to block this user?")) {
                await fetch("/api/v1/communication/safety/block", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ targetUserId: blockedId }),
                });
                alert("User blocked.");
                setSelectedConversation(null);
                fetchConversations();
              }
            }}
            onReport={() => {
              const reason = prompt("Reason for reporting (e.g. spam, harassment, misconduct):");
              if (reason) {
                fetch("/api/v1/communication/safety/report", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    conversationId: selectedConversation.id,
                    reportedUserId: activePeer?.userId,
                    reason,
                  }),
                });
                alert("Report submitted to moderation queue.");
              }
            }}
          />
        )}
      </div>

      {/* Modals */}
      <ImageSelectorModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Attach Image to Conversation"
        description="Select a medical image or upload a clinical file."
        onSelect={(url) => {
          setSelectedAttachments((prev) => [...prev, url]);
          setShowImageModal(false);
        }}
      />

      {selectedConversation && (
        <ScheduleMeetingModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          conversationId={selectedConversation.id}
          recipientName={activeTitle}
          onScheduled={() => {
            fetchMessages(selectedConversation.id, true);
          }}
        />
      )}

      <ShareEntityModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={(entity) => {
          handleSendMessage(undefined, "LINK", { entity });
        }}
      />

      <CallModal
        isOpen={showCallModal}
        onClose={handleEndCall}
        callType={callType}
        peerName={activeTitle}
        peerImage={activeIsDirect ? activePeer?.image : selectedConversation?.avatarUrl}
        peerTitle={activeSubtitle}
      />

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#1769c2]" />
                <h3 className="text-sm font-bold text-slate-900">Create Clinical Group</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewGroupModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Cardiology Surgical Team, ICU Night Shift"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1769c2]/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup || !newGroupName.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1769c2] text-white text-xs font-bold hover:bg-[#12569f] disabled:opacity-50"
                >
                  {creatingGroup ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
