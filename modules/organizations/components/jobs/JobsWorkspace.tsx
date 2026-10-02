"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  UserCheck,
  X,
} from "lucide-react";
import { OrganizationRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface Props {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function JobsWorkspace({ organization, userRole, customPermissions }: Props) {
  const [activeTab, setActiveTab] = useState<"jobs" | "pipeline" | "interviews">("jobs");
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Job Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [workMode, setWorkMode] = useState("onsite");
  const [city, setCity] = useState(organization.city || "");
  const [state, setState] = useState(organization.state || "");
  const [experienceMin, setExperienceMin] = useState(0);
  const [experienceMax, setExperienceMax] = useState(5);
  const [specialization, setSpecialization] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [skills, setSkills] = useState("");
  const [deadline, setDeadline] = useState("");
  const [savingJob, setSavingJob] = useState(false);
  const [jobError, setJobError] = useState("");

  const canCreateJob = hasOrgPermission(userRole, customPermissions, "JOBS_CREATE");
  const canManageApps = hasOrgPermission(userRole, customPermissions, "APPLICATIONS_MANAGE");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/jobs`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setJobs(data.jobs || []);
        setApplications(data.applications || []);
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

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !description) return;
    setSavingJob(true);
    setJobError("");

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/org/${organization.id}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          department: jobDept || undefined,
          employment_type: employmentType,
          work_mode: workMode,
          city,
          state,
          experience_min: Number(experienceMin),
          experience_max: Number(experienceMax),
          specialization: specialization || undefined,
          salary_min: salaryMin ? Number(salaryMin) : undefined,
          salary_max: salaryMax ? Number(salaryMax) : undefined,
          salary_currency: "INR",
          description,
          responsibilities: responsibilities || undefined,
          requirements: requirements || undefined,
          skills: skillsArray,
          application_deadline: deadline ? new Date(deadline).toISOString() : undefined,
          status: "published",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setJobError(data.error || "Failed to post job");
      } else {
        setIsCreateOpen(false);
        setJobTitle("");
        setDescription("");
        loadData();
      }
    } catch (err: any) {
      setJobError(err.message || "Failed to post job");
    } finally {
      setSavingJob(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch(`/api/org/${organization.id}/jobs/pipeline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, status }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter((j) =>
    (j.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.department || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
            <Briefcase className="size-3.5" />
            <span>Recruitment & Career Requisitions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Jobs & Talent Acquisition</h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish medical job openings, review candidate credentials, manage hiring stages, and schedule interviews.
          </p>
        </div>

        {canCreateJob && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Create Job Opening</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "jobs"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Active Openings ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "pipeline"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Candidate Pipeline ({applications.length})
        </button>
      </div>

      {/* Job Openings View */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
                Loading job requisitions...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                <Briefcase className="size-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-semibold text-white">No job openings posted</p>
                <p className="text-xs text-slate-400 mt-1">
                  Start hiring doctors, nurses, and specialists by creating your first opening.
                </p>
              </div>
            ) : (
              filteredJobs.map((j) => (
                <div
                  key={j.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{j.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {j.status || "Published"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {j.department && <span>{j.department}</span>}
                      <span>•</span>
                      <span className="capitalize">{j.employment_type?.replace("_", " ")}</span>
                      <span>•</span>
                      <span className="capitalize">{j.work_mode}</span>
                      {j.city && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 text-slate-500" />
                            {j.city}, {j.state}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      {j.applicant_count || 0} Applicants
                    </span>
                    <Link
                      href={`/opportunities/jobs/${j.id}`}
                      target="_blank"
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                    >
                      Public View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Candidate Pipeline Kanban / List */}
      {activeTab === "pipeline" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Application Pipeline</h3>
          {applications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No candidate applications received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm">{app.applicant_name || "Applicant"}</p>
                    <p className="text-slate-400">
                      Applied for: <span className="text-slate-200 font-semibold">{app.job_title}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Applied on {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {canManageApps && (
                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="applied">Applied</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview Scheduled</option>
                        <option value="offered">Offer Extended</option>
                        <option value="hired">Hired</option>
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

      {/* Create Job Wizard Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="size-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Create Clinical Job Opening</h2>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {jobError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                {jobError}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Consultant Cardiologist, Staff Nurse"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology"
                    value={jobDept}
                    onChange={(e) => setJobDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract / Locum</option>
                    <option value="internship">Clinical Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="onsite">On-Site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote (Telehealth)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Experience (Years)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={experienceMin}
                      onChange={(e) => setExperienceMin(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={experienceMax}
                      onChange={(e) => setExperienceMax(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Interventional Cardiology, ICU Care"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Echocardiography, Angioplasty, ACLS, CPR"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Job Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide comprehensive details on clinical duties and facility infrastructure..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingJob}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  {savingJob ? "Posting Job..." : "Publish Job Opening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
