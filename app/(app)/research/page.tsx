// app/(app)/research/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Search,
  PlusCircle,
  Users,
  BookOpen,
  Sparkles,
  ArrowRight,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { ResearchProjectCard } from "@/components/research/ResearchProjectCard";
import { ResearchOpportunityCard } from "@/components/research/ResearchOpportunityCard";
import { ResearchProjectRecord, ResearchOpportunityRecord, ResearchPublicationRecord } from "@/modules/research/domain/types";

const RESEARCH_AREAS = [
  "All Disciplines",
  "Cardiology & Vascular",
  "Neuro-Rehabilitation",
  "Orthopedics & Sports Medicine",
  "Physiotherapy & Biomechanics",
  "Digital Health & AI",
  "Epidemiology & Public Health",
  "Pharmacology & Therapeutics",
  "Critical Care Medicine",
];

export default function ResearchDiscoveryPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "opportunities" | "publications">("projects");
  const [projects, setProjects] = useState<ResearchProjectRecord[]>([]);
  const [opportunities, setOpportunities] = useState<ResearchOpportunityRecord[]>([]);
  const [publications, setPublications] = useState<ResearchPublicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Disciplines");
  const [recruitingOnly, setRecruitingOnly] = useState(false);

  const fetchResearchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (selectedArea !== "All Disciplines") q.set("area", selectedArea);
      if (recruitingOnly) q.set("recruiting", "true");

      const [resProj, resOpp, resPub] = await Promise.all([
        fetch(`/api/research/projects?${q.toString()}`),
        fetch(`/api/research/opportunities?${q.toString()}`),
        fetch(`/api/research/publications?${q.toString()}`),
      ]);

      if (resProj.ok) {
        const d = await resProj.json();
        setProjects(d.items || []);
      }
      if (resOpp.ok) {
        const d = await resOpp.json();
        setOpportunities(d.opportunities || []);
      }
      if (resPub.ok) {
        const d = await resPub.json();
        setPublications(d.publications || []);
      }
    } catch (err) {
      console.error("Error loading research data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearchData();
  }, [selectedArea, recruitingOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResearchData();
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Top Header Banner ── */}
      <div className="rounded-3xl border border-[#e8e6e3] bg-gradient-to-r from-purple-600/10 via-indigo-600/5 to-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800">
              <FlaskConical className="h-4 w-4" />
              <span>Healthcare Research & Clinical Trials Ecosystem</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-[#171717] sm:text-3xl">
              Discover → Collaborate → Build → Publish
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-[#5d5854]">
              Connect with principal investigators, form multi-center clinical study groups, hire research assistants, and publish peer-reviewed papers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/research/my"
              className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2.5 text-xs font-semibold text-[#171717] shadow-xs hover:bg-[#f8f7f6]"
            >
              My Research
            </Link>

            <Link
              href="/research/projects/create"
              className="flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-800"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Research Project</span>
            </Link>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#77716b]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clinical trials, study titles, methodology, or publications..."
              className="w-full rounded-2xl border border-[#ded8d1] bg-white py-3 pr-4 pl-10 text-sm text-[#171717] placeholder:text-[#77716b] focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-[#171717] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#333] active:scale-95"
          >
            Search Research
          </button>
        </form>
      </div>

      {/* ── Research Area Pills ── */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {RESEARCH_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => setSelectedArea(area)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedArea === area
                  ? "bg-purple-700 text-white shadow-xs"
                  : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#e8e6e3] py-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "projects" ? "bg-purple-50 text-purple-800" : "text-[#5d5854] hover:bg-[#f8f7f6]"
              }`}
            >
              Research Projects ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("opportunities")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "opportunities" ? "bg-purple-50 text-purple-800" : "text-[#5d5854] hover:bg-[#f8f7f6]"
              }`}
            >
              Opportunities & RA ({opportunities.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("publications")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "publications" ? "bg-purple-50 text-purple-800" : "text-[#5d5854] hover:bg-[#f8f7f6]"
              }`}
            >
              Publications ({publications.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "projects" && (
              <label className="flex items-center gap-2 text-xs font-semibold text-[#171717] cursor-pointer">
                <input
                  type="checkbox"
                  checked={recruitingOnly}
                  onChange={(e) => setRecruitingOnly(e.target.checked)}
                  className="rounded"
                />
                <span>Open for Collaboration Only</span>
              </label>
            )}

            {activeTab === "publications" && (
              <Link
                href="/research/publications"
                className="text-xs font-bold text-purple-700 hover:underline"
              >
                + Add Publication
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Grid / Clean Empty States ── */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-[#f0efee]" />
            ))}
          </div>
        ) : activeTab === "projects" ? (
          projects.length === 0 ? (
            /* Clean Authentic Empty State */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <FlaskConical className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#171717]">No research projects found</h3>
              <p className="mt-1.5 max-w-md text-xs text-[#5d5854]">
                {selectedArea !== "All Disciplines" || search
                  ? "No research projects match your search criteria. Try selecting 'All Disciplines'."
                  : "Verified researchers, medical colleges, and healthcare institutes will post open clinical studies and multi-center trials here."}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/research/projects/create"
                  className="rounded-xl bg-purple-700 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-800"
                >
                  Create Research Project
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((proj) => (
                <ResearchProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          )
        ) : activeTab === "opportunities" ? (
          opportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
              <Briefcase className="h-10 w-10 text-purple-700" />
              <h3 className="mt-3 text-sm font-bold text-[#171717]">No open research positions</h3>
              <p className="mt-1 text-xs text-[#5d5854]">
                Research assistant, student researcher, and data collection openings will appear here.
              </p>
              <Link
                href="/research/opportunities"
                className="mt-4 inline-block rounded-xl bg-purple-700 px-4 py-2 text-xs font-semibold text-white"
              >
                Post an Opportunity
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {opportunities.map((opp) => (
                <ResearchOpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          )
        ) : (
          publications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
              <BookOpen className="h-10 w-10 text-purple-700" />
              <h3 className="mt-3 text-sm font-bold text-[#171717]">No publications indexed yet</h3>
              <p className="mt-1 text-xs text-[#5d5854]">
                Link your peer-reviewed journal articles, conference papers, and clinical trial outcomes.
              </p>
              <Link
                href="/research/publications"
                className="mt-4 inline-block rounded-xl bg-purple-700 px-4 py-2 text-xs font-semibold text-white"
              >
                Add Your Publication
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {publications.map((pub) => (
                <div key={pub.id} className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#77716b]">
                    <span>{pub.journal_or_conference}</span>
                    {pub.publication_date && <span>{new Date(pub.publication_date).getFullYear()}</span>}
                  </div>
                  <h3 className="mt-1.5 text-base font-bold text-[#171717]">{pub.title}</h3>
                  <p className="mt-1 text-xs font-medium text-purple-800">
                    {pub.authors.join(", ")}
                  </p>
                  {pub.abstract && (
                    <p className="mt-2 line-clamp-2 text-xs text-[#5d5854]">{pub.abstract}</p>
                  )}
                  {pub.doi && (
                    <p className="mt-2 text-[11px] font-mono text-[#77716b]">DOI: {pub.doi}</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
