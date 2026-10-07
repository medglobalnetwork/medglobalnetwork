"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Download,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";

export interface PdfViewerProps {
  url: string;
  title?: string;
  page?: number;
  initialPage?: number;
  zoom?: number;
  rotation?: number;
  hideToolbar?: boolean;
  hideBottomControls?: boolean;
  allowDownload?: boolean;
  onPageChange?: (page: number, totalPages: number) => void;
  className?: string;
}

export function PdfViewer({
  url,
  title,
  page: controlledPage,
  initialPage = 1,
  zoom: controlledZoom,
  rotation: controlledRotation,
  hideToolbar = false,
  hideBottomControls = false,
  allowDownload = true,
  onPageChange,
  className = "",
}: PdfViewerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const renderTaskRef = React.useRef<any>(null);
  const loadingTaskRef = React.useRef<any>(null);

  const [pdfDoc, setPdfDoc] = React.useState<any>(null);
  const [internalPage, setInternalPage] = React.useState<number>(initialPage);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [internalZoom, setInternalZoom] = React.useState<number>(100);
  const [internalRotation, setInternalRotation] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [rendering, setRendering] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(800);

  // Use controlled or internal state
  const currentPage = controlledPage !== undefined ? controlledPage : internalPage;
  const currentZoom = controlledZoom !== undefined ? controlledZoom : internalZoom;
  const currentRotation = controlledRotation !== undefined ? controlledRotation : internalRotation;

  // Sync internal page when initialPage changes
  React.useEffect(() => {
    if (controlledPage === undefined) {
      setInternalPage(initialPage);
    }
  }, [initialPage, controlledPage]);

  // Track container width for responsive fit-to-width
  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize PDF.js
  React.useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      if (!url) {
        setError("No document URL provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const pdfjsLib = await import("pdfjs-dist");
        // Use locally served worker to prevent CSP / CORS blocks
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

        if (loadingTaskRef.current) {
          try {
            loadingTaskRef.current.destroy();
          } catch {
            // ignore
          }
        }

        const loadingTask = pdfjsLib.getDocument({
          url,
          cMapUrl: "/pdfjs/cmaps/",
          cMapPacked: true,
          enableXfa: true,
        });
        loadingTaskRef.current = loadingTask;

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          const initialTargetPage = Math.min(Math.max(1, currentPage), doc.numPages);
          if (controlledPage === undefined) {
            setInternalPage(initialTargetPage);
          }
          onPageChange?.(initialTargetPage, doc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        if (isCancelled || err?.name === "AbortException" || err?.name === "WorkerTransportClosedException") {
          return;
        }
        console.error("PDF.js loading failed:", err);
        if (!isCancelled) {
          setError(err.message || "Failed to load PDF with PDF.js engine");
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
      if (loadingTaskRef.current) {
        try {
          loadingTaskRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [url]);

  // Render current page to canvas with responsive fit-to-width
  const renderPage = React.useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || currentPage < 1) return;

    try {
      setRendering(true);

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }

      const validPageNumber = Math.min(Math.max(1, currentPage), pdfDoc.numPages);
      const page = await pdfDoc.getPage(validPageNumber);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      // 1. Calculate unscaled viewport
      const unscaledViewport = page.getViewport({ scale: 1, rotation: currentRotation });

      // 2. Responsive scale calculation:
      // Fit to container width (desktop capped at 900px, mobile 100%)
      const availableWidth = Math.max(containerWidth - 32, 280);
      const targetWidth = Math.min(availableWidth, 900);
      const baseFitScale = targetWidth / unscaledViewport.width;
      
      // User zoom multiplier (100% = 1.0)
      const zoomMultiplier = (currentZoom || 100) / 100;
      const effectiveScale = baseFitScale * zoomMultiplier;

      const viewport = page.getViewport({ scale: effectiveScale, rotation: currentRotation });
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

      // High-DPI canvas resolution
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clean crisp white page background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, viewport.width, viewport.height);

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      ctx.restore();
      setRendering(false);
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("PDF render error:", err);
      }
      setRendering(false);
    }
  }, [pdfDoc, currentPage, currentZoom, currentRotation, containerWidth]);

  React.useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Internal Navigation handlers
  const handlePageChange = (newPage: number) => {
    const valid = Math.min(Math.max(1, newPage), totalPages);
    if (controlledPage === undefined) {
      setInternalPage(valid);
    }
    onPageChange?.(valid, totalPages);
  };

  const handleZoomIn = () => setInternalZoom((z) => Math.min(z + 20, 250));
  const handleZoomOut = () => setInternalZoom((z) => Math.max(z - 20, 50));
  const handleRotate = () => setInternalRotation((r) => (r + 90) % 360);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full w-full bg-[#0b0f17] text-white overflow-hidden relative select-none ${className}`}
    >
      {/* ── OPTIONAL TOP TOOLBAR (Used when standalone, hidden in modals) ── */}
      {!hideToolbar && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] select-none text-xs gap-2 shrink-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 rounded-lg bg-[#0f4c81]/40 text-[#58a6ff] hidden sm:inline-flex">
              <BookOpen className="size-4" />
            </span>
            <span className="font-bold truncate max-w-[140px] sm:max-w-xs text-xs text-white">
              {title || "Medical Document"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded-xl border border-[#30363d]">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="p-1 rounded-lg hover:bg-[#21262d] disabled:opacity-40 transition cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-[11px] font-mono font-bold px-1.5 whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="p-1 rounded-lg hover:bg-[#21262d] disabled:opacity-40 transition cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="hidden sm:flex items-center gap-1 bg-[#0d1117] px-1.5 py-1 rounded-xl border border-[#30363d]">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={currentZoom <= 50 || loading}
                className="p-1 rounded-lg hover:bg-[#21262d] disabled:opacity-40 transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <span className="font-mono text-[10px] text-white/70 px-1 font-bold">
                {currentZoom}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={currentZoom >= 250 || loading}
                className="p-1 rounded-lg hover:bg-[#21262d] disabled:opacity-40 transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleRotate}
              disabled={loading}
              className="p-1.5 rounded-xl bg-[#0d1117] border border-[#30363d] hover:bg-[#21262d] transition cursor-pointer text-white/80"
              title="Rotate 90°"
            >
              <RotateCw className="size-3.5" />
            </button>

            {allowDownload && url && (
              <a
                href={url}
                download={title || "document.pdf"}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-xl bg-[#0f4c81] hover:bg-[#1565c0] text-white font-bold transition flex items-center gap-1.5 text-[11px]"
              >
                <Download className="size-3" />
                <span className="hidden md:inline">Download</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── CANVAS WORKSPACE (Centered, Fit-to-Width, No Overflow) ── */}
      <div className="flex-1 w-full overflow-x-hidden overflow-y-auto flex items-start justify-center p-2 sm:p-4 bg-[#0d1117]">
        {loading ? (
          <div className="flex flex-col items-center justify-center m-auto py-20 space-y-3">
            <Loader2 className="size-9 text-[#58a6ff] animate-spin" />
            <p className="text-xs text-white/70 font-medium font-sans">
              Loading document with PDF.js engine...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center m-auto py-16 max-w-sm text-center p-6 rounded-2xl bg-[#161b22] border border-rose-500/30 space-y-2">
            <AlertCircle className="size-8 text-rose-400" />
            <h4 className="text-sm font-bold text-white">Document Error</h4>
            <p className="text-xs text-rose-300">{error}</p>
          </div>
        ) : (
          <div className="w-full flex justify-center py-2">
            <div className="relative shadow-2xl rounded-lg overflow-hidden border border-[#30363d] bg-white transition-all duration-150 ease-out">
              <canvas
                ref={canvasRef}
                className="block max-w-full h-auto mx-auto select-text cursor-default"
              />
              {rendering && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 className="size-6 text-[#0f4c81] animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── OPTIONAL BOTTOM NAVIGATION (Only if !hideToolbar and !hideBottomControls) ── */}
      {!hideToolbar && !hideBottomControls && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-t border-[#30363d] select-none text-xs text-white/70">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="px-3 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white disabled:opacity-30 cursor-pointer flex items-center gap-1 text-[11px]"
          >
            <ChevronLeft className="size-3.5" /> Previous
          </button>
          <span className="font-mono text-[11px]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="px-3 py-1 rounded-lg bg-[#0f4c81] hover:bg-[#1565c0] text-white disabled:opacity-30 cursor-pointer flex items-center gap-1 text-[11px]"
          >
            Next <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
