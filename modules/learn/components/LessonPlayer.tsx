"use client";

import * as React from "react";
import { CourseLesson, CourseResource, LearnNote } from "../types";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Video,
  FileText,
  BookOpen,
  Check,
  Download,
  Sparkles,
  Save,
  Trash2,
  Paperclip,
} from "lucide-react";

interface LessonPlayerProps {
  lesson: CourseLesson;
  courseTitle?: string;
  courseId?: string;
  onCompleteLesson: () => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function LessonPlayer({
  lesson,
  courseTitle,
  courseId,
  onCompleteLesson,
  onNextLesson,
  onPrevLesson,
  hasNext = false,
  hasPrev = false,
}: LessonPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"overview" | "notes" | "resources">("overview");

  // Notes state
  const [notes, setNotes] = React.useState<LearnNote[]>([]);
  const [newNoteText, setNewNoteText] = React.useState("");
  const [savingNote, setSavingNote] = React.useState(false);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && lesson.last_position_seconds) {
      videoRef.current.currentTime = lesson.last_position_seconds;
    }
  }, [lesson.id, lesson.last_position_seconds]);

  // Load notes for current lesson
  React.useEffect(() => {
    if (!lesson.id) return;
    fetch(`/api/learn/notes?lessonId=${lesson.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.notes)) setNotes(d.notes);
      })
      .catch(() => {});
  }, [lesson.id]);

  // Autosave video progress
  React.useEffect(() => {
    if (!videoRef.current || lesson.lesson_type !== "video") return;

    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        const cur = Math.floor(videoRef.current.currentTime);
        const dur = Math.floor(videoRef.current.duration) || lesson.duration_seconds || 1;
        const pct = Math.min(100, Math.round((cur / dur) * 100));

        fetch(`/api/learn/lessons/${lesson.id}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            progressPercentage: pct,
            lastPositionSeconds: cur,
            completed: pct >= 90,
          }),
        }).catch(() => {});
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lesson.id, lesson.lesson_type, lesson.duration_seconds]);

  const handleManualComplete = async () => {
    setIsMarkingComplete(true);
    try {
      await fetch(`/api/learn/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressPercentage: 100,
          lastPositionSeconds: lesson.duration_seconds || 0,
          completed: true,
        }),
      });
      onCompleteLesson();
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || savingNote) return;

    setSavingNote(true);
    try {
      const curSeconds = videoRef.current ? Math.floor(videoRef.current.currentTime) : undefined;
      const res = await fetch("/api/learn/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseId || lesson.course_id,
          lessonId: lesson.id,
          noteText: newNoteText.trim(),
          timestampSeconds: curSeconds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.note) {
        setNotes((prev) => [data.note, ...prev]);
        setNewNoteText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/learn/notes?id=${noteId}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAskAI = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-mgn-ask-ai", {
          detail: {
            courseId: courseId || lesson.course_id,
            courseTitle,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonContent: lesson.content || lesson.description || undefined,
          },
        })
      );
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. MEDIA VIEWER CANVAS */}
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-black/10 bg-black shadow-lg">
        {lesson.lesson_type === "video" ? (
          lesson.media_url ? (
            lesson.media_url.includes("youtube.com") || lesson.media_url.includes("youtu.be") ? (
              <iframe
                src={
                  lesson.media_url.includes("embed")
                    ? lesson.media_url
                    : `https://www.youtube.com/embed/${
                        lesson.media_url.split("v=")[1]?.split("&")[0] || ""
                      }`
                }
                title={lesson.title}
                className="size-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={lesson.media_url}
                controls
                playsInline
                className="size-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleManualComplete}
              />
            )
          ) : (
            <div className="flex size-full flex-col items-center justify-center text-white/70 p-6 text-center">
              <Video className="size-12 text-white/40 mb-2" />
              <h4 className="text-sm font-bold text-white">{lesson.title}</h4>
              <p className="mt-1 text-xs text-white/70">
                Interactive clinical video stream ready for playback.
              </p>
            </div>
          )
        ) : lesson.lesson_type === "article" ? (
          <div className="flex size-full flex-col justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f4c81] p-8 text-center text-white">
            <FileText className="mx-auto size-12 text-[#38bdf8]" />
            <h3 className="mt-3 text-lg font-bold">{lesson.title}</h3>
            <p className="mt-1 text-xs text-white/70">Interactive Clinical Reading & Case Study</p>
          </div>
        ) : (
          <div className="flex size-full flex-col items-center justify-center bg-gradient-to-br from-[#0f4c81] to-[#1e3a8a] p-8 text-center text-white">
            <BookOpen className="size-12 text-white/80" />
            <h3 className="mt-3 text-lg font-bold">{lesson.title}</h3>
            <p className="mt-1 text-xs text-white/70">Clinical Reference Protocol</p>
          </div>
        )}
      </div>

      {/* 2. STUDY DOCK: OVERVIEW, NOTES, RESOURCES & CONTROLS */}
      <div className="rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 sm:p-6 shadow-xs space-y-5">
        {/* Title & Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0efee] dark:border-[#21262d] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#eef5fc] dark:bg-[#1c2433] px-2.5 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:text-[#58a6ff] uppercase">
                {lesson.lesson_type}
              </span>
              {lesson.completed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                  <Check className="size-3" /> Completed
                </span>
              )}
            </div>
            <h1 className="mt-2 text-base sm:text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">
              {lesson.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAskAI}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0f4c81] to-[#1769c2] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105 transition cursor-pointer"
            >
              <Sparkles className="size-3.5 text-amber-300" />
              <span>Ask AI on Lesson</span>
            </button>

            <button
              type="button"
              onClick={handleManualComplete}
              disabled={isMarkingComplete || lesson.completed}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                lesson.completed
                  ? "bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] cursor-default"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
              }`}
            >
              <CheckCircle2 className="size-4" />
              <span>{lesson.completed ? "Completed" : "Mark as Completed"}</span>
            </button>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-[#f0efee] dark:border-[#21262d]">
          {[
            { id: "overview", label: "Overview & Content" },
            { id: "notes", label: `My Notes (${notes.length})` },
            { id: "resources", label: `Resources (${lesson.resources?.length || 0})` },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`border-b-2 px-3 py-2 text-xs font-bold transition cursor-pointer ${
                  active
                    ? "border-[#0f4c81] text-[#0f4c81] dark:border-[#58a6ff] dark:text-[#58a6ff]"
                    : "border-transparent text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-4 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] leading-relaxed">
            {lesson.description && (
              <p className="text-[#5d5854] dark:text-[#8b949e]">{lesson.description}</p>
            )}

            {lesson.content ? (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap rounded-2xl bg-[#faf9f8] dark:bg-[#1c2128] p-5 border border-[#e8e6e3] dark:border-[#30363d]">
                {lesson.content}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#faf9f8] dark:bg-[#1c2128] p-4 text-xs text-[#77716b] dark:text-[#8b949e] border border-[#e8e6e3] dark:border-[#30363d]">
                Watch the video lecture above or ask the Medical AI assistant for a high-yield clinical breakdown.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: NOTES (Integrated Clinical Notebook) */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <form onSubmit={handleSaveNote} className="space-y-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Take clinical notes, record diagnostic pearls, drug doses..."
                rows={3}
                className="w-full rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] p-3 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none"
              />
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!newNoteText.trim() || savingNote}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="size-3.5" />
                  <span>Save Note</span>
                </button>
              </div>
            </form>

            <div className="space-y-2.5 pt-2">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#fcfbf9] dark:bg-[#1c2128] p-3.5 text-xs relative group"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#77716b] dark:text-[#8b949e] mb-1">
                    <span>{new Date(n.created_at).toLocaleDateString()}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(n.id)}
                      className="text-[#8a8784] hover:text-rose-600 transition p-0.5"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap text-[#171717] dark:text-[#f0f6fc]">{n.note_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RESOURCES */}
        {activeTab === "resources" && (
          <div className="space-y-3">
            {lesson.resources && lesson.resources.length > 0 ? (
              lesson.resources.map((res) => (
                <a
                  key={res.id}
                  href={res.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#1c2128] p-4 hover:border-[#0f4c81] transition"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
                    <div>
                      <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">{res.title}</p>
                      <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">{res.file_type || "PDF Document"}</p>
                    </div>
                  </div>
                  <Download className="size-4 text-[#77716b]" />
                </a>
              ))
            ) : (
              <p className="text-xs text-[#77716b] dark:text-[#8b949e] p-4 text-center">
                No supplemental PDF resources attached to this lesson.
              </p>
            )}
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#f0efee] dark:border-[#21262d]">
          <button
            type="button"
            onClick={onPrevLesson}
            disabled={!hasPrev}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] px-4 py-2 text-xs font-bold text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f8f7f6] dark:hover:bg-[#21262d] transition disabled:opacity-40 cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>Previous Lesson</span>
          </button>

          <button
            type="button"
            onClick={onNextLesson}
            disabled={!hasNext}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition disabled:opacity-40 cursor-pointer"
          >
            <span>Next Lesson</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
