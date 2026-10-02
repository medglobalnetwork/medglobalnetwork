// ============================================================
// MGN College Students Management Workspace
// modules/organizations/components/students/StudentsWorkspace.tsx
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Search,
  Plus,
  Filter,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  Mail,
  Phone,
  BookOpen,
  Trash2,
  RefreshCw,
  X,
  Check,
} from "lucide-react";
import { OrganizationRecord, StudentRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface StudentsWorkspaceProps {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function StudentsWorkspace({
  organization,
  userRole = "VIEWER",
  customPermissions = [],
}: StudentsWorkspaceProps) {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    program: "BPT",
    year: 1,
    semester: 1,
    department: "Physiotherapy",
    enrollment_number: "",
    batch: "2024-2028",
  });

  const canManage =
    hasOrgPermission(userRole, customPermissions, "STUDENTS_MANAGE") ||
    userRole === "OWNER" ||
    userRole === "ADMIN" ||
    userRole === "DEAN";

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [organization.id]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.enrollment_number) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          program: "BPT",
          year: 1,
          semester: 1,
          department: "Physiotherapy",
          enrollment_number: "",
          batch: "2024-2028",
        });
        await fetchStudents();
      }
    } catch (err) {
      console.error("Failed to add student:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student record?")) return;
    try {
      await fetch(`/api/org/${organization.id}/students?studentId=${studentId}`, {
        method: "DELETE",
      });
      await fetchStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProgram = selectedProgram === "all" || s.program === selectedProgram;
    const matchesYear = selectedYear === "all" || s.year.toString() === selectedYear;
    return matchesSearch && matchesProgram && matchesYear;
  });

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Students Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {students.length} Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage student cohorts, academic enrollment numbers, programs, and institution linkage.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Verification Boundary Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-900/40 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="size-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Institution Linkage Principle: </span>
          College affiliation confirms academic enrollment (e.g., student enrolled in BPT/MBBS). Professional practice verification (e.g. licensed doctor/physiotherapist) is independently governed by MGN central verification.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="size-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, enrollment number, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Programs</option>
            <option value="BPT">BPT (Physiotherapy)</option>
            <option value="MBBS">MBBS</option>
            <option value="BDS">BDS (Dental)</option>
            <option value="B.Sc Nursing">B.Sc Nursing</option>
            <option value="B.Pharm">B.Pharm</option>
            <option value="MPT">MPT</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year / Intern</option>
          </select>
        </div>
      </div>

      {/* Student Records List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
          <RefreshCw className="size-5 animate-spin mr-2 text-blue-500" />
          Loading student directory...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <GraduationCap className="size-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Student Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No students match your active filters. Try resetting search query."
              : "Enrolled students linked to this institution will appear here."}
          </p>
          {canManage && !searchQuery && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
            >
              <Plus className="size-3.5" /> Add First Student
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Enrollment No.</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Year / Sem</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                {canManage && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white">
                    <div>
                      <span className="font-bold">{student.name}</span>
                      {student.email && (
                        <span className="block text-[11px] text-slate-400">{student.email}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {student.enrollment_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                      {student.program}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    Year {student.year} (Sem {student.semester})
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {student.department || "Academic"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="size-3" /> Active
                    </span>
                  </td>
                  {canManage && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        title="Remove student"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="size-4 text-blue-400" />
                Add Student to Institution
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-semibold">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Aryan Sharma (Student)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Enrollment / Roll No. *</label>
                  <input
                    type="text"
                    required
                    value={formData.enrollment_number}
                    onChange={(e) => setFormData({ ...formData, enrollment_number: e.target.value })}
                    placeholder="e.g. BPT-2024-042"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Academic Program *</label>
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="BPT">BPT (Bachelor of Physiotherapy)</option>
                    <option value="MBBS">MBBS</option>
                    <option value="BDS">BDS (Dental)</option>
                    <option value="B.Sc Nursing">B.Sc Nursing</option>
                    <option value="B.Pharm">B.Pharm</option>
                    <option value="MPT">MPT (Master of Physiotherapy)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@college.edu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Batch</label>
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="e.g. 2024-2028"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
