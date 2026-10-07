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
  Search,
  Hand,
  MousePointer,
  Sparkles,
  Focus,
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
  const loupeCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);
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

  // Targeted Area Inspection Tools
  const [isLoupeActive, setIsLoupeActive] = React.useState<boolean>(false);
  const [isPanActive, setIsPanActive] = React.useState<boolean>(false);
  const [loupePos, setLoupePos] = React.useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // Pan / Dragging state
  const isDraggingRef = React.useRef(false);
  const startDragPos = React.useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

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

      // 2. Responsive scale calculation
      const availableWidth = Math.max(containerWidth - 32, 280);
      const targetWidth = Math.min(availableWidth, 900);
      const baseFitScale = targetWidth / unscaledViewport.width;
      
      // User zoom multiplier (100% = 1.0)
      const zoomMultiplier = (currentZoom || 100) / 100;
      const effectiveScale = baseFitScale * zoomMultiplier;

      const viewport = page.getViewport({ scale: effectiveScale, rotation: currentRotation });
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

      // High-DPI canvas resolution for ultra-sharp diagrams
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

  // ── Targeted Area: Double Click / Tap to Zoom into that exact point ──
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const scrollContainer = scrollAreaRef.current;
    if (!canvas || !scrollContainer) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const ratioX = clickX / rect.width;
    const ratioY = clickY / rect.height;

    if (currentZoom <= 120) {
      // Zoom in to 220% on that exact area
      const targetZoom = 220;
      setInternalZoom(targetZoom);

      // After zoom applies, scroll directly to center the clicked area
      setTimeout(() => {
        if (canvasRef.current && scrollAreaRef.current) {
          const newWidth = canvasRef.current.offsetWidth;
          const newHeight = canvasRef.current.offsetHeight;
          const scrollTargetX = newWidth * ratioX - scrollAreaRef.current.clientWidth / 2;
          const scrollTargetY = newHeight * ratioY - scrollAreaRef.current.clientHeight / 2;
          scrollAreaRef.current.scrollTo({
            left: Math.max(0, scrollTargetX),
            top: Math.max(0, scrollTargetY),
            behavior: "smooth",
          });
        }
      }, 50);
    } else {
      // Reset zoom back to 100% fit-to-width
      setInternalZoom(100);
    }
  };

  // ── Targeted Area: Magnifier Loupe Lens Rendering ──
  const updateLoupe = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const loupeCanvas = loupeCanvasRef.current;
    if (!canvas || !loupeCanvas || !isLoupeActive) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setLoupePos((p) => ({ ...p, visible: false }));
      return;
    }

    setLoupePos({ x: clientX, y: clientY, visible: true });

    const loupeCtx = loupeCanvas.getContext("2d");
    if (!loupeCtx) return;

    const zoomFactor = 2.5; // 2.5x targeted magnification
    const loupeSize = 180; // Diameter in pixels
    const dpr = window.devicePixelRatio || 1;

    loupeCanvas.width = loupeSize * dpr;
    loupeCanvas.height = loupeSize * dpr;

    loupeCtx.save();
    loupeCtx.scale(dpr, dpr);
    loupeCtx.clearRect(0, 0, loupeSize, loupeSize);

    // Render circular clip
    loupeCtx.beginPath();
    loupeCtx.arc(loupeSize / 2, loupeSize / 2, loupeSize / 2, 0, Math.PI * 2);
    loupeCtx.clip();

    // High quality canvas source copy
    const sourceScale = canvas.width / rect.width;
    const srcW = (loupeSize / zoomFactor) * sourceScale;
    const srcH = (loupeSize / zoomFactor) * sourceScale;
    const srcX = x * sourceScale - srcW / 2;
    const srcY = y * sourceScale - srcH / 2;

    loupeCtx.fillStyle = "#ffffff";
    loupeCtx.fillRect(0, 0, loupeSize, loupeSize);

    loupeCtx.drawImage(
      canvas,
      Math.max(0, srcX),
      Math.max(0, srcY),
      srcW,
      srcH,
      0,
      0,
      loupeSize,
      loupeSize
    );

    // Crosshair in center
    loupeCtx.strokeStyle = "rgba(88, 166, 255, 0.6)";
    loupeCtx.lineWidth = 1;
    loupeCtx.beginPath();
    loupeCtx.moveTo(loupeSize / 2 - 10, loupeSize / 2);
    loupeCtx.lineTo(loupeSize / 2 + 10, loupeSize / 2);
    loupeCtx.moveTo(loupeSize / 2, loupeSize / 2 - 10);
    loupeCtx.lineTo(loupeSize / 2, loupeSize / 2 + 10);
    loupeCtx.stroke();

    loupeCtx.restore();
  };

  // ── Drag to Pan Hand Tool (Mouse & Touch) ──
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLoupeActive) return;
    if (isPanActive || currentZoom > 100) {
      isDraggingRef.current = true;
      const scrollEl = scrollAreaRef.current;
      if (scrollEl) {
        startDragPos.current = {
          x: e.clientX,
          y: e.clientY,
          scrollLeft: scrollEl.scrollLeft,
          scrollTop: scrollEl.scrollTop,
        };
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLoupeActive) {
      updateLoupe(e.clientX, e.clientY);
      return;
    }

    if (isDraggingRef.current && scrollAreaRef.current) {
      const dx = e.clientX - startDragPos.current.x;
      const dy = e.clientY - startDragPos.current.y;
      scrollAreaRef.current.scrollLeft = startDragPos.current.scrollLeft - dx;
      scrollAreaRef.current.scrollTop = startDragPos.current.scrollTop - dy;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Ctrl + Wheel Zoom at cursor coordinate
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setInternalZoom((z) => Math.min(z + 20, 350));
      } else {
        setInternalZoom((z) => Math.max(z - 20, 50));
      }
    }
  };

  // Navigation handlers
  const handlePageChange = (newPage: number) => {
    const valid = Math.min(Math.max(1, newPage), totalPages);
    if (controlledPage === undefined) {
      setInternalPage(valid);
    }
    onPageChange?.(valid, totalPages);
  };

  const handleZoomIn = () => setInternalZoom((z) => Math.min(z + 25, 350));
  const handleZoomOut = () => setInternalZoom((z) => Math.max(z - 25, 50));
  const handleRotate = () => setInternalRotation((r) => (r + 90) % 360);
  const handleResetZoom = () => setInternalZoom(100);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className={`flex flex-col h-full w-full bg-[#0b0f17] text-white overflow-hidden relative select-none ${className}`}
    >
      {/* ── OPTIONAL STANDALONE TOP TOOLBAR ── */}
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
                disabled={currentZoom >= 350 || loading}
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

      {/* ── CANVAS WORKSPACE (Centered, Targeted Area Double-Click, Drag-to-Pan) ── */}
      <div
        ref={scrollAreaRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          isDraggingRef.current = false;
          setLoupePos((p) => ({ ...p, visible: false }));
        }}
        className={`flex-1 w-full overflow-x-auto overflow-y-auto flex items-start justify-center p-2 sm:p-4 bg-[#0d1117] relative ${
          isLoupeActive
            ? "cursor-crosshair"
            : isPanActive || currentZoom > 100
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-default"
        }`}
      >
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
          <div className="w-full flex justify-center py-2 min-w-max">
            <div className="relative shadow-2xl rounded-lg overflow-hidden border border-[#30363d] bg-white transition-all duration-100 ease-out">
              <canvas
                ref={canvasRef}
                onDoubleClick={handleCanvasDoubleClick}
                title={
                  isLoupeActive
                    ? "Hover over any diagram or text for 2.5x targeted magnification"
                    : "Double click to zoom into this exact area • Drag to pan"
                }
                className="block max-w-none h-auto select-text"
              />
              {rendering && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 className="size-6 text-[#0f4c81] animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TARGETED AREA FLOATING MAGNIFIER LOUPE LENS ── */}
        {isLoupeActive && loupePos.visible && (
          <div
            className="fixed pointer-events-none z-50 rounded-full border-4 border-[#58a6ff] shadow-2xl overflow-hidden bg-white ring-4 ring-black/40"
            style={{
              left: `${loupePos.x - 90}px`,
              top: `${loupePos.y - 90}px`,
              width: "180px",
              height: "180px",
            }}
          >
            <canvas ref={loupeCanvasRef} className="w-full h-full block" />
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-[#58a6ff] font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
              2.5X LENS
            </span>
          </div>
        )}

        {/* ── TARGETED AREA QUICK ACTION TOOLBAR (Bottom Right Floating Pill) ── */}
        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#161b22]/95 backdrop-blur-md border border-[#30363d] shadow-2xl select-none">
          {/* Magnifier Loupe Tool */}
          <button
            type="button"
            onClick={() => {
              setIsLoupeActive((prev) => !prev);
              setIsPanActive(false);
            }}
            title="Targeted Magnifier Loupe (Hover over anatomical diagrams for 2.5x zoom)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isLoupeActive
                ? "bg-[#58a6ff] text-black shadow-md"
                : "bg-[#21262d] text-white/80 hover:text-white hover:bg-[#30363d]"
            }`}
          >
            <Focus className="size-3.5" />
            <span className="text-[11px]">Area Loupe</span>
          </button>

          {/* Drag-to-Pan Hand Tool */}
          <button
            type="button"
            onClick={() => {
              setIsPanActive((prev) => !prev);
              setIsLoupeActive(false);
            }}
            title="Pan / Hand Tool (Click & drag to move across zoomed diagrams)"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isPanActive || currentZoom > 100
                ? "bg-[#0f4c81] text-white shadow-md"
                : "bg-[#21262d] text-white/80 hover:text-white hover:bg-[#30363d]"
            }`}
          >
            <Hand className="size-3.5" />
            <span className="text-[11px] hidden sm:inline">Pan</span>
          </button>

          {/* Quick 200% Area Focus / Reset */}
          <button
            type="button"
            onClick={() => {
              if (currentZoom > 120) {
                handleResetZoom();
              } else {
                setInternalZoom(200);
              }
            }}
            title={currentZoom > 120 ? "Reset to Fit" : "Zoom to 200% Area Detail"}
            className="px-2.5 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white/90 text-[11px] font-mono font-bold transition cursor-pointer"
          >
            {currentZoom > 120 ? "Reset Fit" : "200% Focus"}
          </button>
        </div>
      </div>

      {/* ── OPTIONAL BOTTOM NAVIGATION ── */}
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
