// ============================================================
// Direct Cloudflare R2 Upload Hook
// lib/use-media-upload.ts
//
// Handles pre-signed URL generation and direct binary streaming
// to Cloudflare R2 with real-time percentage progress tracking.
// ============================================================

import { useState, useCallback } from "react";

export interface UploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  mediaType: "image" | "video" | "pdf" | "other";
}

export interface UseMediaUploadOptions {
  folder?: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function useMediaUpload(options: UseMediaUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getMediaType = (mime: string): "image" | "video" | "pdf" | "other" => {
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime === "application/pdf") return "pdf";
    return "other";
  };

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Step 1: Request pre-signed URL from Next.js backend
        const presignRes = await fetch("/api/media/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            folder: options.folder || "posts",
          }),
        });

        if (!presignRes.ok) {
          const errData = await presignRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to obtain pre-signed upload URL");
        }

        const { uploadUrl, publicUrl, key } = await presignRes.json();

        // Step 2: Upload file directly to Cloudflare R2 using XMLHttpRequest for real-time progress
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl, true);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setProgress(100);
              resolve();
            } else {
              reject(new Error(`R2 upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error("Network error during direct Cloudflare R2 upload. Check bucket CORS."));
          };

          xhr.send(file);
        });

        const result: UploadResult = {
          uploadUrl,
          publicUrl,
          key,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          mediaType: getMediaType(file.type),
        };

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err: any) {
        const errorMsg = err.message || "An unexpected error occurred during upload";
        setError(errorMsg);
        if (options.onError) {
          options.onError(errorMsg);
        }
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    reset,
  };
}
