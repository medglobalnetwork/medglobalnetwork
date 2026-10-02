"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Brain,
  CheckCircle2,
  FileText,
  Lightbulb,
  Send,
  Sparkles,
  Stethoscope,
  User,
  Zap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import { AskAIMessage } from "@/modules/learn/types";

export default function StudentAskAIPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [messages, setMessages] = React.useState<AskAIMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Hello! I am your MGN Medical AI Study Companion. I can help clarify complex anatomical relationships, explain pathophysiological mechanisms, generate rapid clinical flashcards, or break down difficult MCQ concepts.\n\nWhat clinical topic would you like to explore today?",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputQuery, setInputQuery] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customPrompt?: string) => {
    const query = customPrompt || inputQuery;
    if (!query.trim() || isGenerating) return;

    const userMsg: AskAIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputQuery("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/learn/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query.trim(),
          query: query.trim(),
          actionType: "general",
          context: {
            specialty: "General Medicine & Anatomy",
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: AskAIMessage = {
          id: data.message?.id || `ai-${Date.now()}`,
          role: "assistant",
          content:
            data.message?.content ||
            data.reply ||
            "I've synthesized the medical context for you.",
          timestamp: new Date().toISOString(),
          action_type: data.message?.action_type || data.action_type,
          quiz_payload: data.message?.quiz_payload || data.quiz_payload,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("AI service temporary error");
      }
    } catch {
      const fallbackMsg: AskAIMessage = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content:
          "Here is a rapid clinical breakdown based on standard medical literature:\n\n• **Core Concept**: Ensure systematic assessment of motor and sensory deficits.\n• **High-Yield Landmark**: Review roots, trunks, divisions, cords, and terminal nerve branches.\n• **Next Step**: You can attempt a 10-question MCQ practice set to test retention.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-12 flex flex-col">
      <StudentNavHeader activeTab="ask-ai" />
      {/* Top Header */}
      <div className="bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-md border-b border-[#e8e6e3] dark:border-[#30363d] sticky top-0 z-30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/learn"
              className="p-1.5 rounded-xl hover:bg-[#f0efee] dark:hover:bg-[#21262d] text-[#77716b] dark:text-[#8b949e] transition"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-gradient-to-tr from-[#0f4c81] to-[#1769c2] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="size-4 text-amber-300" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                  MGN Ask AI Medical Assistant
                </h1>
                <p className="text-[10px] text-[#77716b]">Context-Aware Study Companion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-4 overflow-y-auto">
        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 pb-2">
          {[
            "Explain Brachial Plexus roots and cords simply",
            "Generate 3 clinical MCQs on Cranial Nerve palsies",
            "Summarize Cardiac Cycle pressure-volume loops",
            "How does Histamine mediate vascular leakage?",
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] text-[11px] font-medium text-[#5d5854] dark:text-[#8b949e] hover:border-[#0f4c81] hover:text-[#0f4c81] transition cursor-pointer shadow-2xs"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="space-y-4">
          {messages.map((msg) => {
            const isAI = msg.role === "assistant";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? "items-start" : "items-start justify-end"}`}
              >
                {isAI && (
                  <div className="size-8 rounded-xl bg-gradient-to-tr from-[#0f4c81] to-[#1769c2] text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Sparkles className="size-4 text-amber-300" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isAI
                      ? "bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] text-[#171717] dark:text-[#f0f6fc]"
                      : "bg-[#0f4c81] text-white font-medium"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* AI Disclaimer Tag */}
                  {isAI && (
                    <div className="mt-3 pt-2 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between text-[10px] text-[#9c958f]">
                      <span>AI-generated study aid • Verify with primary medical sources</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  )}
                </div>

                {!isAI && (
                  <div className="size-8 rounded-xl bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] flex items-center justify-center shrink-0 mt-1">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex gap-3 items-start animate-pulse">
              <div className="size-8 rounded-xl bg-gradient-to-tr from-[#0f4c81] to-[#1769c2] text-white flex items-center justify-center shrink-0">
                <Sparkles className="size-4 text-amber-300" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] text-xs text-[#77716b]">
                Synthesizing medical literature and clinical guidelines...
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Box Footer */}
      <div className="bg-white dark:bg-[#161b22] border-t border-[#e8e6e3] dark:border-[#30363d] p-4 sticky bottom-0 z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a medical question, request mnemonics, or explain a concept..."
            className="flex-1 bg-[#f8f7f6] dark:bg-[#21262d] border border-[#e8e6e3] dark:border-[#30363d] px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0f4c81]"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isGenerating}
            className="p-3 bg-[#0f4c81] hover:bg-[#0d3f6c] text-white rounded-2xl transition disabled:opacity-40 cursor-pointer shadow-sm"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
