"use client";

import * as React from "react";
import {
  X,
  Edit,
  Save,
  Loader2,
  Lock,
  ShieldCheck,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { LearningResource } from "@/modules/learn/types";

interface TeacherResourceEditModalProps {
  resource: LearningResource | null;
  isOpen: boolean;
  onClose: () => void;
  onResourceUpdated: (updated: LearningResource) => void;
}

export function TeacherResourceEditModal({
  resource,
  isOpen,
  onClose,
  onResourceUpdated,
}: TeacherResourceEditModalProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("Anatomy");
  const [isPublic, setIsPublic] = React.useState(true);
  const [isPinned, setIsPinned] = React.useState(false);

  // Permissions state
  const [allowDownload, setAllowDownload] = React.useState(false);
  const [allowPrint, setAllowPrint] = React.useState(false);
  const [allowCopy, setAllowCopy] = React.useState(false);
  const [allowOffline, setAllowOffline] = React.useState(false);

  // Optional File Replacement
  const [replacementFile, setReplacementFile] = React.useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = React.useState(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (resource && isOpen) {
      setTitle(resource.title || "");
      setDescription(resource.description || "");
      setCategory(resource.category || "Anatomy");
      setIsPublic(resource.is_public !== false);
      setIsPinned(Boolean(resource.is_pinned));

      // Permissions from resource
      const perms = resource.permissions;
      setAllowDownload(perms ? Boolean(perms.allow_download) : false);
      setAllowPrint(perms ? Boolean(perms.allow_print) : false);
      setAllowCopy(perms ? Boolean(perms.allow_copy) : false);
      setAllowOffline(perms ? Boolean(perms.allow_offline) : false);

      setReplacementFile(null);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [resource, isOpen]);

  if (!isOpen || !resource) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Title is required");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let fileUrl = resource.file_url;
      let storageKey = resource.storage_key;
      let fileSizeBytes = resource.file_size_bytes;
      let mimeType = resource.mime_type;

      // 1. If replacement file selected, upload to /api/media/upload
      if (replacementFile) {
        setUploadingFile(true);
        const formData = new FormData();
        formData.append("file", replacementFile);
        formData.append("folder", "learnresources");

        const uploadRes = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || "Failed to upload replacement PDF file");
        }

        fileUrl = uploadData.url;
        storageKey = uploadData.key || `learnresources/${Date.now()}_${replacementFile.name}`;
        fileSizeBytes = replacementFile.size;
        mimeType = replacementFile.type || "application/pdf";
        setUploadingFile(false);
      }

      // 2. Update resource metadata
      const updateRes = await fetch(`/api/learn/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          isPublic,
          isPinned,
          fileUrl,
          storageKey,
          fileSizeBytes,
          mimeType,
        }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        throw new Error(updateData.error || "Failed to update resource metadata");
      }

      // 3. Update permissions matrix
      const permRes = await fetch(`/api/learn/resources/${resource.id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allow_view: true,
          allow_download: allowDownload,
          allow_print: allowPrint,
          allow_copy: allowCopy,
          allow_offline: allowOffline,
        }),
      });

      const permData = await permRes.json();
      if (!permRes.ok) {
        console.warn("Permission update warning:", permData.error);
      }

      const mergedResource: LearningResource = {
        ...updateData.resource,
        permissions: {
          id: resource.permissions?.id || `perm-${resource.id}`,
          resource_id: resource.id,
          allow_view: true,
          allow_download: allowDownload,
          allow_print: allowPrint,
          allow_copy: allowCopy,
          allow_offline: allowOffline,
        },
      };

      setSuccessMsg("Resource updated successfully!");
      onResourceUpdated(mergedResource);

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save changes");
    } finally {
      setIsSubmitting(false);
      setUploadingFile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#161b22] text-white rounded-3xl border border-[#30363d] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#10141b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0f4c81]/30 text-[#58a6ff]">
              <Edit className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Clinical Resource</h3>
              <p className="text-xs text-white/60">
                Update document metadata, read-only restrictions, and student access
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#21262d] text-white/60 hover:text-white transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/90">Resource Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. BD Chaurasia's Human Anatomy - Volume 1"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs sm:text-sm text-white focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/90">Clinical Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Summary of topics, clinical correlations, and target curriculum..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs sm:text-sm text-white focus:outline-none focus:border-[#58a6ff] resize-none"
            />
          </div>

          {/* Category & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/90">Medical Subject</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-white focus:outline-none focus:border-[#58a6ff]"
              >
                <option value="Anatomy">Anatomy</option>
                <option value="Physiology">Physiology</option>
                <option value="Neuroanatomy">Neuroanatomy</option>
                <option value="Pharmacology">Pharmacology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pathology">Pathology</option>
                <option value="General Surgery">General Surgery</option>
                <option value="Physiotherapy">Physiotherapy</option>
                <option value="Clinical Medicine">Clinical Medicine</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/90">Visibility</label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="size-4 rounded border-[#30363d] bg-[#0d1117] text-[#0f4c81]"
                  />
                  <span>Public in Study Library</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="size-4 rounded border-[#30363d] bg-[#0d1117] text-[#0f4c81]"
                  />
                  <span>Pin to Top</span>
                </label>
              </div>
            </div>
          </div>

          {/* ── PERMISSIONS & READ-ONLY SECURITY MATRIX ── */}
          <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Student Security & Download Policy
                </h4>
              </div>
              <span className="text-[11px] font-mono text-white/60">
                {!allowDownload ? "🔒 READ-ONLY ENFORCED" : "⚡ DOWNLOAD ALLOWED"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Allow Download */}
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#161b22] border border-[#30363d] cursor-pointer hover:border-[#58a6ff]/50 transition">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="size-4 mt-0.5 rounded border-[#30363d] text-[#0f4c81]"
                />
                <div>
                  <p className="text-xs font-bold text-white">Allow Student Download</p>
                  <p className="text-[10px] text-white/60">
                    Uncheck to lock as Read-Only (Students cannot download original file)
                  </p>
                </div>
              </label>

              {/* Allow Copy */}
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#161b22] border border-[#30363d] cursor-pointer hover:border-[#58a6ff]/50 transition">
                <input
                  type="checkbox"
                  checked={allowCopy}
                  onChange={(e) => setAllowCopy(e.target.checked)}
                  className="size-4 mt-0.5 rounded border-[#30363d] text-[#0f4c81]"
                />
                <div>
                  <p className="text-xs font-bold text-white">Allow Text Selection</p>
                  <p className="text-[10px] text-white/60">
                    Students can highlight and copy excerpts
                  </p>
                </div>
              </label>

              {/* Allow Print */}
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#161b22] border border-[#30363d] cursor-pointer hover:border-[#58a6ff]/50 transition">
                <input
                  type="checkbox"
                  checked={allowPrint}
                  onChange={(e) => setAllowPrint(e.target.checked)}
                  className="size-4 mt-0.5 rounded border-[#30363d] text-[#0f4c81]"
                />
                <div>
                  <p className="text-xs font-bold text-white">Allow Browser Printing</p>
                  <p className="text-[10px] text-white/60">
                    Enable print dialog from document viewer
                  </p>
                </div>
              </label>

              {/* Offline Reading */}
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#161b22] border border-[#30363d] cursor-pointer hover:border-[#58a6ff]/50 transition">
                <input
                  type="checkbox"
                  checked={allowOffline}
                  onChange={(e) => setAllowOffline(e.target.checked)}
                  className="size-4 mt-0.5 rounded border-[#30363d] text-[#0f4c81]"
                />
                <div>
                  <p className="text-xs font-bold text-white">Allow App Offline Cache</p>
                  <p className="text-[10px] text-white/60">
                    Capacitor mobile app encrypted storage
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Optional: Replace PDF file */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-white/90">
              Replace Document File (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setReplacementFile(e.target.files?.[0] || null)}
                className="text-xs text-white/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#21262d] file:text-white hover:file:bg-[#30363d] cursor-pointer"
              />
              {replacementFile && (
                <span className="text-[11px] text-emerald-400 font-mono">
                  {(replacementFile.size / (1024 * 1024)).toFixed(1)} MB ready to upload
                </span>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0f4c81] hover:bg-[#1565c0] text-white text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{uploadingFile ? "Uploading File..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
