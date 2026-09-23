"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Tent,
  Briefcase,
  FlaskConical,
  User,
  GraduationCap,
  Search,
  Sparkles,
  Loader2,
} from "lucide-react";
import { RichEntitySharePayload } from "../types";

interface ShareEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (entity: RichEntitySharePayload) => void;
}

export function ShareEntityModal({ isOpen, onClose, onShare }: ShareEntityModalProps) {
  const [activeTab, setActiveTab] = useState<"event" | "camp" | "job" | "research" | "profile">("event");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  if (!isOpen) return null;

  const handleQuickShare = (entity: RichEntitySharePayload) => {
    onShare(entity);
    onClose();
  };

  const handleCustomShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    onShare({
      entityType: activeTab,
      id: `mgn_${Date.now()}`,
      title: customTitle.trim(),
      subtitle: customSubtitle.trim() || undefined,
      url: customUrl.trim() || `/${activeTab}s`,
      badge: `${activeTab.toUpperCase()} REFERENCE`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1769c2]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Share MGN Canonical Entity</h3>
              <p className="text-xs text-slate-500">
                Embed verified events, clinical camps, research, or job opportunities
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("event")}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
              activeTab === "event" ? "bg-white text-[#1769c2] shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" /> Event
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("camp")}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
              activeTab === "camp" ? "bg-white text-emerald-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Tent className="h-3.5 w-3.5" /> Camp
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("job")}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
              activeTab === "job" ? "bg-white text-purple-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" /> Job
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("research")}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
              activeTab === "research" ? "bg-white text-amber-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" /> Study
          </button>
        </div>

        {/* Custom share form */}
        <form onSubmit={handleCustomShare} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Title / Name
            </label>
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={
                activeTab === "event"
                  ? "e.g. National Orthopaedic Summit 2026"
                  : activeTab === "camp"
                  ? "e.g. Rural Diabetes & Hypertension Screening Camp"
                  : activeTab === "job"
                  ? "e.g. Consultant Neurosurgeon (AIIMS Partner)"
                  : "e.g. Clinical Study on Multi-Drug Resistant Bacteria"
              }
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1769c2]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Location / Organizer / Department
            </label>
            <input
              type="text"
              value={customSubtitle}
              onChange={(e) => setCustomSubtitle(e.target.value)}
              placeholder="e.g. Apollo Hospitals · New Delhi · Verified CME"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1769c2]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resource Link / URL
            </label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder={`/${activeTab}s`}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1769c2]/30"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!customTitle.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1769c2] text-white text-xs font-bold hover:bg-[#12569f] transition disabled:opacity-50 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Embed in Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
