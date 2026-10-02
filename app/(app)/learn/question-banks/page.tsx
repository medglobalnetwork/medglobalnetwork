"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import { QuestionBankItem } from "@/modules/learn/types";

export default function QuestionBanksPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [questionBanks, setQuestionBanks] = React.useState<QuestionBankItem[]>([]);
  const [selectedSubject, setSelectedSubject] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  // Custom Test Builder Modal State
  const [showBuilderModal, setShowBuilderModal] = React.useState(false);
  const [builderSubject, setBuilderSubject] = React.useState("Anatomy");
  const [builderDifficulty, setBuilderDifficulty] = React.useState("medium");
  const [builderCount, setBuilderCount] = React.useState(15);
  const [builderTime, setBuilderTime] = React.useState(20);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const loadQuestionBanks = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        if (selectedSubject !== "All") query.set("subject", selectedSubject);
        if (searchQuery.trim()) query.set("search", searchQuery.trim());

        const res = await fetch(`/api/learn/question-banks?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setQuestionBanks(data.questionBanks || []);
        }
      } catch (err) {
        console.error("Failed to load question banks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestionBanks();
  }, [session?.user, selectedSubject, searchQuery]);

  const handleLaunchCustomTest = () => {
    router.push(
      `/learn/practice?subject=${encodeURIComponent(builderSubject)}&difficulty=${builderDifficulty}&limit=${builderCount}`
    );
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
      <StudentNavHeader activeTab="practice" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
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
                Medical Question Banks 🗂️
              </h1>
            </div>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 ml-8">
              Faculty-curated clinical question banks and intelligent custom exam generator.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowBuilderModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0f4c81] text-xs font-bold transition shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="size-4" /> Custom Test Builder
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Anatomy", "Physiology", "Pharmacology", "Pathology"].map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedSubject === subj
                    ? "bg-[#0f4c81] text-white"
                    : "bg-[#f5f4f2] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] hover:bg-[#e8e6e3]"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#9c958f]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question banks..."
              className="w-full bg-[#f8f7f6] dark:bg-[#21262d] pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Question Banks Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl h-48 animate-pulse"
              />
            ))}
          </div>
        ) : questionBanks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {questionBanks.map((qb) => (
              <div
                key={qb.id}
                className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#0f4c81] dark:text-[#58a6ff]">
                      {qb.subject}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {qb.question_count} Questions
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                    {qb.title}
                  </h3>

                  <p className="text-xs text-[#5d5854] dark:text-[#8b949e] line-clamp-2 leading-relaxed">
                    {qb.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {qb.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#77716b]">
                    <ShieldCheck className="size-3.5 text-blue-500" />
                    <span>{qb.creator_name}</span>
                  </div>

                  <Link
                    href={`/learn/practice?subject=${encodeURIComponent(qb.subject)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-xs font-bold transition shadow-xs"
                  >
                    <Play className="size-3" /> Practice Bank
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-12 text-center text-xs text-[#77716b]">
            No question banks found for your query.
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* CUSTOM TEST BUILDER MODAL */}
        {/* ───────────────────────────────────────────── */}
        {showBuilderModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-500" />
                  Custom Assessment Generator
                </h3>
                <p className="text-xs text-[#77716b]">
                  Assemble a tailored clinical test from verified database questions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5d5854]">Subject</label>
                  <select
                    value={builderSubject}
                    onChange={(e) => setBuilderSubject(e.target.value)}
                    className="w-full bg-[#f8f7f6] dark:bg-[#21262d] p-2.5 rounded-xl text-xs font-semibold border border-[#e8e6e3]"
                  >
                    <option value="Anatomy">Anatomy</option>
                    <option value="Physiology">Physiology</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Pathology">Pathology</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#5d5854]">Question Count</label>
                    <select
                      value={builderCount}
                      onChange={(e) => setBuilderCount(Number(e.target.value))}
                      className="w-full bg-[#f8f7f6] dark:bg-[#21262d] p-2.5 rounded-xl text-xs font-semibold border border-[#e8e6e3]"
                    >
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                      <option value={25}>25 Questions</option>
                      <option value={50}>50 Questions</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#5d5854]">Difficulty</label>
                    <select
                      value={builderDifficulty}
                      onChange={(e) => setBuilderDifficulty(e.target.value)}
                      className="w-full bg-[#f8f7f6] dark:bg-[#21262d] p-2.5 rounded-xl text-xs font-semibold border border-[#e8e6e3]"
                    >
                      <option value="easy">Easy (Foundational)</option>
                      <option value="medium">Medium (Clinical)</option>
                      <option value="hard">Hard (Advanced Vignettes)</option>
                      <option value="all">Mixed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0efee] dark:border-[#21262d]">
                <button
                  type="button"
                  onClick={() => setShowBuilderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#77716b]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLaunchCustomTest}
                  className="px-5 py-2 rounded-xl bg-[#0f4c81] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="size-3.5 fill-white" /> Generate & Start Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
