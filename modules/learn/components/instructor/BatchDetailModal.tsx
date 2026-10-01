"use client";

import * as React from "react";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import { Batch, BatchStudent, BatchAnnouncement } from "../../types";

interface BatchDetailModalProps {
  batchId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onBatchUpdated?: () => void;
}

export function BatchDetailModal({
  batchId,
  isOpen,
  onClose,
  onBatchUpdated,
}: BatchDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<"roster" | "announcements" | "settings">("roster");
  const [batch, setBatch] = React.useState<Batch | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Add Student Form State
  const [studentInput, setStudentInput] = React.useState("");
  const [studentNotes, setStudentNotes] = React.useState("");
  const [isAddingStudent, setIsAddingStudent] = React.useState(false);
  const [addStudentSuccess, setAddStudentSuccess] = React.useState<string | null>(null);
  const [addStudentError, setAddStudentError] = React.useState<string | null>(null);

  // Announcement Form State
  const [annTitle, setAnnTitle] = React.useState("");
  const [annContent, setAnnContent] = React.useState("");
  const [annPriority, setAnnPriority] = React.useState<"normal" | "high" | "urgent">("normal");
  const [isPostingAnn, setIsPostingAnn] = React.useState(false);

  // Edit Batch State
  const [editName, setEditName] = React.useState("");
  const [editCode, setEditCode] = React.useState("");
  const [editMaxCap, setEditMaxCap] = React.useState(50);
  const [editSchedule, setEditSchedule] = React.useState("");
  const [editMeetingUrl, setEditMeetingUrl] = React.useState("");
  const [editStatus, setEditStatus] = React.useState<string>("active");
  const [isSavingBatch, setIsSavingBatch] = React.useState(false);

  const fetchBatch = React.useCallback(async () => {
    if (!batchId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/learn/instructor/batches/${batchId}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load batch");
      setBatch(data.batch);
      setEditName(data.batch.name);
      setEditCode(data.batch.code);
      setEditMaxCap(data.batch.max_capacity);
      setEditSchedule(data.batch.schedule_info || "");
      setEditMeetingUrl(data.batch.meeting_url || "");
      setEditStatus(data.batch.status || "active");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch batch details");
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  React.useEffect(() => {
    if (isOpen && batchId) {
      fetchBatch();
    }
  }, [isOpen, batchId, fetchBatch]);

  if (!isOpen || !batchId) return null;

  // Handle Add Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInput.trim()) return;
    setIsAddingStudent(true);
    setAddStudentSuccess(null);
    setAddStudentError(null);

    try {
      const res = await fetch(`/api/learn/instructor/batches/${batchId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIdentifier: studentInput.trim(),
          notes: studentNotes.trim() || undefined,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add student to batch");

      setAddStudentSuccess(`Successfully enrolled ${data.userName || studentInput} in this batch.`);
      setStudentInput("");
      setStudentNotes("");
      fetchBatch();
      if (onBatchUpdated) onBatchUpdated();
      setTimeout(() => setAddStudentSuccess(null), 4000);
    } catch (err: any) {
      setAddStudentError(err.message || "Failed to add student");
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Handle Remove Student
  const handleRemoveStudent = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this learner from the batch roster?")) return;
    try {
      const res = await fetch(`/api/learn/instructor/batches/${batchId}/students?userId=${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove student");
      }
      fetchBatch();
      if (onBatchUpdated) onBatchUpdated();
    } catch (err: any) {
      alert(err.message || "Failed to remove student");
    }
  };

  // Handle Post Announcement
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setIsPostingAnn(true);

    try {
      const res = await fetch(`/api/learn/instructor/batches/${batchId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: annTitle.trim(),
          content: annContent.trim(),
          priority: annPriority,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post announcement");

      setAnnTitle("");
      setAnnContent("");
      setAnnPriority("normal");
      fetchBatch();
    } catch (err: any) {
      alert(err.message || "Failed to post announcement");
    } finally {
      setIsPostingAnn(false);
    }
  };

  // Handle Delete Announcement
  const handleDeleteAnnouncement = async (annId: string) => {
    try {
      const res = await fetch(`/api/learn/instructor/batches/${batchId}/announcements?announcementId=${annId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchBatch();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Save Batch Settings
  const handleSaveBatchSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBatch(true);
    try {
      const res = await fetch(`/api/learn/instructor/batches/${batchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          code: editCode.trim(),
          maxCapacity: editMaxCap,
          scheduleInfo: editSchedule.trim(),
          meetingUrl: editMeetingUrl.trim(),
          status: editStatus,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update batch");
      }
      fetchBatch();
      if (onBatchUpdated) onBatchUpdated();
      alert("Batch details updated successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to save batch details");
    } finally {
      setIsSavingBatch(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-[#ded8d1] bg-white shadow-2xl dark:border-[#30363d] dark:bg-[#161b22] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-[#ded8d1] p-5 dark:border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#eef5fc] px-2 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:bg-[#1f2937] dark:text-[#58a6ff]">
                {batch?.code || "BATCH"}
              </span>
              <span className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
                {batch?.course_title || "Course Batch"}
              </span>
            </div>
            <h2 className="text-lg font-black text-[#171717] dark:text-[#f0f6fc]">
              {batch?.name || "Batch Details & Student Roster"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchBatch}
              className="rounded-xl p-2 text-[#77716b] hover:bg-[#f0efee] hover:text-[#171717] dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#f0f6fc] cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[#77716b] hover:bg-[#f0efee] hover:text-[#171717] dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#f0f6fc] cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* MODAL TABS */}
        <div className="flex items-center gap-2 border-b border-[#ded8d1] px-5 pt-3 dark:border-[#30363d]">
          <button
            type="button"
            onClick={() => setActiveTab("roster")}
            className={`flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "roster"
                ? "border-[#0f4c81] text-[#0f4c81] dark:border-[#58a6ff] dark:text-[#58a6ff]"
                : "border-transparent text-[#77716b] hover:text-[#171717] dark:text-[#8b949e] dark:hover:text-[#f0f6fc]"
            }`}
          >
            <Users className="size-3.5" />
            <span>Learner Roster ({batch?.students?.length || 0} / {batch?.max_capacity || 50})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("announcements")}
            className={`flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "announcements"
                ? "border-[#0f4c81] text-[#0f4c81] dark:border-[#58a6ff] dark:text-[#58a6ff]"
                : "border-transparent text-[#77716b] hover:text-[#171717] dark:text-[#8b949e] dark:hover:text-[#f0f6fc]"
            }`}
          >
            <Bell className="size-3.5" />
            <span>Announcements ({batch?.announcements?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "settings"
                ? "border-[#0f4c81] text-[#0f4c81] dark:border-[#58a6ff] dark:text-[#58a6ff]"
                : "border-transparent text-[#77716b] hover:text-[#171717] dark:text-[#8b949e] dark:hover:text-[#f0f6fc]"
            }`}
          >
            <Calendar className="size-3.5" />
            <span>Schedule & Timings</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="size-8 animate-spin rounded-full border-2 border-[#0f4c81] border-t-transparent dark:border-[#58a6ff]" />
              <p className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
                Loading batch roster and schedule details...
              </p>
            </div>
          ) : errorMsg ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
              {errorMsg}
            </div>
          ) : (
            <>
              {/* TAB 1: ROSTER & ENROLLMENT */}
              {activeTab === "roster" && (
                <div className="space-y-6">
                  {/* ADD STUDENT CARD */}
                  <form
                    onSubmit={handleAddStudent}
                    className="rounded-2xl border border-[#ded8d1] bg-[#fbfaf9] p-4 dark:border-[#30363d] dark:bg-[#0d1117] space-y-3"
                  >
                    <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1.5">
                      <UserPlus className="size-3.5 text-[#0f4c81] dark:text-[#58a6ff]" />
                      Enroll Healthcare Learner to this Batch
                    </h4>

                    {addStudentSuccess && (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{addStudentSuccess}</span>
                      </div>
                    )}

                    {addStudentError && (
                      <div className="flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-300">
                        <AlertCircle className="size-3.5 text-red-600 dark:text-red-400 shrink-0" />
                        <span>{addStudentError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          value={studentInput}
                          onChange={(e) => setStudentInput(e.target.value)}
                          placeholder="Learner email (e.g. doctor@hospital.org) or User ID..."
                          className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={studentNotes}
                          onChange={(e) => setStudentNotes(e.target.value)}
                          placeholder="Optional enrollment notes..."
                          className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isAddingStudent || !studentInput.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer"
                      >
                        <UserPlus className="size-3.5" />
                        <span>{isAddingStudent ? "Enrolling..." : "Add to Batch Roster"}</span>
                      </button>
                    </div>
                  </form>

                  {/* STUDENTS LIST TABLE */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                        Active Batch Roster ({batch?.students?.length || 0} Students)
                      </h4>
                      <span className="text-[11px] font-semibold text-[#77716b] dark:text-[#8b949e]">
                        Max Capacity: {batch?.max_capacity} Seats
                      </span>
                    </div>

                    {(!batch?.students || batch.students.length === 0) ? (
                      <div className="rounded-2xl border border-dashed border-[#ded8d1] p-8 text-center dark:border-[#30363d]">
                        <Users className="mx-auto size-8 text-[#77716b] opacity-40 mb-2 dark:text-[#8b949e]" />
                        <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                          No learners enrolled in this batch yet
                        </p>
                        <p className="mt-1 text-[11px] text-[#77716b] dark:text-[#8b949e]">
                          Use the form above to add students by their registered email or ID.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-[#ded8d1] dark:border-[#30363d]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#f0efee] dark:bg-[#21262d] font-bold text-[#171717] dark:text-[#f0f6fc]">
                            <tr>
                              <th className="p-3">Learner</th>
                              <th className="p-3">Enrolled On</th>
                              <th className="p-3">Course Progress</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#ded8d1] dark:divide-[#30363d]">
                            {batch.students.map((student) => (
                              <tr key={student.id} className="hover:bg-[#fbfaf9] dark:hover:bg-[#161b22]/80">
                                <td className="p-3">
                                  <div className="font-bold text-[#171717] dark:text-[#f0f6fc]">
                                    {student.user_name}
                                  </div>
                                  <div className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                                    {student.user_email}
                                  </div>
                                  {student.notes && (
                                    <div className="text-[10px] text-amber-700 dark:text-amber-400 italic mt-0.5">
                                      Note: {student.notes}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 text-[#5d5854] dark:text-[#8b949e]">
                                  {new Date(student.enrolled_at).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                      <div
                                        className="h-full bg-[#16804d]"
                                        style={{ width: `${student.progress_percentage || 0}%` }}
                                      />
                                    </div>
                                    <span className="text-[11px] font-bold text-[#171717] dark:text-[#f0f6fc]">
                                      {student.progress_percentage || 0}%
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    <UserCheck className="size-3" />
                                    Active
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStudent(student.user_id)}
                                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                                    title="Remove from batch"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ANNOUNCEMENTS */}
              {activeTab === "announcements" && (
                <div className="space-y-6">
                  {/* POST ANNOUNCEMENT CARD */}
                  <form
                    onSubmit={handlePostAnnouncement}
                    className="rounded-2xl border border-[#ded8d1] bg-[#fbfaf9] p-4 dark:border-[#30363d] dark:bg-[#0d1117] space-y-3"
                  >
                    <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1.5">
                      <Send className="size-3.5 text-[#0f4c81] dark:text-[#58a6ff]" />
                      Broadcast Batch Announcement
                    </h4>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          required
                          value={annTitle}
                          onChange={(e) => setAnnTitle(e.target.value)}
                          placeholder="e.g. Live Q&A Session moved to 8:00 PM IST"
                          className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                        />
                      </div>
                      <div>
                        <select
                          value={annPriority}
                          onChange={(e: any) => setAnnPriority(e.target.value)}
                          className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-2 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                        >
                          <option value="normal">Normal Priority</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent Alert</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        required
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        placeholder="Write announcement details, study instructions, or live class links..."
                        className="w-full rounded-xl border border-[#ded8d1] bg-white p-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isPostingAnn || !annTitle.trim() || !annContent.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="size-3.5" />
                        <span>{isPostingAnn ? "Posting..." : "Post Announcement"}</span>
                      </button>
                    </div>
                  </form>

                  {/* ANNOUNCEMENTS LIST */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                      Announcement History
                    </h4>

                    {(!batch?.announcements || batch.announcements.length === 0) ? (
                      <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                        No announcements posted to this batch yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {batch.announcements.map((ann) => (
                          <div
                            key={ann.id}
                            className="rounded-2xl border border-[#ded8d1] bg-white p-4 dark:border-[#30363d] dark:bg-[#161b22] flex items-start justify-between gap-3 shadow-2xs"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                {ann.priority === "urgent" ? (
                                  <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-950/40 dark:text-red-300">
                                    Urgent
                                  </span>
                                ) : ann.priority === "high" ? (
                                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                    Important
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                    Notice
                                  </span>
                                )}
                                <span className="text-[10px] text-[#77716b] dark:text-[#8b949e]">
                                  {new Date(ann.created_at).toLocaleString()}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                                {ann.title}
                              </h5>
                              <p className="text-xs text-[#5d5854] dark:text-[#8b949e] whitespace-pre-wrap">
                                {ann.content}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="text-[#77716b] hover:text-red-600 transition cursor-pointer p-1"
                              title="Delete announcement"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SCHEDULE & TIMINGS SETTINGS */}
              {activeTab === "settings" && (
                <form onSubmit={handleSaveBatchSettings} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                        Batch Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                        Batch Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                        className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] uppercase focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                        Maximum Student Capacity
                      </label>
                      <input
                        type="number"
                        value={editMaxCap}
                        onChange={(e) => setEditMaxCap(Number(e.target.value))}
                        className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                        Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active / In-Progress</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                      Live Class Timings & Recurring Schedule
                    </label>
                    <input
                      type="text"
                      value={editSchedule}
                      onChange={(e) => setEditSchedule(e.target.value)}
                      placeholder="e.g. Every Mon, Wed & Fri at 7:00 PM – 8:30 PM IST"
                      className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                      Live Classroom Meeting Link (MGN Live or Zoom/Meet)
                    </label>
                    <input
                      type="url"
                      value={editMeetingUrl}
                      onChange={(e) => setEditMeetingUrl(e.target.value)}
                      placeholder="https://meet.google.com/... or MGN Live Classroom Room ID"
                      className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingBatch}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>{isSavingBatch ? "Saving..." : "Save Batch Changes"}</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
