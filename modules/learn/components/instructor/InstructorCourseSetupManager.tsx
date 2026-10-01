"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Coins,
  Edit,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Folder,
  FolderPlus,
  GraduationCap,
  Headphones,
  Image as ImageIcon,
  Layers,
  Layout,
  Plus,
  Presentation,
  Save,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  Video,
} from "lucide-react";
import { Course, CourseModule, CourseLesson, CreateCourseInput } from "../../types";
import { InstructorVideoUploadModal } from "../InstructorVideoUploadModal";
import { TeacherResourceUploadModal } from "../resources/TeacherResourceUploadModal";

interface InstructorCourseSetupManagerProps {
  initialCourseId?: string | null;
  onFinished?: () => void;
}

export function InstructorCourseSetupManager({
  initialCourseId,
  onFinished,
}: InstructorCourseSetupManagerProps) {
  const router = useRouter();
  const [courseId, setCourseId] = React.useState<string | null>(initialCourseId || null);
  const [activeStep, setActiveStep] = React.useState<1 | 2>(initialCourseId ? 2 : 1);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // STEP 1: COURSE SETUP & PRICING
  const [title, setTitle] = React.useState("");
  const [shortDesc, setShortDesc] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState("");
  const [category, setCategory] = React.useState("Physiotherapy");
  const [subcategory, setSubcategory] = React.useState("");
  const [profession, setProfession] = React.useState("Physiotherapist");
  const [specialization, setSpecialization] = React.useState("Orthopedic & Sports Rehab");
  const [level, setLevel] = React.useState<any>("all_levels");
  const [language, setLanguage] = React.useState("English");

  // Pricing & Subscription Tiers
  const [isFree, setIsFree] = React.useState(true);
  const [price, setPrice] = React.useState(0);
  const [discountPrice, setDiscountPrice] = React.useState<number | "">("");
  const [subscriptionTier, setSubscriptionTier] = React.useState<"standard" | "premium" | "all_access">("standard");
  const [bundleAccess, setBundleAccess] = React.useState(true);

  // Certification & Accreditation
  const [certEnabled, setCertEnabled] = React.useState(true);
  const [accreditation, setAccreditation] = React.useState("CME / CPD Accredited");
  const [status, setStatus] = React.useState<any>("published");

  // STEP 2: HIERARCHICAL CURRICULUM (FOLDERS & LECTURES)
  const [modules, setModules] = React.useState<{ id: string; title: string; description?: string; lessons: any[] }[]>([]);
  const [activeModuleId, setActiveModuleId] = React.useState<string | null>(null);

  // Add Folder/Module State
  const [folderTitle, setFolderTitle] = React.useState("");
  const [folderDesc, setFolderDesc] = React.useState("");

  // Add Lecture State
  const [lessonTitle, setLessonTitle] = React.useState("");
  const [lessonType, setLessonType] = React.useState<string>("video");
  const [lessonUrl, setLessonUrl] = React.useState("");
  const [lessonContent, setLessonContent] = React.useState("");
  const [lessonDuration, setLessonDuration] = React.useState(15);
  const [lessonIsPreview, setLessonIsPreview] = React.useState(false);

  // Modals
  const [showVideoModal, setShowVideoModal] = React.useState(false);
  const [showResourceModal, setShowResourceModal] = React.useState(false);

  // Load existing course if courseId is passed
  React.useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    fetch(`/api/learn/courses/${courseId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.course) {
          const c = data.course;
          setTitle(c.title || "");
          setShortDesc(c.short_description || "");
          setDescription(c.description || "");
          setThumbnail(c.thumbnail || "");
          setCategory(c.category || "Physiotherapy");
          setSubcategory(c.subcategory || "");
          setProfession(c.profession || "Physiotherapist");
          setSpecialization(c.specialization || "");
          setLevel(c.level || "all_levels");
          setLanguage(c.language || "English");
          setIsFree(Boolean(c.is_free));
          setPrice(c.price || 0);
          setDiscountPrice(c.discount_price || "");
          setCertEnabled(Boolean(c.certificate_enabled));
          setAccreditation(c.accreditation || "CME / CPD Accredited");
          setSubscriptionTier(c.subscription_tier || "standard");
          setBundleAccess(c.bundle_access ?? true);
          setStatus(c.status || "published");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Fetch curriculum
    fetchCurriculum(courseId);
  }, [courseId]);

  const fetchCurriculum = async (cid: string) => {
    try {
      const res = await fetch(`/api/learn/courses/${cid}/curriculum`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.modules)) {
        setModules(data.modules);
        if (data.modules.length > 0 && !activeModuleId) {
          setActiveModuleId(data.modules[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // STEP 1 SUBMIT: SAVE COURSE METADATA & PRICING
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Course Title is required");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload: CreateCourseInput = {
      title: title.trim(),
      short_description: shortDesc.trim() || undefined,
      description: description.trim() || undefined,
      thumbnail: thumbnail.trim() || undefined,
      category,
      subcategory: subcategory.trim() || undefined,
      profession,
      specialization: specialization.trim() || undefined,
      level,
      language,
      is_free: isFree,
      price: isFree ? 0 : Number(price),
      discount_price: isFree || !discountPrice ? undefined : Number(discountPrice),
      certificate_enabled: certEnabled,
      accreditation: accreditation.trim() || undefined,
      subscription_tier: subscriptionTier,
      bundle_access: bundleAccess,
      status,
    };

    try {
      if (courseId) {
        // Update existing course
        const res = await fetch(`/api/learn/instructor/courses/${courseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update course");
        setSuccessMsg("Course details and pricing settings saved successfully.");
        setActiveStep(2);
      } else {
        // Create new course
        const res = await fetch("/api/learn/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create course");
        setCourseId(data.courseId);
        setActiveStep(2);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  // ADD FOLDER / MODULE
  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderTitle.trim() || !courseId) return;

    try {
      const res = await fetch(`/api/learn/courses/${courseId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "module",
          title: folderTitle.trim(),
          description: folderDesc.trim() || undefined,
          orderIndex: modules.length,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setFolderTitle("");
        setFolderDesc("");
        fetchCurriculum(courseId);
        setActiveModuleId(data.moduleId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE FOLDER / MODULE
  const handleDeleteFolder = async (modId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this folder/module and all its lectures?")) return;
    try {
      const res = await fetch(`/api/learn/courses/${courseId}/curriculum?type=module&id=${modId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok && courseId) {
        fetchCurriculum(courseId);
        if (activeModuleId === modId) setActiveModuleId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ADD LECTURE
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !activeModuleId || !courseId) return;

    try {
      const res = await fetch(`/api/learn/courses/${courseId}/curriculum`, {
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
          isPreview: lessonIsPreview,
          orderIndex: 0,
        }),
        credentials: "include",
      });

      if (res.ok) {
        setLessonTitle("");
        setLessonUrl("");
        setLessonContent("");
        setLessonIsPreview(false);
        fetchCurriculum(courseId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE LECTURE
  const handleDeleteLesson = async (lesId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this lecture?")) return;
    try {
      const res = await fetch(`/api/learn/courses/${courseId}/curriculum?type=lesson&id=${lesId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok && courseId) fetchCurriculum(courseId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* STEPPER HEADER */}
      <div className="flex items-center justify-between border-b border-[#ded8d1] pb-4 dark:border-[#30363d]">
        <div className="space-y-0.5">
          <h2 className="text-lg font-black text-[#171717] dark:text-[#f0f6fc]">
            {courseId ? "Course Studio & Curriculum Manager" : "Create Accredited Course"}
          </h2>
          <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
            Configure pricing models, subscription tiers, certificates, and organized lecture folders.
          </p>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              activeStep === 1
                ? "bg-[#0f4c81] text-white"
                : "border border-[#ded8d1] bg-white text-[#5d5854] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]"
            }`}
          >
            <span>1. Course Setup & Pricing</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!courseId) {
                alert("Please save course metadata in Step 1 first.");
                return;
              }
              setActiveStep(2);
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              activeStep === 2
                ? "bg-[#0f4c81] text-white"
                : "border border-[#ded8d1] bg-white text-[#5d5854] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]"
            }`}
          >
            <span>2. Folder & Lecture Setup</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle className="size-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STEP 1: COURSE SETUP, SUBSCRIPTIONS & PRICING */}
      {activeStep === 1 && (
        <form onSubmit={handleSaveCourse} className="space-y-6">
          {/* 1. BASIC INFORMATION */}
          <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs dark:border-[#30363d] dark:bg-[#161b22] space-y-4">
            <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
              <BookOpen className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
              1. Course Overview & Target Healthcare Audience
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Evidence-Based Clinical Assessment of Knee & ACL Pathology"
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3.5 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                >
                  <option value="Physiotherapy">Physiotherapy</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Clinical Research">Clinical Research</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Target Profession *
                </label>
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                >
                  <option value="Physiotherapist">Physiotherapist</option>
                  <option value="Doctor / Physician">Doctor / Physician</option>
                  <option value="Surgeon">Surgeon</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Medical Student">Medical Student</option>
                  <option value="Researcher">Researcher</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Clinical Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                >
                  <option value="all_levels">All Levels</option>
                  <option value="beginner">Beginner / Foundation</option>
                  <option value="intermediate">Intermediate / Practitioner</option>
                  <option value="advanced">Advanced / Fellow</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Specialization / Clinical Focus
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Sports Injuries, Neuro-Rehab, Interventional Cardiology"
                  className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3.5 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Thumbnail Image Link
                </label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://... or uploaded image URL"
                  className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3.5 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                Short Summary
              </label>
              <input
                type="text"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="1-2 sentence overview shown on course cards..."
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3.5 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                Full Syllabus & Clinical Learning Outcomes
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed curriculum overview, diagnostic criteria, clinical objectives, and case assessment protocols..."
                className="w-full rounded-xl border border-[#ded8d1] bg-white p-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>
          </div>

          {/* 2. SUBSCRIPTION & PRICING MODEL */}
          <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs dark:border-[#30363d] dark:bg-[#161b22] space-y-4">
            <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
              <Coins className="size-4 text-[#16804d] dark:text-emerald-400" />
              2. Pricing Model & Subscription Tiers (INR)
            </h3>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 font-bold text-xs cursor-pointer">
                <input
                  type="radio"
                  name="pricingModel"
                  checked={isFree}
                  onChange={() => setIsFree(true)}
                  className="size-4 text-[#0f4c81]"
                />
                <span>Free Course (Open Medical Access)</span>
              </label>

              <label className="flex items-center gap-2 font-bold text-xs cursor-pointer">
                <input
                  type="radio"
                  name="pricingModel"
                  checked={!isFree}
                  onChange={() => setIsFree(false)}
                  className="size-4 text-[#0f4c81]"
                />
                <span>Paid Course (Individual or Subscription Purchase)</span>
              </label>
            </div>

            {!isFree && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-2xl bg-[#fbfaf9] p-4 dark:bg-[#0d1117] border border-[#ded8d1] dark:border-[#30363d]">
                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Standard Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required={!isFree}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="e.g. 1999"
                    className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs font-bold text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Discount / Early-Bird Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 999"
                    className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs font-bold text-[#16804d] dark:border-[#30363d] dark:bg-[#161b22] dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Subscription Tier Access
                  </label>
                  <select
                    value={subscriptionTier}
                    onChange={(e: any) => setSubscriptionTier(e.target.value)}
                    className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                  >
                    <option value="standard">Standard Course Tier</option>
                    <option value="premium">Premium Specialty Tier</option>
                    <option value="all_access">All-Access Medical Pass</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 3. CERTIFICATES & ACCREDITATION */}
          <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs dark:border-[#30363d] dark:bg-[#161b22] space-y-4">
            <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
              <Award className="size-4 text-amber-600 dark:text-amber-400" />
              3. Verified Certification & Accreditation
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={certEnabled}
                  onChange={(e) => setCertEnabled(e.target.checked)}
                  className="size-4 rounded border-[#ded8d1] text-[#0f4c81]"
                />
                <span className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                  Issue Verified MGN Digital Certificate upon 100% curriculum completion and passing tests
                </span>
              </label>

              {certEnabled && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Accreditation / Governing Council Name
                  </label>
                  <input
                    type="text"
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value)}
                    placeholder="e.g. CME / CPD Accredited Specialty Training"
                    className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f4c81] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="size-4" />
              <span>{saving ? "Saving Course..." : "Save & Proceed to Folders / Curriculum"}</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: HIERARCHICAL FOLDERS & LECTURE SETUP */}
      {activeStep === 2 && courseId && (
        <div className="space-y-6">
          {/* ADD FOLDER / MODULE CARD */}
          <form
            onSubmit={handleAddFolder}
            className="rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-xs dark:border-[#30363d] dark:bg-[#161b22] space-y-3"
          >
            <h3 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1.5">
              <FolderPlus className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
              Add Curriculum Section / Lecture Folder
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={folderTitle}
                  onChange={(e) => setFolderTitle(e.target.value)}
                  placeholder="e.g. Section 1: Physical Assessment & Diagnostic Protocols"
                  className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!folderTitle.trim()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f4c81] px-5 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Create Folder</span>
                </button>
              </div>
            </div>
          </form>

          {/* FOLDERS & LECTURES HIERARCHY */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1.5">
              <Folder className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
              Curriculum Structure ({modules.length} Folders)
            </h3>

            {modules.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#ded8d1] p-10 text-center dark:border-[#30363d]">
                <Folder className="mx-auto size-10 text-[#77716b] opacity-40 mb-2 dark:text-[#8b949e]" />
                <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                  No lecture folders added yet
                </p>
                <p className="mt-1 text-[11px] text-[#77716b] dark:text-[#8b949e]">
                  Use the section above to create your first curriculum module or folder.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((m, mIdx) => (
                  <div
                    key={m.id}
                    className={`rounded-3xl border transition shadow-2xs overflow-hidden ${
                      activeModuleId === m.id
                        ? "border-[#0f4c81] bg-white dark:border-[#58a6ff] dark:bg-[#161b22]"
                        : "border-[#ded8d1] bg-white dark:border-[#30363d] dark:bg-[#161b22]"
                    }`}
                  >
                    {/* Folder Header */}
                    <div className="flex items-center justify-between bg-[#fbfaf9] p-4 border-b border-[#f0efee] dark:bg-[#0d1117] dark:border-[#21262d]">
                      <div className="flex items-center gap-2">
                        <Folder className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
                        <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                          {mIdx + 1}. {m.title}
                        </h4>
                        <span className="text-[10px] text-[#77716b] dark:text-[#8b949e]">
                          ({m.lessons?.length || 0} Lectures)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModuleId(m.id)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                            activeModuleId === m.id
                              ? "bg-[#0f4c81] text-white dark:bg-[#58a6ff] dark:text-black"
                              : "border border-[#ded8d1] text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:text-[#8b949e]"
                          }`}
                        >
                          {activeModuleId === m.id ? "Selected Folder" : "Select to Add Lectures"}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteFolder(m.id, e)}
                          className="rounded p-1 text-[#77716b] hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete folder"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Lectures inside folder */}
                    <div className="p-4 space-y-2">
                      {(!m.lessons || m.lessons.length === 0) ? (
                        <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] italic">
                          No lectures inside this folder. Select it and add a video, note, or handout below.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {m.lessons.map((l: any, lIdx: number) => (
                            <div
                              key={l.id}
                              className="flex items-center justify-between rounded-xl border border-[#ded8d1] bg-[#fbfaf9] p-3 text-xs dark:border-[#30363d] dark:bg-[#0d1117]"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[11px] font-bold text-[#77716b] dark:text-[#8b949e]">
                                  {mIdx + 1}.{lIdx + 1}
                                </span>
                                {l.lesson_type === "video" ? (
                                  <Video className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
                                ) : l.lesson_type === "presentation" ? (
                                  <Presentation className="size-4 text-amber-600 dark:text-amber-400" />
                                ) : l.lesson_type === "audio" ? (
                                  <Headphones className="size-4 text-purple-600 dark:text-purple-400" />
                                ) : (
                                  <FileText className="size-4 text-[#16804d] dark:text-emerald-400" />
                                )}
                                <span className="font-bold text-[#171717] dark:text-[#f0f6fc]">
                                  {l.title}
                                </span>
                                {l.is_preview && (
                                  <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-[#0f4c81] dark:bg-blue-950 dark:text-blue-300">
                                    Free Preview
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-[#77716b] dark:text-[#8b949e]">
                                <span>{Math.round(l.duration_seconds / 60)} mins</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteLesson(l.id, e)}
                                  className="text-[#77716b] hover:text-red-600"
                                  title="Delete lecture"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ADD LECTURE FORM FOR ACTIVE FOLDER */}
          {activeModuleId && (
            <form
              onSubmit={handleAddLesson}
              className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs dark:border-[#30363d] dark:bg-[#161b22] space-y-4"
            >
              <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
                <Plus className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
                Add Lecture to Selected Folder
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Lecture Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="e.g. Pivot Shift Test Diagnostic Protocol"
                    className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Lecture Type
                  </label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                  >
                    <option value="video">Video Lecture (Upload or Streaming URL)</option>
                    <option value="article">Clinical Notes / Literature Article</option>
                    <option value="presentation">Slide Deck / Presentation (PPT)</option>
                    <option value="audio">Audio Lecture / Podcast</option>
                    <option value="pdf">PDF Clinical Handout</option>
                  </select>
                </div>
              </div>

              {lessonType === "video" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                        Video URL (or Upload to Cloudflare R2 Studio)
                      </label>
                      <input
                        type="text"
                        value={lessonUrl}
                        onChange={(e) => setLessonUrl(e.target.value)}
                        placeholder="https://... or uploaded storage key"
                        className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={lessonDuration}
                        onChange={(e) => setLessonDuration(Number(e.target.value))}
                        className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                      />
                    </div>
                  </div>

                  {/* Upload to R2 Button */}
                  <div className="flex items-center justify-between rounded-2xl bg-[#eef5fc] p-3 border border-[#0f4c81]/20 dark:bg-[#1f2937] dark:border-[#58a6ff]/20">
                    <div className="text-xs">
                      <span className="font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                        Cloudflare R2 Video Upload Pipeline
                      </span>
                      <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e]">
                        Transcode raw MP4/MOV videos with adaptive HLS streaming
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowVideoModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                    >
                      <Video className="size-3.5" />
                      <span>Upload Video</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                      Content / Study Notes / PDF Resource URL
                    </label>
                    <textarea
                      rows={4}
                      value={lessonContent}
                      onChange={(e) => setLessonContent(e.target.value)}
                      placeholder="Write formatted clinical content, protocols, literature summaries..."
                      className="w-full rounded-xl border border-[#ded8d1] bg-white p-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonIsPreview}
                    onChange={(e) => setLessonIsPreview(e.target.checked)}
                    className="size-4 rounded border-[#ded8d1] text-[#0f4c81]"
                  />
                  <span>Allow Free Preview (Students can view without enrollment)</span>
                </label>

                <button
                  type="submit"
                  disabled={!lessonTitle.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-5 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Save Lecture to Folder</span>
                </button>
              </div>
            </form>
          )}

          {/* FINISH FOOTER */}
          <div className="flex items-center justify-between border-t border-[#ded8d1] pt-4 dark:border-[#30363d]">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-bold text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Course Setup</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onFinished) onFinished();
                else router.push(`/learn/course/${courseId}`);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#16804d] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#13683f] transition shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="size-4" />
              <span>Finish & Preview Course</span>
            </button>
          </div>
        </div>
      )}

      {/* R2 VIDEO UPLOAD MODAL */}
      <InstructorVideoUploadModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        courseId={courseId || undefined}
        onUploadComplete={(data) => {
          if (data.storageKey) setLessonUrl(data.storageKey);
          if (data.videoAsset?.title && !lessonTitle) setLessonTitle(data.videoAsset.title);
        }}
      />
    </div>
  );
}
