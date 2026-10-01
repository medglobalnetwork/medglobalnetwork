"use client";

import * as React from "react";
import {
  Pen,
  Highlighter,
  Square,
  Circle,
  Minus,
  MoveRight,
  Type,
  Eraser,
  Sparkles,
  Undo2,
  Redo2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
} from "lucide-react";

export type WhiteboardTool =
  | "pen"
  | "highlighter"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text"
  | "eraser"
  | "laser";

export interface DrawingElement {
  id: string;
  tool: WhiteboardTool;
  points?: { x: number; y: number }[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  color: string;
  strokeWidth: number;
  text?: string;
}

interface LiveWhiteboardProps {
  sessionId: string;
  isPresenter: boolean;
  initialElements?: DrawingElement[];
  onStateChange?: (elements: DrawingElement[], slideIndex: number) => void;
}

const PALETTE = [
  { name: "Medical Blue", value: "#0f4c81" },
  { name: "Arterial Red", value: "#ef4444" },
  { name: "Vascular Green", value: "#10b981" },
  { name: "Charcoal Black", value: "#1e293b" },
  { name: "Surgical Purple", value: "#8b5cf6" },
  { name: "Amber Alert", value: "#f59e0b" },
];

export function LiveWhiteboard({
  sessionId,
  isPresenter,
  initialElements = [],
  onStateChange,
}: LiveWhiteboardProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [elements, setElements] = React.useState<DrawingElement[]>(initialElements);
  const [history, setHistory] = React.useState<DrawingElement[][]>([initialElements]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const [currentTool, setCurrentTool] = React.useState<WhiteboardTool>("pen");
  const [color, setColor] = React.useState<string>("#0f4c81");
  const [strokeWidth, setStrokeWidth] = React.useState<number>(3);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [currentElement, setCurrentElement] = React.useState<DrawingElement | null>(null);
  const [laserPos, setLaserPos] = React.useState<{ x: number; y: number } | null>(null);
  const [slideIndex, setSlideIndex] = React.useState(0);
  const [totalSlides, setTotalSlides] = React.useState(1);

  // Redraw canvas whenever elements or currentElement change
  const redraw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background for anatomical precision
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const allElements = currentElement ? [...elements, currentElement] : elements;

    allElements.forEach((el) => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (el.tool === "highlighter") {
        ctx.globalAlpha = 0.35;
      } else {
        ctx.globalAlpha = 1.0;
      }

      if (el.tool === "pen" || el.tool === "highlighter") {
        if (!el.points || el.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.tool === "rectangle") {
        if (el.startX === undefined || el.startY === undefined || el.endX === undefined || el.endY === undefined) return;
        const w = el.endX - el.startX;
        const h = el.endY - el.startY;
        ctx.strokeRect(el.startX, el.startY, w, h);
      } else if (el.tool === "circle") {
        if (el.startX === undefined || el.startY === undefined || el.endX === undefined || el.endY === undefined) return;
        const rx = Math.abs(el.endX - el.startX) / 2;
        const ry = Math.abs(el.endY - el.startY) / 2;
        const cx = Math.min(el.startX, el.endX) + rx;
        const cy = Math.min(el.startY, el.endY) + ry;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (el.tool === "line") {
        if (el.startX === undefined || el.startY === undefined || el.endX === undefined || el.endY === undefined) return;
        ctx.beginPath();
        ctx.moveTo(el.startX, el.startY);
        ctx.lineTo(el.endX, el.endY);
        ctx.stroke();
      } else if (el.tool === "arrow") {
        if (el.startX === undefined || el.startY === undefined || el.endX === undefined || el.endY === undefined) return;
        ctx.beginPath();
        ctx.moveTo(el.startX, el.startY);
        ctx.lineTo(el.endX, el.endY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(el.endY - el.startY, el.endX - el.startX);
        const headlen = 14;
        ctx.beginPath();
        ctx.moveTo(el.endX, el.endY);
        ctx.lineTo(el.endX - headlen * Math.cos(angle - Math.PI / 6), el.endY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(el.endX, el.endY);
        ctx.lineTo(el.endX - headlen * Math.cos(angle + Math.PI / 6), el.endY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (el.tool === "text" && el.text) {
        if (el.startX === undefined || el.startY === undefined) return;
        ctx.font = "bold 16px Inter, sans-serif";
        ctx.fillText(el.text, el.startX, el.startY);
      }
    });

    ctx.globalAlpha = 1.0;
  }, [elements, currentElement]);

  // Handle Resize
  React.useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      redraw();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [redraw]);

  React.useEffect(() => {
    redraw();
  }, [elements, currentElement, redraw]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPresenter) return;
    const { x, y } = getCanvasCoordinates(e);

    if (currentTool === "laser") {
      setLaserPos({ x, y });
      return;
    }

    if (currentTool === "text") {
      const text = prompt("Enter clinical note / annotation text:");
      if (text && text.trim()) {
        const newEl: DrawingElement = {
          id: Math.random().toString(36).substring(2, 9),
          tool: "text",
          startX: x,
          startY: y,
          color,
          strokeWidth,
          text: text.trim(),
        };
        const nextElements = [...elements, newEl];
        setElements(nextElements);
        pushHistory(nextElements);
        onStateChange?.(nextElements, slideIndex);
      }
      return;
    }

    if (currentTool === "eraser") {
      // Find and remove elements clicked near
      const threshold = 15;
      const remaining = elements.filter((el) => {
        if (el.points) {
          return !el.points.some((p) => Math.hypot(p.x - x, p.y - y) < threshold);
        }
        if (el.startX !== undefined && el.startY !== undefined) {
          return Math.hypot(el.startX - x, el.startY - y) >= threshold;
        }
        return true;
      });
      setElements(remaining);
      pushHistory(remaining);
      onStateChange?.(remaining, slideIndex);
      return;
    }

    setIsDrawing(true);
    if (currentTool === "pen" || currentTool === "highlighter") {
      setCurrentElement({
        id: Math.random().toString(36).substring(2, 9),
        tool: currentTool,
        points: [{ x, y }],
        color,
        strokeWidth: currentTool === "highlighter" ? strokeWidth * 3 : strokeWidth,
      });
    } else {
      setCurrentElement({
        id: Math.random().toString(36).substring(2, 9),
        tool: currentTool,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        color,
        strokeWidth,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);

    if (currentTool === "laser") {
      setLaserPos({ x, y });
      return;
    }

    if (!isDrawing || !currentElement) return;

    if (currentTool === "pen" || currentTool === "highlighter") {
      setCurrentElement((prev) => {
        if (!prev || !prev.points) return prev;
        return {
          ...prev,
          points: [...prev.points, { x, y }],
        };
      });
    } else {
      setCurrentElement((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          endX: x,
          endY: y,
        };
      });
    }
  };

  const handleMouseUp = () => {
    if (!isPresenter || !isDrawing || !currentElement) {
      setIsDrawing(false);
      setCurrentElement(null);
      return;
    }

    const nextElements = [...elements, currentElement];
    setElements(nextElements);
    setCurrentElement(null);
    setIsDrawing(false);
    pushHistory(nextElements);
    onStateChange?.(nextElements, slideIndex);
  };

  const pushHistory = (newElements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevElements = history[prevIndex];
      setHistoryIndex(prevIndex);
      setElements(prevElements);
      onStateChange?.(prevElements, slideIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextElements = history[nextIndex];
      setHistoryIndex(nextIndex);
      setElements(nextElements);
      onStateChange?.(nextElements, slideIndex);
    }
  };

  const handleClear = () => {
    if (confirm("Clear the entire whiteboard canvas?")) {
      setElements([]);
      pushHistory([]);
      onStateChange?.([], slideIndex);
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `whiteboard-slide-${slideIndex + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="relative flex size-full flex-col bg-white dark:bg-[#0d1117] rounded-2xl overflow-hidden border border-[#ded8d1] dark:border-[#30363d] shadow-sm select-none">
      {/* Top Whiteboard Floating Controls */}
      {isPresenter && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md p-1.5 shadow-lg border border-[#e2e8f0] dark:border-[#30363d]">
          {/* Tools */}
          <div className="flex items-center gap-1 border-r border-[#e2e8f0] dark:border-[#30363d] pr-1.5">
            <button
              type="button"
              onClick={() => setCurrentTool("pen")}
              className={`p-2 rounded-xl transition ${
                currentTool === "pen"
                  ? "bg-[#0f4c81] text-white"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Pen"
            >
              <Pen className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("highlighter")}
              className={`p-2 rounded-xl transition ${
                currentTool === "highlighter"
                  ? "bg-[#0f4c81] text-white"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Highlighter"
            >
              <Highlighter className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("rectangle")}
              className={`p-2 rounded-xl transition ${
                currentTool === "rectangle"
                  ? "bg-[#0f4c81] text-white"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Rectangle"
            >
              <Square className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("circle")}
              className={`p-2 rounded-xl transition ${
                currentTool === "circle"
                  ? "bg-[#0f4c81] text-white"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Circle / Ellipse"
            >
              <Circle className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("arrow")}
              className={`p-2 rounded-xl transition ${
                currentTool === "arrow"
                  ? "bg-[#0f4c81] text-white"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Arrow"
            >
              <MoveRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("text")}
              className={`p-2 rounded-xl transition ${
                currentTool === "text"
                  ? "bg-[#0f4c81] text-white"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Text Annotation"
            >
              <Type className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("laser")}
              className={`p-2 rounded-xl transition ${
                currentTool === "laser"
                  ? "bg-rose-500 text-white"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Laser Pointer"
            >
              <Sparkles className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("eraser")}
              className={`p-2 rounded-xl transition ${
                currentTool === "eraser"
                  ? "bg-[#0f4c81] text-white"
                  : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title="Eraser"
            >
              <Eraser className="size-4" />
            </button>
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1.5 px-1">
            {PALETTE.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setColor(p.value)}
                style={{ backgroundColor: p.value }}
                className={`size-5 rounded-full transition cursor-pointer ring-offset-2 dark:ring-offset-[#161b22] ${
                  color === p.value ? "ring-2 ring-[#0f4c81] dark:ring-white scale-110" : "opacity-80 hover:opacity-100"
                }`}
                title={p.name}
              />
            ))}
          </div>

          {/* Stroke Width Selector */}
          <div className="flex items-center gap-1 border-l border-[#e2e8f0] dark:border-[#30363d] pl-1.5">
            {[2, 4, 8].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setStrokeWidth(w)}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
                  strokeWidth === w
                    ? "bg-[#0f4c81] text-white"
                    : "text-[#5d5854] dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {w}px
              </button>
            ))}
          </div>

          {/* Undo / Redo / Clear */}
          <div className="flex items-center gap-1 border-l border-[#e2e8f0] dark:border-[#30363d] pl-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 text-[#5d5854] dark:text-[#8b949e] disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition"
              title="Undo"
            >
              <Undo2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-[#5d5854] dark:text-[#8b949e] disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition"
              title="Redo"
            >
              <Redo2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
              title="Clear Canvas"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div className="relative flex-1 size-full overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="size-full"
        />

        {/* Pulsating Laser Pointer */}
        {laserPos && currentTool === "laser" && (
          <div
            style={{
              left: `${laserPos.x}px`,
              top: `${laserPos.y}px`,
            }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 size-4 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-ping"
          />
        )}
      </div>

      {/* Bottom Slide Navigator & Export bar */}
      <div className="flex items-center justify-between border-t border-[#ded8d1] dark:border-[#30363d] bg-[#fbfaf9] dark:bg-[#161b22] px-4 py-2 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
            disabled={slideIndex === 0}
            className="p-1.5 rounded-lg border border-[#ded8d1] dark:border-[#30363d] disabled:opacity-30 hover:bg-white dark:hover:bg-[#21262d] transition cursor-pointer"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span>
            Slide {slideIndex + 1} of {totalSlides}
          </span>
          <button
            type="button"
            onClick={() => setSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1))}
            disabled={slideIndex >= totalSlides - 1}
            className="p-1.5 rounded-lg border border-[#ded8d1] dark:border-[#30363d] disabled:opacity-30 hover:bg-white dark:hover:bg-[#21262d] transition cursor-pointer"
          >
            <ChevronRight className="size-3.5" />
          </button>
          {isPresenter && (
            <button
              type="button"
              onClick={() => {
                setTotalSlides((prev) => prev + 1);
                setSlideIndex(totalSlides);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0f4c81] text-white hover:bg-[#0c3c66] transition cursor-pointer"
            >
              <Plus className="size-3" />
              <span>New Slide</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Save Slide</span>
          </button>
        </div>
      </div>
    </div>
  );
}
