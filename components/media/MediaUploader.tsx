// components/media/MediaUploader.tsx
"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Film,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useMediaUpload, UploadResult } from "@/lib/use-media-upload";

export interface MediaUploaderProps {
  folder?: string;
  maxSizeBytes?: number; // default 50MB
  allowedTypes?: ("image" | "video" | "pdf")[];
  onUploadComplete?: (result: UploadResult) => void;
  className?: string;
}

export function MediaUploader({
  folder = "posts",
  maxSizeBytes = 50 * 1024 * 1024, // 50MB
  allowedTypes = ["image", "video", "pdf"],
  onUploadComplete,
  className = "",
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedResult, setUploadedResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { uploadFile, isUploading, progress, error, reset } = useMediaUpload({
    folder,
    onSuccess: (result) => {
      setUploadedResult(result);
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    },
  });

  const getAcceptMimeTypes = () => {
    const list: string[] = [];
    if (allowedTypes.includes("image")) list.push("image/*");
    if (allowedTypes.includes("video")) list.push("video/mp4,video/webm,video/quicktime");
    if (allowedTypes.includes("pdf")) list.push("application/pdf");
    return list.join(",");
  };

  const handleFileSelect = (file: File) => {
    if (file.size > maxSizeBytes) {
      alert(`File size exceeds ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB limit.`);
      return;
    }

    setSelectedFile(file);
    setUploadedResult(null);

    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    await uploadFile(selectedFile);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedResult(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-5 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptMimeTypes()}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {!selectedFile ? (
        // Dropzone Area
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-slate-700 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-950/60"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-white">Click or drag & drop file to upload</h4>
          <p className="mt-1 text-xs text-slate-400">
            Supports {allowedTypes.join(", ").toUpperCase()} (up to {(maxSizeBytes / 1024 / 1024).toFixed(0)}MB)
          </p>
        </div>
      ) : (
        // Selected File Preview & Controls
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-950 p-3.5 border border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              {selectedFile.type.startsWith("image/") ? (
                previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-12 w-12 rounded-lg object-cover border border-slate-800 shrink-0"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-blue-400 shrink-0" />
                )
              ) : selectedFile.type.startsWith("video/") ? (
                <Film className="h-6 w-6 text-purple-400 shrink-0" />
              ) : (
                <FileText className="h-6 w-6 text-amber-400 shrink-0" />
              )}

              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || "file"}
                </p>
              </div>
            </div>

            {!isUploading && !uploadedResult && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading directly to R2...
                </span>
                <span className="font-mono text-slate-400">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-blue-600 transition-all duration-150 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Banner */}
          {uploadedResult && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 overflow-hidden">
                <span className="font-bold block">Upload Complete!</span>
                <p className="text-[11px] font-mono text-emerald-400/90 truncate">
                  CDN URL: {uploadedResult.publicUrl}
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Upload Failed</span>
                <p className="text-[11px] text-rose-400/90">{error}</p>
              </div>
            </div>
          )}

          {/* Action CTA */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {!uploadedResult ? (
              <button
                type="button"
                onClick={handleStartUpload}
                disabled={isUploading}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Upload to Cloudflare R2</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
              >
                Upload Another File
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
