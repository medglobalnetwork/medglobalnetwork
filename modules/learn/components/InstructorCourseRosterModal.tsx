"use client";

import * as React from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

export interface InstructorLearnerRecord {
  enrollment_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_image: string | null;
  member_id: string | null;
  is_founding_member: boolean;
  profession: string | null;
  specialization: string | null;
  organization: string | null;
  enrolled_at: string;
  completed_at: string | null;
  status: string;
  progress_percentage: number;
  last_accessed_at: string;
  has_certificate: boolean;
  certificate_id: string | null;
  certificate_number: string | null;
  verification_code: string | null;
  certificate_issued_at: string | null;
  certificate_status: string | null;
  certificate_state: "ISSUED" | "PENDING" | "DISABLED";
}

interface InstructorCourseRosterModalProps {
  courseId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InstructorCourseRosterModal({
  courseId,
  isOpen,
  onClose,
}: InstructorCourseRosterModalProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [courseInfo, setCourseInfo] = React.useState<{
    id: string;
    title: string;
    category: string;
    certificate_enabled: boolean;
  } | null>(null);
  const [stats, setStats] = React.useState<{
    totalEnrolled: number;
    completedCount: number;
    inProgressCount: number;
    certificatesIssuedCount: number;
    completionRate: number;
  }>({
    totalEnrolled: 0,
    completedCount: 0,
    inProgressCount: 0,
    certificatesIssuedCount: 0,
    completionRate: 0,
  });
  const [learners, setLearners] = React.useState<InstructorLearnerRecord[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterTab, setFilterTab] = React.useState<"all" | "completed" | "in_progress" | "certified">(
    "all"
  );

  React.useEffect(() => {
    if (!isOpen || !courseId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/learn/instructor/courses/${courseId}/students`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load course learners");
        }
        return res.json();
      })
      .then((data) => {
        setCourseInfo(data.course);
        setStats(data.stats);
        setLearners(data.learners || []);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load learners and certificate records");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const filteredLearners = learners.filter((learner) => {
    const matchesSearch =
      !searchQuery.trim() ||
      learner.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (learner.member_id && learner.member_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (learner.profession && learner.profession.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (learner.certificate_number &&
        learner.certificate_number.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === "completed") return learner.status === "completed";
    if (filterTab === "in_progress") return learner.status !== "completed";
    if (filterTab === "certified") return learner.has_certificate;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#ded8d1] bg-white shadow-2xl dark:border-[#30363d] dark:bg-[#161b22]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#ded8d1] p-5 sm:p-6 dark:border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eef5fc] px-2.5 py-0.5 text-[11px] font-bold text-[#0f4c81] dark:bg-[#1f2937] dark:text-[#58a6ff]">
                <GraduationCap className="size-3.5" />
                {courseInfo?.category || "Course Roster"}
              </span>
              {courseInfo?.certificate_enabled ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" />
                  Accredited Certificate Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  No Certificate
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-[#171717] sm:text-xl dark:text-[#f0f6fc]">
              {courseInfo?.title || "Course Students & Certificate Status"}
            </h2>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
              Monitor enrolled students, course completion rates, and issued verified certificates.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-[#77716b] hover:bg-[#f0efee] hover:text-[#171717] transition dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#f0f6fc] cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Course Statistics Summary Bar */}
        <div className="grid grid-cols-2 gap-3 border-b border-[#ded8d1] bg-[#faf9f8] p-4 sm:grid-cols-4 dark:border-[#30363d] dark:bg-[#0d1117]">
          <div className="rounded-2xl border border-[#ded8d1] bg-white p-3 dark:border-[#30363d] dark:bg-[#161b22]">
            <p className="text-[11px] font-bold text-[#77716b] dark:text-[#8b949e]">Enrolled Students</p>
            <p className="mt-1 text-xl font-black text-[#171717] dark:text-[#f0f6fc]">
              {stats.totalEnrolled}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-3 dark:border-emerald-950 dark:bg-[#161b22]">
            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              Completed Course
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-[#16804d] dark:text-emerald-400">
                {stats.completedCount}
              </span>
              <span className="text-[11px] font-bold text-[#77716b] dark:text-[#8b949e]">
                ({stats.completionRate}%)
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ded8d1] bg-white p-3 dark:border-[#30363d] dark:bg-[#161b22]">
            <p className="text-[11px] font-bold text-[#77716b] dark:text-[#8b949e]">In Progress</p>
            <p className="mt-1 text-xl font-black text-[#0f4c81] dark:text-[#58a6ff]">
              {stats.inProgressCount}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-3 dark:border-amber-950 dark:bg-[#161b22]">
            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
              Certificates Issued
            </p>
            <p className="mt-1 text-xl font-black text-amber-600 dark:text-amber-400">
              {stats.certificatesIssuedCount}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-3 border-b border-[#ded8d1] p-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#30363d]">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`rounded-xl px-3 py-1.5 transition cursor-pointer ${
                filterTab === "all"
                  ? "bg-[#0f4c81] text-white"
                  : "bg-[#f0efee] text-[#5d5854] hover:bg-[#e8e6e3] dark:bg-[#21262d] dark:text-[#8b949e]"
              }`}
            >
              All Students ({learners.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("completed")}
              className={`rounded-xl px-3 py-1.5 transition cursor-pointer ${
                filterTab === "completed"
                  ? "bg-[#16804d] text-white"
                  : "bg-[#f0efee] text-[#5d5854] hover:bg-[#e8e6e3] dark:bg-[#21262d] dark:text-[#8b949e]"
              }`}
            >
              Completed ({stats.completedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("in_progress")}
              className={`rounded-xl px-3 py-1.5 transition cursor-pointer ${
                filterTab === "in_progress"
                  ? "bg-[#0f4c81] text-white"
                  : "bg-[#f0efee] text-[#5d5854] hover:bg-[#e8e6e3] dark:bg-[#21262d] dark:text-[#8b949e]"
              }`}
            >
              In Progress ({stats.inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("certified")}
              className={`rounded-xl px-3 py-1.5 transition cursor-pointer ${
                filterTab === "certified"
                  ? "bg-amber-600 text-white"
                  : "bg-[#f0efee] text-[#5d5854] hover:bg-[#e8e6e3] dark:bg-[#21262d] dark:text-[#8b949e]"
              }`}
            >
              Certificates ({stats.certificatesIssuedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#77716b] dark:text-[#8b949e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or MGN ID..."
              className="h-8 w-full rounded-xl border border-[#ded8d1] bg-white pl-8 pr-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
            />
          </div>
        </div>

        {/* Student Records List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="size-8 animate-spin rounded-full border-2 border-[#0f4c81] border-t-transparent dark:border-[#58a6ff]" />
              <p className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
                Loading student roster & certificate records...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs font-semibold text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          ) : filteredLearners.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#ded8d1] p-12 text-center dark:border-[#30363d]">
              <Users className="mx-auto size-10 text-[#77716b] dark:text-[#8b949e] opacity-50 mb-3" />
              <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                No Students Found
              </h3>
              <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] max-w-xs mx-auto">
                {searchQuery || filterTab !== "all"
                  ? "No enrolled students matched your search criteria."
                  : "No students have enrolled in this course yet. Once healthcare professionals enroll and progress, their completion and certificate records will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLearners.map((learner) => (
                <div
                  key={learner.enrollment_id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#ded8d1] bg-white p-4 transition hover:border-[#0f4c81]/30 sm:flex-row sm:items-center sm:justify-between dark:border-[#30363d] dark:bg-[#161b22]"
                >
                  {/* Student Profile Info */}
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={learner.user_image}
                      name={learner.user_name}
                      userId={learner.user_id}
                      className="size-11 rounded-xl shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                          {learner.user_name}
                        </span>
                        {learner.member_id && (
                          <span className="rounded-md bg-[#f0efee] dark:bg-[#21262d] px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#5d5854] dark:text-[#8b949e]">
                            {learner.member_id}
                          </span>
                        )}
                        {learner.is_founding_member && (
                          <span className="rounded-md bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Founder
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                        {[learner.profession, learner.specialization, learner.organization]
                          .filter(Boolean)
                          .join(" • ") || "Healthcare Professional"}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-[#77716b] dark:text-[#8b949e]">
                        <span>Enrolled: {new Date(learner.enrolled_at).toLocaleDateString()}</span>
                        {learner.completed_at && (
                          <span className="font-semibold text-[#16804d] dark:text-emerald-400">
                            Completed: {new Date(learner.completed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress & Certificate Status */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t border-[#f0efee] pt-3 sm:border-0 sm:pt-0 dark:border-[#21262d]">
                    {/* Progress Bar */}
                    <div className="w-full sm:w-48 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span
                          className={
                            learner.status === "completed"
                              ? "text-[#16804d] dark:text-emerald-400"
                              : "text-[#0f4c81] dark:text-[#58a6ff]"
                          }
                        >
                          {learner.status === "completed" ? "Completed (100%)" : "In Progress"}
                        </span>
                        <span className="text-[#171717] dark:text-[#f0f6fc]">
                          {learner.progress_percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0efee] dark:bg-[#21262d]">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            learner.status === "completed"
                              ? "bg-[#16804d]"
                              : "bg-[#0f4c81]"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, learner.progress_percentage))}%` }}
                        />
                      </div>
                    </div>

                    {/* Certificate Status Box */}
                    {learner.certificate_state === "ISSUED" ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <Award className="size-3.5 text-[#16804d]" />
                          <span>Certificate Issued</span>
                        </div>
                        {learner.verification_code && (
                          <Link
                            href={`/verify/certificate/${learner.verification_code}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-xl bg-[#0f4c81] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#0c3c66] transition shadow-2xs"
                          >
                            <span>Verify</span>
                            <ExternalLink className="size-3" />
                          </Link>
                        )}
                      </div>
                    ) : learner.certificate_state === "DISABLED" ? (
                      <span className="text-[11px] font-semibold text-[#77716b] dark:text-[#8b949e]">
                        Certificates Disabled
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/50">
                        <Clock className="size-3" />
                        <span>Pending Completion</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#ded8d1] bg-[#faf9f8] p-4 dark:border-[#30363d] dark:bg-[#0d1117]">
          <span className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
            Showing {filteredLearners.length} of {learners.length} enrolled students
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-bold text-[#171717] hover:bg-[#f0efee] transition dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc] dark:hover:bg-[#21262d] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
