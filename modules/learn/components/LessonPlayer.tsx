"use client";

import * as React from "react";
import { CourseLesson } from "../types";

interface LessonPlayerProps {
  lesson: CourseLesson;
  onCompleteLesson: () => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function LessonPlayer({
  lesson,
  onCompleteLesson,
  onNextLesson,
  onPrevLesson,
  hasNext = false,
  hasPrev = false,
}: LessonPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Sync initial playback position
  React.useEffect(() => {
    if (videoRef.current && lesson.last_position_seconds) {
      videoRef.current.currentTime = lesson.last_position_seconds;
    }
  }, [lesson.id, lesson.last_position_seconds]);

  // Periodic progress tracking (every 5 seconds)
  React.useEffect(() => {
    if (!videoRef.current || lesson.lesson_type !== "video") return;

    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        const cur = Math.floor(videoRef.current.currentTime);
        const dur = Math.floor(videoRef.current.duration) || lesson.duration_seconds || 1;
        const pct = Math.min(100, Math.round((cur / dur) * 100));

        fetch(`/api/learn/lessons/${lesson.id}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            progressPercentage: pct,
            lastPositionSeconds: cur,
            completed: pct >= 90,
          }),
        }).catch(() => {});
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lesson.id, lesson.lesson_type, lesson.duration_seconds]);

  const handleManualComplete = async () => {
    setIsMarkingComplete(true);
    try {
      await fetch(`/api/learn/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressPercentage: 100,
          lastPositionSeconds: lesson.duration_seconds || 0,
          completed: true,
        }),
      });
      onCompleteLesson();
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  return (
    <div className="flex flex-col space-y-5">
      {/* 1. MEDIA VIEWER CANVAS */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-black/10 bg-black shadow-md">
        {lesson.lesson_type === "video" ? (
          lesson.media_url ? (
            lesson.media_url.includes("youtube.com") || lesson.media_url.includes("youtu.be") ? (
              <iframe
                src={
                  lesson.media_url.includes("embed")
                    ? lesson.media_url
                    : `https://www.youtube.com/embed/${lesson.media_url.split("v=")[1]?.split("&")[0] || ""}`
                }
                title={lesson.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={lesson.media_url}
                controls
                playsInline
                className="h-full w-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleManualComplete}
              />
            )
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-white/70">
              <span className="text-4xl">🎥</span>
              <p className="mt-2 text-xs">Video content is currently processing or unavailable.</p>
            </div>
          )
        ) : lesson.lesson_type === "article" ? (
          <div className="flex h-full w-full flex-col justify-center bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-8 text-center text-white">
            <span className="text-4xl">📄</span>
            <h3 className="mt-2 text-lg font-bold">{lesson.title}</h3>
            <p className="mt-1 text-xs text-white/70">Interactive Clinical Reading</p>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0f4c81] to-[#1e3a8a] p-8 text-center text-white">
            <span className="text-4xl">📑</span>
            <h3 className="mt-2 text-lg font-bold">{lesson.title}</h3>
            <p className="mt-1 text-xs text-white/70">Document & Clinical Protocol</p>
          </div>
        )}
      </div>

      {/* 2. LESSON DETAILS & CONTROLS */}
      <div className="rounded-2xl border border-[#ded8d1] bg-white p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#eef5fc] px-2.5 py-0.5 text-[10px] font-bold text-[#1769c2] uppercase">
                {lesson.lesson_type}
              </span>
              {lesson.completed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#047857]">
                  ✓ Completed
                </span>
              )}
            </div>
            <h2 className="mt-2 text-lg font-bold text-[#171717] sm:text-xl">{lesson.title}</h2>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualComplete}
              disabled={isMarkingComplete || lesson.completed}
              className={`rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition ${
                lesson.completed
                  ? "bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]"
                  : "bg-[#1769c2] text-white hover:bg-[#12569f]"
              }`}
            >
              {lesson.completed ? "✓ Lesson Finished" : isMarkingComplete ? "Saving..." : "Mark Complete"}
            </button>

            {hasNext && (
              <button
                type="button"
                onClick={onNextLesson}
                className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-[#f8f7f6]"
              >
                Next Lesson →
              </button>
            )}
          </div>
        </div>

        {/* Lesson Description / Rich Article Content */}
        {(lesson.content || lesson.description) && (
          <div className="mt-6 border-t border-[#f5f4f3] pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#77716b] mb-3">
              Study Notes & Key Takeaways
            </h3>
            <div className="prose prose-sm max-w-none text-xs leading-relaxed text-[#5d5854] whitespace-pre-line sm:text-sm">
              {lesson.content || lesson.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
