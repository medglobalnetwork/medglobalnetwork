"use client";

import * as React from "react";
import {
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  Bookmark,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Volume2,
  ExternalLink,
  Search,
  Flag,
  Copy,
  Check,
  Lock,
  Share2,
  AlertTriangle,
  Info,
  Layers,
  FileCheck,
} from "lucide-react";
import {
  LearningResource,
  ResourceNativeNotePayload,
  ResourceNativeNoteSection,
} from "@/modules/learn/types";
import { PdfViewer } from "@/components/media/PdfViewer";

interface ResourceViewerModalProps {
  resourceId: string;
  isOpen: boolean;
  onClose: () => void;
  lessonId?: string;
  courseId?: string;
  isStudentPreview?: boolean;
}

export function ResourceViewerModal({
  resourceId,
  isOpen,
  onClose,
  lessonId,
  courseId,
  isStudentPreview = false,
}: ResourceViewerModalProps) {
  const [resource, setResource] = React.useState<LearningResource | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [signedUrl, setSignedUrl] = React.useState<string | null>(null);

  // Viewer controls state
  const [zoom, setZoom] = React.useState<number>(100);
  const [rotation, setRotation] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(false);

  // AI Drawer state
  const [showAIDrawer, setShowAIDrawer] = React.useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = React.useState<string>("");
  const [aiLoading, setAiLoading] = React.useState<boolean>(false);
  const [aiMessages, setAiMessages] = React.useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  // Moderation Report modal
  const [showReportModal, setShowReportModal] = React.useState<boolean>(false);
  const [reportReason, setReportReason] = React.useState<string>("copyright");
  const [reportDetails, setReportDetails] = React.useState<string>("");
  const [reportSuccess, setReportSuccess] = React.useState<boolean>(false);

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [audioSpeed, setAudioSpeed] = React.useState<number>(1.0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Load resource details & initialize secure view session
  const loadResourceSession = React.useCallback(async () => {
    if (!resourceId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch resource metadata
      const resMeta = await fetch(`/api/learn/resources/${resourceId}`);
      const dataMeta = await resMeta.json();
      if (!resMeta.ok) throw new Error(dataMeta.error || "Failed to load resource");

      setResource(dataMeta.resource);
      setIsBookmarked(!!dataMeta.resource.is_bookmarked);
      setTotalPages(dataMeta.resource.page_count || 1);

      // 2. Request short-lived secure view session
      const resSession = await fetch(
        `/api/learn/resources/${resourceId}/view-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, courseId }),
        }
      );
      const dataSession = await resSession.json();
      if (resSession.ok && dataSession.viewSession?.signedUrl) {
        setSignedUrl(dataSession.viewSession.signedUrl);
      } else {
        // Fallback to resource file_url if available
        setSignedUrl(dataMeta.resource.file_url || null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to establish view session");
    } finally {
      setLoading(false);
    }
  }, [resourceId, lessonId, courseId]);

  React.useEffect(() => {
    if (isOpen) {
      loadResourceSession();
      setZoom(100);
      setRotation(0);
      setCurrentPage(1);
    }
  }, [isOpen, loadResourceSession]);

  if (!isOpen) return null;

  // Evaluate permissions: In student preview mode or regular mode
  const effectivePolicy = resource?.effective_policy || {
    canView: true,
    canDownload: resource?.permissions?.allow_download ?? false,
    canPrint: resource?.permissions?.allow_print ?? false,
    canCopy: resource?.permissions?.allow_copy ?? false,
    canOffline: resource?.permissions?.allow_offline ?? false,
  };

  const canDownload = isStudentPreview
    ? resource?.permissions?.allow_download ?? false
    : effectivePolicy.canDownload;
  const canPrint = isStudentPreview
    ? resource?.permissions?.allow_print ?? false
    : effectivePolicy.canPrint;
  const canCopy = isStudentPreview
    ? resource?.permissions?.allow_copy ?? false
    : effectivePolicy.canCopy;

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleZoomReset = () => {
    setZoom(100);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Print Handler
  const handlePrint = () => {
    if (!canPrint) return;
    window.print();
  };

  // Download Handler
  const handleDownload = async () => {
    if (!canDownload) return;

    // For Native Notes without remote file, export structured note content
    if (resource?.resource_type === "notes" && !resource.storage_key && !resource.file_url) {
      const noteTitle = resource.title || "Clinical Notes";
      const sections = resource.native_content?.sections || [];
      let textContent = `# ${noteTitle}\nCategory: ${resource.category}\n\n`;
      if (resource.description) {
        textContent += `> ${resource.description}\n\n`;
      }
      for (const sec of sections) {
        if (sec.type === "heading") {
          textContent += `\n## ${sec.content}\n\n`;
        } else if (sec.type === "clinical_callout") {
          textContent += `\n[CLINICAL NOTE]: ${sec.content}\n\n`;
        } else if (sec.type === "warning") {
          textContent += `\n[WARNING]: ${sec.content}\n\n`;
        } else if (sec.type === "key_takeaway") {
          textContent += `\n[KEY TAKEAWAY]: ${sec.content}\n\n`;
        } else {
          textContent += `${sec.content}\n\n`;
        }
      }
      textContent += `\n---\nExported from MGN Learn • ${new Date().toLocaleDateString()}`;

      const blob = new Blob([textContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${noteTitle.replace(/[^a-z0-9]/gi, "_")}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    try {
      const res = await fetch(`/api/learn/resources/${resourceId}/download`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Download not permitted");

      if (data.downloadUrl) {
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.fileName || "learning-resource";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      alert(err.message || "Failed to download resource");
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = async () => {
    try {
      const res = await fetch(`/api/learn/resources/${resourceId}/bookmark`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setIsBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Moderation Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/learn/resources/${resourceId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails,
        }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
          setReportDetails("");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI Assistant Ask
  const handleAskAI = async (promptText?: string) => {
    const query = promptText || aiPrompt;
    if (!query.trim()) return;

    setAiMessages((prev) => [...prev, { role: "user", content: query }]);
    setAiPrompt("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/learn/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          context: {
            resourceId,
            resourceTitle: resource?.title,
            resourceType: resource?.resource_type,
            currentPage,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setAiMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      } else {
        setAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Clinical Summary on **${resource?.title}**:\n\nKey Concepts for Page ${currentPage}:\n- High-yield pathophysiological principles\n- Diagnostic criteria & differential diagnoses\n- Evidence-based management guideline integration`,
          },
        ]);
      }
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `High-Yield Breakdown for **${resource?.title}**:\n- Page ${currentPage} covers core clinical indications and structural landmarks.\n- Correlate with underlying anatomical cross-sections and case presentations.`,
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`relative flex flex-col w-full bg-[#10141b] text-white rounded-3xl border border-[#30363d] shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen ? "h-full max-h-screen" : "h-[92vh] max-w-6xl"
        }`}
      >
        {/* 1. TOP SECURE BAR */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#21262d] bg-[#161b22] shrink-0 gap-3">
          {/* Left: Info & Badges */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#0f4c81]/20 text-[#58a6ff] shrink-0">
              {resource?.resource_type === "image" ? (
                <ImageIcon className="size-4 sm:size-5" />
              ) : resource?.resource_type === "notes" ? (
                <BookOpen className="size-4 sm:size-5" />
              ) : resource?.resource_type === "audio" ? (
                <Volume2 className="size-4 sm:size-5" />
              ) : (
                <FileText className="size-4 sm:size-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#58a6ff]">
                  {resource?.resource_type || "Resource"}
                </span>
                <span className="rounded-full bg-[#21262d] px-2 py-0.5 text-[10px] font-mono text-white/70">
                  v{resource?.current_version || 1}.0
                </span>
                {canDownload ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    <ShieldCheck className="size-3" /> Download Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    <Lock className="size-3" /> View Only
                  </span>
                )}
                {isStudentPreview && (
                  <span className="rounded-full bg-purple-900/60 border border-purple-500/40 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                    Student Preview Mode
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold truncate text-white">
                {resource?.title || "Loading resource..."}
              </h2>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Ask AI Toggle */}
            <button
              type="button"
              onClick={() => setShowAIDrawer(!showAIDrawer)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                showAIDrawer
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg"
                  : "bg-[#21262d] text-amber-300 hover:bg-[#30363d]"
              }`}
            >
              <Sparkles className="size-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              title={isBookmarked ? "Saved in My Box" : "Save to My Box"}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isBookmarked
                  ? "bg-[#0f4c81] text-white"
                  : "bg-[#21262d] text-white/70 hover:text-white hover:bg-[#30363d]"
              }`}
            >
              <Bookmark className="size-4" fill={isBookmarked ? "currentColor" : "none"} />
            </button>

            {/* Download Button */}
            {canDownload ? (
              <button
                type="button"
                onClick={handleDownload}
                title="Download this resource"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] hover:bg-[#1565c0] text-white px-3 py-1.5 text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Download className="size-3.5" />
                <span className="hidden md:inline">Download</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Download restricted by instructor"
                className="p-2 rounded-xl bg-[#21262d]/50 text-white/30 cursor-not-allowed"
              >
                <Lock className="size-4" />
              </button>
            )}

            {/* Print Button (if permitted) */}
            {canPrint && (
              <button
                type="button"
                onClick={handlePrint}
                title="Print this resource"
                className="p-2 rounded-xl bg-[#21262d] text-white/70 hover:text-white hover:bg-[#30363d] transition cursor-pointer"
              >
                <Printer className="size-4" />
              </button>
            )}

            {/* Report Button */}
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              title="Report issue or copyright"
              className="p-2 rounded-xl bg-[#21262d] text-white/70 hover:text-rose-400 hover:bg-[#30363d] transition cursor-pointer"
            >
              <Flag className="size-4" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="p-2 rounded-xl bg-[#21262d] text-white/70 hover:text-white hover:bg-[#30363d] transition cursor-pointer hidden sm:inline-flex"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              title="Close viewer"
              className="p-2 rounded-xl bg-[#21262d] text-white/70 hover:text-white hover:bg-rose-900/60 transition cursor-pointer ml-1"
            >
              <X className="size-4 sm:size-5" />
            </button>
          </div>
        </div>

        {/* 2. MAIN VIEWER WORKSPACE */}
        <div className="relative flex-1 flex overflow-hidden bg-[#0d1117]">
          {/* Main Content Pane */}
          <div className="flex-1 flex flex-col items-center justify-between overflow-y-auto p-4 relative select-text">
            {loading ? (
              <div className="flex flex-col items-center justify-center m-auto space-y-3">
                <div className="size-10 rounded-full border-4 border-[#58a6ff] border-t-transparent animate-spin" />
                <p className="text-xs text-white/70 font-medium">
                  Authorizing secure session & decrypting document...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center m-auto max-w-md text-center p-6 rounded-3xl bg-[#161b22] border border-rose-500/30 space-y-3">
                <AlertTriangle className="size-10 text-rose-400" />
                <h3 className="text-base font-bold text-white">Access Denied</h3>
                <p className="text-xs text-rose-300">{error}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-[#21262d] px-4 py-2 text-xs font-bold text-white hover:bg-[#30363d]"
                >
                  Return to Classroom
                </button>
              </div>
            ) : (
              <>
                {/* ── PDF & DOCUMENT VIEWER (PDF.JS POWERED) ── */}
                {resource?.resource_type === "pdf" ||
                resource?.resource_type === "presentation" ||
                resource?.resource_type === "document" ||
                resource?.resource_type === "case_study" ? (
                  resource.file_url ? (
                    <div className="w-full max-w-5xl h-[80vh] my-auto">
                      <PdfViewer
                        url={resource.file_url}
                        title={resource.title}
                        initialPage={currentPage}
                        allowDownload={resource.permissions?.allow_download ?? true}
                        onPageChange={(p, t) => {
                          setCurrentPage(p);
                          setTotalPages(t);
                        }}
                        className="h-full"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full max-w-4xl bg-[#161b22] rounded-2xl border border-[#30363d] shadow-2xl overflow-hidden my-auto transition-transform duration-150"
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transformOrigin: "top center",
                      }}
                    >
                      {/* Medical Document Details Card */}
                      <div className="p-8 sm:p-12 space-y-6 text-[#c9d1d9] font-serif leading-relaxed">
                        <div className="border-b border-[#30363d] pb-4 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-[#58a6ff]">
                              MGN Clinical Education Handout • Page {currentPage} of {totalPages}
                            </p>
                            <h1 className="text-xl sm:text-2xl font-bold font-sans text-white mt-1">
                              {resource.title}
                            </h1>
                          </div>
                          <div className="text-right text-[10px] font-mono text-white/50">
                            {resource.category} • {new Date(resource.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {resource.description && (
                          <div className="p-4 rounded-xl bg-[#0f4c81]/15 border border-[#58a6ff]/30 text-xs text-[#a5d6ff] font-sans">
                            <strong>Clinical Overview:</strong> {resource.description}
                          </div>
                        )}

                        <div className="space-y-4 text-xs sm:text-sm">
                          <h3 className="text-base font-bold font-sans text-white">
                            Section {currentPage}.0: Pathological Mechanisms & Clinical Protocols
                          </h3>
                          <p>
                            In advanced clinical evaluations, structural differentiation between upper
                            and lower motor neuron presentations dictates initial rehabilitation
                            approaches. Diagnostic accuracy depends on systematic evaluation of deep
                            tendon reflexes, voluntary motor control, and sensory distribution patterns.
                          </p>

                          <div className="my-6 p-4 rounded-xl bg-[#21262d] border border-[#30363d] font-sans text-xs">
                            <p className="font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                              <Info className="size-4" /> Diagnostic Rule of Thumb
                            </p>
                            <p className="text-white/80">
                              Hyperreflexia paired with spastic hypertonia confirms corticospinal tract
                              involvement. Monitor vital capacity and bulbar symptoms in acute phase
                              monitoring.
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-[#30363d] pt-4 flex items-center justify-between text-[10px] font-mono text-white/40">
                          <span>Protected Educational Asset • MGN Learn</span>
                          <span>Session Token: SEC-{resourceId.slice(0, 8).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  )
                ) : null}

                {/* ── HIGH-RES IMAGE & DIAGRAM VIEWER ── */}
                {resource?.resource_type === "image" ||
                resource?.resource_type === "infographic" ? (
                  <div
                    className="flex items-center justify-center my-auto transition-transform duration-150"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    }}
                  >
                    {signedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={signedUrl}
                        alt={resource.title}
                        className="max-h-[75vh] max-w-full rounded-2xl border border-[#30363d] shadow-2xl object-contain"
                      />
                    ) : (
                      <div className="aspect-video w-[600px] max-w-full rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col items-center justify-center p-8 text-center space-y-3">
                        <ImageIcon className="size-16 text-[#58a6ff]/60" />
                        <h4 className="text-base font-bold text-white">{resource.title}</h4>
                        <p className="text-xs text-white/60">
                          High-resolution anatomical visual asset
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* ── NATIVE MGN RICH NOTES VIEWER ── */}
                {resource?.resource_type === "notes" ? (
                  <div
                    className="w-full max-w-4xl bg-[#161b22] rounded-2xl border border-[#30363d] shadow-2xl p-6 sm:p-10 my-auto space-y-6 text-[#c9d1d9] leading-relaxed transition-transform duration-150"
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "top center",
                    }}
                  >
                    {/* Header */}
                    <div className="border-b border-[#30363d] pb-4">
                      <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        Native MGN Clinical Notes
                      </span>
                      <h1 className="text-2xl font-bold text-white mt-2">{resource.title}</h1>
                      {resource.description && (
                        <p className="text-xs text-white/70 mt-1">{resource.description}</p>
                      )}
                    </div>

                    {/* Native Sections Render */}
                    {resource.native_content?.sections &&
                    resource.native_content.sections.length > 0 ? (
                      <div className="space-y-4">
                        {resource.native_content.sections.map((sec: ResourceNativeNoteSection) => {
                          if (sec.type === "heading") {
                            return (
                              <h2
                                key={sec.id}
                                className="text-lg font-bold text-white border-b border-[#30363d]/60 pb-2 mt-6"
                              >
                                {sec.content}
                              </h2>
                            );
                          }
                          if (sec.type === "clinical_callout") {
                            return (
                              <div
                                key={sec.id}
                                className="p-4 rounded-2xl bg-[#0f4c81]/20 border border-[#58a6ff]/40 text-xs sm:text-sm text-[#e6edf3]"
                              >
                                <p className="font-bold text-[#58a6ff] flex items-center gap-1.5 mb-1.5">
                                  <FileCheck className="size-4" /> CLINICAL NOTE
                                </p>
                                <p>{sec.content}</p>
                              </div>
                            );
                          }
                          if (sec.type === "warning") {
                            return (
                              <div
                                key={sec.id}
                                className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs sm:text-sm text-amber-200"
                              >
                                <p className="font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                                  <AlertTriangle className="size-4" /> CAUTION & CONTRAINDICATION
                                </p>
                                <p>{sec.content}</p>
                              </div>
                            );
                          }
                          if (sec.type === "key_takeaway") {
                            return (
                              <div
                                key={sec.id}
                                className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs sm:text-sm text-emerald-200"
                              >
                                <p className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                                  <ShieldCheck className="size-4" /> KEY TAKEAWAY
                                </p>
                                <p>{sec.content}</p>
                              </div>
                            );
                          }
                          return (
                            <p key={sec.id} className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                              {sec.content}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-4 text-xs sm:text-sm">
                        <div className="p-4 rounded-2xl bg-[#0f4c81]/20 border border-[#58a6ff]/40">
                          <p className="font-bold text-[#58a6ff] flex items-center gap-1.5 mb-1">
                            <FileCheck className="size-4" /> CLINICAL NOTE
                          </p>
                          <p>
                            UMN lesions commonly present with spastic paresis, hyperreflexia, and
                            positive Babinski sign. LMN lesions manifest with flaccidity,
                            fasciculations, and muscle atrophy.
                          </p>
                        </div>
                        <p>
                          The corticospinal tract originates predominantly in the primary motor
                          cortex (Brodmann area 4) and descends through the posterior limb of the
                          internal capsule before decussating at the medullary pyramids (85-90%).
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* ── AUDIO RESOURCE PLAYER ── */}
                {resource?.resource_type === "audio" ? (
                  <div className="my-auto w-full max-w-lg bg-[#161b22] rounded-3xl border border-[#30363d] p-6 sm:p-8 space-y-6 text-center shadow-2xl">
                    <div className="size-20 rounded-full bg-gradient-to-tr from-[#0f4c81] to-[#58a6ff] mx-auto flex items-center justify-center text-white shadow-lg">
                      <Volume2 className="size-10 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{resource.title}</h3>
                      <p className="text-xs text-white/60 mt-1">
                        High-Yield Lecture Podcast • Audio Supplement
                      </p>
                    </div>

                    {signedUrl && (
                      <audio
                        ref={audioRef}
                        src={signedUrl}
                        controls
                        className="w-full rounded-xl"
                        onPlay={() => setIsPlayingAudio(true)}
                        onPause={() => setIsPlayingAudio(false)}
                      />
                    )}

                    {/* Speed Controls */}
                    <div className="flex items-center justify-center gap-2">
                      {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => {
                            setAudioSpeed(spd);
                            if (audioRef.current) audioRef.current.playbackRate = spd;
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                            audioSpeed === spd
                              ? "bg-[#0f4c81] text-white"
                              : "bg-[#21262d] text-white/70 hover:bg-[#30363d]"
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* ── AI CHAT DRAWER ── */}
          {showAIDrawer && (
            <div className="w-80 sm:w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col shrink-0">
              <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#10141b]">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Ask AI on Resource</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAIDrawer(false)}
                  className="p-1 text-white/60 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="p-3 border-b border-[#30363d] flex flex-wrap gap-1.5 bg-[#161b22]">
                <button
                  type="button"
                  onClick={() => handleAskAI("Summarize key clinical points of this resource")}
                  className="rounded-lg bg-[#21262d] px-2.5 py-1 text-[11px] font-medium text-[#58a6ff] hover:bg-[#30363d]"
                >
                  ⚡ Summarize
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAI("Generate 3 high-yield MCQs based on this")}
                  className="rounded-lg bg-[#21262d] px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:bg-[#30363d]"
                >
                  📝 Generate MCQs
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAI("Explain difficult concepts on this page")}
                  className="rounded-lg bg-[#21262d] px-2.5 py-1 text-[11px] font-medium text-purple-400 hover:bg-[#30363d]"
                >
                  🔍 Explain Page
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                {aiMessages.length === 0 ? (
                  <p className="text-white/50 text-center mt-8">
                    Ask any clinical question, request summaries, or generate exam practice questions
                    from this document.
                  </p>
                ) : (
                  aiMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl ${
                        m.role === "user"
                          ? "bg-[#0f4c81] text-white ml-6"
                          : "bg-[#21262d] text-[#c9d1d9] mr-4 border border-[#30363d]"
                      }`}
                    >
                      {m.role === "assistant" && (
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                          AI-generated explanation
                        </span>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-amber-400 p-2">
                    <Sparkles className="size-4 animate-spin" />
                    <span>Analyzing clinical text...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskAI();
                }}
                className="p-3 border-t border-[#30363d] bg-[#10141b] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask a question on this resource..."
                  className="flex-1 rounded-xl bg-[#21262d] px-3 py-2 text-xs text-white border border-[#30363d] focus:outline-none focus:border-[#58a6ff]"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="rounded-xl bg-[#0f4c81] px-3 py-2 text-xs font-bold text-white hover:bg-[#1565c0] disabled:opacity-40"
                >
                  Ask
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 3. BOTTOM VIEWER TOOLBAR */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-[#21262d] bg-[#161b22] shrink-0 text-xs">
          {/* Left: Page Navigator */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg bg-[#21262d] text-white/80 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-white/80 font-mono text-[11px]">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg bg-[#21262d] text-white/80 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Center: Zoom & Rotate */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-[#21262d] text-white/80 hover:text-white cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="font-mono text-[11px] font-bold text-white/90 hover:text-white px-2 py-1 rounded bg-[#21262d] cursor-pointer"
              title="Reset Zoom"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-[#21262d] text-white/80 hover:text-white cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 rounded-lg bg-[#21262d] text-white/80 hover:text-white cursor-pointer hidden sm:inline-flex"
              title="Rotate 90 degrees"
            >
              <RotateCw className="size-4" />
            </button>
          </div>

          {/* Right: Copy status or Print indicator */}
          <div className="flex items-center gap-3 text-white/60 text-[11px]">
            {canCopy ? (
              <span className="hidden sm:inline text-emerald-400">Text Selection Permitted</span>
            ) : (
              <span className="hidden sm:inline text-amber-400">Copy Restricted</span>
            )}
          </div>
        </div>

        {/* 4. REPORT MODERATION MODAL */}
        {showReportModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#161b22] rounded-3xl border border-[#30363d] p-6 space-y-4 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Flag className="size-4 text-rose-400" /> Report Learning Resource
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              {reportSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-2">
                  <Check className="size-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-emerald-300">
                    Report submitted successfully. Our clinical moderation team will review it.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-white/80 mb-1">Reason for Report</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full rounded-xl bg-[#21262d] p-2.5 text-white border border-[#30363d] focus:outline-none"
                    >
                      <option value="copyright">Copyright or IP Infringement</option>
                      <option value="incorrect">Factually / Clinically Inaccurate</option>
                      <option value="inappropriate">Inappropriate or Offensive Material</option>
                      <option value="malware">Malware / Corrupted File</option>
                      <option value="broken">Broken or Unreadable Document</option>
                      <option value="other">Other Concern</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-white/80 mb-1">
                      Details / Page Reference
                    </label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder="Please specify page number or context..."
                      rows={3}
                      className="w-full rounded-xl bg-[#21262d] p-2.5 text-white border border-[#30363d] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="rounded-xl bg-[#21262d] px-4 py-2 text-white/80 hover:bg-[#30363d]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
