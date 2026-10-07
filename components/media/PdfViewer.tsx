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
  FileText,
  Search,
  Layers,
  BookOpen,
  RefreshCw,
} from "lucide-react";

interface PdfViewerProps {
  url: string;
  title?: string;
  initialPage?: number;
  allowDownload?: boolean;
  onPageChange?: (page: number, totalPages: number) => void;
  className?: string;
}

export function PdfViewer({
  url,
  title,
  initialPage = 1,
  allowDownload = true,
  onPageChange,
  className = "",
}: PdfViewerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = React.useState<any>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(initialPage);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [scale, setScale] = React.useState<number>(1.2);
  const [rotation, setRotation] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [rendering, setRendering] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = React.useState<boolean>(false);
  const [thumbnails, setThumbnails] = React.useState<string[]>([]);
  const renderTaskRef = React.useRef<any>(null);

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
        // Dynamically import pdfjs-dist on client side
        const pdfjsLib = await import("pdfjs-dist");
        
        // Configure Worker
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;
        }

        const loadingTask = pdfjsLib.getDocument({
          url,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
          enableXfa: true,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setCurrentPage(Math.min(Math.max(1, initialPage), doc.numPages));
          onPageChange?.(Math.min(Math.max(1, initialPage), doc.numPages), doc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
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
    };
  }, [url, initialPage, onPageChange]);

  // Render current page to canvas
  const renderPage = React.useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      setRendering(true);

      // Cancel ongoing render if any
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const viewport = page.getViewport({ scale, rotation });
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Fill crisp white background before rendering
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
  }, [pdfDoc, currentPage, scale, rotation]);

  React.useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Navigation handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      onPageChange?.(next, totalPages);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      onPageChange?.(prev, totalPages);
    }
  };

  const handleZoomIn = () => setScale((s) => Math.min(Number((s + 0.2).toFixed(1)), 2.5));
  const handleZoomOut = () => setScale((s) => Math.max(Number((s - 0.2).toFixed(1)), 0.6));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleResetZoom = () => setScale(1.2);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full w-full bg-[#0b0f17] text-white rounded-2xl overflow-hidden border border-[#30363d] shadow-2xl relative ${className}`}
    >
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] select-none text-xs gap-2 shrink-0 z-20">
        {/* Left: Title & Page Jump */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-lg bg-[#0f4c81]/40 text-[#58a6ff] hidden sm:inline-flex">
            <BookOpen className="size-4" />
          </span>
          <span className="font-bold truncate max-w-[140px] sm:max-w-xs text-xs text-white">
            {title || "Medical Document"}
          </span>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded-xl border border-[#30363d]">
          <button
            type="button"
            onClick={goToPrevPage}
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
            onClick={goToNextPage}
            disabled={currentPage >= totalPages || loading}
            className="p-1 rounded-lg hover:bg-[#21262d] disabled:opacity-40 transition cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Right: Zoom, Rotate, Fullscreen, Download */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="hidden sm:flex items-center gap-1 bg-[#0d1117] px-1.5 py-1 rounded-xl border border-[#30363d]">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 0.6 || loading}
              className="p-1 rounded-lg hover:bg-[#21262d] disabled:opacity-40 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="text-[10px] font-mono font-bold px-1 hover:text-[#58a6ff]"
              title="Reset Zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 2.5 || loading}
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
            className="p-1.5 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] transition cursor-pointer hidden md:flex"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] transition cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>

          {allowDownload && url && (
            <a
              href={url}
              download={title ? `${title}.pdf` : "document.pdf"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-[#0f4c81] hover:bg-[#0c3c66] text-white transition cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5"
              title="Download PDF"
            >
              <Download className="size-3.5" />
              <span className="hidden md:inline">Download</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 overflow-auto bg-[#0b0f17] flex items-center justify-center p-4 relative min-h-[450px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 text-center py-16">
            <Loader2 className="size-8 animate-spin text-[#58a6ff]" />
            <p className="text-xs font-semibold text-[#8b949e]">
              Loading medical document with PDF.js engine...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center max-w-md p-6 rounded-2xl bg-[#161b22] border border-red-900/50">
            <AlertCircle className="size-10 text-red-400" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Could not render PDF directly</h4>
              <p className="text-xs text-[#8b949e]">{error}</p>
            </div>
            {url && (
              <div className="flex items-center gap-2 pt-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-xs"
                >
                  Open in Browser Viewer
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="relative my-auto flex flex-col items-center">
            {rendering && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
                <Loader2 className="size-6 animate-spin text-[#58a6ff]" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="rounded-xl shadow-2xl transition-all duration-100 bg-white"
            />
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="px-4 py-2 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between text-[10px] text-[#8b949e] shrink-0 font-mono">
        <span>Engine: PDF.js • MGN Clinical Document Reader</span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>
    </div>
  );
}
