"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Users,
  Smartphone,
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Radio,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  Search,
  Check,
  ExternalLink,
  MessageSquare,
  Clock,
  Info,
} from "lucide-react";

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"compose" | "history" | "stream">("compose");

  // Telemetry data
  const [telemetry, setTelemetry] = useState({
    totalDevices: 0,
    platformBreakdown: { android: 0, ios: 0, web: 0 },
    totalUsers: 0,
    verifiedDoctors: 0,
    medicalStudents: 0,
  });
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
  const [liveStream, setLiveStream] = useState<any[]>([]);

  // Composer Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState<"all" | "doctors" | "students" | "city" | "single_user">("all");
  const [targetValue, setTargetValue] = useState("");
  const [channel, setChannel] = useState<"push_and_inapp" | "push_only" | "inapp_only" | "announcement">("push_and_inapp");
  const [link, setLink] = useState("/home");
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal");

  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notifications/broadcast");
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data.telemetry || {});
        setBroadcastHistory(data.broadcastHistory || []);
        setLiveStream(data.liveNotificationStream || []);
      }
    } catch (err) {
      console.error("Error loading notification telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ text: "Please enter both notification title and message body.", type: "error" });
      return;
    }

    const estimatedReach =
      targetAudience === "all"
        ? telemetry.totalUsers
        : targetAudience === "doctors"
        ? telemetry.verifiedDoctors
        : targetAudience === "students"
        ? telemetry.medicalStudents
        : 1;

    if (!confirm(`Are you sure you want to broadcast this notification to approximately ${estimatedReach} user(s)?`)) {
      return;
    }

    setSending(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          targetAudience,
          targetValue,
          channel,
          link,
          priority,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          text: `Broadcast sent successfully! Reached ${data.recipientsCount} recipient(s) (${data.pushSent} push delivered).`,
          type: "success",
        });
        setTitle("");
        setMessage("");
        await fetchTelemetry();
        setActiveTab("history");
      } else {
        setFeedback({ text: data.error || "Failed to dispatch broadcast.", type: "error" });
      }
    } catch (err: any) {
      setFeedback({ text: err.message || "Network error while sending broadcast.", type: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <Bell className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Notification & Broadcast Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch bulk push notifications, send targeted healthcare alerts, and monitor live notification streams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTelemetry}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compose")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>New Broadcast</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Push Devices */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Devices</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Smartphone className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{telemetry.totalDevices}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
            <span>Android: {telemetry.platformBreakdown.android || 0}</span>
            <span>·</span>
            <span>Web: {telemetry.platformBreakdown.web || 0}</span>
            <span>·</span>
            <span>iOS: {telemetry.platformBreakdown.ios || 0}</span>
          </div>
        </div>

        {/* Total Network Reach */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Network Users</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{telemetry.totalUsers}</p>
          <p className="text-[11px] text-slate-500 mt-1">Registered healthcare profiles</p>
        </div>

        {/* Verified Doctors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Clinicians</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{telemetry.verifiedDoctors}</p>
          <p className="text-[11px] text-slate-500 mt-1">Verified Medical Council doctors</p>
        </div>

        {/* Broadcasts Sent */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Past Broadcasts</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{broadcastHistory.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">System broadcasts sent</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("compose")}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            activeTab === "compose"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Compose Bulk Broadcast
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            activeTab === "history"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Sent History ({broadcastHistory.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("stream")}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
            activeTab === "stream"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Live Notifications Feed ({liveStream.length})
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-current font-bold hover:opacity-70 ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: COMPOSE BULK BROADCAST */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Compose Form */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Compose New Broadcast</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Send targeted push notifications and announcements directly to user devices.
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              {/* Target Audience */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Audience</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "all", label: "All Members", count: telemetry.totalUsers },
                    { id: "doctors", label: "Doctors & Surgeons", count: telemetry.verifiedDoctors },
                    { id: "students", label: "Medical Students", count: telemetry.medicalStudents },
                    { id: "city", label: "Filter by City" },
                    { id: "single_user", label: "Single User (Email/ID)" },
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setTargetAudience(aud.id as any)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                        targetAudience === aud.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{aud.label}</span>
                        {targetAudience === aud.id && <Check className="h-3.5 w-3.5 text-blue-600" />}
                      </div>
                      {aud.count !== undefined && (
                        <p className="text-[10px] text-slate-500 mt-0.5">{aud.count} recipients</p>
                      )}
                    </button>
                  ))}
                </div>

                {(targetAudience === "city" || targetAudience === "single_user") && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder={
                        targetAudience === "city"
                          ? "Enter city name (e.g. Mumbai, Delhi, Bengaluru)..."
                          : "Enter recipient email or User ID..."
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Channels & Delivery Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery Channels</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "push_and_inapp", label: "Push + In-App Bell" },
                    { id: "push_only", label: "Mobile Push Only" },
                    { id: "inapp_only", label: "In-App Bell Only" },
                    { id: "announcement", label: "Global Top Banner" },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setChannel(ch.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition cursor-pointer ${
                        channel === ch.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority & Urgency</label>
                <div className="flex gap-2">
                  {[
                    { id: "normal", label: "Normal Update", color: "text-slate-700" },
                    { id: "high", label: "High Priority", color: "text-amber-700" },
                    { id: "urgent", label: "Urgent Medical Alert", color: "text-rose-700" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id as any)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        priority === p.id
                          ? "border-blue-600 bg-blue-50/50 text-blue-900"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Notification Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Free Oncology Screening Camp Tomorrow in Pune"
                  maxLength={100}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Notification Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write full message details or urgent clinical advisory..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right">{message.length}/500 chars</p>
              </div>

              {/* Deep Link URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tap Destination URL</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="e.g. /camps, /events, /learn, or /home"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 mt-2">
                  {["/home", "/camps", "/events", "/learn", "/opportunities"].map((quickUrl) => (
                    <button
                      key={quickUrl}
                      type="button"
                      onClick={() => setLink(quickUrl)}
                      className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      {quickUrl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{sending ? "Broadcasting to Devices..." : "Send Bulk Broadcast"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Mobile Lock Screen Preview */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Live Device Push Preview
              </h3>

              {/* Phone Frame Mock */}
              <div className="rounded-3xl border-4 border-slate-800 bg-slate-900 p-3 shadow-xl max-w-xs mx-auto text-white">
                <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto mb-4" />

                {/* Lock Screen Push Card */}
                <div className="rounded-2xl bg-white/95 backdrop-blur-md p-3 text-slate-900 shadow-md border border-white/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <img src="/icon-192.png" alt="MGN" className="h-4 w-4 rounded object-cover" />
                      <span className="text-[11px] font-bold text-blue-900 uppercase tracking-tight">
                        Med Global Network
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">now</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {title || "Free Oncology Screening Camp"}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                    {message || "New healthcare notification received. Tap to view full clinical details."}
                  </p>

                  <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] font-bold text-blue-600">
                    <span className="hover:underline">Open MGN</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400">Dismiss</span>
                  </div>
                </div>

                <div className="mt-8 text-center text-[10px] text-slate-500">
                  Slide or tap to open destination
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Info className="h-3.5 w-3.5 text-blue-600" />
                  <span>Delivery SLA</span>
                </div>
                <p>Delivers directly through Firebase Cloud Messaging (FCM) & Web Push API with &lt; 2s latency.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SENT BROADCAST HISTORY */}
      {activeTab === "history" && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Radio className="h-4 w-4 text-blue-600" />
              <span>Broadcast Log Archive</span>
            </div>
          </div>

          {broadcastHistory.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No broadcasts have been sent yet. Use the composer tab to launch your first announcement.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-3 px-4">Title & Details</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Scope</th>
                    <th className="py-3 px-4">Sent By</th>
                    <th className="py-3 px-4">Reads</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {broadcastHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.body}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.priority === "urgent"
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : item.priority === "high"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 capitalize font-medium text-slate-700">{item.scope}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{item.sender_name || item.sender_email || "System"}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.read_count ?? 0}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE NOTIFICATIONS STREAM */}
      {activeTab === "stream" && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Live In-App Notification Telemetry (Platform-wide Activity)</span>
            </div>
          </div>

          {liveStream.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No live in-app notifications recorded recently.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Message Preview</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liveStream.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.recipient_name || item.recipient_email || item.user_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-md truncate">{item.message}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold ${
                            item.is_read ? "text-slate-400" : "text-emerald-600"
                          }`}
                        >
                          {item.is_read ? "Read" : "Delivered"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
