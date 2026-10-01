"use client";

import * as React from "react";
import {
  Sparkles,
  X,
  Send,
  BookOpen,
  HelpCircle,
  FileText,
  Brain,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import { AskAIMessage, AskAIContext } from "../types";

interface AskAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: AskAIContext;
}

export function AskAIModal({ isOpen, onClose, context }: AskAIModalProps) {
  const [messages, setMessages] = React.useState<AskAIMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = React.useState<Record<string, number>>({});
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Initialize greeting with context
  React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      const topicName = context?.lessonTitle
        ? `Lesson: "${context.lessonTitle}"`
        : context?.courseTitle
        ? `Course: "${context.courseTitle}"`
        : "Medical & Healthcare Studies";

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello Doctor / Colleague! I am your **MGN Medical AI Study Assistant**.\n\nCurrently assisting you with **${topicName}**.\n\nHow can I support your clinical learning today? Choose a quick study prompt below or ask any specific clinical question.`,
          timestamp: new Date().toISOString(),
          action_type: "general",
        },
      ]);
    }
  }, [isOpen, context, messages.length]);

  // Scroll to bottom on new message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSendMessage = async (promptText: string, actionType: AskAIMessage["action_type"] = "general") => {
    if (!promptText.trim() || loading) return;

    const userMsg: AskAIMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: promptText,
      timestamp: new Date().toISOString(),
      action_type: actionType,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/learn/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          actionType,
          context,
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: "err-" + Date.now(),
            role: "assistant",
            content: "I apologize, an error occurred while processing your request. Please try again.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "Network error. Please verify your connection and try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: "💡 Explain in simple terms",
      prompt: `Explain the key concepts of ${context?.lessonTitle || context?.courseTitle || "this topic"} in clear clinical terms with analogies.`,
      actionType: "explanation" as const,
      icon: BookOpen,
    },
    {
      label: "📝 Generate revision notes",
      prompt: `Generate high-yield bullet revision notes and clinical pearls for ${context?.lessonTitle || context?.courseTitle || "this topic"}.`,
      actionType: "notes" as const,
      icon: FileText,
    },
    {
      label: "❓ Create quick quiz",
      prompt: `Create an active recall clinical MCQ quiz testing my understanding of ${context?.lessonTitle || context?.courseTitle || "this topic"}.`,
      actionType: "quiz" as const,
      icon: HelpCircle,
    },
    {
      label: "🩺 Clinical reasoning",
      prompt: `Provide a structured clinical case scenario and differential diagnosis reasoning on ${context?.lessonTitle || context?.courseTitle || "this topic"}.`,
      actionType: "case_reasoning" as const,
      icon: Brain,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="flex h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#f0efee] dark:border-[#21262d] bg-gradient-to-r from-[#0f4c81]/10 via-white dark:via-[#161b22] to-emerald-500/10 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0f4c81] to-[#1769c2] text-white shadow-md">
              <Sparkles className="size-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                  MGN Medical AI Assistant
                </h3>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  Course-Aware
                </span>
              </div>
              <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] truncate max-w-xs sm:max-w-md">
                {context?.lessonTitle
                  ? `Lesson: ${context.lessonTitle}`
                  : context?.courseTitle
                  ? `Course: ${context.courseTitle}`
                  : "Clinical Learning & Exam Preparation"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl text-[#77716b] dark:text-[#8b949e] hover:bg-[#f0efee] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] transition cursor-pointer"
            aria-label="Close Ask AI modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Medical AI Disclaimer Banner */}
        <div className="bg-[#f8f9fc] dark:bg-[#1a2233] border-b border-[#e8eef8] dark:border-[#26324d] px-4 py-1.5 flex items-center gap-2 text-[10px] text-[#556987] dark:text-[#9fb3d0]">
          <Stethoscope className="size-3.5 text-[#0f4c81] dark:text-[#58a6ff] shrink-0" />
          <span>Educational assistant for revision, case reasoning, and high-yield synthesis.</span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#0f4c81] dark:bg-[#1f6feb] text-white font-medium rounded-br-xs"
                    : "bg-[#f8f7f6] dark:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc] border border-[#e8e6e3] dark:border-[#30363d] rounded-bl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap space-y-2">{msg.content}</div>

                {/* Interactive MCQ Quiz Render */}
                {msg.quiz_payload && (
                  <div className="mt-3 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-3 sm:p-4 text-xs space-y-3">
                    <p className="font-bold text-[#171717] dark:text-[#f0f6fc]">
                      {msg.quiz_payload.question}
                    </p>
                    <div className="space-y-1.5">
                      {msg.quiz_payload.options.map((opt, optIdx) => {
                        const isAnswered = selectedQuizAnswers[msg.id] !== undefined;
                        const isSelected = selectedQuizAnswers[msg.id] === optIdx;
                        const isCorrect = optIdx === msg.quiz_payload?.correctIndex;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isAnswered}
                            onClick={() =>
                              setSelectedQuizAnswers((prev) => ({
                                ...prev,
                                [msg.id]: optIdx,
                              }))
                            }
                            className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                              !isAnswered
                                ? "border-[#ded8d1] dark:border-[#30363d] hover:bg-[#f8f7f6] dark:hover:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc]"
                                : isCorrect
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold"
                                : isSelected
                                ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300"
                                : "border-[#ded8d1] dark:border-[#30363d] text-[#77716b] opacity-60"
                            }`}
                          >
                            <span className="font-bold mr-2">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {selectedQuizAnswers[msg.id] !== undefined && (
                      <div className="mt-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 p-2.5 text-[11px] text-[#0f4c81] dark:text-[#58a6ff]">
                        <span className="font-bold">Explanation: </span>
                        {msg.quiz_payload.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="mt-1 text-[10px] text-[#8a8784] dark:text-[#8b949e] px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#0f4c81] dark:text-[#58a6ff] bg-[#f0f7ff] dark:bg-[#1c2433] rounded-2xl p-3 max-w-[70%] animate-pulse">
              <RefreshCw className="size-4 animate-spin" />
              <span>Analyzing clinical literature & synthesizing response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Chips */}
        <div className="border-t border-[#f0efee] dark:border-[#21262d] bg-[#faf9f8] dark:bg-[#161b22] px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.label}
                type="button"
                onClick={() => handleSendMessage(q.prompt, q.actionType)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-2.5 py-1.5 text-[11px] font-semibold text-[#5d5854] dark:text-[#f0f6fc] hover:border-[#0f4c81] hover:text-[#0f4c81] dark:hover:text-[#58a6ff] transition cursor-pointer shadow-2xs"
              >
                <Icon className="size-3 text-[#0f4c81] dark:text-[#58a6ff]" />
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="border-t border-[#f0efee] dark:border-[#21262d] p-3 sm:p-4 bg-white dark:bg-[#161b22] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask medical question or clinical reasoning step..."
            className="flex-1 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#21262d] px-3.5 py-2.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="inline-flex size-10 items-center justify-center rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] text-white shadow-xs hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer"
            aria-label="Send message"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
