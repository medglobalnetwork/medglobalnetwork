"use client";

import * as React from "react";

export function AppSplashScreen() {
  const [visible, setVisible] = React.useState(true);
  const [animatingOut, setAnimatingOut] = React.useState(false);

  React.useEffect(() => {
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

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-99999 flex flex-col items-center justify-center bg-[#faf9f8] select-none transition-opacity duration-400 ease-out ${
        animatingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-5 px-6">
        {/* Blinking / Heartbeat Pulsing Logo */}
        <div className="relative flex items-center justify-center">
          {/* Subtle glowing radial pulse backdrop */}
          <div className="absolute -inset-4 rounded-full bg-[#0f4c81]/10 blur-xl animate-pulse" />
          
          <div className="relative flex items-center justify-center animate-bounce duration-1000">
            <img
              src="/logo.png"
              alt="MedGlobalNetwork"
              className="h-16 w-auto sm:h-20 object-contain drop-shadow-sm transition-transform duration-700 hover:scale-105 animate-pulse"
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
        <div className="w-36 sm:w-44 h-1 bg-[#e8e6e3] rounded-full overflow-hidden mt-4">
          <div className="h-full bg-linear-to-r from-[#0f4c81] via-[#16804d] to-[#0f4c81] rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  );
}

export default AppSplashScreen;
