"use client";

import * as React from "react";
import { X, UploadCloud, Link as LinkIcon, Check, Image as ImageIcon, Trash2, Sparkles, Loader2 } from "lucide-react";
import { useMediaUpload } from "@/lib/use-media-upload";
import CallChip from "@/components/ui/CallChip";

interface ImageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  currentImageUrl?: string | null;
  folder?: string;
  aspectRatio?: "square" | "cover";
  presets?: { label: string; url: string }[];
  onSelect: (url: string) => void;
  onRemove?: () => void;
}

export function ImageSelectorModal({
  isOpen,
  onClose,
  title = "Select Image",
  description = "Upload an image from your device or enter a web URL.",
  currentImageUrl,
  folder = "avatars",
  aspectRatio = "square",
  presets = [],
  onSelect,
  onRemove,
}: ImageSelectorModalProps) {
  const [activeTab, setActiveTab] = React.useState<"upload" | "url" | "presets">("upload");
  const [urlInput, setUrlInput] = React.useState(currentImageUrl || "");
  const [previewUrl, setPreviewUrl] = React.useState(currentImageUrl || "");
  const [urlError, setUrlError] = React.useState<string | null>(null);
  const [uploadingFileName, setUploadingFileName] = React.useState<string | null>(null);
  const [callStatus, setCallStatus] = React.useState<"idle" | "running" | "done" | "error">("idle");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress, error: uploadError } = useMediaUpload({
    folder,
    onSuccess: (result) => {
      setPreviewUrl(result.publicUrl);
      setUrlInput(result.publicUrl);
      setCallStatus("done");
    },
    onError: () => {
      setCallStatus("error");
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      setUrlInput(currentImageUrl || "");
      setPreviewUrl(currentImageUrl || "");
      setUrlError(null);
    }
  }, [isOpen, currentImageUrl]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUrlError("Please select a valid image file (JPEG, PNG, WebP, GIF)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUrlError("Image size must be less than 10MB");
      return;
    }

    setUrlError(null);
    setUploadingFileName(file.name);
    setCallStatus("running");
    // Instant preview while upload is in progress
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);
    setUrlInput(tempUrl);

    const result = await uploadFile(file);
    if (result && result.publicUrl) {
      setPreviewUrl(result.publicUrl);
      setUrlInput(result.publicUrl);
      setCallStatus("done");
    } else {
      setCallStatus("error");
    }
  };

  const handleApply = () => {
    const finalUrl = previewUrl || urlInput.trim();
    if (!finalUrl) {
      setUrlError("Please upload an image or enter a valid URL");
      return;
    }
    onSelect(finalUrl);
    onClose();
  };

  const handleRemove = () => {
    onRemove?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-[#e8e6e3] overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0efee] px-6 py-4 bg-[#fcfbf9]">
          <div>
            <h3 className="text-base font-bold text-[#171717]">{title}</h3>
            <p className="text-xs text-[#77716b]">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#f0efee] px-6 pt-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "upload"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "url"
                ? "border-[#1769c2] text-[#1769c2]"
                : "border-transparent text-[#77716b] hover:text-[#171717]"
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            <span>Image URL</span>
          </button>

          {presets.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                activeTab === "presets"
                  ? "border-[#1769c2] text-[#1769c2]"
                  : "border-transparent text-[#77716b] hover:text-[#171717]"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Presets</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* 1. Local Upload Tab */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#ded8d1] bg-[#faf9f8] p-8 text-center cursor-pointer hover:border-[#1769c2] hover:bg-blue-50/20 transition group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1769c2] mb-3 group-hover:scale-105 transition">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <UploadCloud className="h-6 w-6 stroke-[2]" />
                  )}
                </div>
                <p className="text-xs font-bold text-[#171717]">
                  {isUploading ? "Uploading..." : "Click or drag image to upload"}
                </p>
                <p className="mt-1 text-[11px] text-[#77716b]">
                  Supports JPG, PNG, WebP or GIF (Up to 10MB)
                </p>

                {isUploading && (
                  <div className="w-full max-w-xs mt-4">
                    <div className="h-1.5 w-full rounded-full bg-[#ded8d1] overflow-hidden">
                      <div
                        className="h-full bg-[#1769c2] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1769c2] mt-1 block">
                      {progress}% uploaded
                    </span>
                  </div>
                )}
              </div>

              {(isUploading || uploadingFileName) && (
                <div className="flex justify-center pt-1 animate-fade-in">
                  <CallChip
                    icon="image"
                    name={isUploading ? "Uploading" : callStatus === "done" ? "Uploaded" : "Failed"}
                    argument={uploadingFileName || "image.jpg"}
                    status={isUploading ? "running" : uploadError ? "error" : callStatus}
                    expectedMs={2200}
                    showTimer
                    surfaceColor="#f0efee"
                    color="#171717"
                    progressColor="#0f4c81"
                    doneColor="#16804d"
                    errorColor="#ef4444"
                    onRetry={() => {
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* 2. URL Input Tab */}
          {activeTab === "url" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5d5854] mb-1">
                  Web Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or https://example.com/photo.jpg"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setPreviewUrl(e.target.value);
                      setUrlError(null);
                    }}
                    className="flex-1 rounded-xl border border-[#ded8d1] px-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#1769c2]"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(urlInput.trim())}
                    className="rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3 py-2 text-xs font-bold text-[#171717] hover:bg-[#eee]"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Presets Tab */}
          {activeTab === "presets" && presets.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPreviewUrl(preset.url);
                    setUrlInput(preset.url);
                  }}
                  className={`relative rounded-xl overflow-hidden border-2 p-1 cursor-pointer transition ${
                    previewUrl === preset.url
                      ? "border-[#1769c2] shadow-xs ring-2 ring-[#1769c2]/20"
                      : "border-[#e8e6e3] hover:border-[#ded8d1]"
                  }`}
                >
                  <div className="h-16 w-full rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-center text-[#171717] truncate">
                    {preset.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Error display */}
          {(urlError || uploadError) && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-800">
              {urlError || uploadError}
            </div>
          )}

          {/* Live Preview Box */}
          {previewUrl && (
            <div className="rounded-2xl border border-[#e8e6e3] bg-[#faf9f8] p-4">
              <span className="text-[10px] font-bold text-[#77716b] uppercase block mb-2">
                Live Preview
              </span>
              <div className="flex items-center justify-center">
                {aspectRatio === "square" ? (
                  <div className="size-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-100">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={() => setUrlError("Failed to load image from URL. Please check the link.")}
                    />
                  </div>
                ) : (
                  <div className="h-28 w-full rounded-2xl overflow-hidden border border-[#ded8d1] shadow-xs bg-slate-100">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={() => setUrlError("Failed to load image from URL. Please check the link.")}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#f0efee] px-6 py-4 bg-[#fcfbf9]">
          {onRemove && currentImageUrl ? (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isUploading || (!previewUrl && !urlInput)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#12569f] transition active:scale-95 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>Apply Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
