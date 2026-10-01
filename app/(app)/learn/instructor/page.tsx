"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ShieldAlert, ArrowLeft, GraduationCap, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { InstructorStudioDashboard } from "@/modules/learn/components/InstructorStudioDashboard";

export default function InstructorPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [eligibility, setEligibility] = React.useState<{
    checking: boolean;
    eligible: boolean;
    reason?: string;
  }>({
    checking: true,
    eligible: false,
  });

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    fetch("/api/shared/eligibility?type=instructor", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          setEligibility({
            checking: false,
            eligible: false,
            reason: "Unable to verify instructor credentials.",
          });
          return;
        }
        const data = await res.json();
        setEligibility({
          checking: false,
          eligible: Boolean(data.eligible),
          reason: data.reason,
        });
      })
      .catch(() => {
        setEligibility({
          checking: false,
          eligible: false,
          reason: "Network error verifying instructor credentials.",
        });
      });
  }, [session?.user]);

  if (isPending || !session || eligibility.checking) {
    return (
      <main className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-[#0f4c81] border-t-transparent dark:border-[#58a6ff]" />
          <p className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
            Verifying instructor authorization...
          </p>
        </div>
      </main>
    );
  }

  if (!eligibility.eligible) {
    return (
      <main className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] pb-24 text-[#171717] dark:text-[#f0f6fc]">
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-xs mb-5">
            <Lock className="size-7" />
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-3">
            <ShieldAlert className="size-3.5" />
            Instructor Access Restricted
          </span>

          <h1 className="text-xl sm:text-2xl font-black text-[#171717] dark:text-[#f0f6fc]">
            Instructor Studio is Restricted
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] max-w-md mx-auto leading-relaxed">
            {eligibility.reason ||
              "Instructor Studio is exclusively reserved for verified medical educators, professors, clinical faculty, and authorized healthcare instructors."}
          </p>

          <div className="mt-6 p-4 rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-left space-y-2">
            <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
              Who is eligible for Instructor Studio?
            </p>
            <ul className="text-xs text-[#5d5854] dark:text-[#8b949e] space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#16804d] shrink-0" />
                Verified Healthcare Faculty & Professors
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#16804d] shrink-0" />
                Accredited Medical Institute Educators & Trainers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#16804d] shrink-0" />
                Verified Healthcare Organizations & Institutions
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/learn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-5 py-2.5 text-xs font-bold text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] transition"
            >
              <ArrowLeft className="size-3.5" />
              Back to Learn
            </Link>
            <Link
              href="/settings/verification"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f4c81] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-xs"
            >
              <GraduationCap className="size-3.5" />
              Request Verification
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] pb-36 text-[#171717] dark:text-[#f0f6fc]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div>
          <button
            type="button"
            onClick={() => router.push("/learn")}
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded cursor-pointer"
          >
            ← Back to Learn Home
          </button>
        </div>

        <InstructorStudioDashboard />
      </div>
    </main>
  );
}
