"use client";

import * as React from "react";

export function AppSplashScreen() {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(true);
  const [animatingOut, setAnimatingOut] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Show splash on cold start/initial load, then smoothly dismiss
    const timer = setTimeout(() => {
      setAnimatingOut(true);
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 400);
      return () => clearTimeout(hideTimer);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white select-none transition-opacity duration-400 ease-out ${
        animatingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-5 px-6">
        {/* Pulsing MGN Logo with subtle glow on White Background */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-6 rounded-full bg-[#0f4c81]/5 blur-2xl animate-pulse" />
          
          <div className="relative flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Med Global Network"
              className="h-20 w-auto sm:h-24 object-contain drop-shadow-xs transition-transform duration-700 animate-pulse"
            />
          </div>
        </div>

        {/* Brand Text */}
        <div className="text-center space-y-1">
          <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#0f4c81]">
            MedGlobalNetwork
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold text-[#77716b] tracking-wider uppercase">
            Healthcare Professional Ecosystem
          </p>
        </div>

        {/* Sleek Medical Progress Bar */}
        <div className="w-36 sm:w-44 h-1 bg-[#f0ede8] rounded-full overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-[#0f4c81] via-[#16804d] to-[#0f4c81] rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  );
}

export default AppSplashScreen;
