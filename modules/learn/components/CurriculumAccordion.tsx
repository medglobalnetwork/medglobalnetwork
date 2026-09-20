"use client";

import * as React from "react";
import { CourseModule, CourseLesson } from "../types";

interface CurriculumAccordionProps {
  modules: CourseModule[];
  currentLessonId?: string;
  onSelectLesson?: (lesson: CourseLesson) => void;
  isEnrolled?: boolean;
}

const LESSON_ICONS: Record<string, string> = {
  video: "🎥",
  article: "📄",
  pdf: "📑",
  resource: "📦",
  quiz: "📝",
};

export function CurriculumAccordion({
  modules,
  currentLessonId,
  onSelectLesson,
  isEnrolled = false,
}: CurriculumAccordionProps) {
  // By default expand first module
  const [openModuleIds, setOpenModuleIds] = React.useState<Set<string>>(
    new Set(modules.length > 0 ? [modules[0].id] : [])
  );

  const toggleModule = (id: string) => {
    setOpenModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  if (modules.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#ded8d1] p-6 text-center text-xs text-[#77716b]">
        No syllabus modules published yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {modules.map((mod, modIdx) => {
        const isOpen = openModuleIds.has(mod.id);
        const lessons = mod.lessons || [];
        const completedCount = lessons.filter((l) => l.completed).length;

        return (
          <div
            key={mod.id}
            className="overflow-hidden rounded-2xl border border-[#ded8d1] bg-white transition shadow-2xs"
          >
            {/* Module Accordion Header */}
            <button
              type="button"
              onClick={() => toggleModule(mod.id)}
              className="flex w-full items-center justify-between bg-[#faf9f8] p-4 text-left transition hover:bg-[#f5f4f3]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1769c2]/10 text-xs font-bold text-[#1769c2]">
                  {modIdx + 1}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#171717]">{mod.title}</h4>
                  <p className="text-[11px] text-[#77716b]">
                    {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                    {isEnrolled && ` · ${completedCount}/${lessons.length} completed`}
                  </p>
                </div>
              </div>

              <span className="text-xs text-[#77716b]">{isOpen ? "▲" : "▼"}</span>
            </button>

            {/* Lessons List */}
            {isOpen && (
              <div className="divide-y divide-[#f5f4f3] border-t border-[#ded8d1]">
                {lessons.length === 0 ? (
                  <p className="p-4 text-xs text-[#77716b]">No lessons in this module.</p>
                ) : (
                  lessons.map((lesson) => {
                    const isSelected = currentLessonId === lesson.id;
                    const canAccess = isEnrolled || lesson.is_preview;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => canAccess && onSelectLesson?.(lesson)}
                        disabled={!canAccess}
                        className={`flex w-full items-center justify-between p-3.5 text-left text-xs transition ${
                          isSelected
                            ? "bg-[#eef5fc] font-semibold text-[#1769c2]"
                            : canAccess
                            ? "hover:bg-[#faf9f8] text-[#171717]"
                            : "opacity-60 cursor-not-allowed bg-white text-[#77716b]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="text-sm">
                            {lesson.completed
                              ? "✅"
                              : LESSON_ICONS[lesson.lesson_type] || "📄"}
                          </span>
                          <span className="truncate">{lesson.title}</span>
                          {lesson.is_preview && !isEnrolled && (
                            <span className="rounded-full bg-[#eef5fc] px-2 py-0.5 text-[9px] font-bold text-[#1769c2]">
                              Preview
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {lesson.duration_seconds > 0 && (
                            <span className="text-[11px] text-[#77716b]">
                              {formatSeconds(lesson.duration_seconds)}
                            </span>
                          )}
                          {!canAccess && <span className="text-xs">🔒</span>}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
