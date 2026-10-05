"use client";

import React, { useEffect, useState } from "react";
import {
  AdminDataTable,
  ColumnDef,
} from "@/modules/admin/components/AdminDataTable";
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { AdminMetricCard } from "@/modules/admin/components/AdminMetricCard";

interface CourseRecord {
  id: string;
  title: string;
  slug: string;
  category: string;
  profession: string;
  level: string;
  price: number;
  currency: string;
  is_free: boolean;
  status: string;
  enrollment_count: number;
  rating_avg: number;
  instructor_name?: string;
  created_at: string;
}

export default function AdminLearnPage() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchLearnData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/learn");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Error loading learn data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearnData();
  }, []);

  const handleTogglePublish = async (courseId: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/admin/learn", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          status: newStatus,
        }),
      });
      if (res.ok) fetchLearnData();
    } catch (err) {
      console.error("Error toggling course status:", err);
    }
  };

  const columns: ColumnDef<CourseRecord>[] = [
    {
      key: "title",
      header: "Course & Instructor",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 leading-tight block">{row.title}</span>
          <span className="text-[11px] text-slate-500">
            Instructor: {row.instructor_name || "MGN Faculty"}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category & Level",
      sortable: true,
      render: (row) => (
        <div>
          <span className="text-slate-800 font-semibold">{row.category}</span>
          <p className="text-[11px] text-slate-500">{row.level || "All Levels"}</p>
        </div>
      ),
    },
    {
      key: "enrollment_count",
      header: "Enrollments",
      sortable: true,
      align: "center",
      render: (row) => (
        <span className="font-bold text-blue-600">{row.enrollment_count || 0}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
            row.status === "published"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {row.status === "published" ? "Published ✓" : "Draft"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (row) => (
        <button
          type="button"
          onClick={() => handleTogglePublish(row.id, row.status)}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors shadow-2xs ${
            row.status === "published"
              ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
          }`}
        >
          {row.status === "published" ? "Unpublish" : "Publish Live"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          Learn & LMS Ecosystem Management
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Supervise clinical courses, instructor certifications, quizzes, and issued credentials.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AdminMetricCard
          title="Total Courses"
          value={stats.total_courses || courses.length}
          icon={<BookOpen className="h-5 w-5" />}
          badgeColor="blue"
        />
        <AdminMetricCard
          title="Published Courses"
          value={stats.published_courses || courses.filter((c) => c.status === "published").length}
          icon={<CheckCircle2 className="h-5 w-5" />}
          badgeColor="emerald"
        />
        <AdminMetricCard
          title="Total Enrollments"
          value={stats.total_enrollments || 0}
          icon={<Users className="h-5 w-5" />}
          badgeColor="purple"
        />
        <AdminMetricCard
          title="Certificates Issued"
          value={stats.total_certificates || 0}
          icon={<Award className="h-5 w-5" />}
          badgeColor="amber"
        />
      </div>

      {/* Courses Table */}
      <AdminDataTable
        columns={columns}
        data={courses}
        isLoading={loading}
        onRefresh={fetchLearnData}
        title="Courses & Clinical Masterclasses"
        subtitle="Catalog of all created medical education courses"
      />
    </div>
  );
}
