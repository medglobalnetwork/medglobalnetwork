// app/(app)/research/projects/[projectId]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FlaskConical,
  Users,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  X,
  Plus,
  Briefcase,
  FileText,
  UserPlus,
} from "lucide-react";
import { ResearchProjectRecord } from "@/modules/research/domain/types";

export default function ResearchProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<ResearchProjectRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [roleApplied, setRoleApplied] = useState("Collaborator / Co-Investigator");
  const [proposalMessage, setProposalMessage] = useState("");
  const [submittingCollab, setSubmittingCollab] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/research/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (err) {
      console.error("Error loading project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [projectId]);

  const handleSendCollaborationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCollab(true);
    setMessage(null);
    try {
      const res = await fetch("/api/research/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          roleApplied,
          proposalMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send collaboration request");

      setShowCollabModal(false);
      setMessage("Collaboration proposal sent to the Principal Investigator.");
      fetchDetail();
    } catch (err: any) {
      setMessage(err.message || "Failed to send proposal");
    } finally {
      setSubmittingCollab(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-3xl bg-[#f0efee]" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#171717]">Research project not found</h2>
        <p className="mt-2 text-sm text-[#5d5854]">This study may have been completed or archived.</p>
        <Link
          href="/research"
          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-purple-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to research hub</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5d5854] hover:text-[#171717]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Research</span>
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-xs font-semibold text-purple-900">
          {message}
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Project Description & Team */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-[#e8e6e3] bg-gradient-to-r from-purple-50 via-white to-indigo-50/30 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
                {project.research_area}
              </span>
              <span className="rounded-md bg-[#171717] px-3 py-1 text-xs font-bold text-white capitalize">
                {project.status}
              </span>
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-black text-[#171717]">
              {project.title}
            </h1>

            {/* Principal Investigator Dossier */}
            <div className="mt-6 flex items-center gap-3 border-t border-[#e8e6e3] pt-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-800">
                {project.lead_image ? (
                  <img src={project.lead_image} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  (project.lead_name || "R")[0]
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#171717]">
                    {project.lead_name || "Lead Investigator"}
                  </span>
                  {project.lead_verified && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1769c2]" />
                  )}
                </div>
                <p className="text-xs text-[#5d5854]">
                  Principal Investigator · {project.organization_name || project.lead_profession || "Medical Researcher"}
                </p>
              </div>
            </div>
          </div>

          {/* Abstract */}
          <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6">
            <h2 className="text-base font-bold text-[#171717]">Study Abstract</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5d5854] whitespace-pre-line">
              {project.abstract}
            </p>

            {project.methodology && (
              <div className="mt-6 border-t border-[#f0efee] pt-4">
                <h3 className="text-xs font-bold uppercase text-[#171717]">
                  Methodology & Study Design
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#5d5854] whitespace-pre-line text-pretty">
                  {project.methodology}
                </p>
              </div>
            )}

            {project.research_questions && project.research_questions.length > 0 && (
              <div className="mt-6 border-t border-[#f0efee] pt-4">
                <h3 className="text-xs font-bold uppercase text-[#171717]">
                  Key Research Questions
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[#5d5854]">
                  {project.research_questions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Research Team / Collaborators */}
          <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171717]">Study Investigators & Team</h2>
                <p className="text-xs text-[#5d5854]">
                  Co-authors and contributing healthcare professionals.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-800">
                {project.members?.length || 1} Member{project.members?.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-4 divide-y divide-[#f0efee]">
              {project.members?.map((mem) => (
                <div key={mem.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-800">
                      {mem.user_name ? mem.user_name[0] : "C"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171717]">{mem.user_name}</p>
                      <p className="text-[11px] text-[#77716b]">{mem.user_profession || "Collaborator"}</p>
                    </div>
                  </div>

                  <span className="rounded-md bg-[#f8f7f6] px-2.5 py-1 text-[11px] font-semibold text-[#5d5854] capitalize">
                    {mem.role.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Project Stats & Collaboration Action */}
        <div className="space-y-6">
          <div className="sticky top-20 rounded-3xl border border-[#e8e6e3] bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#171717]">Collaboration Status</h3>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#f0efee] pb-2">
                <span className="text-[#77716b]">Status</span>
                <span className="font-bold text-[#171717] capitalize">{project.status}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#f0efee] pb-2">
                <span className="text-[#77716b]">Discipline</span>
                <span className="font-bold text-purple-800">{project.research_area}</span>
              </div>
              {project.ethical_approval_number && (
                <div className="flex items-center justify-between border-b border-[#f0efee] pb-2">
                  <span className="text-[#77716b]">Ethics Ref #</span>
                  <span className="font-mono text-[#171717]">{project.ethical_approval_number}</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-6">
              {project.user_membership_role ? (
                <div className="rounded-2xl bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-900">
                  ✓ You are a {project.user_membership_role.replace(/_/g, " ")} on this study
                </div>
              ) : project.user_pending_collab_request ? (
                <div className="rounded-2xl bg-purple-50 p-3 text-center text-xs font-bold text-purple-900">
                  Collaboration Proposal Pending Review
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCollabModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-700 py-3 text-xs font-bold text-white shadow-xs hover:bg-purple-800 active:scale-95"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Request to Collaborate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration Proposal Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#171717]">Collaborate on Research</h3>
              <button
                type="button"
                onClick={() => setShowCollabModal(false)}
                className="rounded-full p-1 text-[#77716b] hover:bg-[#f0efee]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-1 text-xs text-[#5d5854]">
              {project.title}
            </p>

            <form onSubmit={handleSendCollaborationRequest} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717]">Proposed Role</label>
                <input
                  type="text"
                  required
                  value={roleApplied}
                  onChange={(e) => setRoleApplied(e.target.value)}
                  placeholder="e.g. Co-Investigator / Clinical Data Analyst"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717]">Proposal & Clinical Expertise</label>
                <textarea
                  rows={4}
                  required
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  placeholder="Explain how your expertise aligns with this research project and your planned contributions..."
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCollabModal(false)}
                  className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCollab}
                  className="rounded-xl bg-purple-700 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
                >
                  {submittingCollab ? "Sending Proposal..." : "Submit Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
