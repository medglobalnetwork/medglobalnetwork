"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Layers,
  Plus,
  Video,
} from "lucide-react";
import { CreateCourseInput } from "../types";

export function InstructorBuilder() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [createdCourseId, setCreatedCourseId] = React.useState<string | null>(null);

  // Step 1: Course Info
  const [title, setTitle] = React.useState("");
  const [shortDesc, setShortDesc] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState("");
  const [category, setCategory] = React.useState("Physiotherapy");
  const [profession, setProfession] = React.useState("Physiotherapist");
  const [specialization, setSpecialization] = React.useState("");
  const [level, setLevel] = React.useState<any>("all_levels");
  const [isFree, setIsFree] = React.useState(true);
  const [price, setPrice] = React.useState(0);
  const [certEnabled, setCertEnabled] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Step 2: Curriculum
  const [moduleTitle, setModuleTitle] = React.useState("");
  const [modules, setModules] = React.useState<{ id: string; title: string; lessons: any[] }[]>([]);
  const [activeModuleId, setActiveModuleId] = React.useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = React.useState("");
  const [lessonType, setLessonType] = React.useState<string>("video");
  const [lessonUrl, setLessonUrl] = React.useState("");
  const [lessonContent, setLessonContent] = React.useState("");
  const [lessonDuration, setLessonDuration] = React.useState(10);

  // Step 1 Submit: Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Course title is required");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload: CreateCourseInput = {
        title: title.trim(),
        short_description: shortDesc.trim() || undefined,
        description: description.trim() || undefined,
        thumbnail: thumbnail.trim() || undefined,
        category,
        profession,
        specialization: specialization.trim() || undefined,
        level,
        is_free: isFree,
        price: isFree ? 0 : Number(price),
        certificate_enabled: certEnabled,
      };

      const res = await fetch("/api/learn/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");

      setCreatedCourseId(data.courseId);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save course");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Module
  const handleAddModule = async () => {
    if (!moduleTitle.trim() || !createdCourseId) return;
    try {
      const res = await fetch(`/api/learn/courses/${createdCourseId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "module",
          title: moduleTitle.trim(),
          orderIndex: modules.length,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setModules((prev) => [
          ...prev,
          { id: data.moduleId, title: moduleTitle.trim(), lessons: [] },
        ]);
        setActiveModuleId(data.moduleId);
        setModuleTitle("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Lesson
  const handleAddLesson = async () => {
    if (!lessonTitle.trim() || !activeModuleId || !createdCourseId) return;
    try {
      const res = await fetch(`/api/learn/courses/${createdCourseId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lesson",
          moduleId: activeModuleId,
          title: lessonTitle.trim(),
          lessonType,
          mediaUrl: lessonUrl.trim() || undefined,
          content: lessonContent.trim() || undefined,
          durationSeconds: Number(lessonDuration) * 60,
          orderIndex: 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setModules((prev) =>
          prev.map((m) =>
            m.id === activeModuleId
              ? {
                  ...m,
                  lessons: [
                    ...m.lessons,
                    { id: data.lessonId, title: lessonTitle.trim(), type: lessonType },
                  ],
                }
              : m
          )
        );
        setLessonTitle("");
        setLessonUrl("");
        setLessonContent("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Step Tabs Header */}
      <div className="flex items-center justify-between border-b border-[#ded8d1] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#171717]">Instructor Course Studio</h2>
          <p className="text-xs text-[#77716b]">
            Publish accredited courses and training modules for healthcare professionals
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              step === 1 ? "bg-[#1769c2] text-white" : "bg-[#eef5fc] text-[#1769c2]"
            }`}
          >
            1
          </span>
          <span className="text-[#ded8d1]">─</span>
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              step === 2 ? "bg-[#1769c2] text-white" : "bg-[#f0efee] text-[#77716b]"
            }`}
          >
            2
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: BASIC COURSE INFO */}
      {step === 1 && (
        <form onSubmit={handleCreateCourse} className="space-y-4 rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clinical Assessment & Management of ACL Tears"
              className="h-10 w-full rounded-xl border border-[#ded8d1] px-3.5 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717]"
              >
                <option value="Physiotherapy">Physiotherapy</option>
                <option value="Medicine">Medicine</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Clinical Research">Clinical Research</option>
                <option value="Nursing">Nursing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                Target Profession *
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717]"
              >
                <option value="Physiotherapist">Physiotherapist</option>
                <option value="Doctor / Physician">Doctor / Physician</option>
                <option value="Surgeon">Surgeon</option>
                <option value="Nurse">Nurse</option>
                <option value="Researcher">Researcher</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Short Summary
            </label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Brief 1-2 sentence description for course cards..."
              className="h-10 w-full rounded-xl border border-[#ded8d1] px-3.5 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Full Syllabus & Learning Outcomes
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed syllabus, clinical requirements, and target outcomes..."
              className="w-full rounded-xl border border-[#ded8d1] p-3 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Thumbnail Image URL
            </label>
            <input
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://images.unsplash.com/photo-... or medical banner link"
              className="h-10 w-full rounded-xl border border-[#ded8d1] px-3.5 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-6 border-t border-[#f5f4f3] pt-4 text-xs">
            <label className="flex items-center gap-2 font-semibold text-[#171717] cursor-pointer">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="h-4 w-4 rounded border-[#ded8d1] text-[#1769c2]"
              />
              Free Course for Healthcare Peers
            </label>

            <label className="flex items-center gap-2 font-semibold text-[#171717] cursor-pointer">
              <input
                type="checkbox"
                checked={certEnabled}
                onChange={(e) => setCertEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-[#ded8d1] text-[#1769c2]"
              />
              Award Accredited MGN Certificate on Completion
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#12569f] disabled:opacity-50"
            >
              {isSubmitting ? "Creating Course..." : (
                <>
                  Save & Proceed to Curriculum <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: CURRICULUM & LESSONS */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Add Module Box */}
          <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#1769c2]" /> Step 2: Add Curriculum Modules
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g. Module 1: Diagnostic Protocols & Physical Tests"
                className="h-10 flex-1 rounded-xl border border-[#ded8d1] px-3 text-xs text-[#171717]"
              />
              <button
                type="button"
                onClick={handleAddModule}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-bold text-white hover:bg-[#12569f]"
              >
                <Plus className="h-3.5 w-3.5" /> Add Module
              </button>
            </div>

            {/* Created Modules List */}
            {modules.length > 0 && (
              <div className="space-y-3 pt-2">
                {modules.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-2xl border p-4 transition ${
                      activeModuleId === m.id ? "border-[#1769c2] bg-[#eef5fc]" : "border-[#ded8d1]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#171717]">{m.title}</h4>
                      <button
                        type="button"
                        onClick={() => setActiveModuleId(m.id)}
                        className="text-[11px] font-semibold text-[#1769c2] hover:underline"
                      >
                        {activeModuleId === m.id ? "Active Module" : "Select to Add Lessons"}
                      </button>
                    </div>

                    {/* Lessons list in this module */}
                    {m.lessons.length > 0 && (
                      <ul className="mt-2 space-y-1.5 text-xs text-[#5d5854] border-t border-black/5 pt-2">
                        {m.lessons.map((l, i) => (
                          <li key={l.id} className="flex items-center gap-2">
                            <span className="text-[11px] text-[#77716b]">{i + 1}.</span>
                            {l.type === "video" ? (
                              <Video className="h-3.5 w-3.5 text-[#1769c2]" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 text-[#047857]" />
                            )}
                            <span className="font-medium text-[#171717]">{l.title}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Lesson to Active Module */}
          {activeModuleId && (
            <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#171717]">Add Lesson to Selected Module</h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="e.g. Lachman & Pivot Shift Tests Demo"
                    className="h-10 w-full rounded-xl border border-[#ded8d1] px-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Lesson Type
                  </label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs"
                  >
                    <option value="video">Video (URL / YouTube)</option>
                    <option value="article">Clinical Article / Notes</option>
                  </select>
                </div>
              </div>

              {lessonType === "video" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      Video URL (YouTube or MP4)
                    </label>
                    <input
                      type="url"
                      value={lessonUrl}
                      onChange={(e) => setLessonUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="h-10 w-full rounded-xl border border-[#ded8d1] px-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      Estimated Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      value={lessonDuration}
                      onChange={(e) => setLessonDuration(Number(e.target.value))}
                      className="h-10 w-full rounded-xl border border-[#ded8d1] px-3 text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Article / Study Notes Content
                  </label>
                  <textarea
                    rows={4}
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    placeholder="Write clinical instructions, literature notes, or protocols..."
                    className="w-full rounded-xl border border-[#ded8d1] p-3 text-xs"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleAddLesson}
                disabled={!lessonTitle.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-bold text-white hover:bg-[#12569f] disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" /> Save Lesson to Module
              </button>
            </div>
          )}

          {/* Finish & View Course */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-semibold text-[#5d5854]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Edit Course Info
            </button>

            <button
              type="button"
              onClick={() => router.push(`/learn/course/${createdCourseId}`)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#15803d] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#166534]"
            >
              <CheckCircle2 className="h-4 w-4" /> Complete & View Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
