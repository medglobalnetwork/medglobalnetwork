// app/(app)/research/publications/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  PlusCircle,
  ArrowLeft,
  ExternalLink,
  X,
  FileText,
} from "lucide-react";
import { ResearchPublicationRecord } from "@/modules/research/domain/types";

export default function PublicationsArchivePage() {
  const [publications, setPublications] = useState<ResearchPublicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [newPub, setNewPub] = useState({
    title: "",
    authors: "",
    journal_or_conference: "",
    publication_date: "",
    doi: "",
    abstract: "",
    research_area: "Physiotherapy & Biomechanics",
    external_url: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPubs = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      const res = await fetch(`/api/research/publications?${q.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setPublications(d.publications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPubs();
  }, []);

  const handleAddPublication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/research/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPub,
          authors: newPub.authors.split(",").map((a) => a.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add publication");

      setShowAddModal(false);
      setMessage("Publication added to your verified MGN profile & research registry!");
      fetchPubs();
    } catch (err: any) {
      setMessage(err.message || "Failed to add publication");
    } finally {
      setSubmitting(false);
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
            <span>Back to Research Hub</span>
          </Link>
          <h1 className="mt-1 text-2xl font-black text-[#171717]">Research Publications</h1>
          <p className="text-xs text-[#5d5854]">
            Peer-reviewed papers, clinical trial outcomes, and conference proceedings published by verified healthcare professionals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-800"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Publication</span>
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-xs font-semibold text-purple-900">
          {message}
        </div>
      )}

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#f0efee]" />
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-purple-700" />
            <h3 className="mt-3 text-sm font-bold text-[#171717]">No publications indexed yet</h3>
            <p className="mt-1 text-xs text-[#5d5854]">
              Add your published medical journals, PubMed citations, or clinical study papers.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-4 rounded-xl bg-purple-700 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-800"
            >
              Add First Publication
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs transition-all hover:border-[#ded8d1]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#77716b]">
                  <span className="font-semibold text-purple-800">{pub.journal_or_conference}</span>
                  {pub.publication_date && <span>{new Date(pub.publication_date).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}</span>}
                </div>

                <h3 className="mt-1.5 text-base font-bold text-[#171717]">{pub.title}</h3>
                <p className="mt-1 text-xs font-medium text-[#5d5854]">
                  Authors: {pub.authors?.join(", ")}
                </p>

                {pub.abstract && (
                  <p className="mt-2 text-xs leading-relaxed text-[#5d5854] line-clamp-3">
                    {pub.abstract}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0efee] pt-3 text-xs">
                  {pub.doi ? (
                    <span className="font-mono text-[11px] text-[#77716b]">DOI: {pub.doi}</span>
                  ) : <div />}

                  {pub.external_url && (
                    <a
                      href={pub.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-purple-700 hover:underline"
                    >
                      <span>Read Paper</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Publication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#171717]">Add Research Publication</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1 text-[#77716b] hover:bg-[#f0efee]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPublication} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717]">Paper / Article Title *</label>
                <input
                  type="text"
                  required
                  value={newPub.title}
                  onChange={(e) => setNewPub({ ...newPub, title: e.target.value })}
                  placeholder="e.g. Longitudinal Outcomes of Early Physical Rehabilitation..."
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717]">Authors (comma-separated) *</label>
                <input
                  type="text"
                  required
                  value={newPub.authors}
                  onChange={(e) => setNewPub({ ...newPub, authors: e.target.value })}
                  placeholder="e.g. Dr. A. Sharma, Dr. P. Patel, PT R. Verma"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717]">Journal / Conference *</label>
                  <input
                    type="text"
                    required
                    value={newPub.journal_or_conference}
                    onChange={(e) => setNewPub({ ...newPub, journal_or_conference: e.target.value })}
                    placeholder="e.g. Journal of Orthopedic Research"
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717]">Publication Date</label>
                  <input
                    type="date"
                    value={newPub.publication_date}
                    onChange={(e) => setNewPub({ ...newPub, publication_date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717]">DOI (Digital Object Identifier)</label>
                  <input
                    type="text"
                    value={newPub.doi}
                    onChange={(e) => setNewPub({ ...newPub, doi: e.target.value })}
                    placeholder="10.1016/j.jphys..."
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717]">External Link / URL</label>
                  <input
                    type="url"
                    value={newPub.external_url}
                    onChange={(e) => setNewPub({ ...newPub, external_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717]">Abstract</label>
                <textarea
                  rows={3}
                  value={newPub.abstract}
                  onChange={(e) => setNewPub({ ...newPub, abstract: e.target.value })}
                  placeholder="Summary of objectives, methodology, and conclusion..."
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-purple-700 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add to Research Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
