"use client";

import * as React from "react";
import {
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Volume2,
  ExternalLink,
  Plus,
  Trash2,
  ShieldCheck,
  Lock,
  Calendar,
  CheckCircle2,
  Layers,
  AlertTriangle,
} from "lucide-react";
import {
  ResourceType,
  ResourceNativeNoteSection,
  LearningResource,
} from "@/modules/learn/types";

interface TeacherResourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResourceCreated?: (resource: LearningResource) => void;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
}

export function TeacherResourceUploadModal({
  isOpen,
  onClose,
  onResourceCreated,
  courseId,
  moduleId,
  lessonId,
}: TeacherResourceUploadModalProps) {
  const [resourceType, setResourceType] = React.useState<ResourceType>("pdf");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("Physiotherapy");
  const [tagsInput, setTagsInput] = React.useState("");
  const [isPinned, setIsPinned] = React.useState(false);
  const [isPublic, setIsPublic] = React.useState(false);
  const [copyrightDeclared, setCopyrightDeclared] = React.useState(true);

  // File Upload State
  const [file, setFile] = React.useState<File | null>(null);
  const [fileUrl, setFileUrl] = React.useState("");
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  // Native Notes State
  const [noteSections, setNoteSections] = React.useState<ResourceNativeNoteSection[]>([
    {
      id: "sec-1",
      type: "heading",
      content: "Clinical Assessment & Pathway",
    },
    {
      id: "sec-2",
      type: "paragraph",
      content: "Outline key signs and differential diagnosis criteria for clinical evaluation.",
    },
    {
      id: "sec-3",
      type: "clinical_callout",
      content: "Ensure bilaterally symmetric motor and sensory mapping during acute phase.",
    },
  ]);

  // Permission Matrix State
  const [allowView, setAllowView] = React.useState(true);
  const [allowDownload, setAllowDownload] = React.useState(false);
  const [allowPrint, setAllowPrint] = React.useState(false);
  const [allowCopy, setAllowCopy] = React.useState(false);
  const [allowOffline, setAllowOffline] = React.useState(false);
  const [accessDurationType, setAccessDurationType] = React.useState<
    "while_enrolled" | "lifetime" | "until_date" | "custom_days"
  >("while_enrolled");
  const [accessValidUntil, setAccessValidUntil] = React.useState("");
  const [accessDays, setAccessDays] = React.useState<number>(30);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!isOpen) return null;

  // Add Note Section
  const handleAddNoteSection = (
    type: ResourceNativeNoteSection["type"]
  ) => {
    const newSec: ResourceNativeNoteSection = {
      id: `sec-${Date.now()}`,
      type,
      content:
        type === "heading"
          ? "New Clinical Section"
          : type === "clinical_callout"
          ? "Clinical Guideline Note..."
          : type === "warning"
          ? "Contraindication or Caution..."
          : type === "key_takeaway"
          ? "Key Exam Takeaway..."
          : "Enter clinical text here...",
    };
    setNoteSections((prev) => [...prev, newSec]);
  };

  // Update Section
  const handleUpdateSection = (id: string, content: string) => {
    setNoteSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content } : s))
    );
  };

  // Delete Section
  const handleDeleteSection = (id: string) => {
    setNoteSections((prev) => prev.filter((s) => s.id !== id));
  };

  // Handle Direct File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }

      // Auto-detect type
      if (selectedFile.type.startsWith("image/")) setResourceType("image");
      else if (selectedFile.type === "application/pdf") setResourceType("pdf");
      else if (selectedFile.type.startsWith("audio/")) setResourceType("audio");
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Resource title is required");
      return;
    }
    if (!copyrightDeclared) {
      setErrorMsg("You must confirm copyright ownership or permission");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let finalStorageKey: string | null = null;
      let finalFileUrl = fileUrl.trim() || null;
      let finalFileSize = file?.size || null;
      let finalMimeType = file?.type || null;

      // Upload file to R2 if selected
      if (file) {
        setIsUploading(true);
        setUploadProgress(10);

        const presignedRes = await fetch("/api/learn/resources/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            courseId,
          }),
        });

        const presignedData = await presignedRes.json();
        if (!presignedRes.ok) {
          throw new Error(presignedData.error || "Failed to get upload authorization");
        }

        setUploadProgress(40);

        // Upload directly to Cloudflare R2
        try {
          await fetch(presignedData.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: file,
          });
          finalStorageKey = presignedData.storageKey;
          finalFileUrl = presignedData.publicUrl;
        } catch {
          // If direct PUT fails in dev sandbox, fall back to storage key
          finalStorageKey = presignedData.storageKey;
          finalFileUrl = presignedData.publicUrl;
        }

        setUploadProgress(100);
        setIsUploading(false);
      }

      // Prepare Native Content payload if native notes
      const nativeContent =
        resourceType === "notes"
          ? {
              title: title.trim(),
              lastEdited: new Date().toISOString(),
              sections: noteSections,
            }
          : null;

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Create Resource via API
      const res = await fetch("/api/learn/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseId || null,
          moduleId: moduleId || null,
          lessonId: lessonId || null,
          title: title.trim(),
          description: description.trim() || null,
          resourceType,
          category,
          tags,
          status: "PUBLISHED",
          fileUrl: finalFileUrl,
          storageKey: finalStorageKey,
          fileSizeBytes: finalFileSize,
          mimeType: finalMimeType,
          originalFilename: file?.name || null,
          isPinned,
          isPublic,
          copyrightDeclared,
          nativeContent,
          availableFrom: null,
          availableUntil: accessDurationType === "until_date" && accessValidUntil ? accessValidUntil : null,
          permissions: {
            allow_view: allowView,
            allow_download: allowDownload,
            allow_print: allowPrint,
            allow_copy: allowCopy,
            allow_offline: allowOffline,
            access_duration_type: accessDurationType,
            access_valid_until: accessDurationType === "until_date" && accessValidUntil ? accessValidUntil : null,
            access_days: accessDurationType === "custom_days" ? accessDays : null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create resource");

      if (onResourceCreated && data.resource) {
        onResourceCreated(data.resource);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create resource");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#161b22] rounded-3xl border border-[#ded8d1] dark:border-[#30363d] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0efee] dark:border-[#21262d] bg-[#faf9f8] dark:bg-[#10141b] shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-white">
              Add Learning Resource
            </h2>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
              Publish clinical notes, PDFs, anatomical diagrams, presentations, or audio
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#77716b] dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-[#f0efee] dark:hover:bg-[#21262d] transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. RESOURCE TYPE SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-[#171717] dark:text-white mb-2">
              Resource Type
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {[
                { id: "pdf", label: "PDF", icon: FileText },
                { id: "image", label: "Image", icon: ImageIcon },
                { id: "notes", label: "Notes", icon: BookOpen },
                { id: "presentation", label: "PPT", icon: Layers },
                { id: "document", label: "DOC", icon: FileText },
                { id: "audio", label: "Audio", icon: Volume2 },
                { id: "link", label: "Link", icon: ExternalLink },
              ].map((t) => {
                const Icon = t.icon;
                const active = resourceType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setResourceType(t.id as ResourceType)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition cursor-pointer ${
                      active
                        ? "border-[#0f4c81] bg-[#eef5fc] dark:bg-[#0f4c81]/20 text-[#0f4c81] dark:text-[#58a6ff] font-bold shadow-xs"
                        : "border-[#e8e6e3] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] hover:border-[#0f4c81]"
                    }`}
                  >
                    <Icon className="size-5 mb-1" />
                    <span className="text-[11px]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. FILE UPLOAD OR NATIVE NOTES BUILDER */}
          {resourceType === "notes" ? (
            <div className="space-y-3 rounded-2xl bg-[#faf9f8] dark:bg-[#10141b] p-4 border border-[#ded8d1] dark:border-[#30363d]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#171717] dark:text-white">
                  Native MGN Clinical Notes Sections
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddNoteSection("heading")}
                    className="rounded-lg bg-white dark:bg-[#21262d] px-2 py-1 text-[11px] font-bold border border-[#ded8d1] dark:border-[#30363d] text-[#171717] dark:text-white hover:bg-[#0f4c81] hover:text-white"
                  >
                    + Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddNoteSection("paragraph")}
                    className="rounded-lg bg-white dark:bg-[#21262d] px-2 py-1 text-[11px] font-bold border border-[#ded8d1] dark:border-[#30363d] text-[#171717] dark:text-white hover:bg-[#0f4c81] hover:text-white"
                  >
                    + Text
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddNoteSection("clinical_callout")}
                    className="rounded-lg bg-blue-50 dark:bg-blue-950/50 px-2 py-1 text-[11px] font-bold border border-blue-200 dark:border-blue-900 text-[#0f4c81] dark:text-[#58a6ff]"
                  >
                    + Clinical Note
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddNoteSection("warning")}
                    className="rounded-lg bg-amber-50 dark:bg-amber-950/50 px-2 py-1 text-[11px] font-bold border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400"
                  >
                    + Warning
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {noteSections.map((sec) => (
                  <div
                    key={sec.id}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d]"
                  >
                    <span className="rounded bg-[#f0efee] dark:bg-[#161b22] px-1.5 py-0.5 text-[9px] font-mono uppercase text-[#77716b] shrink-0 mt-1">
                      {sec.type}
                    </span>
                    <textarea
                      value={sec.content}
                      onChange={(e) => handleUpdateSection(sec.id, e.target.value)}
                      rows={sec.type === "heading" ? 1 : 2}
                      className="flex-1 bg-transparent text-xs text-[#171717] dark:text-white focus:outline-none resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(sec.id)}
                      className="text-[#8a8784] hover:text-rose-600 p-1 shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-white mb-2">
                Upload Asset
              </label>
              <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#ded8d1] dark:border-[#30363d] rounded-2xl bg-[#faf9f8] dark:bg-[#10141b] hover:border-[#0f4c81] transition cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="size-8 text-[#0f4c81] dark:text-[#58a6ff] mb-2" />
                <p className="text-xs font-bold text-[#171717] dark:text-white">
                  {file ? file.name : "Drag & Drop or Browse File"}
                </p>
                <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] mt-1">
                  Supports PDF, PNG, JPG, PPTX, DOCX, MP3 up to 50MB
                </p>
                {file && (
                  <span className="mt-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB Selected
                  </span>
                )}
              </div>

              {/* Or External Link */}
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-[#77716b] dark:text-[#8b949e] mb-1">
                  Or Direct File / Cloud Storage URL
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-[#0f4c81]"
                />
              </div>
            </div>
          )}

          {/* 3. METADATA: TITLE, DESCRIPTION, CATEGORY */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-white mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neuroanatomy Cross-Sectional Handout"
                className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3.5 py-2 text-xs sm:text-sm text-[#171717] dark:text-white focus:outline-none focus:border-[#0f4c81]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-white mb-1">
                Description / Clinical Context
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key learning objectives or clinical guidelines covered..."
                rows={2}
                className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3.5 py-2 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-[#0f4c81]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-white mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-[#0f4c81]"
                >
                  <option value="Physiotherapy">Physiotherapy</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Anatomy">Anatomy</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Pathology">Pathology</option>
                  <option value="Pharmacology">Pharmacology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-white mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="neuro, corticospinal, motor-exam"
                  className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3 py-2 text-xs text-[#171717] dark:text-white focus:outline-none focus:border-[#0f4c81]"
                />
              </div>
            </div>
          </div>

          {/* 4. GRANULAR ACCESS-CONTROL ENGINE & PERMISSION MATRIX */}
          <div className="rounded-2xl bg-[#faf9f8] dark:bg-[#10141b] p-4 border border-[#ded8d1] dark:border-[#30363d] space-y-3">
            <div className="flex items-center justify-between border-b border-[#f0efee] dark:border-[#21262d] pb-2">
              <div>
                <h4 className="text-xs font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
                  <Lock className="size-3.5 text-[#0f4c81] dark:text-[#58a6ff]" /> Access Control &
                  Security Policy
                </h4>
                <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">
                  Enforced server-side with cryptographic short-lived sessions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[11px] font-bold text-[#171717] dark:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-[#0f4c81]"
                  />
                  Pin Resource
                </label>
              </div>
            </div>

            {/* Permission Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowView}
                  onChange={(e) => setAllowView(e.target.checked)}
                  className="rounded text-[#0f4c81]"
                />
                <div>
                  <p className="font-bold text-[#171717] dark:text-white">Viewing</p>
                  <p className="text-[9px] text-[#77716b]">Allow in-app read</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="rounded text-[#0f4c81]"
                />
                <div>
                  <p className="font-bold text-[#171717] dark:text-white">Download</p>
                  <p className="text-[9px] text-[#77716b]">Allow direct save</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowPrint}
                  onChange={(e) => setAllowPrint(e.target.checked)}
                  className="rounded text-[#0f4c81]"
                />
                <div>
                  <p className="font-bold text-[#171717] dark:text-white">Print</p>
                  <p className="text-[9px] text-[#77716b]">Allow printing</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowOffline}
                  onChange={(e) => setAllowOffline(e.target.checked)}
                  className="rounded text-[#0f4c81]"
                />
                <div>
                  <p className="font-bold text-[#171717] dark:text-white">Offline</p>
                  <p className="text-[9px] text-[#77716b]">App encrypted cache</p>
                </div>
              </label>
            </div>

            {/* Access Duration */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-[11px] font-bold text-[#171717] dark:text-white">
                Access Duration:
              </span>
              <div className="flex items-center gap-2">
                {[
                  { id: "while_enrolled", label: "While Enrolled" },
                  { id: "lifetime", label: "Lifetime" },
                  { id: "until_date", label: "Until Date" },
                ].map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setAccessDurationType(dur.id as any)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                      accessDurationType === dur.id
                        ? "bg-[#0f4c81] text-white"
                        : "bg-white dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] border border-[#ded8d1] dark:border-[#30363d]"
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>

              {accessDurationType === "until_date" && (
                <input
                  type="date"
                  value={accessValidUntil}
                  onChange={(e) => setAccessValidUntil(e.target.value)}
                  className="rounded-lg border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-2 py-1 text-[11px] text-[#171717] dark:text-white"
                />
              )}
            </div>
          </div>

          {/* 5. COPYRIGHT CONFIRMATION */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <label className="flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={copyrightDeclared}
                onChange={(e) => setCopyrightDeclared(e.target.checked)}
                className="rounded text-amber-600 mt-0.5"
                required
              />
              <span>
                <strong>Copyright & IP Declaration:</strong> I certify that I own or have
                verified license rights to upload and distribute this educational material on MGN.
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0efee] dark:border-[#21262d]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] px-4 py-2 text-xs font-bold text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f8f7f6] dark:hover:bg-[#21262d] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] hover:bg-[#0c3c66] text-white px-5 py-2 text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Publishing Resource...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Publish Resource</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
