// components/research/ResearchOpportunityCard.tsx
"use client";

import React from "react";
import { Briefcase, MapPin, DollarSign, ArrowRight, CheckCircle2 } from "lucide-react";
import { ResearchOpportunityRecord } from "@/modules/research/domain/types";

interface ResearchOpportunityCardProps {
  opportunity: ResearchOpportunityRecord;
  onApply?: (opp: ResearchOpportunityRecord) => void;
}

export function ResearchOpportunityCard({ opportunity, onApply }: ResearchOpportunityCardProps) {
  const typeLabels: Record<string, string> = {
    research_assistant: "Research Assistant",
    student_researcher: "Student Researcher",
    clinical_research: "Clinical Researcher",
    data_collection: "Data Collection Specialist",
    research_volunteer: "Research Volunteer",
    statistical_analysis: "Biostatistician / Data Analyst",
    academic_collaboration: "Academic Collaborator",
    co_author: "Co-Author Opportunity",
  };

  return (
    <div className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs transition-all hover:border-[#ded8d1] hover:shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-800">
              {typeLabels[opportunity.opportunity_type] || "Research Opportunity"}
            </span>
            {opportunity.is_funded ? (
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
                Funded / Stipend Available
              </span>
            ) : (
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                Honorary / Co-authorship
              </span>
            )}
          </div>

          <h3 className="mt-2 text-base font-bold text-[#171717]">
            {opportunity.title}
          </h3>

          {opportunity.project_title && (
            <p className="mt-0.5 text-xs font-medium text-purple-700">
              Project: {opportunity.project_title}
            </p>
          )}

          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#5d5854]">
            {opportunity.description}
          </p>
        </div>
      </div>

      {/* Meta & Qualifications */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#77716b]">
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-purple-600" />
          <span className="capitalize">{opportunity.location_type} {opportunity.city ? `(${opportunity.city})` : ""}</span>
        </div>
        {opportunity.stipend_amount ? (
          <div className="flex items-center gap-1 font-semibold text-emerald-700">
            <span>₹{opportunity.stipend_amount} stipend</span>
          </div>
        ) : null}
        <div>
          <span>{opportunity.slots_available} position{opportunity.slots_available > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Skills tags */}
      {opportunity.required_skills && opportunity.required_skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {opportunity.required_skills.map((skill, idx) => (
            <span key={idx} className="rounded-md bg-[#f8f7f6] px-2 py-0.5 text-[10px] text-[#5d5854]">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f0efee] pt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#77716b]">
            Posted by <span className="font-semibold text-[#171717]">{opportunity.creator_name || "Investigator"}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onApply?.(opportunity)}
          className="rounded-xl border border-purple-600 bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700 active:scale-95"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
