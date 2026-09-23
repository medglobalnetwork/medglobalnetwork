// components/research/ResearchProjectCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import { FlaskConical, Users, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import { ResearchProjectRecord } from "@/modules/research/domain/types";

interface ResearchProjectCardProps {
  project: ResearchProjectRecord;
}

export function ResearchProjectCard({ project }: ResearchProjectCardProps) {
  const isRecruiting = project.status === "recruiting";

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-xs transition-all hover:border-[#ded8d1] hover:shadow-md">
      <div>
        {/* Header Tag & Status */}
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
            {project.research_area}
          </span>
          {isRecruiting ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              Recruiting Collaborators
            </span>
          ) : (
            <span className="rounded-full bg-[#f8f7f6] px-2.5 py-0.5 text-[11px] font-semibold text-[#5d5854] capitalize">
              {project.status}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/research/projects/${project.id}`}>
          <h3 className="line-clamp-2 text-base font-bold text-[#171717] transition-colors group-hover:text-purple-700">
            {project.title}
          </h3>
        </Link>

        {/* Abstract */}
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#5d5854]">
          {project.abstract}
        </p>

        {/* Required Skills */}
        {project.required_skills && project.required_skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.required_skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="rounded-md bg-[#f8f7f6] px-2 py-0.5 text-[10px] font-medium text-[#5d5854]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Lead Researcher */}
        <div className="mt-4 flex items-center gap-2 border-t border-[#f0efee] pt-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[11px] font-bold text-purple-800">
            {project.lead_image ? (
              <img src={project.lead_image} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              (project.lead_name || "R")[0]
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-xs font-semibold text-[#171717]">
                {project.lead_name || "Lead Investigator"}
              </span>
              {project.lead_verified && (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#1769c2]" />
              )}
            </div>
            <p className="truncate text-[11px] text-[#77716b]">
              {project.organization_name || project.lead_profession || "Principal Investigator"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f0efee] pt-3">
        <div className="flex items-center gap-1.5 text-xs text-[#77716b]">
          <Users className="h-3.5 w-3.5 text-purple-600" />
          <span>{project.collaborators_count} Collaborator{project.collaborators_count > 1 ? "s" : ""}</span>
        </div>

        <Link
          href={`/research/projects/${project.id}`}
          className="flex items-center gap-1 rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3.5 py-1.5 text-xs font-semibold text-[#171717] transition-all hover:border-purple-600 hover:bg-purple-600 hover:text-white active:scale-95"
        >
          <span>Explore Project</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
