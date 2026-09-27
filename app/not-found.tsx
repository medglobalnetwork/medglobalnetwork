import Link from "next/link";
import { Home, ArrowLeft, RefreshCw, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] px-4 py-10 selection:bg-[#0f4c81]/15">
      <div className="max-w-md sm:max-w-xl w-full text-center flex flex-col items-center space-y-6">
        {/* Responsive 404 Illustration */}
        <div className="w-full flex justify-center">
          {/* Mobile Image (Visible on phones) */}
          <img
            src="/404mob.png"
            alt="Page Not Found"
            className="block sm:hidden max-h-72 w-auto object-contain drop-shadow-xs"
          />

          {/* Desktop & Tablet Image (Visible on tablets and desktops) */}
          <img
            src="/404error.png"
            alt="Page Not Found"
            className="hidden sm:block max-h-80 md:max-h-96 w-auto object-contain drop-shadow-xs"
          />
        </div>

        {/* Text & Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f4c81]/10 dark:bg-[#58a6ff]/10 text-[#0f4c81] dark:text-[#58a6ff] text-xs font-semibold">
            <Compass className="size-3.5" />
            <span>404 Error</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#171717] dark:text-[#f0f6fc] text-balance">
            Page Not Found
          </h1>

          <p className="text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] leading-relaxed max-w-md mx-auto text-pretty">
            The healthcare directory, clinical case, or page you are looking for does not exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2">
          <Link
            href="/home"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition cursor-pointer active:scale-98"
          >
            <Home className="size-4" />
            <span>Go to Home</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-6 py-2.5 text-xs sm:text-sm font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d] transition cursor-pointer active:scale-98"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
