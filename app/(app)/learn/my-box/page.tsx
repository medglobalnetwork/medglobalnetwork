"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  FolderPlus,
  GraduationCap,
  PlayCircle,
  Plus,
  Printer,
  ShieldCheck,
  Sparkles,
  Trash2,
  Briefcase,
  Layers,
  Folder,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  CourseEnrollment,
  Certificate,
  LearnBookmark,
  LearnNote,
  LearnCollection,
  MatchedJobRole,
  LearningResource,
} from "@/modules/learn/types";
import { ResourceViewerModal } from "@/modules/learn/components/resources/ResourceViewerModal";

export default function MyBoxPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [activeTab, setActiveTab] = React.useState<
    "in_progress" | "completed" | "saved" | "resources" | "notes" | "certificates" | "collections"
  >("in_progress");

  const [inProgress, setInProgress] = React.useState<CourseEnrollment[]>([]);
  const [completed, setCompleted] = React.useState<CourseEnrollment[]>([]);
  const [saved, setSaved] = React.useState<LearnBookmark[]>([]);
  const [savedResources, setSavedResources] = React.useState<LearningResource[]>([]);
  const [selectedViewerResourceId, setSelectedViewerResourceId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<LearnNote[]>([]);
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [collections, setCollections] = React.useState<LearnCollection[]>([]);
  const [matchedJobs, setMatchedJobs] = React.useState<MatchedJobRole[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Collection modal
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = React.useState("");
  const [newCollectionDesc, setNewCollectionDesc] = React.useState("");

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  const loadMyBoxData = React.useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const [resBox, resRes] = await Promise.all([
        fetch("/api/learn/my-box"),
        fetch("/api/learn/resources/my-box"),
      ]);
      const data = await resBox.json();
      if (resBox.ok) {
        setInProgress(data.inProgress || []);
        setCompleted(data.completed || []);
        setSaved(data.saved || []);
        setNotes(data.notes || []);
        setCertificates(data.certificates || []);
        setCollections(data.collections || []);
        setMatchedJobs(data.matchedJobs || []);
      }
      if (resRes.ok) {
        const dataRes = await resRes.json();
        setSavedResources(dataRes.resources || []);
      }
    } catch (err) {
      console.error("Failed to load My Box data:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  React.useEffect(() => {
    loadMyBoxData();
  }, [loadMyBoxData]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionTitle.trim()) return;

    try {
      const res = await fetch("/api/learn/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newCollectionTitle.trim(),
          description: newCollectionDesc.trim() || undefined,
        }),
      });

      if (res.ok) {
        setNewCollectionTitle("");
        setNewCollectionDesc("");
        setShowCreateModal(false);
        loadMyBoxData();
      }
    } catch (err) {
      console.error("Failed to create collection:", err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this clinical note?")) return;
    try {
      const res = await fetch(`/api/learn/notes?id=${noteId}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isPending || !session) {
    return <main className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117]" />;
  }

  return (
    <div className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] pb-28 text-[#171717] dark:text-[#f0f6fc]">
      {/* Top Header */}
      <div className="border-b border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] mb-1">
                <Link href="/learn" className="hover:underline flex items-center gap-1">
                  <ArrowLeft className="size-3.5" /> Dashboard
                </Link>
                <span>/</span>
                <span>My Box</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#171717] dark:text-[#f0f6fc]">
                Personal Learning Repository
              </h1>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                Manage your active coursework, clinical notes, accredited credentials, and collections
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/learn/explore"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Explore More Courses</span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-[#f0efee] dark:border-[#21262d]">
            {[
              { id: "in_progress", label: "In-Progress", count: inProgress.length },
              { id: "completed", label: "Completed", count: completed.length },
              { id: "saved", label: "Saved Courses", count: saved.length },
              { id: "resources", label: "Resources", count: savedResources.length },
              { id: "notes", label: "Clinical Notes", count: notes.length },
              { id: "certificates", label: "Certificates", count: certificates.length },
              { id: "collections", label: "Collections", count: collections.length },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`shrink-0 inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition cursor-pointer ${
                    active
                      ? "border-[#0f4c81] text-[#0f4c81] dark:border-[#58a6ff] dark:text-[#58a6ff]"
                      : "border-transparent text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                      active
                        ? "bg-[#0f4c81]/10 text-[#0f4c81] dark:text-[#58a6ff]"
                        : "bg-[#f0efee] dark:bg-[#21262d] text-[#77716b] dark:text-[#8b949e]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* 1. IN PROGRESS TAB */}
        {activeTab === "in_progress" && (
          <div>
            {inProgress.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-2xs hover:border-[#0f4c81] transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="rounded-full bg-[#eef5fc] dark:bg-[#1c2433] px-2.5 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                          {item.course?.category || "Medical"}
                        </span>
                        <span className="font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                          {item.progress_percentage}% done
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-2">
                        {item.course?.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e]">
                        Faculty: {item.course?.instructor?.name || "Senior Faculty"}
                      </p>
                    </div>

                    <div className="mt-6">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0efee] dark:bg-[#21262d]">
                        <div
                          className="h-full rounded-full bg-[#0f4c81] dark:bg-[#58a6ff]"
                          style={{ width: `${item.progress_percentage}%` }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            item.last_lesson_id
                              ? `/learn/lesson/${item.last_lesson_id}`
                              : `/learn/course/${item.course_id}`
                          )
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] py-2.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                      >
                        <PlayCircle className="size-4" />
                        <span>Resume Lesson</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-12 text-center">
                <BookOpen className="size-12 mx-auto text-[#8a8784] mb-3" />
                <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                  No active courses in progress
                </h3>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 max-w-sm mx-auto">
                  Explore our accredited catalog and enroll in your first clinical masterclass.
                </p>
                <Link
                  href="/learn/explore"
                  className="mt-5 inline-block rounded-xl bg-[#0f4c81] px-5 py-2.5 text-xs font-bold text-white shadow-xs"
                >
                  Browse Masterclasses
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 2. COMPLETED TAB */}
        {activeTab === "completed" && (
          <div>
            {completed.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-[#161b22] p-5 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" /> Completed
                        </span>
                        <span className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                          {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : "Finished"}
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-2">
                        {item.course?.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e]">
                        Faculty: {item.course?.instructor?.name || "Medical Faculty"}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between">
                      <Link
                        href={`/learn/course/${item.course_id}`}
                        className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                      >
                        Review Material
                      </Link>
                      <button
                        type="button"
                        onClick={() => setActiveTab("certificates")}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-400"
                      >
                        <Award className="size-3.5" />
                        <span>View Certificate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-12 text-center">
                <Award className="size-12 mx-auto text-[#8a8784] mb-3" />
                <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                  No completed courses yet
                </h3>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 max-w-sm mx-auto">
                  Complete lessons and pass final assessments to earn verified CME certificates.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. SAVED / BOOKMARKS TAB */}
        {activeTab === "saved" && (
          <div>
            {saved.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-2xs hover:border-[#0f4c81] transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="rounded-full bg-[#f0efee] dark:bg-[#21262d] px-2.5 py-0.5 text-[10px] font-bold text-[#5d5854] dark:text-[#8b949e]">
                          {item.course?.category || "Bookmarked"}
                        </span>
                        <Bookmark className="size-4 text-[#0f4c81] fill-[#0f4c81]" />
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-2">
                        {item.course?.title}
                      </h3>
                    </div>

                    <Link
                      href={`/learn/course/${item.course_id}`}
                      className="mt-5 inline-flex items-center justify-center gap-1 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition"
                    >
                      <span>Go to Course</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-12 text-center">
                <Bookmark className="size-12 mx-auto text-[#8a8784] mb-3" />
                <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                  No saved courses
                </h3>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 max-w-sm mx-auto">
                  Bookmark interesting masterclasses while browsing Explore to study them later.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3.5. SAVED LEARNING RESOURCES TAB */}
        {activeTab === "resources" && (
          <div className="space-y-4">
            {savedResources.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedResources.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => setSelectedViewerResourceId(res.id)}
                    className="group flex flex-col justify-between rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-2xs hover:border-[#0f4c81] transition cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="rounded-full bg-[#eef5fc] dark:bg-[#1c2433] px-2.5 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:text-[#58a6ff] uppercase">
                          {res.resource_type}
                        </span>
                        <span className="text-[10px] font-mono text-[#77716b] dark:text-[#8b949e]">
                          v{res.current_version}.0
                        </span>
                      </div>

                      <h4 className="mt-3 text-sm font-bold text-[#171717] dark:text-[#f0f6fc] group-hover:text-[#0f4c81] dark:group-hover:text-[#58a6ff] transition line-clamp-2">
                        {res.title}
                      </h4>

                      {res.description && (
                        <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] line-clamp-2">
                          {res.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[#77716b] dark:text-[#8b949e]">
                        {new Date(res.created_at).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedViewerResourceId(res.id);
                        }}
                        className="inline-flex items-center gap-1 font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                      >
                        <span>Open Viewer</span>
                        <ArrowRight className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-12 text-center">
                <BookOpen className="size-12 mx-auto text-[#8a8784] mb-3 opacity-50" />
                <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                  No resources saved in My Box
                </h3>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 max-w-sm mx-auto">
                  Bookmark lecture handouts, clinical notes, and anatomical diagrams while taking courses to review them here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. CLINICAL NOTES TAB */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            {notes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-[#f0efee] dark:border-[#21262d]">
                        <div>
                          <p className="font-bold text-[#171717] dark:text-[#f0f6fc] truncate max-w-[220px]">
                            {note.lesson_title || "Clinical Note"}
                          </p>
                          <p className="text-[10px] text-[#77716b] dark:text-[#8b949e] truncate max-w-[220px]">
                            {note.course_title}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-[#8a8784] hover:text-rose-600 p-1 transition"
                          title="Delete note"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <p className="mt-3 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] whitespace-pre-wrap leading-relaxed">
                        {note.note_text}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between text-[10px] text-[#77716b] dark:text-[#8b949e]">
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      <Link
                        href={`/learn/lesson/${note.lesson_id}`}
                        className="font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                      >
                        Open Lesson →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-12 text-center">
                <FileText className="size-12 mx-auto text-[#8a8784] mb-3" />
                <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                  No clinical notes recorded yet
                </h3>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 max-w-sm mx-auto">
                  Take notes directly in the lesson player during video and case lectures.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 5. VERIFIED CERTIFICATES TAB */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="rounded-3xl border-2 border-emerald-500/20 bg-gradient-to-br from-white via-white to-emerald-500/5 dark:from-[#161b22] dark:to-[#161b22] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                            <Award className="size-6" />
                          </div>
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900 dark:text-emerald-300">
                              <ShieldCheck className="size-3" /> Verified Credential
                            </span>
                            <h3 className="mt-1 text-sm sm:text-base font-bold text-[#171717] dark:text-[#f0f6fc] leading-snug">
                              {cert.course?.title || cert.metadata?.course_title || "Accredited Medical Masterclass"}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-y border-[#f0efee] dark:border-[#21262d] py-3 text-[#77716b] dark:text-[#8b949e]">
                        <div>
                          <span className="block text-[10px] uppercase font-semibold">Verification Code</span>
                          <span className="font-mono font-bold text-[#171717] dark:text-[#f0f6fc] text-[11px]">
                            {cert.verification_code}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-semibold">Issued Date</span>
                          <span className="font-bold text-[#171717] dark:text-[#f0f6fc] text-[11px]">
                            {new Date(cert.issued_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between text-xs bg-[#f8f9fa] dark:bg-[#1a202c] p-2 rounded-xl border border-[#ded8d1] dark:border-[#30363d]">
                        <span className="text-[11px] font-semibold text-[#5d5854] dark:text-[#8b949e] flex items-center gap-1.5">
                          <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          Public on MGN Profile
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                          Synced
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <a
                          href={`/verify/certificate/${cert.verification_code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                        >
                          <span>Public Verification Page</span>
                          <ExternalLink className="size-3" />
                        </a>

                        <button
                          type="button"
                          onClick={() => window.open(`/verify/certificate/${cert.verification_code}`, "_blank")}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                        >
                          <Printer className="size-3.5" />
                          <span>Print / PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-12 text-center">
                <Award className="size-12 mx-auto text-[#8a8784] mb-3" />
                <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                  No verified certificates yet
                </h3>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 max-w-sm mx-auto">
                  Earn accredited CME certifications by completing course lessons and quizzes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 6. CUSTOM COLLECTIONS & FOLDERS TAB */}
        {activeTab === "collections" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                  Custom Learning Collections
                </h3>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                  Group your courses into custom categories like "Neurology", "Exam Prep", or "Journal Club"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer shadow-xs"
              >
                <FolderPlus className="size-3.5" />
                <span>New Collection</span>
              </button>
            </div>

            {collections.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((col) => (
                  <div
                    key={col.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-2xs hover:border-[#0f4c81] transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <Folder className="size-5 text-[#0f4c81] dark:text-[#58a6ff]" />
                        <span className="rounded-full bg-[#f0efee] dark:bg-[#21262d] px-2 py-0.5 text-[10px] font-bold text-[#77716b]">
                          {col.item_count} items
                        </span>
                      </div>
                      <h4 className="mt-3 text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                        {col.title}
                      </h4>
                      {col.description && (
                        <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] line-clamp-2">
                          {col.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                      <span>Browse folder</span>
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-12 text-center">
                <FolderPlus className="size-12 mx-auto text-[#8a8784] mb-3" />
                <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                  No custom collections yet
                </h3>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 max-w-sm mx-auto">
                  Create organized folders to group related masterclasses and clinical revision materials.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  Create Your First Collection
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* CONNECTED ECOSYSTEM: OPPORTUNITIES & JOBS MATCHING            */}
        {/* ============================================================= */}
        {matchedJobs.length > 0 && (
          <section className="rounded-3xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/30 dark:from-[#161b22] dark:to-[#161b22] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#0f4c81] text-white shadow-xs">
                  <Briefcase className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                    Connected Career Opportunities
                  </h3>
                  <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                    Clinical roles matching your verified skills and completed CME masterclasses
                  </p>
                </div>
              </div>

              <Link
                href="/opportunities"
                className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                <span>View all jobs</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {matchedJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => router.push(job.id ? `/opportunities/jobs/${job.id}` : "/opportunities")}
                  className="group flex flex-col justify-between rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#1c2128] p-4 shadow-2xs hover:border-[#0f4c81] transition cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                      {job.organization} · {job.location}
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-[#171717] dark:text-[#f0f6fc] group-hover:text-[#0f4c81] dark:group-hover:text-[#58a6ff]">
                      {job.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Skills Matched
                    </span>
                    <span className="font-bold text-[#171717] dark:text-[#f0f6fc]">
                      {job.salary_range}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* CREATE COLLECTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
              Create New Learning Collection
            </h3>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-0.5">
              Organize courses by clinical specialty, exam syllabus, or personal interest.
            </p>

            <form onSubmit={handleCreateCollection} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e]">Collection Title</label>
                <input
                  type="text"
                  required
                  value={newCollectionTitle}
                  onChange={(e) => setNewCollectionTitle(e.target.value)}
                  placeholder="e.g. Neurology Board Prep, Pediatric Acute Care"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:border-[#0f4c81]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e]">Description (Optional)</label>
                <textarea
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="Brief description of this study folder..."
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] focus:outline-none focus:border-[#0f4c81]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] px-4 py-2 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f8f7f6] dark:hover:bg-[#21262d] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOURCE VIEWER MODAL */}
      {selectedViewerResourceId && (
        <ResourceViewerModal
          resourceId={selectedViewerResourceId}
          isOpen={!!selectedViewerResourceId}
          onClose={() => {
            setSelectedViewerResourceId(null);
            loadMyBoxData();
          }}
        />
      )}
    </div>
  );
}
