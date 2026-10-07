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
  Printer,
  Loader2,
  AlertCircle,
  BookOpen,
  Search,
  Hand,
  Focus,
  PanelLeft,
  PanelLeftClose,
  FileText,
  ListTree,
  Info,
  X,
  Sparkles,
  Bookmark,
  Edit,
  Flag,
  Lock,
  ShieldCheck,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export interface PdfViewerProps {
  url: string;
  title?: string;
  category?: string;
  version?: number;
  page?: number;
  initialPage?: number;
  zoom?: number;
  rotation?: number;
  hideToolbar?: boolean;
  hideBottomControls?: boolean;
  allowDownload?: boolean;
  allowPrint?: boolean;
  allowCopy?: boolean;
  isStudentPreview?: boolean;
  isOwner?: boolean;
  isBookmarked?: boolean;
  onEditResource?: () => void;
  onAskAI?: () => void;
  onToggleBookmark?: () => void;
  onReport?: () => void;
  onClose?: () => void;
  onPageChange?: (page: number, totalPages: number) => void;
  className?: string;
}

interface OutlineItem {
  title: string;
  dest?: any;
  items?: OutlineItem[];
}

interface SearchMatch {
  pageNumber: number;
  matchIndex: number;
}

export function PdfViewer({
  url,
  title,
  category,
  version = 1,
  page: controlledPage,
  initialPage = 1,
  zoom: controlledZoom,
  rotation: controlledRotation,
  hideToolbar = false,
  hideBottomControls = false,
  allowDownload = false,
  allowPrint = false,
  allowCopy = true,
  isStudentPreview = false,
  isOwner = false,
  isBookmarked = false,
  onEditResource,
  onAskAI,
  onToggleBookmark,
  onReport,
  onClose,
  onPageChange,
  className = "",
}: PdfViewerProps) {
  // Container & Canvas Refs
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = React.useRef<HTMLDivElement | null>(null);
  const loupeCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);
  const renderTaskRef = React.useRef<any>(null);
  const loadingTaskRef = React.useRef<any>(null);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  // Core State
  const [pdfDoc, setPdfDoc] = React.useState<any>(null);
  const [internalPage, setInternalPage] = React.useState<number>(initialPage);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [pageInputVal, setPageInputVal] = React.useState<string>(String(initialPage));
  const [internalZoom, setInternalZoom] = React.useState<number>(100);
  const [fitMode, setFitMode] = React.useState<"fit-width" | "fit-page" | "custom">("fit-width");
  const [internalRotation, setInternalRotation] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [rendering, setRendering] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(800);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);

  // Left Sidebar State
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = React.useState<"thumbnails" | "outline" | "info">("thumbnails");
  const [outline, setOutline] = React.useState<OutlineItem[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = React.useState<{ [page: number]: string }>({});

  // Search State
  const [isSearchOpen, setIsSearchOpen] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [searchResults, setSearchResults] = React.useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = React.useState<number>(0);
  const [isSearching, setIsSearching] = React.useState<boolean>(false);

  // Text layer items for current page
  const [pageTextItems, setPageTextItems] = React.useState<
    Array<{ str: string; x: number; y: number; width: number; height: number }>
  >([]);

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

  // Effective controlled values
  const currentPage = controlledPage !== undefined ? controlledPage : internalPage;
  const currentZoom = controlledZoom !== undefined ? controlledZoom : internalZoom;
  const currentRotation = controlledRotation !== undefined ? controlledRotation : internalRotation;

  // Clean formatted display title
  const displayTitle = React.useMemo(() => {
    if (!title) return "Medical Learning Resource";
    if (/^[a-zA-Z0-9_-]{18,}\.pdf$/i.test(title) || /^[a-zA-Z0-9]{22,}/.test(title)) {
      if (category && category.toLowerCase() !== "general") {
        return `Competency-Based Guide to ${category.replace(/_/g, " ")}`;
      }
      return "BD Chaurasia's Human Anatomy • Volume 1 (9th Edition)";
    }
    return title.replace(/\.pdf$/i, "");
  }, [title, category]);

  // Sync internal page & input
  React.useEffect(() => {
    setPageInputVal(String(currentPage));
  }, [currentPage]);

  // Container width observer
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

  // Initialize PDF.js document
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

          // Fetch document outline / TOC
          try {
            const docOutline = await doc.getOutline();
            if (docOutline && Array.isArray(docOutline)) {
              setOutline(docOutline);
            }
          } catch {
            // Outline optional
          }

          setLoading(false);
        }
      } catch (err: any) {
        if (isCancelled || err?.name === "AbortException" || err?.name === "WorkerTransportClosedException") {
          return;
        }
        console.error("PDF.js load error:", err);
        if (!isCancelled) {
          setError(err.message || "Failed to load PDF document");
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

  // Page navigation handler
  const handlePageChange = React.useCallback(
    (targetPage: number) => {
      if (!pdfDoc) return;
      const validPage = Math.min(Math.max(1, targetPage), pdfDoc.numPages);
      if (controlledPage === undefined) {
        setInternalPage(validPage);
      }
      setPageInputVal(String(validPage));
      onPageChange?.(validPage, pdfDoc.numPages);
      // Scroll to top of viewer
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = 0;
      }
    },
    [pdfDoc, controlledPage, onPageChange]
  );

  // Jump by input
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInputVal, 10);
    if (!isNaN(parsed)) {
      handlePageChange(parsed);
    } else {
      setPageInputVal(String(currentPage));
    }
  };

  // Render current page to canvas & calculate text layer
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
      const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
      if (!ctx) return;

      // 1. Calculate unscaled viewport
      const unscaledViewport = page.getViewport({ scale: 1, rotation: currentRotation });

      // 2. Fit mode / zoom calculation
      let calculatedScale = 1.0;
      const availableWidth = Math.max(containerWidth - (sidebarOpen ? 300 : 40), 280);

      if (fitMode === "fit-width") {
        const targetWidth = Math.min(availableWidth, 960);
        calculatedScale = (targetWidth / unscaledViewport.width) * ((currentZoom || 100) / 100);
      } else if (fitMode === "fit-page") {
        const containerHeight = scrollAreaRef.current?.clientHeight || 700;
        const scaleH = (containerHeight - 60) / unscaledViewport.height;
        const scaleW = availableWidth / unscaledViewport.width;
        calculatedScale = Math.min(scaleH, scaleW) * ((currentZoom || 100) / 100);
      } else {
        const baseWidth = Math.min(availableWidth, 900);
        calculatedScale = (baseWidth / unscaledViewport.width) * ((currentZoom || 100) / 100);
      }

      const viewport = page.getViewport({ scale: calculatedScale, rotation: currentRotation });
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

      // Canvas high-res sizing
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      ctx.save();
      ctx.scale(dpr, dpr);
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

      // Extract text content for selectable text layer & search
      try {
        const textContent = await page.getTextContent();
        if (textContent && textContent.items) {
          const items = textContent.items.map((item: any) => {
            const tx = item.transform;
            const x = tx[4] * calculatedScale;
            const y = viewport.height - tx[5] * calculatedScale - (item.height || 12) * calculatedScale;
            return {
              str: item.str,
              x,
              y,
              width: item.width * calculatedScale,
              height: (item.height || 12) * calculatedScale,
            };
          });
          setPageTextItems(items);
        }
      } catch {
        setPageTextItems([]);
      }

      setRendering(false);
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("PDF render error:", err);
      }
      setRendering(false);
    }
  }, [pdfDoc, currentPage, currentZoom, currentRotation, containerWidth, fitMode, sidebarOpen]);

  React.useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Generate thumbnail on-demand
  const renderThumbnail = React.useCallback(
    async (pageIndex: number, canvasEl: HTMLCanvasElement | null) => {
      if (!pdfDoc || !canvasEl) return;
      try {
        const page = await pdfDoc.getPage(pageIndex);
        const unscaled = page.getViewport({ scale: 1 });
        const scale = 140 / unscaled.width;
        const viewport = page.getViewport({ scale });
        canvasEl.width = viewport.width;
        canvasEl.height = viewport.height;
        const ctx = canvasEl.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, viewport.width, viewport.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
        }
      } catch {
        // ignore
      }
    },
    [pdfDoc]
  );

  // Search execution across all document pages
  const handlePerformSearch = React.useCallback(
    async (query: string) => {
      if (!pdfDoc || !query.trim()) {
        setSearchResults([]);
        setCurrentMatchIndex(0);
        return;
      }

      setIsSearching(true);
      const matches: SearchMatch[] = [];
      const lowerQuery = query.toLowerCase();

      try {
        for (let p = 1; p <= pdfDoc.numPages; p++) {
          const page = await pdfDoc.getPage(p);
          const textContent = await page.getTextContent();
          const pageString = textContent.items
            .map((item: any) => item.str)
            .join(" ")
            .toLowerCase();

          let matchIdx = pageString.indexOf(lowerQuery);
          let count = 0;
          while (matchIdx !== -1 && count < 20) {
            matches.push({ pageNumber: p, matchIndex: count });
            count++;
            matchIdx = pageString.indexOf(lowerQuery, matchIdx + lowerQuery.length);
          }
        }

        setSearchResults(matches);
        setCurrentMatchIndex(0);
        if (matches.length > 0) {
          handlePageChange(matches[0].pageNumber);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [pdfDoc, handlePageChange]
  );

  // Next / Previous search match
  const handleNextSearchMatch = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchResults.length;
    setCurrentMatchIndex(nextIdx);
    handlePageChange(searchResults[nextIdx].pageNumber);
  };

  const handlePrevSearchMatch = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentMatchIndex(prevIdx);
    handlePageChange(searchResults[prevIdx].pageNumber);
  };

  // Keyboard Shortcuts (Ctrl+F, Ctrl+-, Ctrl++, Arrow Keys, Escape)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F / Cmd+F -> Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
        return;
      }
      // Escape -> Close search or Loupe
      if (e.key === "Escape") {
        if (isSearchOpen) {
          setIsSearchOpen(false);
          return;
        }
        if (isLoupeActive) {
          setIsLoupeActive(false);
          return;
        }
      }
      // Ctrl + Wheel / + / -
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setInternalZoom((prev) => Math.min(prev + 25, 400));
        setFitMode("custom");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setInternalZoom((prev) => Math.max(prev - 25, 25));
        setFitMode("custom");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setInternalZoom(100);
        setFitMode("fit-width");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, isLoupeActive]);

  // Zoom preset handlers
  const handleZoomPreset = (val: string) => {
    if (val === "fit-width") {
      setFitMode("fit-width");
      setInternalZoom(100);
    } else if (val === "fit-page") {
      setFitMode("fit-page");
      setInternalZoom(100);
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        setFitMode("custom");
        setInternalZoom(num);
      }
    }
  };

  // Rotate handler
  const handleRotate = () => {
    setInternalRotation((prev) => (prev + 90) % 360);
  };

  // Print handler
  const handlePrint = () => {
    if (!allowPrint) return;
    window.print();
  };

  // Download handler
  const handleDownload = () => {
    if (!allowDownload || !url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${displayTitle.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Pan / Dragging mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPanActive && currentZoom <= 100) return;
    isDraggingRef.current = true;
    startDragPos.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: scrollAreaRef.current?.scrollLeft || 0,
      scrollTop: scrollAreaRef.current?.scrollTop || 0,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Pan logic
    if (isDraggingRef.current && scrollAreaRef.current) {
      const dx = e.clientX - startDragPos.current.x;
      const dy = e.clientY - startDragPos.current.y;
      scrollAreaRef.current.scrollLeft = startDragPos.current.scrollLeft - dx;
      scrollAreaRef.current.scrollTop = startDragPos.current.scrollTop - dy;
    }

    // 2. Magnifier Loupe logic
    if (isLoupeActive && canvasRef.current && loupeCanvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        setLoupePos({
          x: clientX - rect.left,
          y: clientY - rect.top,
          visible: true,
        });

        const loupeCtx = loupeCanvasRef.current.getContext("2d", { willReadFrequently: true });
        if (loupeCtx) {
          const lSize = 180;
          const zoomFactor = 2.5;
          loupeCanvasRef.current.width = lSize;
          loupeCanvasRef.current.height = lSize;

          loupeCtx.clearRect(0, 0, lSize, lSize);
          loupeCtx.save();

          // Circular clip
          loupeCtx.beginPath();
          loupeCtx.arc(lSize / 2, lSize / 2, lSize / 2 - 2, 0, Math.PI * 2);
          loupeCtx.clip();

          // Fill clean background
          loupeCtx.fillStyle = "#ffffff";
          loupeCtx.fillRect(0, 0, lSize, lSize);

          // Draw scaled portion from main canvas
          const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
          const srcX = (clientX - rect.left) * dpr - (lSize / (2 * zoomFactor)) * dpr;
          const srcY = (clientY - rect.top) * dpr - (lSize / (2 * zoomFactor)) * dpr;
          const srcW = (lSize / zoomFactor) * dpr;
          const srcH = (lSize / zoomFactor) * dpr;

          loupeCtx.drawImage(
            canvasRef.current,
            Math.max(0, srcX),
            Math.max(0, srcY),
            srcW,
            srcH,
            0,
            0,
            lSize,
            lSize
          );

          // Outer ring & crosshair
          loupeCtx.restore();
          loupeCtx.beginPath();
          loupeCtx.arc(lSize / 2, lSize / 2, lSize / 2 - 2, 0, Math.PI * 2);
          loupeCtx.lineWidth = 4;
          loupeCtx.strokeStyle = "#58a6ff";
          loupeCtx.stroke();
        }
      } else {
        setLoupePos((prev) => ({ ...prev, visible: false }));
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col w-full h-full bg-[#0d1117] text-white select-none overflow-hidden ${className}`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. GOOGLE DRIVE / CHROME STYLE UNIFIED TOP TOOLBAR
      ───────────────────────────────────────────────────────────── */}
      {!hideToolbar && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] z-30 shrink-0 gap-2 select-none shadow-md">
          {/* LEFT: Sidebar Toggle & Document Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              title={sidebarOpen ? "Close Sidebar (Thumbnails & Outline)" : "Open Sidebar (Thumbnails & Outline)"}
              className={`p-2 rounded-xl transition cursor-pointer ${
                sidebarOpen
                  ? "bg-[#0f4c81] text-white shadow-xs"
                  : "bg-[#21262d] text-white/70 hover:text-white hover:bg-[#30363d]"
              }`}
            >
              {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeft className="size-4" />}
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-[#0f4c81]/20 text-[#58a6ff] shrink-0 hidden xs:block">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[220px] md:max-w-[340px]">
                  {displayTitle}
                </h1>
                <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-mono">
                  <span>v{version}.0</span>
                  {allowDownload ? (
                    <span className="text-emerald-400 font-bold hidden sm:inline">• Download Allowed</span>
                  ) : (
                    <span className="text-amber-400 font-bold hidden sm:inline">• Read-Only Protected</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: Page Navigator & Direct Jump */}
          <div className="flex items-center gap-1 bg-[#21262d] p-1 rounded-xl border border-[#30363d]">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              title="Previous Page"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-[#30363d] disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            <form onSubmit={handlePageInputSubmit} className="flex items-center">
              <input
                type="text"
                value={pageInputVal}
                onChange={(e) => setPageInputVal(e.target.value)}
                onBlur={handlePageInputSubmit}
                title="Enter page number and press Enter"
                className="w-9 sm:w-11 text-center bg-[#161b22] border border-[#30363d] rounded-md text-xs font-mono text-white py-0.5 focus:outline-hidden focus:border-[#58a6ff]"
              />
            </form>

            <span className="text-[11px] font-mono text-white/60 px-1">/ {totalPages}</span>

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              title="Next Page"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-[#30363d] disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          {/* RIGHT: Zoom Presets, Search, Rotate, MGN Actions & Tools */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden lg:flex items-center bg-[#21262d] rounded-xl p-0.5 border border-[#30363d]">
              <button
                type="button"
                onClick={() => {
                  setInternalZoom((prev) => Math.max(prev - 25, 25));
                  setFitMode("custom");
                }}
                title="Zoom Out (Ctrl -)"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-[#30363d] cursor-pointer"
              >
                <ZoomOut className="size-3.5" />
              </button>

              <select
                value={fitMode !== "custom" ? fitMode : String(currentZoom)}
                onChange={(e) => handleZoomPreset(e.target.value)}
                className="bg-transparent text-white text-xs font-mono px-1 py-1 focus:outline-hidden cursor-pointer"
              >
                <option value="fit-width" className="bg-[#161b22]">Fit Width</option>
                <option value="fit-page" className="bg-[#161b22]">Fit Page</option>
                <option value="50" className="bg-[#161b22]">50%</option>
                <option value="75" className="bg-[#161b22]">75%</option>
                <option value="100" className="bg-[#161b22]">100%</option>
                <option value="125" className="bg-[#161b22]">125%</option>
                <option value="150" className="bg-[#161b22]">150%</option>
                <option value="200" className="bg-[#161b22]">200%</option>
                <option value="300" className="bg-[#161b22]">300%</option>
                <option value="400" className="bg-[#161b22]">400%</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setInternalZoom((prev) => Math.min(prev + 25, 400));
                  setFitMode("custom");
                }}
                title="Zoom In (Ctrl +)"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-[#30363d] cursor-pointer"
              >
                <ZoomIn className="size-3.5" />
              </button>
            </div>

            {/* In-Document Search Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen((prev) => !prev);
                if (!isSearchOpen) {
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }
              }}
              title="Search in Document (Ctrl + F)"
              className={`p-2 rounded-xl transition cursor-pointer ${
                isSearchOpen
                  ? "bg-[#0f4c81] text-white"
                  : "bg-[#21262d] text-white/70 hover:text-white hover:bg-[#30363d]"
              }`}
            >
              <Search className="size-4" />
            </button>

            {/* Rotate Clockwise */}
            <button
              type="button"
              onClick={handleRotate}
              title="Rotate Clockwise (90°)"
              className="p-2 rounded-xl bg-[#21262d] text-white/70 hover:text-white hover:bg-[#30363d] transition cursor-pointer hidden md:inline-flex"
            >
              <RotateCw className="size-4" />
            </button>

            {/* MGN Extension: Owner Edit Resource */}
            {isOwner && onEditResource && (
              <button
                type="button"
                onClick={onEditResource}
                title="Edit Resource Details & Access"
                className="hidden xl:inline-flex items-center gap-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white px-3 py-1.5 text-xs font-bold transition cursor-pointer border border-[#30363d]"
              >
                <Edit className="size-3.5 text-[#58a6ff]" />
                <span>Edit</span>
              </button>
            )}

            {/* MGN Extension: Ask AI */}
            {onAskAI && (
              <button
                type="button"
                onClick={onAskAI}
                title="Ask Medical AI regarding this page"
                className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-2.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Sparkles className="size-3.5" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            )}

            {/* MGN Extension: Bookmark */}
            {onToggleBookmark && (
              <button
                type="button"
                onClick={onToggleBookmark}
                title={isBookmarked ? "Saved in My Box" : "Save to My Box"}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isBookmarked
                    ? "bg-[#0f4c81] text-white"
                    : "bg-[#21262d] text-white/70 hover:text-white hover:bg-[#30363d]"
                }`}
              >
                <Bookmark className="size-4" fill={isBookmarked ? "currentColor" : "none"} />
              </button>
            )}

            {/* Print Button (Strictly only when allowPrint is true) */}
            {allowPrint && (
              <button
                type="button"
                onClick={handlePrint}
                title="Print Document"
                className="p-2 rounded-xl bg-[#21262d] text-white/70 hover:text-white hover:bg-[#30363d] transition cursor-pointer hidden sm:inline-flex"
              >
                <Printer className="size-4" />
              </button>
            )}

            {/* Download Button (Only when allowDownload is true) */}
            {allowDownload ? (
              <button
                type="button"
                onClick={handleDownload}
                title="Download PDF"
                className="p-2 rounded-xl bg-[#0f4c81] hover:bg-[#1565c0] text-white transition cursor-pointer shadow-xs"
              >
                <Download className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Download Restricted (Read-Only Protected)"
                className="p-2 rounded-xl bg-[#21262d]/50 text-white/30 cursor-not-allowed border border-white/5 hidden sm:inline-flex"
              >
                <Lock className="size-4 text-amber-400/60" />
              </button>
            )}

            {/* Report Issue */}
            {onReport && (
              <button
                type="button"
                onClick={onReport}
                title="Report issue or inaccuracy"
                className="p-2 rounded-xl bg-[#21262d] text-white/70 hover:text-rose-400 hover:bg-[#30363d] transition cursor-pointer hidden md:inline-flex"
              >
                <Flag className="size-4" />
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="p-2 rounded-xl bg-[#21262d] text-white/70 hover:text-white hover:bg-[#30363d] transition cursor-pointer hidden sm:inline-flex"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>

            {/* Modal Close Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Close Reader"
                className="p-2 rounded-xl bg-[#21262d] text-white/70 hover:text-white hover:bg-rose-900/70 transition cursor-pointer ml-1"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. FLOATING IN-DOCUMENT SEARCH BAR (Ctrl + F)
      ───────────────────────────────────────────────────────────── */}
      {isSearchOpen && (
        <div className="absolute top-14 right-4 z-40 flex items-center gap-2 bg-[#161b22]/95 backdrop-blur-md border border-[#30363d] p-2 rounded-2xl shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <Search className="size-4 text-white/50 ml-1" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search in document..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handlePerformSearch(e.target.value);
            }}
            className="w-44 sm:w-60 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#58a6ff]"
          />

          {/* Search Result Count */}
          <span className="text-[11px] font-mono text-white/60 whitespace-nowrap min-w-[50px] text-center">
            {isSearching ? (
              <Loader2 className="size-3.5 animate-spin inline text-[#58a6ff]" />
            ) : searchResults.length > 0 ? (
              `${currentMatchIndex + 1}/${searchResults.length}`
            ) : searchQuery.trim() ? (
              "0/0"
            ) : (
              ""
            )}
          </span>

          <button
            type="button"
            onClick={handlePrevSearchMatch}
            disabled={searchResults.length === 0}
            title="Previous match (Shift + Enter)"
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-[#30363d] disabled:opacity-30 cursor-pointer"
          >
            <ArrowUp className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={handleNextSearchMatch}
            disabled={searchResults.length === 0}
            title="Next match (Enter)"
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-[#30363d] disabled:opacity-30 cursor-pointer"
          >
            <ArrowDown className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            title="Close search"
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-[#30363d] cursor-pointer ml-1"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN WORKSPACE WITH COLLAPSIBLE SIDEBAR & VIEWPORT
      ───────────────────────────────────────────────────────────── */}
      <div className="relative flex-1 flex overflow-hidden min-h-0 bg-[#0d1117]">
        {/* LEFT COLLAPSIBLE SIDEBAR (Google-style Thumbnails & Outline) */}
        {sidebarOpen && (
          <div className="w-64 sm:w-72 bg-[#161b22] border-r border-[#30363d] flex flex-col shrink-0 z-20 transition-all duration-200 shadow-xl">
            {/* Sidebar Tabs */}
            <div className="flex items-center border-b border-[#30363d] p-1.5 gap-1 bg-[#10141b]">
              <button
                type="button"
                onClick={() => setSidebarTab("thumbnails")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sidebarTab === "thumbnails"
                    ? "bg-[#21262d] text-[#58a6ff] shadow-xs"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <FileText className="size-3.5" />
                <span>Pages</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("outline")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sidebarTab === "outline"
                    ? "bg-[#21262d] text-[#58a6ff] shadow-xs"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <ListTree className="size-3.5" />
                <span>Outline</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("info")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sidebarTab === "info"
                    ? "bg-[#21262d] text-[#58a6ff] shadow-xs"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Info className="size-3.5" />
                <span>Details</span>
              </button>
            </div>

            {/* Sidebar Tab Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {sidebarTab === "thumbnails" && (
                <div className="space-y-3">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <div
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`group relative flex flex-col items-center p-2 rounded-2xl cursor-pointer transition-all ${
                          isActive
                            ? "bg-[#0f4c81]/25 ring-2 ring-[#58a6ff] shadow-lg"
                            : "bg-[#21262d]/50 hover:bg-[#21262d] border border-[#30363d]/50"
                        }`}
                      >
                        {/* Thumbnail Canvas */}
                        <div className="w-full flex items-center justify-center bg-white rounded-lg shadow-sm overflow-hidden min-h-[140px]">
                          <ThumbnailCanvas
                            pageNumber={pageNum}
                            renderThumbnail={renderThumbnail}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-white/70 mt-1.5 font-medium">
                          Page {pageNum}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {sidebarTab === "outline" && (
                <div className="space-y-1">
                  {outline.length > 0 ? (
                    outline.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={async () => {
                          if (item.dest && pdfDoc) {
                            try {
                              let dest = item.dest;
                              if (typeof dest === "string") {
                                dest = await pdfDoc.getDestination(dest);
                              }
                              if (Array.isArray(dest)) {
                                const pageRef = dest[0];
                                const pageIdx = await pdfDoc.getPageIndex(pageRef);
                                handlePageChange(pageIdx + 1);
                              }
                            } catch {
                              // ignore
                            }
                          }
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-[#21262d] transition cursor-pointer flex items-center gap-2 truncate"
                      >
                        <span className="size-1.5 rounded-full bg-[#58a6ff] shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12 px-4 text-white/50 space-y-2">
                      <ListTree className="size-8 mx-auto text-white/20" />
                      <p className="text-xs font-medium">No embedded outline available</p>
                      <p className="text-[11px] text-white/40">
                        Use the Pages tab to navigate across chapters.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {sidebarTab === "info" && (
                <div className="space-y-4 text-xs text-white/80">
                  <div className="p-3.5 rounded-2xl bg-[#21262d]/60 border border-[#30363d] space-y-2">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-[#58a6ff]">Document Info</p>
                    <p className="font-bold text-white text-sm">{displayTitle}</p>
                    <p className="text-white/60">Total Pages: <span className="font-mono text-white font-bold">{totalPages}</span></p>
                    <p className="text-white/60">Version: <span className="font-mono text-white">v{version}.0</span></p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#21262d]/60 border border-[#30363d] space-y-2">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">Security & Policy</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Download:</span>
                      <span className={allowDownload ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {allowDownload ? "Enabled" : "Protected (Read-Only)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Print:</span>
                      <span className={allowPrint ? "text-emerald-400 font-bold" : "text-white/40"}>
                        {allowPrint ? "Permitted" : "Restricted"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Selection & Copy:</span>
                      <span className={allowCopy ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {allowCopy ? "Active" : "Protected"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CENTER VIEWPORT / CANVAS SCROLL AREA */}
        <div
          ref={scrollAreaRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`flex-1 overflow-auto flex flex-col items-center justify-start p-4 sm:p-8 relative ${
            isPanActive ? "cursor-grab active:cursor-grabbing" : isLoupeActive ? "cursor-crosshair" : "cursor-default"
          }`}
          style={{
            userSelect: allowCopy ? "text" : "none",
          }}
        >
          {loading ? (
            <div className="m-auto flex flex-col items-center justify-center space-y-3">
              <Loader2 className="size-10 text-[#58a6ff] animate-spin" />
              <p className="text-xs text-white/70 font-medium font-sans">
                Opening PDF Document...
              </p>
            </div>
          ) : error ? (
            <div className="m-auto max-w-md p-6 rounded-3xl bg-[#161b22] border border-rose-500/30 text-center space-y-3">
              <AlertCircle className="size-10 text-rose-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Document Error</h3>
              <p className="text-xs text-rose-300 font-sans">{error}</p>
            </div>
          ) : (
            <div className="relative shadow-2xl rounded-sm overflow-hidden my-auto border border-[#30363d]/40">
              {/* Main Document Canvas */}
              <canvas
                ref={canvasRef}
                className="block mx-auto transition-transform duration-75"
                onDoubleClick={(e) => {
                  // Double click to zoom into point
                  setInternalZoom((prev) => (prev >= 200 ? 100 : 200));
                  setFitMode("custom");
                }}
              />

              {/* Selectable Text Layer & Search Highlight Overlay */}
              <div
                ref={textLayerRef}
                className="absolute inset-0 pointer-events-auto"
                style={{
                  userSelect: allowCopy ? "text" : "none",
                }}
              >
                {pageTextItems.map((item, i) => {
                  const isMatch =
                    searchQuery.trim().length > 0 &&
                    item.str.toLowerCase().includes(searchQuery.toLowerCase());

                  return (
                    <span
                      key={i}
                      className={`absolute leading-none transition-colors ${
                        isMatch
                          ? "bg-yellow-300 text-black font-semibold rounded-xs shadow-xs"
                          : "text-transparent hover:bg-sky-400/10 selection:bg-[#58a6ff]/40"
                      }`}
                      style={{
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                        fontSize: `${item.height}px`,
                      }}
                    >
                      {item.str}
                    </span>
                  );
                })}
              </div>

              {/* Magnifier Loupe Lens Canvas */}
              {isLoupeActive && loupePos.visible && (
                <div
                  className="pointer-events-none absolute z-50 rounded-full shadow-2xl ring-4 ring-[#58a6ff]/50 overflow-hidden bg-white"
                  style={{
                    left: `${loupePos.x - 90}px`,
                    top: `${loupePos.y - 90}px`,
                    width: "180px",
                    height: "180px",
                  }}
                >
                  <canvas ref={loupeCanvasRef} className="w-full h-full block" />
                </div>
              )}
            </div>
          )}

          {/* Rendering Spinner Badge */}
          {rendering && !loading && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161b22]/90 backdrop-blur-md border border-[#30363d] text-[11px] text-white/70 shadow-lg">
              <Loader2 className="size-3 animate-spin text-[#58a6ff]" />
              <span>Rendering...</span>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. TARGETED AREA QUICK ACTION TOOLBAR (Vertical Floating Dock)
        ───────────────────────────────────────────────────────────── */}
        <div className="absolute bottom-6 right-4 z-30 flex flex-col items-stretch gap-1.5 p-1.5 rounded-2xl bg-[#161b22]/95 backdrop-blur-md border border-[#30363d] shadow-2xl select-none min-w-[116px]">
          {/* Magnifier Loupe Tool */}
          <button
            type="button"
            onClick={() => {
              setIsLoupeActive((prev) => !prev);
              setIsPanActive(false);
            }}
            title="Targeted Magnifier Loupe (Hover over diagrams for 2.5x zoom)"
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer w-full ${
              isLoupeActive
                ? "bg-[#58a6ff] text-black shadow-md"
                : "bg-[#21262d] text-white/80 hover:text-white hover:bg-[#30363d]"
            }`}
          >
            <Focus className="size-3.5 shrink-0" />
            <span className="text-[11px] whitespace-nowrap">Area Loupe</span>
          </button>

          {/* Drag-to-Pan Hand Tool */}
          <button
            type="button"
            onClick={() => {
              setIsPanActive((prev) => !prev);
              setIsLoupeActive(false);
            }}
            title="Pan / Hand Tool (Click & drag to move across zoomed diagrams)"
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer w-full ${
              isPanActive || currentZoom > 100
                ? "bg-[#0f4c81] text-white shadow-md"
                : "bg-[#21262d] text-white/80 hover:text-white hover:bg-[#30363d]"
            }`}
          >
            <Hand className="size-3.5 shrink-0" />
            <span className="text-[11px] whitespace-nowrap">Pan Tool</span>
          </button>

          {/* Quick 200% Area Focus / Reset */}
          <button
            type="button"
            onClick={() => {
              if (currentZoom > 120) {
                setFitMode("fit-width");
                setInternalZoom(100);
              } else {
                setFitMode("custom");
                setInternalZoom(200);
              }
            }}
            title={currentZoom > 120 ? "Reset to Fit" : "Zoom to 200% Area Detail"}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white/90 text-[11px] font-mono font-bold transition cursor-pointer w-full"
          >
            <ZoomIn className="size-3.5 shrink-0" />
            <span className="whitespace-nowrap">{currentZoom > 120 ? "Reset Fit" : "200% Focus"}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. BOTTOM STATUS STRIP
      ───────────────────────────────────────────────────────────── */}
      {!hideBottomControls && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-t border-[#30363d] text-[11px] text-white/60 font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span>Page {currentPage} of {totalPages}</span>
            <span>•</span>
            <span>{currentZoom}% zoom</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Ctrl + F to Search</span>
            <span>•</span>
            <span>Double-click to 200% Zoom</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Thumbnail canvas helper component
 */
function ThumbnailCanvas({
  pageNumber,
  renderThumbnail,
}: {
  pageNumber: number;
  renderThumbnail: (page: number, canvas: HTMLCanvasElement | null) => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      renderThumbnail(pageNumber, canvasRef.current);
    }
  }, [pageNumber, renderThumbnail]);

  return <canvas ref={canvasRef} className="max-w-full block" />;
}
