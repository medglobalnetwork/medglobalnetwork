import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#eef6fc] dark:bg-[#0d1117] flex flex-col justify-between">
      {/* Full-Screen 404 Visual Artwork */}
      <div className="absolute inset-0 size-full flex items-center justify-center">
        {/* Mobile Full-Screen 404 Image (Portrait) */}
        <img
          src="/404mob.png"
          alt="404 Page Not Found - MedGlobalNetwork"
          className="block sm:hidden size-full object-cover object-center"
        />

        {/* Desktop & Tablet Full-Screen 404 Image (Landscape) */}
        <img
          src="/404error.png"
          alt="404 Page Not Found - MedGlobalNetwork"
          className="hidden sm:block size-full object-cover lg:object-contain object-center"
        />
      </div>

      {/* Top Left Subtle Brand Link */}
      <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-[#161b22]/80 px-4 py-1.5 text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] backdrop-blur-md border border-[#e8e6e3]/80 dark:border-[#30363d]/80 shadow-xs hover:bg-white dark:hover:bg-[#161b22] transition"
        >
          <img src="/logo.png" alt="MGN" className="size-4 object-contain" />
          <span>MGN.life</span>
        </Link>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="relative z-10 p-4 sm:p-8 flex justify-center pb-6 sm:pb-8">
        <div className="flex items-center gap-3 rounded-2xl bg-white/90 dark:bg-[#161b22]/90 p-2 border border-slate-200/80 dark:border-slate-800/80 shadow-lg backdrop-blur-md">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition cursor-pointer active:scale-98"
          >
            <Home className="size-4" />
            <span>Go to Home</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-5 py-2.5 text-xs sm:text-sm font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#30363d] transition cursor-pointer active:scale-98"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Portal</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
