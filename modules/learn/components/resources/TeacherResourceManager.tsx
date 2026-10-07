"use client";

import * as React from "react";
import {
  FileText,
  Image as ImageIcon,
  BookOpen,
  Volume2,
  ExternalLink,
  Plus,
  ShieldCheck,
  Lock,
  Eye,
  Download,
  Trash2,
  Edit,
  Pin,
  Sparkles,
  Layers,
  History,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  X,
} from "lucide-react";
import { LearningResource, ResourceType } from "@/modules/learn/types";
import { TeacherResourceUploadModal } from "./TeacherResourceUploadModal";
import { TeacherResourceEditModal } from "./TeacherResourceEditModal";
import { ResourceViewerModal } from "./ResourceViewerModal";

interface TeacherResourceManagerProps {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  isInstructor?: boolean;
  onResourceCountChange?: (count: number) => void;
}

export function TeacherResourceManager({
  courseId,
  moduleId,
  lessonId,
  isInstructor = true,
  onResourceCountChange,
}: TeacherResourceManagerProps) {
  const [resources, setResources] = React.useState<LearningResource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showUploadModal, setShowUploadModal] = React.useState(false);

  // Edit Modal State
  const [editModalResource, setEditModalResource] = React.useState<LearningResource | null>(null);

  // Viewer Modal State
  const [selectedViewerResourceId, setSelectedViewerResourceId] = React.useState<string | null>(null);

  // Student Preview Mode Toggle
  const [studentPreviewMode, setStudentPreviewMode] = React.useState(false);

  // Versioning Modal State
  const [versionModalResource, setVersionModalResource] = React.useState<LearningResource | null>(null);
  const [versionChangeNote, setVersionChangeNote] = React.useState("");
  const [versionFile, setVersionFile] = React.useState<File | null>(null);
  const [isSubmittingVersion, setIsSubmittingVersion] = React.useState(false);

  // Permissions Edit Modal State
  const [permissionModalResource, setPermissionModalResource] = React.useState<LearningResource | null>(null);
  const [editAllowView, setEditAllowView] = React.useState(true);
  const [editAllowDownload, setEditAllowDownload] = React.useState(false);
  const [editAllowPrint, setEditAllowPrint] = React.useState(false);
  const [editAllowCopy, setEditAllowCopy] = React.useState(false);
  const [editAllowOffline, setEditAllowOffline] = React.useState(false);
  const [isSubmittingPerm, setIsSubmittingPerm] = React.useState(false);

  // Fetch Resources
  const fetchResources = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (lessonId) params.set("lessonId", lessonId);
      else if (courseId) params.set("courseId", courseId);

      const res = await fetch(`/api/learn/resources?${params.toString()}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.resources)) {
        setResources(data.resources);
        if (onResourceCountChange) {
          onResourceCountChange(data.resources.length);
        }
      }
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, onResourceCountChange]);

  React.useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Handle Bookmark Toggle
  const handleToggleBookmark = async (resourceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/learn/resources/${resourceId}/bookmark`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setResources((prev) =>
          prev.map((r) =>
            r.id === resourceId ? { ...r, is_bookmarked: data.bookmarked } : r
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Direct Download
  const handleDirectDownload = async (resource: LearningResource, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/learn/resources/${resource.id}/download`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Download not permitted");

      if (data.downloadUrl) {
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.fileName || "learning-resource";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      alert(err.message || "Failed to download resource");
    }
  };

  // Handle Pin Toggle
  const handleTogglePin = async (resource: LearningResource) => {
    try {
      const res = await fetch(`/api/learn/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !resource.is_pinned }),
      });
      if (res.ok) {
        setResources((prev) =>
          prev.map((r) =>
            r.id === resource.id ? { ...r, is_pinned: !r.is_pinned } : r
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Archive
  const handleArchive = async (resourceId: string) => {
    if (!confirm("Are you sure you want to archive this resource?")) return;
    try {
      const res = await fetch(`/api/learn/resources/${resourceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Submit New Version
  const handleCreateNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionModalResource || !versionChangeNote.trim()) return;

    setIsSubmittingVersion(true);
    try {
      let storageKey: string | null = null;
      let fileUrl: string | null = null;
      let fileSize: number | null = null;
      let mimeType: string | null = null;

      if (versionFile) {
        const presignedRes = await fetch("/api/learn/resources/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: versionFile.name,
            contentType: versionFile.type || "application/octet-stream",
            courseId,
          }),
        });
        const presignedData = await presignedRes.json();
        if (presignedRes.ok) {
          storageKey = presignedData.storageKey;
          fileUrl = presignedData.publicUrl;
          fileSize = versionFile.size;
          mimeType = versionFile.type;
        }
      }

      const res = await fetch(
        `/api/learn/resources/${versionModalResource.id}/versions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            changeNote: versionChangeNote.trim(),
            storageKey,
            fileUrl,
            fileSizeBytes: fileSize,
            mimeType,
          }),
        }
      );

      if (res.ok) {
        setVersionModalResource(null);
        setVersionChangeNote("");
        setVersionFile(null);
        fetchResources();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingVersion(false);
    }
  };

  // Handle Update Permissions
  const handleUpdatePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissionModalResource) return;

    setIsSubmittingPerm(true);
    try {
      const res = await fetch(
        `/api/learn/resources/${permissionModalResource.id}/permissions`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            allow_view: editAllowView,
            allow_download: editAllowDownload,
            allow_print: editAllowPrint,
            allow_copy: editAllowCopy,
            allow_offline: editAllowOffline,
          }),
        }
      );

      if (res.ok) {
        setPermissionModalResource(null);
        fetchResources();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPerm(false);
    }
  };

  const getIconForType = (type: ResourceType) => {
    switch (type) {
      case "image":
        return <ImageIcon className="size-4 text-purple-500" />;
      case "notes":
        return <BookOpen className="size-4 text-emerald-500" />;
      case "audio":
        return <Volume2 className="size-4 text-amber-500" />;
      case "presentation":
        return <Layers className="size-4 text-orange-500" />;
      case "link":
        return <ExternalLink className="size-4 text-cyan-500" />;
      default:
        return <FileText className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#faf9f8] dark:bg-[#161b22] p-4 rounded-2xl border border-[#ded8d1] dark:border-[#30363d]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#0f4c81]/10 text-[#0f4c81] dark:text-[#58a6ff]">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#171717] dark:text-white">
              Learning Content & Resources ({resources.length})
            </h3>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
              Manage PDFs, high-res images, clinical notes, and access controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Student Preview Mode Toggle */}
          {isInstructor && (
            <button
              type="button"
              onClick={() => setStudentPreviewMode(!studentPreviewMode)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer border ${
                studentPreviewMode
                  ? "bg-purple-900/40 border-purple-500 text-purple-300 shadow-xs"
                  : "bg-white dark:bg-[#21262d] border-[#ded8d1] dark:border-[#30363d] text-[#5d5854] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-white"
              }`}
            >
              <Eye className="size-3.5" />
              <span>{studentPreviewMode ? "Student Preview: ON" : "Preview as Student"}</span>
            </button>
          )}

          {/* Add Resource Button */}
          {isInstructor && !studentPreviewMode && (
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] hover:bg-[#0c3c66] text-white px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Plus className="size-4" />
              <span>Add Resource</span>
            </button>
          )}
        </div>
      </div>

      {/* Student Preview Notification Banner */}
      {studentPreviewMode && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs">
          <div className="flex items-center gap-2">
            <Eye className="size-4 shrink-0" />
            <span>
              <strong>Student Preview Active:</strong> You are viewing resources with student
              access boundaries. Download buttons and copy policies reflect configured student rules.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStudentPreviewMode(false)}
            className="text-xs font-bold underline hover:text-white ml-2"
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* 2. Resources List / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 space-y-2 text-xs text-[#77716b]">
          <div className="size-6 rounded-full border-2 border-[#0f4c81] border-t-transparent animate-spin" />
          <p>Loading course resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#161b22] p-8 text-center space-y-3">
          <BookOpen className="size-10 text-[#77716b] dark:text-[#8b949e] mx-auto opacity-50" />
          <div>
            <h4 className="text-sm font-bold text-[#171717] dark:text-white">
              No Learning Resources Attached Yet
            </h4>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 max-w-sm mx-auto">
              Upload supplemental PDFs, clinical case studies, anatomical illustrations, or native
              MGN notes to enrich this module.
            </p>
          </div>
          {isInstructor && !studentPreviewMode && (
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] text-white px-4 py-2 text-xs font-bold hover:bg-[#0c3c66] transition cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add First Resource</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {resources.map((res) => {
            const isDownloadAllowed = res.permissions?.allow_download ?? false;
            return (
              <div
                key={res.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition ${
                  res.is_pinned
                    ? "border-[#0f4c81]/40 bg-[#f4f8fc] dark:bg-[#0f4c81]/10"
                    : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-[#0f4c81]"
                }`}
              >
                {/* Left Info */}
                <div
                  onClick={() => setSelectedViewerResourceId(res.id)}
                  className="flex items-start sm:items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="p-2.5 rounded-xl bg-[#faf9f8] dark:bg-[#21262d] border border-[#e8e6e3] dark:border-[#30363d] shrink-0">
                    {getIconForType(res.resource_type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f4c81] dark:text-[#58a6ff]">
                        {res.resource_type}
                      </span>
                      <span className="rounded-full bg-[#f0efee] dark:bg-[#21262d] px-2 py-0.5 text-[9px] font-mono text-[#5d5854] dark:text-[#8b949e]">
                        v{res.current_version}.0
                      </span>
                      {res.is_pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[9px] font-bold text-amber-800 dark:text-amber-400">
                          <Pin className="size-2.5" /> Pinned
                        </span>
                      )}
                      {isDownloadAllowed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="size-3" /> Download Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-700 dark:text-slate-400">
                          <Lock className="size-3" /> View Only
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-white truncate mt-1">
                      {res.title}
                    </h4>

                    {res.description && (
                      <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] truncate max-w-lg">
                        {res.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Bookmark / Save to My Box */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleBookmark(res.id, e)}
                    title={res.is_bookmarked ? "Saved in My Box" : "Save to My Box"}
                    className={`p-1.5 rounded-xl border transition cursor-pointer ${
                      res.is_bookmarked
                        ? "bg-[#0f4c81] text-white border-[#0f4c81]"
                        : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] hover:text-[#0f4c81]"
                    }`}
                  >
                    <BookOpen className="size-3.5" />
                  </button>

                  {/* Direct Download if permitted */}
                  {isDownloadAllowed && (
                    <button
                      type="button"
                      onClick={(e) => handleDirectDownload(res, e)}
                      title="Download Resource"
                      className="p-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition cursor-pointer"
                    >
                      <Download className="size-3.5" />
                    </button>
                  )}

                  {/* Open Viewer */}
                  <button
                    type="button"
                    onClick={() => setSelectedViewerResourceId(res.id)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] text-white px-3 py-1.5 text-xs font-bold hover:brightness-105 transition cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                    <span>Open</span>
                  </button>

                  {/* Instructor Controls */}
                  {isInstructor && !studentPreviewMode && (
                    <>
                      {/* Edit Metadata & Permissions */}
                      <button
                        type="button"
                        onClick={() => setEditModalResource(res)}
                        title="Edit Resource Details & Permissions"
                        className="p-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] hover:text-[#0f4c81] hover:border-[#0f4c81] transition cursor-pointer"
                      >
                        <Edit className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
                      </button>

                      {/* Edit Permissions */}
                      <button
                        type="button"
                        onClick={() => {
                          setPermissionModalResource(res);
                          setEditAllowView(res.permissions?.allow_view ?? true);
                          setEditAllowDownload(res.permissions?.allow_download ?? false);
                          setEditAllowPrint(res.permissions?.allow_print ?? false);
                          setEditAllowCopy(res.permissions?.allow_copy ?? false);
                          setEditAllowOffline(res.permissions?.allow_offline ?? false);
                        }}
                        title="Quick Security & Download Policy"
                        className="p-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] hover:text-[#0f4c81] transition cursor-pointer"
                      >
                        <Lock className="size-4" />
                      </button>

                      {/* New Version */}
                      <button
                        type="button"
                        onClick={() => {
                          setVersionModalResource(res);
                          setVersionChangeNote("");
                          setVersionFile(null);
                        }}
                        title="Upload New Version"
                        className="p-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] hover:text-[#0f4c81] transition cursor-pointer"
                      >
                        <History className="size-4" />
                      </button>

                      {/* Pin Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePin(res)}
                        title={res.is_pinned ? "Unpin Resource" : "Pin Resource"}
                        className={`p-1.5 rounded-xl border transition cursor-pointer ${
                          res.is_pinned
                            ? "bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-400"
                            : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] hover:text-amber-600"
                        }`}
                      >
                        <Pin className="size-4" />
                      </button>

                      {/* Archive */}
                      <button
                        type="button"
                        onClick={() => handleArchive(res.id)}
                        title="Archive Resource"
                        className="p-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] text-[#8a8784] hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. UPLOAD MODAL */}
      <TeacherResourceUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        courseId={courseId}
        moduleId={moduleId}
        lessonId={lessonId}
        onResourceCreated={() => fetchResources()}
      />

      {/* 4. EDIT RESOURCE MODAL */}
      {editModalResource && (
        <TeacherResourceEditModal
          resource={editModalResource}
          isOpen={Boolean(editModalResource)}
          onClose={() => setEditModalResource(null)}
          onResourceUpdated={() => fetchResources()}
        />
      )}

      {/* 5. VIEWER MODAL */}
      {selectedViewerResourceId && (
        <ResourceViewerModal
          resourceId={selectedViewerResourceId}
          isOpen={!!selectedViewerResourceId}
          onClose={() => setSelectedViewerResourceId(null)}
          courseId={courseId}
          lessonId={lessonId}
          isStudentPreview={studentPreviewMode}
        />
      )}

      {/* 5. VERSIONING MODAL */}
      {versionModalResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#161b22] rounded-3xl border border-[#ded8d1] dark:border-[#30363d] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0efee] dark:border-[#21262d] pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#171717] dark:text-white flex items-center gap-2">
                  <History className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" /> Publish Version{" "}
                  {versionModalResource.current_version + 1}.0
                </h3>
                <p className="text-xs text-[#77716b]">{versionModalResource.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setVersionModalResource(null)}
                className="text-[#77716b] hover:text-black dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewVersion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#171717] dark:text-white mb-1">
                  Change Note / Revision Summary *
                </label>
                <textarea
                  value={versionChangeNote}
                  onChange={(e) => setVersionChangeNote(e.target.value)}
                  placeholder="e.g. Updated clinical guideline section and diagnostic criteria table"
                  rows={3}
                  className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#21262d] p-2.5 text-[#171717] dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#171717] dark:text-white mb-1">
                  Updated File (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setVersionFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-[#77716b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#f0efee] dark:border-[#21262d]">
                <button
                  type="button"
                  onClick={() => setVersionModalResource(null)}
                  className="rounded-xl px-4 py-2 text-[#5d5854] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVersion || !versionChangeNote.trim()}
                  className="rounded-xl bg-[#0f4c81] text-white font-bold px-4 py-2 hover:bg-[#0c3c66] disabled:opacity-40"
                >
                  {isSubmittingVersion ? "Publishing..." : "Publish Version"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. PERMISSIONS MODAL */}
      {permissionModalResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#161b22] rounded-3xl border border-[#ded8d1] dark:border-[#30363d] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0efee] dark:border-[#21262d] pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#171717] dark:text-white flex items-center gap-2">
                  <Lock className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" /> Access Control
                  Policy
                </h3>
                <p className="text-xs text-[#77716b]">{permissionModalResource.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setPermissionModalResource(null)}
                className="text-[#77716b] hover:text-black dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePermissions} className="space-y-3 text-xs">
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf9f8] dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] cursor-pointer">
                  <span className="font-bold text-[#171717] dark:text-white">Viewing Allowed</span>
                  <input
                    type="checkbox"
                    checked={editAllowView}
                    onChange={(e) => setEditAllowView(e.target.checked)}
                    className="rounded text-[#0f4c81]"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf9f8] dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] cursor-pointer">
                  <span className="font-bold text-[#171717] dark:text-white">Download Allowed</span>
                  <input
                    type="checkbox"
                    checked={editAllowDownload}
                    onChange={(e) => setEditAllowDownload(e.target.checked)}
                    className="rounded text-[#0f4c81]"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf9f8] dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] cursor-pointer">
                  <span className="font-bold text-[#171717] dark:text-white">Print Allowed</span>
                  <input
                    type="checkbox"
                    checked={editAllowPrint}
                    onChange={(e) => setEditAllowPrint(e.target.checked)}
                    className="rounded text-[#0f4c81]"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf9f8] dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] cursor-pointer">
                  <span className="font-bold text-[#171717] dark:text-white">Text Copy Allowed</span>
                  <input
                    type="checkbox"
                    checked={editAllowCopy}
                    onChange={(e) => setEditAllowCopy(e.target.checked)}
                    className="rounded text-[#0f4c81]"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf9f8] dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] cursor-pointer">
                  <span className="font-bold text-[#171717] dark:text-white">Offline Access</span>
                  <input
                    type="checkbox"
                    checked={editAllowOffline}
                    onChange={(e) => setEditAllowOffline(e.target.checked)}
                    className="rounded text-[#0f4c81]"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#f0efee] dark:border-[#21262d]">
                <button
                  type="button"
                  onClick={() => setPermissionModalResource(null)}
                  className="rounded-xl px-4 py-2 text-[#5d5854] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPerm}
                  className="rounded-xl bg-[#0f4c81] text-white font-bold px-4 py-2 hover:bg-[#0c3c66] disabled:opacity-40"
                >
                  {isSubmittingPerm ? "Saving..." : "Save Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
