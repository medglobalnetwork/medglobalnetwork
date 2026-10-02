"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Briefcase,
  Calendar,
  Tent,
  GraduationCap,
  FlaskConical,
  Compass,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { OrganizationRecord, OrgRole, OrgPermission } from "../../types";

interface Props {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function CommunicationWorkspace({ organization }: Props) {
  const [activeContext, setActiveContext] = useState<
    "candidates" | "members" | "events" | "camps" | "students" | "researchers" | "groups"
  >("candidates");

  const [messageText, setMessageText] = useState("");

  const contextChannels = [
    { id: "candidates", label: "Job Candidates", icon: Briefcase, count: 0, tag: "job_id" },
    { id: "members", label: "Team Members", icon: Users, count: 1, tag: "org_id" },
    { id: "events", label: "Event Attendees", icon: Calendar, count: 0, tag: "event_id" },
    { id: "camps", label: "Camp Volunteers", icon: Tent, count: 0, tag: "camp_id" },
    { id: "students", label: "LMS Students", icon: GraduationCap, count: 0, tag: "course_id" },
    { id: "researchers", label: "Trial Researchers", icon: FlaskConical, count: 0, tag: "project_id" },
    { id: "groups", label: "Org Groups", icon: Compass, count: 0, tag: "group_id" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
          <MessageSquare className="size-3.5" />
          <span>Context-Aware Communications</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Central Operations Messaging</h1>
        <p className="text-xs text-slate-400 mt-1">
          Every conversation automatically attaches context metadata (Job ID, Event ID, Camp ID, or Project ID) so your team always has full context.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Context Channels */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase px-3 py-1">Context Streams</p>
          {contextChannels.map((c) => {
            const Icon = c.icon;
            const active = activeContext === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveContext(c.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0" />
                  <span>{c.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    active ? "bg-blue-700 text-blue-100" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {c.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Active Conversation Stream */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px] overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white capitalize">
                {activeContext.replace("_", " ")} Stream
              </h3>
              <p className="text-[11px] text-slate-400">
                Connected to central MGN messaging backend with end-to-end security
              </p>
            </div>
            <Link
              href="/messages"
              className="text-xs font-bold text-blue-400 hover:underline"
            >
              Open Global Inbox
            </Link>
          </div>

          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center text-center">
            <div className="space-y-2 max-w-sm">
              <MessageSquare className="size-8 mx-auto text-slate-600" />
              <p className="text-sm font-bold text-white">No active message threads</p>
              <p className="text-xs text-slate-400">
                Messages from candidate interviews, attendees, or researchers tagged with this organization will appear here automatically.
              </p>
            </div>
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Send message in ${activeContext} context...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => setMessageText("")}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
