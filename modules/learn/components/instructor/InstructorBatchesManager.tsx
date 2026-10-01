"use client";

import * as React from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  Users,
  Video,
  ExternalLink,
} from "lucide-react";
import { Batch } from "../../types";
import { BatchDetailModal } from "./BatchDetailModal";

export function InstructorBatchesManager() {
  const [batches, setBatches] = React.useState<Batch[]>([]);
  const [courses, setCourses] = React.useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Selected batch for detail modal
  const [selectedBatchId, setSelectedBatchId] = React.useState<string | null>(null);

  // Create Batch Form Modal State
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [createCourseId, setCreateCourseId] = React.useState("");
  const [createName, setCreateName] = React.useState("");
  const [createCode, setCreateCode] = React.useState("");
  const [createDescription, setCreateDescription] = React.useState("");
  const [createMaxCapacity, setCreateMaxCapacity] = React.useState(50);
  const [createStartDate, setCreateStartDate] = React.useState("");
  const [createEndDate, setCreateEndDate] = React.useState("");
  const [createSchedule, setCreateSchedule] = React.useState("");
  const [createMeetingUrl, setCreateMeetingUrl] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [batchRes, courseRes] = await Promise.all([
        fetch("/api/learn/instructor/batches", { credentials: "include" }),
        fetch("/api/learn/instructor/courses", { credentials: "include" }),
      ]);

      const batchData = await batchRes.json();
      const courseData = await courseRes.json();

      if (batchRes.ok) {
        setBatches(batchData.batches || []);
      }
      if (courseRes.ok && Array.isArray(courseData.courses)) {
        setCourses(courseData.courses.map((c: any) => ({ id: c.id, title: c.title })));
        if (courseData.courses.length > 0 && !createCourseId) {
          setCreateCourseId(courseData.courses[0].id);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load batches");
    } finally {
      setLoading(false);
    }
  }, [createCourseId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Create Batch
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createCourseId || !createName.trim() || !createCode.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/learn/instructor/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: createCourseId,
          name: createName.trim(),
          code: createCode.trim(),
          description: createDescription.trim() || undefined,
          maxCapacity: Number(createMaxCapacity),
          startDate: createStartDate || undefined,
          endDate: createEndDate || undefined,
          scheduleInfo: createSchedule.trim() || undefined,
          meetingUrl: createMeetingUrl.trim() || undefined,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create batch");

      setShowCreateModal(false);
      setCreateName("");
      setCreateCode("");
      setCreateDescription("");
      setCreateSchedule("");
      setCreateMeetingUrl("");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to create batch");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Batch
  const handleDeleteBatch = async (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this batch? All student enrollments and announcements will be removed.")) return;
    try {
      const res = await fetch(`/api/learn/instructor/batches/${batchId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      !searchQuery.trim() ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.course_title && b.course_title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded8d1] pb-4 dark:border-[#30363d]">
        <div>
          <h2 className="text-lg font-black text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
            <Layers className="size-5 text-[#0f4c81] dark:text-[#58a6ff]" />
            Cohort Batches & Live Class Schedule
          </h2>
          <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
            Organize learners into structured batches with max capacity, start/end dates, live schedules, and dedicated rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="flex size-9 items-center justify-center rounded-xl border border-[#ded8d1] bg-white text-[#77716b] hover:text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:text-[#f0f6fc] transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Create New Batch</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#77716b] dark:text-[#8b949e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search batches by name, code, or course..."
            className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white pl-8 pr-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* BATCHES LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-[#0f4c81] border-t-transparent dark:border-[#58a6ff]" />
          <p className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
            Loading instructor batches...
          </p>
        </div>
      ) : errorMsg ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs font-bold text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {errorMsg}
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-white p-12 text-center dark:border-[#30363d] dark:bg-[#161b22]">
          <Layers className="mx-auto size-10 text-[#77716b] opacity-40 mb-3 dark:text-[#8b949e]" />
          <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc]">
            {searchQuery ? "No matching batches found" : "No cohort batches created yet"}
          </h3>
          <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] max-w-sm mx-auto">
            {searchQuery
              ? "Try adjusting your search keywords or status filter."
              : "Group your students into clinical batches, set live class meeting schedules, and broadcast batch updates."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Create Your First Batch</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBatches.map((batch) => (
            <div
              key={batch.id}
              onClick={() => setSelectedBatchId(batch.id)}
              className="group flex flex-col justify-between rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-xs transition hover:border-[#0f4c81]/50 hover:shadow-md cursor-pointer dark:border-[#30363d] dark:bg-[#161b22]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#eef5fc] px-2 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:bg-[#1f2937] dark:text-[#58a6ff]">
                    {batch.code}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      batch.status === "active"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : batch.status === "upcoming"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {batch.status ? batch.status.toUpperCase() : "UPCOMING"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-[#171717] group-hover:text-[#0f4c81] transition dark:text-[#f0f6fc] dark:group-hover:text-[#58a6ff] line-clamp-1">
                    {batch.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#77716b] dark:text-[#8b949e] line-clamp-1">
                    {batch.course_title || "Course Batch"}
                  </p>
                </div>

                {batch.schedule_info && (
                  <div className="flex items-center gap-1.5 text-xs text-[#5d5854] dark:text-[#8b949e]">
                    <Clock className="size-3.5 text-[#0f4c81] dark:text-[#58a6ff] shrink-0" />
                    <span className="line-clamp-1">{batch.schedule_info}</span>
                  </div>
                )}

                {/* Capacity Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-[#77716b] dark:text-[#8b949e]">Enrollment</span>
                    <span className="text-[#171717] dark:text-[#f0f6fc]">
                      {batch.enrolled_count} / {batch.max_capacity} Learners
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-[#0f4c81] dark:bg-[#58a6ff]"
                      style={{
                        width: `${Math.min(100, Math.round((batch.enrolled_count / (batch.max_capacity || 50)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="flex items-center justify-between border-t border-[#f0efee] pt-3 mt-4 dark:border-[#21262d]">
                <button
                  type="button"
                  onClick={() => setSelectedBatchId(batch.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                >
                  <Users className="size-3.5" />
                  <span>Manage Roster & Broadcast</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeleteBatch(batch.id, e)}
                  className="rounded-lg p-1 text-[#77716b] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition cursor-pointer"
                  title="Delete batch"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE BATCH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-2xl dark:border-[#30363d] dark:bg-[#161b22] space-y-4">
            <div className="flex items-center justify-between border-b border-[#ded8d1] pb-3 dark:border-[#30363d]">
              <h3 className="text-base font-black text-[#171717] dark:text-[#f0f6fc]">
                Create New Course Batch
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#77716b] hover:text-[#171717] dark:text-[#8b949e] dark:hover:text-[#f0f6fc]"
              >
                <Plus className="size-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Assign to Course *
                </label>
                <select
                  required
                  value={createCourseId}
                  onChange={(e) => setCreateCourseId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Spring 2026 Weekend Batch"
                    className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Batch Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={createCode}
                    onChange={(e) => setCreateCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BATCH-2026-A"
                    className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] uppercase dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Max Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    value={createMaxCapacity}
                    onChange={(e) => setCreateMaxCapacity(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Schedule / Live Timings
                  </label>
                  <input
                    type="text"
                    value={createSchedule}
                    onChange={(e) => setCreateSchedule(e.target.value)}
                    placeholder="e.g. Mon & Wed 7:00 PM IST"
                    className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={createStartDate}
                    onChange={(e) => setCreateStartDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={createEndDate}
                    onChange={(e) => setCreateEndDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Live Classroom Link (Zoom / Meet / MGN Live)
                </label>
                <input
                  type="url"
                  value={createMeetingUrl}
                  onChange={(e) => setCreateMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ded8d1] dark:border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-bold text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:text-[#8b949e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-5 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH DETAIL MODAL */}
      <BatchDetailModal
        batchId={selectedBatchId}
        isOpen={Boolean(selectedBatchId)}
        onClose={() => {
          setSelectedBatchId(null);
          fetchData();
        }}
        onBatchUpdated={fetchData}
      />
    </div>
  );
}
