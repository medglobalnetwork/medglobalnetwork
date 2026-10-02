"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  FolderHeart,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";

export default function ResourcesHubPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
      <StudentNavHeader activeTab="resources" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Header */}
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
                Medical Learning Resources Hub 📚
              </h1>
            </div>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 ml-8">
              Access textbooks, interactive anatomical mind maps, question banks, and student study notes.
            </p>
          </div>
        </div>

        {/* 4 Core Resource Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Medical Books */}
          <Link
            href="/learn/books"
            className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#0f4c81] transition group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                <BookOpen className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center justify-between">
                  <span>Medical Books & Atlases</span>
                  <ArrowRight className="size-4 text-[#77716b] group-hover:text-[#0f4c81] transition" />
                </h2>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                  Open-access clinical handbooks, illustrated anatomical atlases, and textbook chapters with built-in eReader, highlighting, and resume reading support.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              Browse Books Library →
            </span>
          </Link>

          {/* 2. Interactive Mind Maps */}
          <Link
            href="/learn/mind-maps"
            className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#0f4c81] transition group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="size-14 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
                <Brain className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center justify-between">
                  <span>Interactive Mind Maps</span>
                  <ArrowRight className="size-4 text-[#77716b] group-hover:text-[#0f4c81] transition" />
                </h2>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                  Deep interactive hierarchical diagrams for Brachial Plexus, Cranial Nerves, Cardiac Conduction, and Autonomic Pharmacology with zoom and node inspector.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
              Explore Mind Maps →
            </span>
          </Link>

          {/* 3. Question Banks */}
          <Link
            href="/learn/question-banks"
            className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#0f4c81] transition group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center group-hover:scale-105 transition">
                <Layers className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center justify-between">
                  <span>Question Banks & Test Builder</span>
                  <ArrowRight className="size-4 text-[#77716b] group-hover:text-[#0f4c81] transition" />
                </h2>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                  Curated banks by subject (Anatomy, Physiology, Pharmacology, Pathology) with instant custom test generation and bookmarking.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] flex items-center gap-1">
              Browse Question Banks →
            </span>
          </Link>

          {/* 4. Notes & Study Community */}
          <Link
            href="/learn/notes"
            className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#0f4c81] transition group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="size-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
                <FileText className="size-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center justify-between">
                  <span>Student Notes & Community Feed</span>
                  <ArrowRight className="size-4 text-[#77716b] group-hover:text-[#0f4c81] transition" />
                </h2>
                <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                  Your private clinical notes with video timestamps and tags, alongside peer-published verified study summaries with discussion threads.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              Open Notes Workspace →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
