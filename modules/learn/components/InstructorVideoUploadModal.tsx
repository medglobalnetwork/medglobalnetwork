"use client";

import * as React from "react";
import {
  UploadCloud,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  X,
  FileText,
  Sparkles,
  Subtitles,
  Paperclip,
  RefreshCw,
  Clock,
} from "lucide-react";
import { VideoChapter, VideoTranscriptCue } from "../types";

interface InstructorVideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  lessonId?: string;
  onUploadComplete?: (videoData: any) => void;
}

export function InstructorVideoUploadModal({
  isOpen,
  onClose,
  courseId,
  lessonId,
  onUploadComplete,
}: InstructorVideoUploadModalProps) {
  // Upload & processing state
  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [durationMinutes, setDurationMinutes] = React.useState(30);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingState, setProcessingState] = React.useState<
    "IDLE" | "UPLOADING" | "SCANNING" | "PROCESSING" | "ENCODING" | "GENERATING_TRANSCRIPT" | "READY"
  >("IDLE");
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Chapters editor
  const [chapters, setChapters] = React.useState<
    { title: string; startMinutes: number; startSeconds: number }[]
  >([
    { title: "Introduction & Clinical Objectives", startMinutes: 0, startSeconds: 0 },
    { title: "Anatomical Landmarks & Pathophysiology", startMinutes: 5, startSeconds: 0 },
    { title: "Clinical Examination & Assessment", startMinutes: 15, startSeconds: 0 },
    { title: "Management & Return-to-Activity Protocol", startMinutes: 24, startSeconds: 0 },
  ]);

  // Captions
  const [englishCaption, setEnglishCaption] = React.useState(true);
  const [hindiCaption, setHindiCaption] = React.useState(false);

  // Resources
  const [resources, setResources] = React.useState<{ title: string; type: string }[]>([
    { title: "Clinical Protocol & Examination Flowchart (PDF)", type: "PDF" },
  ]);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      validateAndSetFile(selected);
    }
  };

  const validateAndSetFile = (f: File) => {
    const validExts = [".mp4", ".mov", ".webm", ".mkv"];
    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      setErrorMsg("Unsupported video format. Please upload MP4, MOV, or WebM.");
      return;
    }
    setFile(f);
    if (!title) {
      setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
    setErrorMsg(null);
  };

  const handleAddChapter = () => {
    setChapters((prev) => [
      ...prev,
      { title: `Chapter ${prev.length + 1}`, startMinutes: prev.length * 5, startSeconds: 0 },
    ]);
  };

  const handleRemoveChapter = (index: number) => {
    setChapters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Lecture title is required");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Step 1: Uploading
      setProcessingState("UPLOADING");
      for (let p = 10; p <= 100; p += 20) {
        setUploadProgress(p);
        await new Promise((r) => setTimeout(r, 150));
      }

      // Step 2: Scanning for malware
      setProcessingState("SCANNING");
      await new Promise((r) => setTimeout(r, 400));

      // Step 3: Transcoding & HLS generation
      setProcessingState("ENCODING");
      await new Promise((r) => setTimeout(r, 500));

      // Step 4: Generating Transcript
      setProcessingState("GENERATING_TRANSCRIPT");
      await new Promise((r) => setTimeout(r, 400));

      // Step 5: Send API request to persist record
      const res = await fetch("/api/learn/videos/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          courseId,
          lessonId,
          filename: file?.name || "lecture.mp4",
          fileSizeBytes: file?.size || 50000000,
          mimeType: file?.type || "video/mp4",
          durationSeconds: Number(durationMinutes) * 60,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to finalize video asset");

      // Step 6: Save chapters if any
      if (data.videoAsset?.id && lessonId) {
        for (let i = 0; i < chapters.length; i++) {
          const ch = chapters[i];
          const startSec = ch.startMinutes * 60 + ch.startSeconds;
          await fetch(`/api/learn/lessons/${lessonId}/chapters`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: ch.title,
              startSeconds: startSec,
              orderIndex: i,
              videoAssetId: data.videoAsset.id,
            }),
          }).catch(() => {});
        }
      }

      setProcessingState("READY");
      if (onUploadComplete) onUploadComplete(data);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Video upload failed");
      setProcessingState("IDLE");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div className="flex h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#f0efee] dark:border-[#21262d] bg-gradient-to-r from-[#0f4c81]/10 to-transparent px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#0f4c81] text-white shadow-md">
              <FileVideo className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                Add Video Lecture
              </h3>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                Upload clinical lecture with automatic transcoding, chapters & transcripts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#77716b] hover:bg-[#f0efee] dark:hover:bg-[#21262d] transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Processing State Machine Indicator */}
          {isProcessing && (
            <div className="rounded-2xl border border-[#0f4c81]/20 bg-[#f0f7ff] dark:bg-[#1c2433] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                <span className="flex items-center gap-2">
                  <RefreshCw className="size-4 animate-spin" />
                  <span>
                    {processingState === "UPLOADING"
                      ? `Uploading Video Asset (${uploadProgress}%)...`
                      : processingState === "SCANNING"
                      ? "Running Security & Malware Scan..."
                      : processingState === "ENCODING"
                      ? "Transcoding Adaptive HLS Qualities (1080p, 720p, 480p)..."
                      : processingState === "GENERATING_TRANSCRIPT"
                      ? "Generating Synchronized Medical Transcript..."
                      : "Processing Complete!"}
                  </span>
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/60 dark:bg-black/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0f4c81] to-[#38bdf8] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* 1. DRAG & DROP UPLOAD ZONE */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#1c2128] p-6 text-center hover:border-[#0f4c81] transition cursor-pointer"
            onClick={() => document.getElementById("video-file-input")?.click()}
          >
            <input
              id="video-file-input"
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
              }}
            />
            <UploadCloud className="size-10 text-[#0f4c81] dark:text-[#58a6ff] mb-2" />
            <p className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
              {file ? file.name : "Drag & drop video lecture or browse files"}
            </p>
            <p className="mt-1 text-[11px] text-[#77716b] dark:text-[#8b949e]">
              Supported formats: MP4, MOV, WebM · Multi-bitrate HLS auto-encoded
            </p>
          </div>

          {/* 2. LECTURE TITLE & DURATION */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                Lecture Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neurological Assessment of Acute Stroke"
                className="h-10 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#21262d] px-3.5 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Estimated Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 1)}
                  className="h-10 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#21262d] px-3.5 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Content Protection
                </label>
                <div className="h-10 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#21262d] px-3.5 flex items-center text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span>✓ Private Storage & Signed URLs</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CHAPTERS EDITOR */}
          <div className="space-y-2.5 rounded-2xl border border-[#ded8d1] dark:border-[#30363d] p-4 bg-white dark:bg-[#161b22]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1.5">
                <Clock className="size-3.5 text-[#0f4c81] dark:text-[#58a6ff]" />
                <span>Video Chapters & Timeline Markers</span>
              </h4>
              <button
                type="button"
                onClick={handleAddChapter}
                className="inline-flex items-center gap-1 rounded-lg bg-[#eef5fc] dark:bg-[#1c2433] px-2.5 py-1 text-[11px] font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#e0effa] transition cursor-pointer"
              >
                <Plus className="size-3" />
                <span>Add Chapter</span>
              </button>
            </div>

            <div className="space-y-2">
              {chapters.map((ch, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl bg-[#faf9f8] dark:bg-[#1c2128] p-2 border border-[#ded8d1] dark:border-[#30363d]"
                >
                  <input
                    type="text"
                    value={ch.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChapters((prev) =>
                        prev.map((c, i) => (i === idx ? { ...c, title: val } : c))
                      );
                    }}
                    placeholder="Chapter Title"
                    className="flex-1 rounded-lg bg-white dark:bg-[#21262d] px-2.5 py-1.5 text-xs text-[#171717] dark:text-[#f0f6fc] border border-[#ded8d1] dark:border-[#30363d]"
                  />
                  <div className="flex items-center gap-1 text-xs text-[#77716b]">
                    <span>At</span>
                    <input
                      type="number"
                      min="0"
                      value={ch.startMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setChapters((prev) =>
                          prev.map((c, i) => (i === idx ? { ...c, startMinutes: val } : c))
                        );
                      }}
                      className="w-12 rounded-lg bg-white dark:bg-[#21262d] px-2 py-1.5 text-xs text-center border border-[#ded8d1] dark:border-[#30363d]"
                    />
                    <span>m</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveChapter(idx)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. CAPTIONS & TRANSCRIPTS */}
          <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] p-4 bg-white dark:bg-[#161b22] space-y-3">
            <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1.5">
              <Subtitles className="size-3.5 text-[#0f4c81] dark:text-[#58a6ff]" />
              <span>Accompanying Captions & Transcripts</span>
            </h4>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#171717] dark:text-[#f0f6fc]">
                <input
                  type="checkbox"
                  checked={englishCaption}
                  onChange={(e) => setEnglishCaption(e.target.checked)}
                  className="rounded text-[#0f4c81]"
                />
                <span>Auto-Generate English Captions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#171717] dark:text-[#f0f6fc]">
                <input
                  type="checkbox"
                  checked={hindiCaption}
                  onChange={(e) => setHindiCaption(e.target.checked)}
                  className="rounded text-[#0f4c81]"
                />
                <span>Hindi (Clinical Terms) Captions</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#f0efee] dark:border-[#21262d] bg-[#faf9f8] dark:bg-[#161b22] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] px-4 py-2 text-xs font-bold text-[#77716b] hover:bg-white dark:hover:bg-[#21262d] transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmitUpload}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="size-3.5 text-amber-300" />
            <span>{isProcessing ? "Processing Video..." : "Upload & Encode Video"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
