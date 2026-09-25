"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Plus,
  Printer,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { CourseEnrollment, Certificate } from "@/modules/learn/types";

export default function MyLearningPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [activeTab, setActiveTab] = React.useState<"in_progress" | "completed" | "certificates">(
    "in_progress"
  );
  const [inProgress, setInProgress] = React.useState<CourseEnrollment[]>([]);
  const [completed, setCompleted] = React.useState<CourseEnrollment[]>([]);
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/learn/my-learning");
        const data = await res.json();
        if (res.ok) {
          setInProgress(data.inProgress || []);
          setCompleted(data.completed || []);
          setCertificates(data.certificates || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [session?.user]);

  if (isPending || !session) {
    return <main className="min-h-dvh bg-[#f5f5f4]" />;
  }

  return (
    <main className="min-h-dvh bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/learn")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1769c2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
              >
                <ArrowLeft className="size-3.5" /> Back to Learn Home
              </button>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-[#171717] text-balance">
              My Learning & Credentials
            </h1>
            <p className="text-xs text-[#77716b] text-pretty">
              Track your clinical training progress and view accredited certificates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/learn/courses")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#12569f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
          >
            <Plus className="size-3.5" /> Browse More Courses
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#ded8d1]">
          <button
            type="button"
            onClick={() => setActiveTab("in_progress")}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-5 text-xs font-bold transition ${
              activeTab === "in_progress"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            <BookOpen className="h-4 w-4" /> In Progress ({inProgress.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-5 text-xs font-bold transition ${
              activeTab === "completed"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" /> Completed ({completed.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("certificates")}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-5 text-xs font-bold transition ${
              activeTab === "certificates"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            <Award className="h-4 w-4" /> Certificates ({certificates.length})
          </button>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/70 animate-pulse border border-[#ded8d1]" />
            ))}
          </div>
        ) : activeTab === "in_progress" ? (
          inProgress.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/learn/course/${item.course_id}`)}
                  className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-[#ded8d1] bg-white p-5 shadow-2xs transition hover:border-[#1769c2] hover:shadow-sm"
                >
                  <div>
                    <span className="rounded-full bg-[#eef5fc] px-2.5 py-0.5 text-[10px] font-bold text-[#1769c2]">
                      {item.course?.category || "Clinical"}
                    </span>
                    <h3 className="mt-2 text-sm font-bold text-[#171717] group-hover:text-[#1769c2] line-clamp-2">
                      {item.course?.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#77716b]">
                      Instructor: {item.course?.instructor?.name || "Medical Faculty"}
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-xs font-medium text-[#77716b]">
                      <span>Progress</span>
                      <span className="font-bold text-[#1769c2]">{item.progress_percentage}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f0efee]">
                      <div
                        className="h-full rounded-full bg-[#1769c2]"
                        style={{ width: `${item.progress_percentage}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1769c2] py-2 text-xs font-bold text-white transition hover:bg-[#12569f]"
                    >
                      Resume Learning <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<GraduationCap className="h-10 w-10 text-[#77716b]" />}
              title="No courses in progress"
              description="Explore accredited clinical courses and physical therapy modules to advance your skills."
              actionText="Explore Course Catalog"
              onAction={() => router.push("/learn/courses")}
            />
          )
        ) : activeTab === "completed" ? (
          completed.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#bbf7d0] bg-white p-5 shadow-2xs"
                >
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f0fdf4] px-2.5 py-0.5 text-[10px] font-bold text-[#15803d]">
                      <CheckCircle2 className="h-3 w-3" /> 100% Completed
                    </span>
                    <h3 className="mt-2 text-sm font-bold text-[#171717]">
                      {item.course?.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#77716b]">
                      Completed on {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : "Recently"}
                    </p>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/learn/course/${item.course_id}`)}
                      className="flex-1 rounded-xl border border-[#ded8d1] py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8]"
                    >
                      Review Syllabus
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("certificates")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#15803d] py-2 text-xs font-bold text-white hover:bg-[#166534]"
                    >
                      <Award className="h-3.5 w-3.5" /> View Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Trophy className="h-10 w-10 text-[#77716b]" />}
              title="No completed courses yet"
              description="Complete all lessons and pass the final assessment of any enrolled course to earn your accredited certificate."
              actionText="Resume Active Course"
              onAction={() => setActiveTab("in_progress")}
            />
          )
        ) : (
          certificates.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#1769c2]/30 bg-gradient-to-br from-white to-[#f0f7ff] p-5 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef5fc] text-[#1769c2]">
                        <Award className="h-5 w-5" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#047857]">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-[#171717]">
                      {cert.course?.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-[#77716b]">
                      Issued: {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                    <p className="mt-0.5 text-[10px] font-mono text-[#1769c2]">
                      Code: {cert.verification_code}
                    </p>
                  </div>

                  <div className="mt-5">
                    <a
                      href={`/verify/certificate/${cert.verification_code}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1769c2] py-2 text-xs font-bold text-white transition hover:bg-[#12569f]"
                    >
                      <Printer className="h-3.5 w-3.5" /> View & Print Certificate
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Award className="h-10 w-10 text-[#77716b]" />}
              title="No certificates earned yet"
              description="Complete courses with accredited certificates enabled to have verified credentials issued directly to your MGN Profile."
              actionText="Browse Certificate Courses"
              onAction={() => router.push("/learn/courses")}
            />
          )
        )}
      </div>
    </main>
  );
}
