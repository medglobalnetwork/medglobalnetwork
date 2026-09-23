// app/(app)/research/opportunities/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  PlusCircle,
  ArrowLeft,
  X,
  CheckCircle2,
} from "lucide-react";
import { ResearchOpportunityCard } from "@/components/research/ResearchOpportunityCard";
import { ResearchOpportunityRecord, ResearchOpportunityType } from "@/modules/research/domain/types";

export default function ResearchOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ResearchOpportunityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<ResearchOpportunityRecord | null>(null);

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New Opportunity Form
  const [newOpp, setNewOpp] = useState({
    title: "",
    opportunity_type: "research_assistant" as ResearchOpportunityType,
    description: "",
    required_skills: "Clinical Evaluation, Data Entry",
    stipend_amount: "",
    location_type: "remote" as const,
    city: "",
    slots_available: 1,
  });
  const [creating, setCreating] = useState(false);

  const fetchOpps = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (selectedType) q.set("type", selectedType);

      const res = await fetch(`/api/research/opportunities?${q.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setOpportunities(d.opportunities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
  }, [selectedType]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setApplying(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/research/opportunities/${selectedOpp.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter, resumeUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply");

      setShowApplyModal(false);
      setMessage("Application submitted successfully to the project investigator!");
      fetchOpps();
    } catch (err: any) {
      setMessage(err.message || "Application failed");
    } finally {
      setApplying(false);
    }
  };

  const handleCreateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/research/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newOpp,
          stipend_amount: newOpp.stipend_amount ? parseFloat(newOpp.stipend_amount) : undefined,
          is_funded: !!newOpp.stipend_amount,
          required_skills: newOpp.required_skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create opportunity");

      setShowCreateModal(false);
      setMessage("Research opportunity published successfully!");
      fetchOpps();
    } catch (err: any) {
      setMessage(err.message || "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/research"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d5854] hover:text-[#171717]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Research</span>
          </Link>
          <h1 className="mt-1 text-2xl font-black text-[#171717]">Research Opportunities</h1>
          <p className="text-xs text-[#5d5854]">
            Find research assistantships, co-authorship positions, and clinical trial coordination roles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-800"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post an Opportunity</span>
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-xs font-semibold text-purple-900">
          {message}
        </div>
      )}

      {/* Grid / List */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#f0efee]" />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-purple-700" />
            <h3 className="mt-3 text-sm font-bold text-[#171717]">No open research positions</h3>
            <p className="mt-1 text-xs text-[#5d5854]">
              Verified healthcare organizations and principal investigators will post research assistant and data collection positions here.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-4 rounded-xl bg-purple-700 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-800"
            >
              Post First Opportunity
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <ResearchOpportunityCard
                key={opp.id}
                opportunity={opp}
                onApply={(target) => {
                  setSelectedOpp(target);
                  setShowApplyModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#171717]">Apply for Research Position</h3>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="rounded-full p-1 text-[#77716b] hover:bg-[#f0efee]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-1 text-xs text-[#5d5854]">
              {selectedOpp.title}
            </p>

            <form onSubmit={handleApply} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717]">Cover Letter / Relevant Background</label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain your relevant clinical training, research methodology skills, or interest in this topic..."
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717]">Resume / CV Link (Optional)</label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="rounded-xl bg-purple-700 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Opportunity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#171717]">Post Research Opportunity</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1 text-[#77716b] hover:bg-[#f0efee]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpp} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717]">Position Title *</label>
                <input
                  type="text"
                  required
                  value={newOpp.title}
                  onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                  placeholder="e.g. Clinical Research Assistant (Biomechanics Lab)"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717]">Opportunity Type *</label>
                  <select
                    value={newOpp.opportunity_type}
                    onChange={(e) => setNewOpp({ ...newOpp, opportunity_type: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                  >
                    <option value="research_assistant">Research Assistant</option>
                    <option value="student_researcher">Student Researcher</option>
                    <option value="clinical_research">Clinical Research Specialist</option>
                    <option value="data_collection">Data Collection Volunteer</option>
                    <option value="co_author">Co-Author Opportunity</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#171717]">Location</label>
                  <select
                    value={newOpp.location_type}
                    onChange={(e) => setNewOpp({ ...newOpp, location_type: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                  >
                    <option value="remote">Remote</option>
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717]">Description & Responsibilities *</label>
                <textarea
                  rows={3}
                  required
                  value={newOpp.description}
                  onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
                  placeholder="Scope of work, hours expected, data collection or literature synthesis tasks..."
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717]">Stipend Amount (INR ₹)</label>
                  <input
                    type="number"
                    value={newOpp.stipend_amount}
                    onChange={(e) => setNewOpp({ ...newOpp, stipend_amount: e.target.value })}
                    placeholder="e.g. 15000 (Optional)"
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717]">Open Slots</label>
                  <input
                    type="number"
                    min="1"
                    value={newOpp.slots_available}
                    onChange={(e) => setNewOpp({ ...newOpp, slots_available: parseInt(e.target.value, 10) || 1 })}
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-purple-700 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
                >
                  {creating ? "Posting..." : "Post Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
