"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Layers,
  Plus,
  Users,
  Award,
  Clock,
  MapPin,
  Globe,
  DollarSign,
  Search,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { OrganizationRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface Props {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function EventsWorkspace({ organization, userRole, customPermissions }: Props) {
  const [activeTab, setActiveTab] = useState<"events" | "conferences" | "attendance">("events");
  const [events, setEvents] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Event creation state
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("webinar");
  const [eventCategory, setEventCategory] = useState("Cardiology");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("online");
  const [description, setDescription] = useState("");
  const [cmeCredits, setCmeCredits] = useState(0);
  const [capacity, setCapacity] = useState(100);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);
  const [savingEvent, setSavingEvent] = useState(false);

  // Conference creation state
  const [isCreateConfOpen, setIsCreateConfOpen] = useState(false);
  const [confTitle, setConfTitle] = useState("");
  const [confTheme, setConfTheme] = useState("");
  const [confStartDate, setConfStartDate] = useState("");
  const [confEndDate, setConfEndDate] = useState("");
  const [confVenueType, setConfVenueType] = useState<"online" | "in_person" | "hybrid">("hybrid");
  const [confVenueName, setConfVenueName] = useState("");
  const [tracks, setTracks] = useState<Array<{ id: string; name: string }>>([
    { id: "1", name: "Clinical Practice" },
    { id: "2", name: "Research & Trials" },
  ]);
  const [savingConf, setSavingConf] = useState(false);

  const canCreateEvent = hasOrgPermission(userRole, customPermissions, "EVENTS_CREATE");
  const canManageConf = hasOrgPermission(userRole, customPermissions, "CONFERENCES_MANAGE");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/events`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setEvents(data.events || []);
        setConferences(data.conferences || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organization.id]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !startDate || !endDate) return;
    setSavingEvent(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventTitle,
          event_type: eventType,
          category: eventCategory,
          start_time: new Date(startDate).toISOString(),
          end_time: new Date(endDate).toISOString(),
          format,
          description,
          cme_credits: Number(cmeCredits),
          capacity: Number(capacity),
          is_free: isFree,
          price: isFree ? 0 : Number(price),
        }),
      });
      if (res.ok) {
        setIsCreateEventOpen(false);
        setEventTitle("");
        setDescription("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleCreateConf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confTitle || !confStartDate || !confEndDate) return;
    setSavingConf(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/conferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: confTitle,
          theme: confTheme || undefined,
          start_date: new Date(confStartDate).toISOString(),
          end_date: new Date(confEndDate).toISOString(),
          venue_type: confVenueType,
          venue_name: confVenueName || undefined,
          tracks,
          sessions: [],
          speakers: [],
          sponsors: [],
          abstract_submission_open: true,
        }),
      });
      if (res.ok) {
        setIsCreateConfOpen(false);
        setConfTitle("");
        setConfTheme("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingConf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-2">
            <Calendar className="size-3.5" />
            <span>Academic & Clinical Operations</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Events, CME & Conferences</h1>
          <p className="text-xs text-slate-400 mt-1">
            Host live accredited medical webinars, international multi-track conferences, and issue CME certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canManageConf && (
            <button
              onClick={() => setIsCreateConfOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              <Layers className="size-4 text-purple-400" />
              <span>New Multi-Track Conference</span>
            </button>
          )}

          {canCreateEvent && (
            <button
              onClick={() => setIsCreateEventOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="size-4" />
              <span>Host Event / CME</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "events"
              ? "bg-purple-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Events & Webinars ({events.length})
        </button>
        <button
          onClick={() => setActiveTab("conferences")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "conferences"
              ? "bg-purple-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Multi-Track Conferences ({conferences.length})
        </button>
      </div>

      {/* Events List */}
      {activeTab === "events" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <Calendar className="size-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-white">No events scheduled</p>
              <p className="text-xs text-slate-400 mt-1">
                Create CME webinars, surgical workshops, or medical roundtables.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {ev.event_type}
                      </span>
                      {ev.cme_credits > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <Award className="size-3" /> {ev.cme_credits} CME Hours
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">{ev.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{ev.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5 text-purple-400" />
                      {new Date(ev.start_time).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5 text-blue-400" />
                      {ev.registered_count || 0} Registered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conferences List */}
      {activeTab === "conferences" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
              Loading conferences...
            </div>
          ) : conferences.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <Layers className="size-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-white">No multi-track conferences created</p>
              <p className="text-xs text-slate-400 mt-1">
                Conferences feature simultaneous track agendas, abstract paper submissions, and sponsor booths.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conferences.map((conf) => (
                <div
                  key={conf.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Multi-Track Conference
                    </span>
                    <span className="text-xs font-semibold text-slate-400 capitalize">
                      {conf.venue_type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{conf.title}</h3>
                  {conf.theme && <p className="text-xs text-slate-300 mt-1 italic">Theme: {conf.theme}</p>}

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {new Date(conf.start_date).toLocaleDateString()} - {new Date(conf.end_date).toLocaleDateString()}
                    </span>
                    <span className="text-purple-400 font-bold">
                      {(conf.tracks || []).length} Tracks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {isCreateEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">Create Clinical Event / Webinar</h2>
              </div>
              <button
                onClick={() => setIsCreateEventOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Cardiology CME 2026"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="webinar">Webinar</option>
                    <option value="cme">CME Workshop</option>
                    <option value="symposium">Symposium</option>
                    <option value="seminar">Seminar</option>
                    <option value="workshop">Clinical Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="online">Online Broadcast</option>
                    <option value="in_person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">CME Credit Hours</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={cmeCredits}
                    onChange={(e) => setCmeCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline syllabus, key speakers, and learning objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateEventOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  {savingEvent ? "Creating..." : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Conference Modal */}
      {isCreateConfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Build Multi-Track Conference</h2>
              </div>
              <button
                onClick={() => setIsCreateConfOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateConf} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Conference Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual International Healthcare Conclave"
                  value={confTitle}
                  onChange={(e) => setConfTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Theme</label>
                <input
                  type="text"
                  placeholder="e.g. Advancing Precision Medicine & AI"
                  value={confTheme}
                  onChange={(e) => setConfTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={confStartDate}
                    onChange={(e) => setConfStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={confEndDate}
                    onChange={(e) => setConfEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Conference Tracks</label>
                <div className="space-y-2">
                  {tracks.map((t, i) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => {
                          const updated = [...tracks];
                          updated[i].name = e.target.value;
                          setTracks(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTracks([...tracks, { id: Date.now().toString(), name: `Track ${tracks.length + 1}` }])}
                    className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="size-3" /> Add Track
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateConfOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConf}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  {savingConf ? "Creating..." : "Launch Conference"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
