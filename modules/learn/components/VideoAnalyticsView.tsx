"use client";

import * as React from "react";
import { VideoAnalyticsSummary } from "../types";
import { Users, Clock, CheckCircle2, TrendingUp, Flame, Bookmark, MessageSquare, AlertCircle } from "lucide-react";

interface VideoAnalyticsViewProps {
  lessonId: string;
}

export function VideoAnalyticsView({ lessonId }: VideoAnalyticsViewProps) {
  const [data, setData] = React.useState<VideoAnalyticsSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    fetch(`/api/learn/instructor/analytics?lessonId=${lessonId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.analytics) setData(d.analytics);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading || !data) {
    return (
      <div className="rounded-2xl bg-[#faf9f8] dark:bg-[#161b22] p-6 text-center text-xs text-[#77716b] dark:text-[#8b949e] animate-pulse">
        Loading clinical watch analytics & drop-off metrics...
      </div>
    );
  }

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6 text-xs sm:text-sm">
      {/* 1. KEY KPI CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#fcfbf9] dark:bg-[#1c2128] p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-[#77716b] dark:text-[#8b949e]">
            <Users className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
            <span className="text-[11px] font-semibold">Total Learners</span>
          </div>
          <p className="mt-2 text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">
            {data.unique_learners}
          </p>
        </div>

        <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#fcfbf9] dark:bg-[#1c2128] p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-[#77716b] dark:text-[#8b949e]">
            <Clock className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-semibold">Avg. Watch Time</span>
          </div>
          <p className="mt-2 text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">
            {formatMinSec(data.avg_watch_time_seconds)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#fcfbf9] dark:bg-[#1c2128] p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-[#77716b] dark:text-[#8b949e]">
            <CheckCircle2 className="size-4 text-[#1769c2] dark:text-[#58a6ff]" />
            <span className="text-[11px] font-semibold">Completion Rate</span>
          </div>
          <p className="mt-2 text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">
            {data.completion_rate_percentage}%
          </p>
        </div>

        <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#fcfbf9] dark:bg-[#1c2128] p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-[#77716b] dark:text-[#8b949e]">
            <TrendingUp className="size-4 text-amber-600 dark:text-amber-400" />
            <span className="text-[11px] font-semibold">Total Streams</span>
          </div>
          <p className="mt-2 text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">
            {data.total_views}
          </p>
        </div>
      </div>

      {/* 2. AUDIENCE RETENTION DROPOFF CURVE */}
      <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
              <TrendingUp className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
              <span>Audience Retention & Drop-off Points</span>
            </h4>
            <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
              Normalized student retention curve across lecture timestamps
            </p>
          </div>
        </div>

        {/* CSS Retention Visualizer */}
        <div className="h-40 w-full pt-4 pb-2 flex items-end gap-1.5 sm:gap-2">
          {data.retention_curve.map((pt) => {
            const h = `${Math.max(10, pt.retention_percentage)}%`;
            return (
              <div key={pt.percentile} className="flex-1 flex flex-col items-center gap-1 group/bar h-full justify-end">
                <div
                  style={{ height: h }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#0f4c81] to-[#38bdf8] group-hover/bar:brightness-125 transition-all relative"
                >
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition rounded bg-black px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap shadow-md">
                    {pt.retention_percentage}% ({formatMinSec(pt.time_seconds)})
                  </div>
                </div>
                <span className="text-[9px] text-[#77716b] dark:text-[#8b949e]">{pt.percentile}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. REWATCH HOTSPOTS & ENGAGEMENT */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Rewatch Hotspots */}
        <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-xs space-y-3">
          <h4 className="font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2 text-xs">
            <Flame className="size-4 text-orange-500" />
            <span>Most Rewatched Segments</span>
          </h4>
          <div className="space-y-2">
            {data.rewatch_hotspots.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-[#faf9f8] dark:bg-[#1c2128] p-2.5 text-xs border border-[#ded8d1] dark:border-[#30363d]"
              >
                <div>
                  <span className="font-bold text-[#171717] dark:text-[#f0f6fc]">
                    {formatMinSec(h.start_seconds)} - {formatMinSec(h.end_seconds)}
                  </span>
                  <p className="text-[10px] text-[#77716b] dark:text-[#8b949e]">Key clinical explanation</p>
                </div>
                <span className="rounded-full bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 text-[10px] font-bold text-orange-800 dark:text-orange-300">
                  {h.intensity}% Replay Intensity
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Bookmarked & Discussed */}
        <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-xs space-y-3">
          <h4 className="font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2 text-xs">
            <Bookmark className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
            <span>Most Bookmarked Timestamps</span>
          </h4>
          <div className="space-y-2">
            {data.most_bookmarked_timestamps.map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-[#faf9f8] dark:bg-[#1c2128] p-2.5 text-xs border border-[#ded8d1] dark:border-[#30363d]"
              >
                <span className="font-mono font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                  {formatMinSec(b.timestamp_seconds)}
                </span>
                <span className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                  🔖 {b.count} clinical bookmarks
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
