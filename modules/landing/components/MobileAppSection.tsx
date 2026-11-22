"use client";

import * as React from "react";
import {
  CheckCircle2,
  Smartphone,
  Download,
  ArrowRight,
  ShieldCheck,
  Activity,
  WifiOff,
  Bell,
  Stethoscope,
  Briefcase,
  GraduationCap,
  MessageSquare,
  QrCode,
} from "lucide-react";

export function MobileAppSection() {
  const [showQrModal, setShowQrModal] = React.useState(false);
  const [pwaInstalled, setPwaInstalled] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setPwaInstalled(Boolean(isStandalone));
    }
  }, []);

  const handleInstallClick = () => {
    if (typeof window !== "undefined") {
      const installBtn = document.getElementById("pwa-install-trigger-btn");
      if (installBtn) {
        installBtn.click();
      } else {
        setShowQrModal(true);
      }
    }
  };

  return (
    <section
      id="mobile-app"
      className="relative isolate overflow-hidden py-20 sm:py-28 bg-gradient-to-b from-[#f8fbff] via-white to-slate-50/60 dark:from-[#0b0f17] dark:via-[#0c1829] dark:to-[#0b0f17] border-b border-slate-200/60 dark:border-slate-800"
    >
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -z-10 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 -z-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ═══════════════════════════════════════════════
              LEFT COLUMN: REALISTIC FIGMA SMARTPHONE MOCKUP
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-6 relative flex items-center justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-[300px] sm:max-w-[330px] md:max-w-[340px]">
              {/* Realistic Phone Frame Container */}
              <div className="relative w-full aspect-[300/605] drop-shadow-[0_25px_35px_rgba(16,45,69,0.22)] dark:drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]">
                {/* Physical Phone Chassis Asset from Figma */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/phone-frame.png"
                  alt="Realistic Smartphone Mockup"
                  className="absolute inset-0 size-full pointer-events-none select-none z-20 object-contain"
                />

                {/* Dynamic Island Pill with Camera Sensor */}
                <div className="absolute top-[17px] left-1/2 -translate-x-1/2 w-[68px] h-[18px] bg-black rounded-full z-30 pointer-events-none flex items-center justify-end pr-2.5">
                  <div className="size-2 rounded-full bg-[#181818] border border-[#282828] flex items-center justify-center">
                    <div className="size-1 rounded-full bg-[#168B78]/60 animate-pulse" />
                  </div>
                </div>

                {/* Inner Screen (Positioned tightly inside the chassis bezel) */}
                <div className="absolute inset-[9px_10px_9px_10px] rounded-[36px] overflow-hidden bg-slate-50 dark:bg-[#0a0f18] z-10 flex flex-col select-none">
                  {/* Status Bar */}
                  <div className="pt-2 px-4 pb-1 flex items-center justify-between text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[9px]">
                      <span>5G</span>
                      <div className="w-4 h-2 border border-current rounded-xs p-0.5 flex items-center">
                        <div className="w-full h-full bg-current rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="px-3 py-2 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0f172a]/95 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo.png" alt="MGN" className="h-5 w-auto object-contain" />
                      <div>
                        <div className="text-[11px] font-black text-[#102D45] dark:text-white leading-tight">
                          MedGlobalNetwork
                        </div>
                        <div className="text-[8px] font-semibold text-[#168B78] dark:text-emerald-400 flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          <span>NMC Verified Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 relative">
                      <Bell className="size-3" />
                      <span className="absolute top-0.5 right-0.5 size-1.5 bg-rose-500 rounded-full" />
                    </div>
                  </div>

                  {/* App Scrollable Content */}
                  <div className="p-2.5 space-y-2 overflow-hidden flex-1 text-xs">
                    {/* Clinician Profile Strip */}
                    <div className="p-2 rounded-xl bg-gradient-to-r from-[#102D45] to-[#168B78] text-white shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-[10px] shrink-0">
                          PN
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[11px] truncate">Dr. Priya Nair, MD</div>
                          <div className="text-[8px] text-teal-100 truncate">Cardiologist • Delhi Council Reg.</div>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[8px] font-bold shrink-0">
                        NMC #7842
                      </span>
                    </div>

                    {/* Quick Access Tiles */}
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 shadow-2xs space-y-0.5">
                        <div className="size-6 mx-auto rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#102D45] dark:text-blue-400 flex items-center justify-center">
                          <Stethoscope className="size-3" />
                        </div>
                        <span className="text-[8px] font-bold block text-slate-700 dark:text-slate-300">Consult</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 shadow-2xs space-y-0.5">
                        <div className="size-6 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#16804d] dark:text-emerald-400 flex items-center justify-center">
                          <Briefcase className="size-3" />
                        </div>
                        <span className="text-[8px] font-bold block text-slate-700 dark:text-slate-300">Locum</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 shadow-2xs space-y-0.5">
                        <div className="size-6 mx-auto rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 flex items-center justify-center">
                          <GraduationCap className="size-3" />
                        </div>
                        <span className="text-[8px] font-bold block text-slate-700 dark:text-slate-300">CME</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 shadow-2xs space-y-0.5">
                        <div className="size-6 mx-auto rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <MessageSquare className="size-3" />
                        </div>
                        <span className="text-[8px] font-bold block text-slate-700 dark:text-slate-300">Rounds</span>
                      </div>
                    </div>

                    {/* Active Clinical Case Feed Card */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-bold text-[#102D45] dark:text-slate-200 flex items-center gap-1">
                          <Activity className="size-2.5 text-rose-500" />
                          <span>Emergency Cardiology Case</span>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/70 px-1 py-0.2 rounded text-[8px]">
                          Live Consult
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-600 dark:text-slate-300 leading-snug">
                        54M acute chest pain. ST elevation V1-V4. Cath lab activated.
                      </div>
                      {/* ECG Waveform SVG */}
                      <div className="h-7 rounded bg-slate-900 px-2 flex items-center justify-between text-[8px] text-emerald-400 font-mono">
                        <span>HR: 84 BPM</span>
                        <svg className="h-4 w-20 text-emerald-400 stroke-current fill-none stroke-[1.5]" viewBox="0 0 100 20">
                          <path d="M0 10 L20 10 L25 2 L30 18 L35 10 L45 10 L50 4 L55 16 L60 10 L100 10" />
                        </svg>
                        <span>ST +2mm</span>
                      </div>
                    </div>

                    {/* Verified Locum Shift Card */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-bold text-[#16804d] dark:text-emerald-300">
                          ICU Night Consultant Locum
                        </span>
                        <span className="font-bold text-[#102D45] dark:text-white">
                          ₹18,000 / shift
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Fortis Healthcare • 8 PM - 8 AM</span>
                        <span className="font-bold text-[#16804d] dark:text-emerald-400 underline">
                          1-Tap Apply
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* App Bottom Navigation Bar */}
                  <div className="border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0f172a]/95 px-5 py-2 flex items-center justify-between text-[8px] font-bold text-slate-400">
                    <div className="text-[#102D45] dark:text-teal-400 flex flex-col items-center gap-0.5">
                      <Activity className="size-3.5" />
                      <span>Feed</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 hover:text-slate-600">
                      <Stethoscope className="size-3.5" />
                      <span>Network</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 hover:text-slate-600">
                      <Briefcase className="size-3.5" />
                      <span>Jobs</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 hover:text-slate-600">
                      <GraduationCap className="size-3.5" />
                      <span>CME</span>
                    </div>
                  </div>

                  {/* Home Bar */}
                  <div className="pb-1.5 pt-0.5 flex justify-center bg-white dark:bg-[#0f172a]">
                    <div className="w-20 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Top Right */}
              <div className="hidden sm:flex absolute -top-4 -right-8 p-3 rounded-2xl bg-white/95 dark:bg-[#161b22]/95 border border-slate-200 dark:border-slate-700 shadow-xl items-center gap-2.5 backdrop-blur-md z-30 animate-in fade-in slide-in-from-bottom-2">
                <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#16804d] dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5 stroke-[2]" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-[#102D45] dark:text-white">Statutory Council Verified</div>
                  <div className="text-[10px] text-slate-500">Zero Impersonation Guaranteed</div>
                </div>
              </div>


            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              RIGHT COLUMN: CLINICAL MOBILITY COPY & ACTIONS
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left order-1 lg:order-2">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-900/40 px-3.5 py-1 text-xs font-bold text-[#102D45] dark:text-teal-300">
              <Smartphone className="size-3.5 text-[#168B78] dark:text-teal-400" />
              <span>Clinical Mobility &amp; Cross-Platform Suite</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102D45] dark:text-white leading-[1.15] tracking-tight text-balance">
              Take MGN Wherever Your Rounds Take You.
            </h2>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Engineered for clinicians on duty, emergency ICU consultants, and medical students. Access council-verified second opinions, urgent hospital shifts, and accredited CME masterclasses directly from your smartphone.
            </p>

            {/* 3 Core Value Props */}
            <div className="space-y-3.5 text-left pt-1">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#102D45] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#102D45] dark:text-white">
                    Emergency Clinical Consultations
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    Discuss critical ECGs, radiological scans, and complex cases with verified specialist peers securely.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#16804d] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#102D45] dark:text-white">
                    High-Priority Hospital Locum Openings
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    Receive instant push alerts for verified hospital vacancies and locum shifts with zero agency cuts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="size-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <WifiOff className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#102D45] dark:text-white">
                    Zero-Interruption Offline Architecture
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    Continue reviewing clinical protocols, drug guides, and case notes even in hospital basement ICUs with zero cellular reception.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Direct PWA Install + Stores */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#102D45] hover:bg-[#0c2438] text-white px-6 py-3.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Download className="size-4 text-teal-400" />
                <span>{pwaInstalled ? "Launch MGN App" : "Install MGN Web App"}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  Fast PWA
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161b22] text-[#102D45] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-3.5 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer"
              >
                <QrCode className="size-4 text-[#168B78]" />
                <span>Scan for Mobile</span>
              </button>
            </div>

            {/* Trust Checklist Footer */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-[#16804d] dark:text-emerald-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>iOS &amp; Android Ready</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>Biometric Authentication</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>Full Hardware Offline Cache</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Quick Scanner Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="size-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#168B78] mx-auto flex items-center justify-center">
              <Smartphone className="size-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#102D45] dark:text-white">
                Open MGN on Your Phone
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scan this QR code with your phone camera to launch or install the verified clinician portal instantly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center">
              {/* Dynamic QR SVG */}
              <div className="size-40 rounded-xl bg-white p-2 border border-slate-200 flex items-center justify-center shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    typeof window !== "undefined" ? window.location.origin : "https://mgn.life"
                  )}`}
                  alt="MGN Mobile App QR Code"
                  className="size-full object-contain"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
