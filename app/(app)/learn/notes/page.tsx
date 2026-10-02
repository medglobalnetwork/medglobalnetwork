"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import { StudentNoteItem, StudentNoteType, NoteVisibility } from "@/modules/learn/types";

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const [activeTab, setActiveTab] = React.useState<"my_notes" | "shared">("my_notes");
  const [myNotes, setMyNotes] = React.useState<StudentNoteItem[]>([]);
  const [sharedNotes, setSharedNotes] = React.useState<StudentNoteItem[]>([]);
  const [selectedNote, setSelectedNote] = React.useState<StudentNoteItem | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  // New / Edit Note Modal State
  const [showEditorModal, setShowEditorModal] = React.useState(false);
  const [editorTitle, setEditorTitle] = React.useState("");
  const [editorContent, setEditorContent] = React.useState("");
  const [editorType, setEditorType] = React.useState<StudentNoteType>("Revision Notes");
  const [editorSubject, setEditorSubject] = React.useState("Anatomy");
  const [editorTopic, setEditorTopic] = React.useState("Upper Limb");
  const [editorTags, setEditorTags] = React.useState("Brachial Plexus, High-Yield");

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = React.useState(false);
  const [publishVisibility, setPublishVisibility] = React.useState<NoteVisibility>("community");
  const [copyrightDeclared, setCopyrightDeclared] = React.useState(false);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  const loadNotes = React.useCallback(async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const [myRes, sharedRes] = await Promise.all([
        fetch("/api/learn/notes"),
        fetch("/api/learn/notes/share"),
      ]);

      if (myRes.ok) {
        const d = await myRes.json();
        setMyNotes(d.notes || []);
      }
      if (sharedRes.ok) {
        const d = await sharedRes.json();
        setSharedNotes(d.notes || []);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  React.useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Create Note
  const handleSaveNote = async () => {
    if (!editorTitle.trim() || !editorContent.trim()) {
      alert("Please provide both title and content for your note.");
      return;
    }

    try {
      const tagList = editorTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/learn/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editorTitle,
          content: editorContent,
          note_type: editorType,
          subject: editorSubject,
          topic: editorTopic,
          tags: tagList,
        }),
      });

      if (res.ok) {
        setShowEditorModal(false);
        setEditorTitle("");
        setEditorContent("");
        loadNotes();
      }
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  };

  // Publish Note to Community
  const handlePublishNote = async () => {
    if (!selectedNote) return;
    if (!copyrightDeclared) {
      alert("You must declare copyright ownership before publishing.");
      return;
    }

    try {
      const res = await fetch("/api/learn/notes/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note_id: selectedNote.id,
          visibility: publishVisibility,
          subject: selectedNote.subject,
          topic: selectedNote.topic,
          tags: selectedNote.tags,
          copyright_declared: true,
        }),
      });

      if (res.ok) {
        setShowPublishModal(false);
        alert("Note published successfully to the medical student community!");
        loadNotes();
      }
    } catch (err) {
      console.error("Failed to publish note:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
      <StudentNavHeader activeTab="resources" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/learn"
                className="p-1.5 rounded-xl hover:bg-[#f0efee] dark:hover:bg-[#21262d] text-[#77716b] dark:text-[#8b949e] transition"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-2xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
                Student Notes & Study Community 📝
              </h1>
            </div>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 ml-8">
              Private study notes, timestamp-linked annotations, and verified peer-shared revision summaries.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowEditorModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-xs font-bold transition shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="size-4" /> Create Study Note
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#e8e6e3] dark:border-[#30363d] pb-px">
          <button
            type="button"
            onClick={() => setActiveTab("my_notes")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "my_notes"
                ? "border-[#0f4c81] text-[#0f4c81] dark:border-[#58a6ff] dark:text-[#58a6ff]"
                : "border-transparent text-[#77716b] dark:text-[#8b949e]"
            }`}
          >
            <Lock className="size-3.5" /> My Notes (Private)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shared")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "shared"
                ? "border-[#0f4c81] text-[#0f4c81] dark:border-[#58a6ff] dark:text-[#58a6ff]"
                : "border-transparent text-[#77716b] dark:text-[#8b949e]"
            }`}
          >
            <Users className="size-3.5" /> Community Shared Notes Feed
          </button>
        </div>

        {/* Notes Grid */}
        {activeTab === "my_notes" ? (
          myNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-5 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#0f4c81] dark:text-[#58a6ff]">
                        {note.note_type}
                      </span>
                      <span className="text-[10px] text-[#77716b]">
                        {note.visibility === "only_me" ? "🔒 Private" : "🌐 Shared"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                      {note.title}
                    </h3>

                    <p className="text-xs text-[#5d5854] dark:text-[#8b949e] line-clamp-3 leading-relaxed">
                      {note.content}
                    </p>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between">
                    <span className="text-[10px] text-[#77716b]">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNote(note);
                        setShowPublishModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
                    >
                      <Share2 className="size-3.5" /> Publish to Community
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-12 text-center space-y-3">
              <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center mx-auto">
                <FileText className="size-7" />
              </div>
              <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                No Private Notes Yet
              </h3>
              <p className="text-xs text-[#77716b] max-w-sm mx-auto">
                Capture high-yield mnemonics, clinical pearls, and lecture takeaways.
              </p>
              <button
                type="button"
                onClick={() => setShowEditorModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f4c81] text-white text-xs font-bold shadow-xs cursor-pointer mt-2"
              >
                Create Your First Note
              </button>
            </div>
          )
        ) : sharedNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sharedNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-5 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      {note.note_type}
                    </span>
                    <span className="text-[11px] text-[#77716b]">
                      {note.subject || "Clinical"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                    {note.title}
                  </h3>

                  <p className="text-xs text-[#5d5854] dark:text-[#8b949e] line-clamp-3 leading-relaxed">
                    {note.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#77716b]">
                    <ShieldCheck className="size-3.5 text-blue-500" />
                    <span>{note.author_name || "Verified Scholar"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Saved note: ${note.title}`)}
                    className="font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                  >
                    Save to My Box
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-12 text-center text-xs text-[#77716b]">
            No shared notes available yet.
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* CREATE NOTE MODAL */}
        {/* ───────────────────────────────────────────── */}
        {showEditorModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                Create New Study Note
              </h3>

              <div className="space-y-3">
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  placeholder="Note Title (e.g. Brachial Plexus Quick Revision)..."
                  className="w-full bg-[#f8f7f6] dark:bg-[#21262d] p-3 rounded-xl text-xs font-bold focus:outline-none border border-[#e8e6e3] dark:border-[#30363d]"
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={editorType}
                    onChange={(e) => setEditorType(e.target.value as StudentNoteType)}
                    className="bg-[#f8f7f6] dark:bg-[#21262d] p-2 rounded-xl text-xs font-medium border border-[#e8e6e3] dark:border-[#30363d]"
                  >
                    <option value="Revision Notes">Revision Notes</option>
                    <option value="Lecture Notes">Lecture Notes</option>
                    <option value="Course Notes">Course Notes</option>
                    <option value="Clinical Notes">Clinical Notes</option>
                    <option value="Exam Notes">Exam Notes</option>
                    <option value="Personal Notes">Personal Notes</option>
                  </select>

                  <input
                    type="text"
                    value={editorSubject}
                    onChange={(e) => setEditorSubject(e.target.value)}
                    placeholder="Subject (e.g. Anatomy)"
                    className="bg-[#f8f7f6] dark:bg-[#21262d] p-2 rounded-xl text-xs font-medium border border-[#e8e6e3] dark:border-[#30363d]"
                  />
                </div>

                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  rows={6}
                  placeholder="Write your clinical pearls, bullet points, and key takeaways here..."
                  className="w-full bg-[#f8f7f6] dark:bg-[#21262d] p-3 rounded-xl text-xs leading-relaxed focus:outline-none border border-[#e8e6e3] dark:border-[#30363d]"
                />

                <input
                  type="text"
                  value={editorTags}
                  onChange={(e) => setEditorTags(e.target.value)}
                  placeholder="Tags separated by comma (e.g. Upper Limb, Motor Nerves)"
                  className="w-full bg-[#f8f7f6] dark:bg-[#21262d] p-2.5 rounded-xl text-xs font-medium border border-[#e8e6e3] dark:border-[#30363d]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditorModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#77716b] hover:bg-[#f0efee]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-5 py-2 rounded-xl bg-[#0f4c81] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* PUBLISH TO COMMUNITY MODAL */}
        {/* ───────────────────────────────────────────── */}
        {showPublishModal && selectedNote && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                Publish Note to Community
              </h3>
              <p className="text-xs text-[#77716b]">
                You are about to share &ldquo;{selectedNote.title}&rdquo; with medical learners.
              </p>

              <div className="space-y-3">
                <label className="text-xs font-bold text-[#5d5854]">Visibility</label>
                <select
                  value={publishVisibility}
                  onChange={(e) => setPublishVisibility(e.target.value as NoteVisibility)}
                  className="w-full bg-[#f8f7f6] dark:bg-[#21262d] p-2.5 rounded-xl text-xs font-semibold border border-[#e8e6e3]"
                >
                  <option value="community">Medical Community</option>
                  <option value="connections">Connections Only</option>
                  <option value="public">Public</option>
                </select>

                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="cr_decl"
                      checked={copyrightDeclared}
                      onChange={(e) => setCopyrightDeclared(e.target.checked)}
                      className="mt-0.5"
                    />
                    <label htmlFor="cr_decl" className="leading-snug font-semibold text-amber-900 dark:text-amber-200">
                      I declare that this note is my original compilation and complies with MGN Academic Honor Code.
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#77716b]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublishNote}
                  disabled={!copyrightDeclared}
                  className="px-5 py-2 rounded-xl bg-[#0f4c81] text-white text-xs font-bold shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  Confirm & Publish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
