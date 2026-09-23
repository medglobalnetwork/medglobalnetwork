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
  ShieldCheck,
  Check,
  CheckCheck,
  MoreVertical,
  User,
  Sparkles,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { getUserAvatarUrl } from "@/lib/avatar";
import { MemberBadge } from "@/modules/network/components/MemberBadge";
import { ImageSelectorModal } from "@/components/media/ImageSelectorModal";

interface Conversation {
  peer_id: string;
  peer_name: string;
  peer_image: string | null;
  peer_profession: string | null;
  peer_specialization: string | null;
  peer_designation: string | null;
  peer_member_id: string | null;
  peer_is_founding: boolean;
  last_message: string | null;
  last_message_at: string | null;
  last_sender_id?: string | null;
  unread_count: number;
  is_connection_only?: boolean;
}

interface MessageItem {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  media_urls?: string[] | null;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_image?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("to") || searchParams.get("user");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedPeer, setSelectedPeer] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  // 1. Fetch conversations list
  const fetchConversations = useCallback(async (autoSelectUserId?: string) => {
    try {
      const res = await fetch("/api/network/messages/conversations");
      if (!res.ok) throw new Error("Failed to load conversations");
      const json = await res.json();
      const list: Conversation[] = json.data || [];
      setConversations(list);

      const toSelect = autoSelectUserId || targetUserId;
      if (toSelect) {
        const found = list.find((c) => c.peer_id === toSelect);
        if (found) {
          setSelectedPeer(found);
        } else {
          // Fetch peer profile details directly if not in list
          try {
            const profileRes = await fetch(`/api/network/profile/${toSelect}`);
            if (profileRes.ok) {
              const profData = await profileRes.json();
              const newPeer: Conversation = {
                peer_id: toSelect,
                peer_name: profData.profile?.name || "Medical Professional",
                peer_image: profData.profile?.image || null,
                peer_profession: profData.profile?.profession || null,
                peer_specialization: profData.profile?.specialization || null,
                peer_designation: profData.profile?.designation || null,
                peer_member_id: profData.profile?.member_id || null,
                peer_is_founding: Boolean(profData.profile?.is_founding_member),
                last_message: null,
                last_message_at: null,
                unread_count: 0,
                is_connection_only: true,
              };
              setConversations((prev) => [newPeer, ...prev]);
              setSelectedPeer(newPeer);
            }
          } catch (e) {
            console.error("Failed to load target peer info", e);
          }
        }
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchConversations(targetUserId || undefined);
  }, [fetchConversations, targetUserId]);

  // 2. Fetch active chat thread messages
  const fetchMessages = useCallback(async (peerId: string, isSilent = false) => {
    if (!isSilent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/network/messages?recipientId=${encodeURIComponent(peerId)}`);
      if (!res.ok) throw new Error("Failed to load messages");
      const json = await res.json();
      const newMsgs: MessageItem[] = json.data || [];
      
      setMessages((prev) => {
        // If count changed or new IDs, update & scroll
        if (prev.length !== newMsgs.length || (newMsgs.length > 0 && prev[prev.length - 1]?.id !== newMsgs[newMsgs.length - 1]?.id)) {
          setTimeout(() => scrollToBottom(prev.length > 0), 50);
        }
        return newMsgs;
      });

      // Clear unread badge in local state
      setConversations((prev) =>
        prev.map((c) => (c.peer_id === peerId ? { ...c, unread_count: 0 } : c))
      );
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      if (!isSilent) setLoadingMessages(false);
    }
  }, [scrollToBottom]);

  // Load messages when selected peer changes
  useEffect(() => {
    if (selectedPeer) {
      fetchMessages(selectedPeer.peer_id);
    } else {
      setMessages([]);
    }
  }, [selectedPeer, fetchMessages]);

  // 3. Polling interval for live incoming messages (every 4 seconds)
  useEffect(() => {
    if (!selectedPeer) return;
    const interval = setInterval(() => {
      fetchMessages(selectedPeer.peer_id, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedPeer, fetchMessages]);

  // 4. Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPeer) return;
    const content = inputMessage.trim();
    if (!content && selectedAttachments.length === 0) return;

    setSending(true);
    const tempText = content;
    const tempMedia = [...selectedAttachments];
    setInputMessage("");
    setSelectedAttachments([]);

    try {
      const res = await fetch("/api/network/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedPeer.peer_id,
          content: tempText,
          mediaUrls: tempMedia.length > 0 ? tempMedia : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const json = await res.json();
      if (json.data) {
        setMessages((prev) => [...prev, json.data]);
        setTimeout(() => scrollToBottom(true), 50);

        // Update last message in conversations list
        setConversations((prev) =>
          prev.map((c) =>
            c.peer_id === selectedPeer.peer_id
              ? {
                  ...c,
                  last_message: tempText || "📷 Image attachment",
                  last_message_at: new Date().toISOString(),
                  last_sender_id: json.data.sender_id,
                  is_connection_only: false,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setInputMessage(tempText);
      setSelectedAttachments(tempMedia);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.peer_name && c.peer_name.toLowerCase().includes(q)) ||
      (c.peer_profession && c.peer_profession.toLowerCase().includes(q)) ||
      (c.peer_specialization && c.peer_specialization.toLowerCase().includes(q)) ||
      (c.last_message && c.last_message.toLowerCase().includes(q))
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
      if (diffDays === 0) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 py-3 sm:py-6 h-[calc(100vh-4.5rem)] md:h-[calc(100vh-5.5rem)] flex flex-col">
      <div className="flex-1 flex overflow-hidden rounded-2xl bg-white border border-[#e8e6e3] shadow-sm">
        
        {/* ============================================================ */}
        {/* LEFT SIDEBAR: CONVERSATIONS LIST */}
        {/* ============================================================ */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-[#e8e6e3] bg-white ${
            selectedPeer ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-[#e8e6e3] flex items-center justify-between bg-[#faf9f8]">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#1769c2]" />
              <h1 className="text-base sm:text-lg font-black text-[#171717]">Messages</h1>
            </div>
            <button
              onClick={() => fetchConversations()}
              className="p-1.5 text-[#77716b] hover:text-[#171717] hover:bg-[#efefef] rounded-lg transition"
              title="Refresh inbox"
            >
              <RefreshCw className="h-4 w-4" />
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
                placeholder="Search clinician or message..."
                className="w-full rounded-xl bg-[#f5f4f2] pl-9 pr-3 py-2 text-xs sm:text-sm text-[#171717] placeholder:text-[#9c958f] border-none focus:outline-none focus:ring-2 focus:ring-[#1769c2]/30"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f5f4f2]">
            {loadingConversations ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-[#77716b]">
                <Loader2 className="h-6 w-6 animate-spin text-[#1769c2] mb-2" />
                <p className="text-xs">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-[#77716b]">
                <MessageSquare className="h-10 w-10 text-[#ded8d1] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#171717]">No conversations yet</p>
                <p className="text-xs text-[#77716b] mt-1 mb-4">
                  Connect with verified medical peers to initiate clinical discussions.
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
                const isSelected = selectedPeer?.peer_id === conv.peer_id;
                const avatar = getUserAvatarUrl(conv.peer_image, conv.peer_name);
                const title =
                  conv.peer_designation ||
                  conv.peer_specialization ||
                  conv.peer_profession ||
                  "Medical Professional";

                return (
                  <button
                    key={conv.peer_id}
                    onClick={() => {
                      setSelectedPeer(conv);
                      router.replace(`/messages?to=${conv.peer_id}`, { scroll: false });
                    }}
                    className={`w-full text-left p-3 sm:p-3.5 flex items-center gap-3 transition ${
                      isSelected
                        ? "bg-[#eef5fc] border-l-4 border-[#1769c2]"
                        : "hover:bg-[#f8f7f6]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={avatar}
                        alt={conv.peer_name}
                        className="h-11 w-11 rounded-full object-cover border border-[#e8e6e3]"
                      />
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1769c2] px-1 text-[10px] font-black text-white ring-2 ring-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-xs sm:text-sm text-[#171717] truncate flex items-center gap-1">
                          {conv.peer_name}
                          {conv.peer_is_founding && (
                            <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                          )}
                        </span>
                        <span className="text-[10px] text-[#9c958f] shrink-0">
                          {formatConversationDate(conv.last_message_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#77716b] truncate mb-0.5">{title}</p>

                      <p className={`text-xs truncate ${conv.unread_count > 0 ? "font-bold text-[#171717]" : "text-[#9c958f]"}`}>
                        {conv.last_message ? (
                          conv.last_message
                        ) : conv.is_connection_only ? (
                          <span className="text-[#1769c2] italic">Connected · Say hello! 👋</span>
                        ) : (
                          "Start conversation"
                        )}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT PANEL: ACTIVE CHAT THREAD */}
        {/* ============================================================ */}
        <div
          className={`flex-1 flex flex-col bg-[#fbfbfa] ${
            !selectedPeer ? "hidden md:flex items-center justify-center" : "flex"
          }`}
        >
          {selectedPeer ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-[#e8e6e3] bg-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <button
                    onClick={() => setSelectedPeer(null)}
                    className="md:hidden p-1.5 -ml-1 text-[#5d5854] hover:bg-[#efefef] rounded-lg transition"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <img
                    src={getUserAvatarUrl(selectedPeer.peer_image, selectedPeer.peer_name)}
                    alt={selectedPeer.peer_name}
                    className="h-10 w-10 rounded-full object-cover border border-[#e8e6e3] shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-sm sm:text-base font-bold text-[#171717] truncate">
                        {selectedPeer.peer_name}
                      </h2>
                      <MemberBadge
                        memberId={selectedPeer.peer_member_id}
                        isFoundingMember={selectedPeer.peer_is_founding}
                        size="sm"
                        variant="pill"
                      />
                    </div>
                    <p className="text-[11px] text-[#77716b] truncate">
                      {selectedPeer.peer_designation ||
                        selectedPeer.peer_specialization ||
                        selectedPeer.peer_profession ||
                        "Medical Professional"}
                    </p>
                  </div>
                </div>

                {/* Right Header Action: Profile Link */}
                <div className="flex items-center gap-1">
                  <Link
                    href={`/profile/${selectedPeer.peer_id}`}
                    className="p-2 text-[#77716b] hover:text-[#1769c2] hover:bg-[#f0f4f8] rounded-xl transition flex items-center gap-1 text-xs font-semibold"
                    title="View Full Profile"
                  >
                    <span className="hidden sm:inline">Profile</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
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
                      Direct message with {selectedPeer.peer_name}
                    </h3>
                    <p className="text-xs text-[#77716b] max-w-sm mt-1 mb-4">
                      All medical discussions on MGN are private and encrypted in transit between verified clinicians.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setInputMessage("Hello! Great to connect with you on Med Global Network.");
                        }}
                        className="text-xs bg-white border border-[#ded8d1] rounded-full px-3 py-1.5 text-[#5d5854] hover:border-[#1769c2] hover:text-[#1769c2] transition"
                      >
                        👋 Hello! Great to connect.
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage("Hi, I wanted to discuss a clinical case with you.");
                        }}
                        className="text-xs bg-white border border-[#ded8d1] rounded-full px-3 py-1.5 text-[#5d5854] hover:border-[#1769c2] hover:text-[#1769c2] transition"
                      >
                        🩺 Discuss a clinical case
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id !== selectedPeer.peer_id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-2xs ${
                            isMe
                              ? "bg-[#1769c2] text-white rounded-br-xs"
                              : "bg-white text-[#171717] border border-[#e8e6e3] rounded-bl-xs"
                          }`}
                        >
                          {/* Image attachments if any */}
                          {msg.media_urls && msg.media_urls.length > 0 && (
                            <div className="mb-2 space-y-1.5">
                              {msg.media_urls.map((url, idx) => (
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

                          {/* Text Content */}
                          {msg.content && (
                            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {msg.content}
                            </p>
                          )}

                          {/* Time & Read Status */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isMe ? "text-blue-100" : "text-[#9c958f]"
                            }`}
                          >
                            <span>{formatMessageTime(msg.created_at)}</span>
                            {isMe && (
                              <span>
                                {msg.is_read ? (
                                  <CheckCheck className="h-3.5 w-3.5 text-blue-200" />
                                ) : (
                                  <Check className="h-3.5 w-3.5 text-blue-200/70" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

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

              {/* Chat Input Box */}
              <div className="p-2.5 sm:p-3.5 border-t border-[#e8e6e3] bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="p-2 text-[#77716b] hover:text-[#1769c2] hover:bg-[#f0f4f8] rounded-xl transition shrink-0"
                    title="Attach Image"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>

                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selectedPeer.peer_name}...`}
                    rows={1}
                    className="flex-1 max-h-32 min-h-[40px] resize-none rounded-xl bg-[#f5f4f2] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] placeholder:text-[#9c958f] border-none focus:outline-none focus:ring-2 focus:ring-[#1769c2]/30"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!inputMessage.trim() && selectedAttachments.length === 0)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1769c2] text-white hover:bg-[#12569f] disabled:opacity-40 disabled:hover:bg-[#1769c2] transition shrink-0 shadow-xs active:scale-95"
                    title="Send"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Desktop Empty Placeholder */
            <div className="flex flex-col items-center justify-center p-8 text-center text-[#77716b]">
              <div className="h-16 w-16 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#1769c2] mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold text-[#171717]">Direct Clinician Messaging</h2>
              <p className="text-xs sm:text-sm text-[#77716b] max-w-sm mt-1">
                Select a conversation from the left or connect with verified peers to start direct medical discussions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Attachment Modal */}
      <ImageSelectorModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Attach Image to Message"
        description="Select a medical image or upload a clinical file."
        onSelect={(url) => {
          setSelectedAttachments((prev) => [...prev, url]);
          setShowImageModal(false);
        }}
      />
    </div>
  );
}
