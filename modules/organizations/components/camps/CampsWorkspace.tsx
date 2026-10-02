"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tent,
  Users,
  Plus,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Search,
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

export function CampsWorkspace({ organization, userRole, customPermissions }: Props) {
  const [activeTab, setActiveTab] = useState<"camps" | "volunteers" | "reports">("camps");
  const [camps, setCamps] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Camp Creation Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [campName, setCampName] = useState("");
  const [campType, setCampType] = useState("Health Screening Camp");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(organization.city || "");
  const [targetPopulation, setTargetPopulation] = useState("Elderly & Rural Families");
  const [capacity, setCapacity] = useState(250);
  const [requiredDoctors, setRequiredDoctors] = useState(4);
  const [requiredNurses, setRequiredNurses] = useState(6);
  const [savingCamp, setSavingCamp] = useState(false);

  const canCreateCamp = hasOrgPermission(userRole, customPermissions, "CAMPS_CREATE");
  const canManageVolunteers = hasOrgPermission(userRole, customPermissions, "VOLUNTEERS_MANAGE");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/camps`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setCamps(data.camps || []);
        setVolunteers(data.volunteers || []);
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

  const handleCreateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName || !startDate || !endDate) return;
    setSavingCamp(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/camps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campName,
          camp_type: campType,
          description,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          address,
          city,
          target_population: targetPopulation,
          capacity: Number(capacity),
          volunteer_requirements: [
            { role: "General Physician", count: Number(requiredDoctors) },
            { role: "Nursing Staff", count: Number(requiredNurses) },
          ],
        }),
      });
      if (res.ok) {
        setIsCreateOpen(false);
        setCampName("");
        setDescription("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCamp(false);
    }
  };

  const handleVolunteerStatus = async (volId: string, status: string) => {
    try {
      const res = await fetch(`/api/org/${organization.id}/camps?action=updateVolunteer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: volId, status }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const CAMP_TYPES = [
    "Health Screening Camp",
    "Physiotherapy Camp",
    "Rehabilitation Camp",
    "Rural Health Camp",
    "Awareness Camp",
    "Preventive Health Camp",
    "Community Outreach",
    "Blood Donation Camp",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold mb-2">
            <Tent className="size-3.5" />
            <span>Clinical Outreach Operations</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Health & Medical Camps</h1>
          <p className="text-xs text-slate-400 mt-1">
            Mobilize healthcare volunteers, organize screening camps, and deliver care to community populations.
          </p>
        </div>

        {canCreateCamp && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Plan Medical Camp</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("camps")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "camps"
              ? "bg-teal-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Scheduled Camps ({camps.length})
        </button>
        <button
          onClick={() => setActiveTab("volunteers")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "volunteers"
              ? "bg-teal-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Volunteer Roster ({volunteers.length})
        </button>
      </div>

      {/* Camps List */}
      {activeTab === "camps" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
              Loading camps...
            </div>
          ) : camps.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <Tent className="size-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-white">No medical camps scheduled</p>
              <p className="text-xs text-slate-400 mt-1">
                Organize preventive screenings, rural diagnostics, or rehabilitation drives.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {camps.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {camp.camp_type || "Health Camp"}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="size-3 text-slate-500" />
                        {camp.city || organization.city}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{camp.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{camp.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5 text-teal-400" />
                      {new Date(camp.start_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5 text-blue-400" />
                      Capacity: {camp.capacity || 200}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Volunteer Applications */}
      {activeTab === "volunteers" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Volunteer Roster & Applications</h3>
          {volunteers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No volunteer applications submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {volunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <span className="font-bold text-white text-sm block">{vol.user_name}</span>
                    <span className="text-slate-400">
                      {vol.user_profession} • {vol.assigned_role}
                    </span>
                  </div>

                  {canManageVolunteers && (
                    <div className="flex items-center gap-2">
                      <select
                        value={vol.status}
                        onChange={(e) => handleVolunteerStatus(vol.id, e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="applied">Applied</option>
                        <option value="approved">Approved</option>
                        <option value="attended">Attended</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Camp Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tent className="size-5 text-teal-400" />
                <h2 className="text-base font-bold text-white">Create Health & Screening Camp</h2>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCamp} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Camp Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Rural Cardiac & Diabetes Screening Camp"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Camp Type</label>
                  <select
                    value={campType}
                    onChange={(e) => setCampType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  >
                    {CAMP_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
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
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Location Address</label>
                <input
                  type="text"
                  placeholder="e.g. Community Health Center, Sector 4"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Doctors Required</label>
                  <input
                    type="number"
                    min={1}
                    value={requiredDoctors}
                    onChange={(e) => setRequiredDoctors(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nursing Staff Required</label>
                  <input
                    type="number"
                    min={1}
                    value={requiredNurses}
                    onChange={(e) => setRequiredNurses(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Camp Objectives</label>
                <textarea
                  rows={3}
                  placeholder="Describe medical screening protocols and required equipment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCamp}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  {savingCamp ? "Scheduling..." : "Launch Camp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
