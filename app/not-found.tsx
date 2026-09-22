import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f4] text-[#171717] px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-[#1769c2]">
          <Compass className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769c2]">404 Error</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Page Not Found
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            The page you are looking for does not exist, has been moved, or you do not have permission to view it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/home"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1769c2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1358a4] transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go to Home</span>
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
