"use client";

import * as React from "react";
import {
  CourseLesson,
  CourseResource,
  LearnNote,
  VideoChapter,
  VideoTranscript,
  VideoDiscussion,
  VideoBookmarkItem,
} from "../types";
import { VideoPlayer } from "./VideoPlayer";
import { VideoAnalyticsView } from "./VideoAnalyticsView";
import { TeacherResourceManager } from "./resources/TeacherResourceManager";
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
  Clock,
  Search,
  Bookmark,
  MessageSquare,
  BarChart2,
  Plus,
  Send,
  UserCheck,
  ShieldCheck,
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
  isInstructor?: boolean;
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
  isInstructor = false,
}: LessonPlayerProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "chapters" | "transcript" | "notes" | "bookmarks" | "discussion" | "resources" | "analytics"
  >("overview");

  const [resourceCount, setResourceCount] = React.useState(lesson.resources?.length || 0);
  const [theaterMode, setTheaterMode] = React.useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = React.useState(0);
  const [isMarkingComplete, setIsMarkingComplete] = React.useState(false);

  // Seek callback reference from VideoPlayer
  const seekRequestRef = React.useRef<((sec: number) => void) | null>(null);

  // 1. Chapters
  const [chapters, setChapters] = React.useState<VideoChapter[]>([]);

  // 2. Transcript & Search
  const [transcript, setTranscript] = React.useState<VideoTranscript | null>(null);
  const [transcriptSearch, setTranscriptSearch] = React.useState("");

  // 3. Notes
  const [notes, setNotes] = React.useState<LearnNote[]>([]);
  const [newNoteText, setNewNoteText] = React.useState("");
  const [savingNote, setSavingNote] = React.useState(false);

  // 4. Bookmarks
  const [bookmarks, setBookmarks] = React.useState<VideoBookmarkItem[]>([]);
  const [bookmarkTitle, setBookmarkTitle] = React.useState("");
  const [savingBookmark, setSavingBookmark] = React.useState(false);

  // 5. Discussions
  const [discussions, setDiscussions] = React.useState<VideoDiscussion[]>([]);
  const [newCommentText, setNewCommentText] = React.useState("");
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [postingComment, setPostingComment] = React.useState(false);

  // Load lesson metadata: chapters, transcript, notes, bookmarks, discussions
  React.useEffect(() => {
    if (!lesson.id) return;

    // Fetch chapters
    fetch(`/api/learn/lessons/${lesson.id}/chapters`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.chapters)) setChapters(d.chapters);
      })
      .catch(() => {});

    // Fetch transcript
    fetch(`/api/learn/lessons/${lesson.id}/transcripts`)
      .then((r) => r.json())
      .then((d) => {
        if (d.transcript) setTranscript(d.transcript);
      })
      .catch(() => {});

    // Fetch notes
    fetch(`/api/learn/notes?lessonId=${lesson.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.notes)) setNotes(d.notes);
      })
      .catch(() => {});

    // Fetch bookmarks
    fetch(`/api/learn/lessons/${lesson.id}/bookmarks`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.bookmarks)) setBookmarks(d.bookmarks);
      })
      .catch(() => {});

    // Fetch discussions
    fetch(`/api/learn/lessons/${lesson.id}/discussions`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.discussions)) setDiscussions(d.discussions);
      })
      .catch(() => {});
  }, [lesson.id]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Jump player to timestamp
  const handleJumpToTimestamp = (seconds: number) => {
    if (seekRequestRef.current) {
      seekRequestRef.current(seconds);
    }
  };

  // Manual completion
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

  // Save in-video note
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || savingNote) return;

    setSavingNote(true);
    try {
      const curSeconds = Math.floor(currentPlaybackTime);
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

  // Delete note
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

  // Save Bookmark
  const handleAddBookmark = async () => {
    const curSeconds = Math.floor(currentPlaybackTime);
    setSavingBookmark(true);
    try {
      const res = await fetch(`/api/learn/lessons/${lesson.id}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestampSeconds: curSeconds,
          title: bookmarkTitle.trim() || `Bookmark at ${formatTime(curSeconds)}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.bookmark) {
        setBookmarks((prev) => [data.bookmark, ...prev]);
        setBookmarkTitle("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingBookmark(false);
    }
  };

  // Delete Bookmark
  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      const res = await fetch(`/api/learn/lessons/${lesson.id}/bookmarks?id=${bookmarkId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Post Discussion Question / Reply
  const handlePostDiscussion = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    const textToPost = parentId ? replyText : newCommentText;
    if (!textToPost.trim() || postingComment) return;

    setPostingComment(true);
    try {
      const res = await fetch(`/api/learn/lessons/${lesson.id}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToPost.trim(),
          parentId: parentId || undefined,
          timestampSeconds: Math.floor(currentPlaybackTime),
        }),
      });

      const data = await res.json();
      if (res.ok && data.discussion) {
        if (parentId) {
          setDiscussions((prev) =>
            prev.map((d) =>
              d.id === parentId
                ? { ...d, replies: [...(d.replies || []), data.discussion] }
                : d
            )
          );
          setReplyingToId(null);
          setReplyText("");
        } else {
          setDiscussions((prev) => [data.discussion, ...prev]);
          setNewCommentText("");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  // Open Ask AI
  const handleOpenAskAI = (selectedText?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-mgn-ask-ai", {
          detail: {
            courseId: courseId || lesson.course_id,
            courseTitle,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonContent: lesson.content || lesson.description || undefined,
            timestampSeconds: Math.floor(currentPlaybackTime),
            selectedText: selectedText || undefined,
          },
        })
      );
    }
  };

  // Filtered transcript cues
  const filteredTranscriptCues = React.useMemo(() => {
    if (!transcript?.cues) return [];
    if (!transcriptSearch.trim()) return transcript.cues;
    const q = transcriptSearch.toLowerCase();
    return transcript.cues.filter((c) => c.text.toLowerCase().includes(q));
  }, [transcript, transcriptSearch]);

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. MEDIA VIEWER CANVAS */}
      {lesson.lesson_type === "video" ? (
        <VideoPlayer
          lessonId={lesson.id}
          courseId={courseId || lesson.course_id}
          courseTitle={courseTitle}
          lessonTitle={lesson.title}
          mediaUrl={lesson.media_url}
          durationSeconds={lesson.duration_seconds || 1800}
          initialPositionSeconds={lesson.last_position_seconds || 0}
          onLessonCompleted={() => onCompleteLesson()}
          onTimeUpdate={(time) => setCurrentPlaybackTime(time)}
          onOpenAskAI={handleOpenAskAI}
          onSeekRequestRef={seekRequestRef}
          theaterMode={theaterMode}
          onToggleTheater={() => setTheaterMode((prev) => !prev)}
        />
      ) : lesson.lesson_type === "article" ? (
        <div className="flex aspect-video w-full flex-col justify-center rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f4c81] p-8 text-center text-white shadow-xl">
          <FileText className="mx-auto size-12 text-[#38bdf8]" />
          <h3 className="mt-3 text-lg font-bold">{lesson.title}</h3>
          <p className="mt-1 text-xs text-white/70">Interactive Clinical Reading & Case Study</p>
        </div>
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-[#0f4c81] to-[#1e3a8a] p-8 text-center text-white shadow-xl">
          <BookOpen className="size-12 text-white/80" />
          <h3 className="mt-3 text-lg font-bold">{lesson.title}</h3>
          <p className="mt-1 text-xs text-white/70">Clinical Reference Protocol</p>
        </div>
      )}

      {/* 2. STUDY DOCK: OVERVIEW, CHAPTERS, TRANSCRIPT, NOTES, BOOKMARKS, DISCUSSIONS & RESOURCES */}
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
              onClick={() => handleOpenAskAI()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0f4c81] to-[#1769c2] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105 transition cursor-pointer"
            >
              <Sparkles className="size-3.5 text-amber-300" />
              <span>Ask AI on Lecture</span>
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
        <div className="flex items-center gap-2 border-b border-[#f0efee] dark:border-[#21262d] overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Overview" },
            { id: "chapters", label: `Chapters (${chapters.length})` },
            { id: "transcript", label: "Transcript" },
            { id: "notes", label: `My Notes (${notes.length})` },
            { id: "bookmarks", label: `Bookmarks (${bookmarks.length})` },
            { id: "discussion", label: `Discussion (${discussions.length})` },
            { id: "resources", label: `Resources (${resourceCount})` },
            { id: "analytics", label: "Analytics" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`border-b-2 px-3 py-2 text-xs font-bold transition cursor-pointer shrink-0 ${
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

        {/* TAB 2: CHAPTERS */}
        {activeTab === "chapters" && (
          <div className="space-y-3">
            {chapters.length > 0 ? (
              chapters.map((ch, idx) => {
                const isActive =
                  currentPlaybackTime >= ch.start_seconds &&
                  (ch.end_seconds ? currentPlaybackTime <= ch.end_seconds : true);

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleJumpToTimestamp(ch.start_seconds)}
                    className={`flex w-full items-center justify-between rounded-2xl p-3.5 text-left text-xs transition cursor-pointer border ${
                      isActive
                        ? "border-[#0f4c81] bg-[#eef5fc] dark:bg-[#1c2433] dark:border-[#58a6ff]"
                        : "border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#1c2128] hover:border-[#0f4c81]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-[#0f4c81] text-white"
                            : "bg-[#e8e6e3] dark:bg-[#21262d] text-[#77716b]"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p
                          className={`font-bold ${
                            isActive ? "text-[#0f4c81] dark:text-[#58a6ff]" : "text-[#171717] dark:text-[#f0f6fc]"
                          }`}
                        >
                          {ch.title}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                      {formatTime(ch.start_seconds)}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="p-4 text-center text-xs text-[#77716b] dark:text-[#8b949e]">
                No timestamped chapters defined for this lecture.
              </p>
            )}
          </div>
        )}

        {/* TAB 3: TRANSCRIPT WITH INSTANT SEARCH */}
        {activeTab === "transcript" && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#77716b]" />
              <input
                type="text"
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                placeholder="Search transcript (e.g. 'internal capsule', 'patellar')..."
                className="w-full rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#21262d] pl-10 pr-4 py-2.5 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none"
              />
              {transcriptSearch && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                  {filteredTranscriptCues.length} matches
                </span>
              )}
            </div>

            {/* Transcript Cues List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredTranscriptCues.map((cue, idx) => {
                const isActive =
                  currentPlaybackTime >= cue.start && currentPlaybackTime <= cue.end;

                return (
                  <div
                    key={idx}
                    onClick={() => handleJumpToTimestamp(cue.start)}
                    className={`flex items-start gap-3 rounded-2xl p-3 text-xs transition cursor-pointer border ${
                      isActive
                        ? "border-[#0f4c81] bg-[#eef5fc] dark:bg-[#1c2433] dark:border-[#58a6ff]"
                        : "border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#1c2128] hover:border-[#0f4c81]"
                    }`}
                  >
                    <button
                      type="button"
                      className="font-mono text-[11px] font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline shrink-0 pt-0.5"
                    >
                      {formatTime(cue.start)}
                    </button>
                    <p className="flex-1 text-[#171717] dark:text-[#f0f6fc] leading-relaxed">
                      {cue.text}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAskAI(cue.text);
                      }}
                      className="shrink-0 p-1 rounded-lg text-[#77716b] hover:text-[#0f4c81] dark:hover:text-[#58a6ff] hover:bg-white/50 dark:hover:bg-black/20 transition"
                      title="Ask AI about this explanation"
                    >
                      <Sparkles className="size-3.5 text-amber-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: IN-VIDEO NOTES */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <form onSubmit={handleSaveNote} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff]">
                <span>Add Note at {formatTime(currentPlaybackTime)}</span>
              </div>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Take timestamped clinical notes, diagnostic criteria, dosing pearls..."
                rows={3}
                className="w-full rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#21262d] p-3 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none"
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
                  <div className="flex items-center justify-between text-[10px] text-[#77716b] dark:text-[#8b949e] mb-1.5">
                    {n.timestamp_seconds !== null && n.timestamp_seconds !== undefined ? (
                      <button
                        type="button"
                        onClick={() => handleJumpToTimestamp(n.timestamp_seconds!)}
                        className="font-mono font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                      >
                        ⏱ {formatTime(n.timestamp_seconds)}
                      </button>
                    ) : (
                      <span>{new Date(n.created_at).toLocaleDateString()}</span>
                    )}

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

        {/* TAB 5: BOOKMARKS & MY BOX */}
        {activeTab === "bookmarks" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-2xl bg-[#faf9f8] dark:bg-[#1c2128] p-3 border border-[#ded8d1] dark:border-[#30363d]">
              <input
                type="text"
                value={bookmarkTitle}
                onChange={(e) => setBookmarkTitle(e.target.value)}
                placeholder={`Bookmark title at ${formatTime(currentPlaybackTime)}...`}
                className="flex-1 rounded-xl bg-white dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] border border-[#ded8d1] dark:border-[#30363d]"
              />
              <button
                type="button"
                onClick={handleAddBookmark}
                disabled={savingBookmark}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
              >
                <Bookmark className="size-3.5" />
                <span>Bookmark {formatTime(currentPlaybackTime)}</span>
              </button>
            </div>

            <div className="space-y-2">
              {bookmarks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#1c2128] p-3 text-xs"
                >
                  <div
                    onClick={() => handleJumpToTimestamp(b.timestamp_seconds)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <span className="font-mono font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                      {formatTime(b.timestamp_seconds)}
                    </span>
                    <span className="font-semibold text-[#171717] dark:text-[#f0f6fc]">
                      {b.title || `Bookmark at ${formatTime(b.timestamp_seconds)}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteBookmark(b.id)}
                    className="text-[#8a8784] hover:text-rose-600 transition p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LECTURE DISCUSSIONS */}
        {activeTab === "discussion" && (
          <div className="space-y-4">
            {/* New Question Box */}
            <form onSubmit={(e) => handlePostDiscussion(e)} className="space-y-2">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Ask a question or clinical clarification on this lecture..."
                rows={2}
                className="w-full rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#21262d] p-3 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#77716b]">
                  Attaching current timestamp: {formatTime(currentPlaybackTime)}
                </span>
                <button
                  type="submit"
                  disabled={!newCommentText.trim() || postingComment}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="size-3.5" />
                  <span>Post Question</span>
                </button>
              </div>
            </form>

            {/* Discussions List */}
            <div className="space-y-3 pt-2">
              {discussions.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#1c2128] p-4 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-[#0f4c81] text-white font-bold text-[10px]">
                        {d.user?.name?.[0] || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#171717] dark:text-[#f0f6fc]">
                            {d.user?.name || "Colleague"}
                          </span>
                          {d.is_instructor_answer && (
                            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              Instructor Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">
                          {d.user?.profession || "Healthcare Professional"}
                        </p>
                      </div>
                    </div>

                    {d.timestamp_seconds !== null && d.timestamp_seconds !== undefined && (
                      <button
                        type="button"
                        onClick={() => handleJumpToTimestamp(d.timestamp_seconds!)}
                        className="font-mono font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                      >
                        ⏱ {formatTime(d.timestamp_seconds)}
                      </button>
                    )}
                  </div>

                  <p className="text-[#171717] dark:text-[#f0f6fc] whitespace-pre-wrap">{d.message}</p>

                  {/* Reply Action */}
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setReplyingToId(replyingToId === d.id ? null : d.id)}
                      className="text-[11px] font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                    >
                      Reply
                    </button>
                  </div>

                  {/* Reply Input Form */}
                  {replyingToId === d.id && (
                    <form onSubmit={(e) => handlePostDiscussion(e, d.id)} className="space-y-2 pt-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a clinical reply..."
                        className="w-full rounded-xl bg-white dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-[#f0f6fc] border border-[#ded8d1] dark:border-[#30363d]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          className="px-3 py-1 text-xs text-[#77716b]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-[#0f4c81] px-3 py-1 text-xs font-bold text-white"
                        >
                          Post Reply
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Replies List */}
                  {d.replies && d.replies.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-[#0f4c81]/20 mt-2">
                      {d.replies.map((rep) => (
                        <div key={rep.id} className="rounded-xl bg-white dark:bg-[#21262d] p-3 text-xs space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#171717] dark:text-[#f0f6fc]">
                              {rep.user?.name || "Faculty"}
                            </span>
                            {rep.is_instructor_answer && (
                              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:text-emerald-300">
                                Instructor
                              </span>
                            )}
                          </div>
                          <p className="text-[#171717] dark:text-[#f0f6fc]">{rep.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: RESOURCES */}
        {activeTab === "resources" && (
          <TeacherResourceManager
            courseId={courseId || lesson.course_id}
            lessonId={lesson.id}
            isInstructor={isInstructor}
            onResourceCountChange={(cnt) => setResourceCount(cnt)}
          />
        )}

        {/* TAB 8: ANALYTICS */}
        {activeTab === "analytics" && (
          <VideoAnalyticsView lessonId={lesson.id} />
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
