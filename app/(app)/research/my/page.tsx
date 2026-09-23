// app/(app)/research/my/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Users,
  BookOpen,
  ArrowLeft,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { ResearchProjectRecord } from "@/modules/research/domain/types";

export default function MyResearchDashboardPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "collaborations" | "requests" | "publications">("projects");
  const [myProjects, setMyProjects] = useState<ResearchProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/research/projects?limit=50")
      .then((r) => r.json())
      .then((d) => setMyProjects(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/research"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d5854] hover:text-[#171717]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Discover Research</span>
          </Link>
          <h1 className="mt-1 text-2xl font-black text-[#171717]">My Research Dashboard</h1>
          <p className="text-xs text-[#5d5854]">
            Manage your principal investigator studies, co-authorship proposals, and indexed publications.
          </p>
        </div>

        <Link
          href="/research/projects/create"
          className="flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-800"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Research Project</span>
        </Link>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-xs font-semibold text-purple-900">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#e8e6e3] gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`pb-3 transition ${
            activeTab === "projects"
              ? "border-b-2 border-purple-700 text-purple-800"
              : "text-[#77716b] hover:text-[#171717]"
          }`}
        >
          My Led Projects
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("collaborations")}
          className={`pb-3 transition ${
            activeTab === "collaborations"
              ? "border-b-2 border-purple-700 text-purple-800"
              : "text-[#77716b] hover:text-[#171717]"
          }`}
        >
          Active Collaborations
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#f0efee]" />
            ))}
          </div>
        ) : myProjects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-[#fcfbfa] p-12 text-center">
            <FlaskConical className="mx-auto h-10 w-10 text-purple-700" />
            <h3 className="mt-3 text-sm font-bold text-[#171717]">No research projects initiated yet</h3>
            <p className="mt-1 text-xs text-[#5d5854]">
              Start your first clinical study, systematic review, or trial and recruit collaborators.
            </p>
            <Link
              href="/research/projects/create"
              className="mt-5 inline-block rounded-xl bg-purple-700 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-800"
            >
              Initiate Project
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myProjects.map((proj) => (
              <div
                key={proj.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e8e6e3] bg-white p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                      {proj.research_area}
                    </span>
                    <span className="rounded-md bg-[#f8f7f6] px-2 py-0.5 text-[10px] font-semibold text-[#5d5854] capitalize">
                      {proj.status}
                    </span>
                  </div>
                  <Link href={`/research/projects/${proj.id}`}>
                    <h3 className="mt-1 text-base font-bold text-[#171717] hover:text-purple-700">
                      {proj.title}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs text-[#5d5854]">{proj.collaborators_count} Team Member{proj.collaborators_count > 1 ? "s" : ""}</p>
                </div>

                <Link
                  href={`/research/projects/${proj.id}`}
                  className="rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-white text-center"
                >
                  Manage Project
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
