"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Brain,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import { MindMapItem, MindMapNodeItem } from "@/modules/learn/types";

export default function MindMapsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const [mindMaps, setMindMaps] = React.useState<MindMapItem[]>([]);
  const [selectedMap, setSelectedMap] = React.useState<MindMapItem | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set(["root-1", "root-cn", "roots-group", "trunks-group", "cords-group"]));
  const [selectedNode, setSelectedNode] = React.useState<MindMapNodeItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const loadMindMaps = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/learn/mind-maps");
        if (res.ok) {
          const data = await res.json();
          const maps: MindMapItem[] = data.mindMaps || [];
          setMindMaps(maps);

          const idParam = searchParams.get("id");
          if (idParam) {
            const found = maps.find((m) => m.id === idParam);
            if (found) setSelectedMap(found);
          } else if (maps.length > 0) {
            setSelectedMap(maps[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load mind maps:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMindMaps();
  }, [session?.user, searchParams]);

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const renderNode = (node: MindMapNodeItem, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    let nodeColorClass = "bg-white dark:bg-[#161b22] border-[#e8e6e3] dark:border-[#30363d] text-[#171717] dark:text-[#f0f6fc]";
    if (node.node_type === "root") {
      nodeColorClass = "bg-[#0f4c81] text-white font-bold border-[#0f4c81] shadow-md";
    } else if (node.node_type === "branch") {
      nodeColorClass = "bg-blue-50/80 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-[#0f4c81] dark:text-[#58a6ff] font-bold";
    } else if (node.node_type === "clinical") {
      nodeColorClass = "bg-rose-50/80 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-bold";
    }

    return (
      <div key={node.id} className="flex flex-col space-y-2 my-1">
        <div className="flex items-center gap-2">
          {/* Node Button */}
          <div
            onClick={() => {
              setSelectedNode(node);
              if (hasChildren) toggleNodeExpand(node.id);
            }}
            className={`px-3.5 py-2 rounded-2xl border text-xs transition cursor-pointer flex items-center gap-2 select-none ${nodeColorClass} ${
              isSelected ? "ring-2 ring-amber-400" : ""
            }`}
          >
            <span>{node.label}</span>
            {hasChildren && (
              <span className="size-4 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px]">
                {isExpanded ? "−" : "+"}
              </span>
            )}
          </div>

          {/* Quick clinical label */}
          {node.description && (
            <span className="text-[10px] text-[#77716b] dark:text-[#8b949e] max-w-xs truncate hidden sm:inline">
              {node.description}
            </span>
          )}
        </div>

        {/* Children Branches */}
        {hasChildren && isExpanded && (
          <div className="pl-6 border-l-2 border-dashed border-[#d8d6d2] dark:border-[#30363d] space-y-1.5 ml-3">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredMindMaps = React.useMemo(() => {
    let list = [...mindMaps];
    if (selectedCategory !== "All") {
      list = list.filter((m) => m.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(q) || m.topic.toLowerCase().includes(q));
    }
    return list;
  }, [mindMaps, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
      <StudentNavHeader activeTab="resources" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/learn"
                className="p-1.5 rounded-xl hover:bg-[#f0efee] dark:hover:bg-[#21262d] text-[#77716b] dark:text-[#8b949e] transition"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-2xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
                Medical Mind Maps 🧠
              </h1>
            </div>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 ml-8">
              Interactive hierarchical trees connecting anatomical landmarks, cranial nerve pathways, and clinical syndromes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mind Maps Directory (Sidebar) */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#9c958f]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter mind maps..."
                  className="w-full bg-[#f8f7f6] dark:bg-[#21262d] pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Mind Maps List */}
              <div className="space-y-2">
                {filteredMindMaps.map((map) => (
                  <button
                    key={map.id}
                    type="button"
                    onClick={() => {
                      setSelectedMap(map);
                      setSelectedNode(null);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer ${
                      selectedMap?.id === map.id
                        ? "border-[#0f4c81] bg-blue-50/70 dark:bg-blue-950/40 text-[#0f4c81] dark:text-[#58a6ff]"
                        : "border-[#e8e6e3] dark:border-[#30363d] hover:bg-[#f8f7f6] dark:hover:bg-[#1c202a]"
                    }`}
                  >
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      {map.category}
                    </span>
                    <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mt-1 line-clamp-1">
                      {map.title}
                    </h4>
                    <p className="text-[10px] text-[#77716b] dark:text-[#8b949e] mt-0.5">
                      {map.creator_name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Mind Map Canvas */}
          <div className="lg:col-span-3 space-y-4">
            {selectedMap ? (
              <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 shadow-sm space-y-6">
                {/* Map Control Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0efee] dark:border-[#21262d] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                      {selectedMap.title}
                    </h2>
                    <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                      {selectedMap.description}
                    </p>
                  </div>

                  {/* Zoom controls */}
                  <div className="flex items-center gap-1 bg-[#f5f4f2] dark:bg-[#21262d] p-1 rounded-xl self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.max(prev - 10, 60))}
                      className="p-1 rounded-lg hover:bg-white dark:hover:bg-[#161b22] transition"
                      title="Zoom Out"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="text-[11px] font-mono px-2 font-bold">{zoomLevel}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.min(prev + 10, 150))}
                      className="p-1 rounded-lg hover:bg-white dark:hover:bg-[#161b22] transition"
                      title="Zoom In"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Interactive Tree View */}
                <div
                  className="overflow-auto max-h-[550px] p-4 bg-[#faf9f8] dark:bg-[#0d1117] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
                >
                  {selectedMap.root_nodes && selectedMap.root_nodes.length > 0 ? (
                    selectedMap.root_nodes.map((node) => renderNode(node))
                  ) : (
                    <p className="text-xs text-[#77716b]">No nodes defined in this mind map.</p>
                  )}
                </div>

                {/* Node Inspector / Linked Resources Footer */}
                {selectedNode && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                        Selected Node: {selectedNode.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedNode(null)}
                        className="text-[10px] font-bold text-[#77716b] hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                    {selectedNode.description && (
                      <p className="text-xs text-[#171717] dark:text-[#f0f6fc]">
                        {selectedNode.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link
                        href={`/learn/practice?subject=Anatomy&topic=${encodeURIComponent(selectedMap.topic)}`}
                        className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        📝 Practice MCQs for this node →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-12 text-center text-xs text-[#77716b]">
                Select a mind map from the list to begin interactive exploration.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
