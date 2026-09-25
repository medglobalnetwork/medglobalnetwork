"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Phone,
  Video,
  Calendar,
  ShieldCheck,
  Building,
  GraduationCap,
  ExternalLink,
  BellOff,
  Bell,
  Ban,
  AlertTriangle,
  Users,
  FileText,
  Image as ImageIcon,
  Pin,
  Sparkles,
} from "lucide-react";
import { getUserAvatarUrl } from "@/lib/avatar";
import { MemberBadge } from "@/modules/network/components/MemberBadge";
import { ConversationSummary, CommunicationMessageItem } from "../types";

interface ConversationDetailsDrawerProps {
  conversation: ConversationSummary;
  members: any[];
  pinnedMessages: any[];
  mediaMessages: CommunicationMessageItem[];
  isOpen: boolean;
  onClose: () => void;
  onStartCall: (type: "VOICE" | "VIDEO") => void;
  onScheduleMeeting: () => void;
  onBlockUser?: (userId: string) => void;
  onReport?: () => void;
}

export function ConversationDetailsDrawer({
  conversation,
  members,
  pinnedMessages,
  mediaMessages,
  isOpen,
  onClose,
  onStartCall,
  onScheduleMeeting,
  onBlockUser,
  onReport,
}: ConversationDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"about" | "media" | "members">("about");
  const [isMuted, setIsMuted] = useState(conversation.isMuted || false);

  if (!isOpen) return null;

  const isDirect = conversation.type === "DIRECT";
  const peer = conversation.peerIdentity;
  const avatar = getUserAvatarUrl(
    isDirect ? peer?.image : conversation.avatarUrl,
    isDirect ? peer?.name : conversation.name || "Group"
  );
  const title = isDirect
    ? peer?.name || "Clinician"
    : conversation.name || `${conversation.type} Chat`;

  const subtitle = isDirect
    ? peer?.designation || peer?.specialization || peer?.profession || "Medical Clinician"
    : `${members.length} members · ${conversation.type}`;

  return (
    <div className="w-80 lg:w-88 border-l border-[#e8e6e3] bg-white flex flex-col h-full overflow-hidden shadow-xs shrink-0 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-[#e8e6e3] flex items-center justify-between bg-[#faf9f8]">
        <h3 className="text-sm font-bold text-[#171717]">Conversation Workspace</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-[#77716b] hover:text-[#171717] hover:bg-[#efefef] rounded-lg transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#f0efee] px-3 pt-2 text-xs font-bold bg-[#faf9f8]">
        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`pb-2 px-3 border-b-2 transition ${
            activeTab === "about"
              ? "border-[#1769c2] text-[#1769c2]"
              : "border-transparent text-[#77716b] hover:text-[#171717]"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className={`pb-2 px-3 border-b-2 transition ${
            activeTab === "media"
              ? "border-[#1769c2] text-[#1769c2]"
              : "border-transparent text-[#77716b] hover:text-[#171717]"
          }`}
        >
          Shared Media
        </button>
        {!isDirect && (
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`pb-2 px-3 border-b-2 transition ${
              activeTab === "members"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            Members ({members.length})
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === "about" && (
          <>
            {/* Identity Profile Summary */}
            <div className="flex flex-col items-center text-center pb-4 border-b border-[#f0efee]">
              <div className="relative mb-3">
                {isDirect && peer?.userId ? (
                  <Link href={`/profile/${peer.userId}`} className="block group">
                    <img
                      src={avatar}
                      alt={title}
                      className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-slate-100 group-hover:ring-[#0f4c81] transition"
                    />
                  </Link>
                ) : (
                  <img
                    src={avatar}
                    alt={title}
                    className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-slate-100"
                  />
                )}
                {isDirect && peer?.identityVerified && (
                  <span
                    className="absolute -bottom-1 -right-1 bg-[#0f4c81] text-white rounded-full p-1 shadow-xs"
                    title="Verified Doctor"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-[#171717] flex items-center justify-center gap-1.5 flex-wrap">
                {isDirect && peer?.userId ? (
                  <Link href={`/profile/${peer.userId}`} className="hover:text-[#0f4c81] hover:underline transition">
                    {title}
                  </Link>
                ) : (
                  title
                )}
                {isDirect && peer && (
                  <MemberBadge
                    memberId={peer.memberId}
                    isFoundingMember={peer.isFoundingMember}
                    size="sm"
                    variant="pill"
                  />
                )}
              </h4>
              <p className="text-xs text-[#77716b] mt-0.5">{subtitle}</p>

              {isDirect && peer?.organization && (
                <div className="flex items-center gap-1 text-[11px] text-[#77716b] mt-1.5">
                  <Building className="h-3 w-3 shrink-0" />
                  <span>{peer.organization}</span>
                </div>
              )}

              {isDirect && peer?.councilNumber && (
                <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 font-medium border border-emerald-200">
                  Reg: {peer.councilNumber} · Medical Council Verified
                </div>
              )}

              {/* View Profile Button for Direct Chats */}
              {isDirect && peer?.userId && (
                <Link
                  href={`/profile/${peer.userId}`}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-[#0f4c81] text-white text-xs font-bold shadow-xs hover:bg-[#0c3d69] transition active:scale-98"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View Full Profile</span>
                </Link>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3 w-full">
                <button
                  type="button"
                  onClick={() => onStartCall("VOICE")}
                  className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-[#f5f4f2] hover:bg-[#efefef] text-[#171717] transition text-xs font-bold gap-1"
                >
                  <Phone className="h-4 w-4 text-[#0f4c81]" />
                  <span>Audio</span>
                </button>
                <button
                  type="button"
                  onClick={() => onStartCall("VIDEO")}
                  className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-[#f5f4f2] hover:bg-[#efefef] text-[#171717] transition text-xs font-bold gap-1"
                >
                  <Video className="h-4 w-4 text-[#0f4c81]" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={onScheduleMeeting}
                  className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-[#f5f4f2] hover:bg-[#efefef] text-[#171717] transition text-xs font-bold gap-1"
                >
                  <Calendar className="h-4 w-4 text-[#0f4c81]" />
                  <span>Meeting</span>
                </button>
              </div>
            </div>

            {/* Context Details (If linked to Event, Camp, Job, or Research) */}
            {(conversation.context.eventId ||
              conversation.context.campId ||
              conversation.context.jobId ||
              conversation.context.researchProjectId) && (
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                  Active Collaboration Context
                </span>
                <p className="text-xs font-bold text-slate-900 mt-1">
                  {conversation.context.eventTitle ||
                    conversation.context.campTitle ||
                    conversation.context.jobTitle ||
                    conversation.context.researchTitle}
                </p>
                <Link
                  href={
                    conversation.context.eventId
                      ? `/events/${conversation.context.eventId}`
                      : conversation.context.campId
                      ? `/camps/${conversation.context.campId}`
                      : conversation.context.jobId
                      ? `/opportunities/${conversation.context.jobId}`
                      : `/research/${conversation.context.researchProjectId}`
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1769c2] hover:underline mt-2"
                >
                  <span>Open Canonical Workspace</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Pin className="h-3.5 w-3.5 text-amber-500" />
                  Pinned Messages ({pinnedMessages.length})
                </h5>
                <div className="space-y-1.5">
                  {pinnedMessages.map((pm: any) => (
                    <div
                      key={pm.id}
                      className="p-2.5 rounded-xl bg-[#f5f4f2] text-xs text-[#171717] border border-[#e8e6e3] line-clamp-2"
                    >
                      {pm.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety & Settings */}
            <div className="pt-2 border-t border-[#f0efee] space-y-1">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-[#171717] hover:bg-[#f5f4f2] transition"
              >
                {isMuted ? (
                  <>
                    <Bell className="h-4 w-4 text-[#1769c2]" />
                    <span>Unmute Notifications</span>
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4 text-[#77716b]" />
                    <span>Mute Conversation</span>
                  </>
                )}
              </button>

              {isDirect && peer && onBlockUser && (
                <button
                  type="button"
                  onClick={() => onBlockUser(peer.userId)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  <Ban className="h-4 w-4" />
                  <span>Block Clinician</span>
                </button>
              )}

              {onReport && (
                <button
                  type="button"
                  onClick={onReport}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 transition"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Report Misconduct</span>
                </button>
              )}
            </div>
          </>
        )}

        {/* Media & Files Tab */}
        {activeTab === "media" && (
          <div>
            <h5 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-3">
              Media & Attachments
            </h5>
            {mediaMessages.length === 0 ? (
              <p className="text-xs text-[#77716b] text-center py-8">
                No media or documents shared yet in this conversation.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {mediaMessages.flatMap((m) =>
                  (m.mediaUrls || []).map((url, i) => (
                    <a
                      key={`${m.id}-${i}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group relative"
                    >
                      <img
                        src={url}
                        alt="Shared media"
                        className="h-full w-full object-cover group-hover:scale-105 transition"
                      />
                    </a>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Group Members Tab */}
        {activeTab === "members" && !isDirect && (
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-2">
              Conversation Members ({members.length})
            </h5>
            {members.map((mbr: any) => {
              const mIden = mbr.identity;
              const mAvatar = getUserAvatarUrl(mIden?.image, mIden?.name);
              return (
                <div
                  key={mbr.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f5f4f2] transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={mAvatar}
                      alt={mIden?.name || "Member"}
                      className="h-8 w-8 rounded-full object-cover border border-[#e8e6e3] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#171717] truncate">
                        {mIden?.name || "Clinician"}
                      </p>
                      <p className="text-[10px] text-[#77716b] truncate">
                        {mIden?.specialization || mIden?.profession || "Member"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {mbr.role}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
