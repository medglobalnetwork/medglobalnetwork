"use client";

import * as React from "react";

interface HeroSectionProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Auto-pause video when scrolled out of viewport, and resume when scrolled back into view
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Ignore play interruption or autoplay restrictions
            });
          }
        } else {
          video.pause();
        }
      },
      {
        threshold: 0.15, // Trigger when at least 15% of video is visible
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="home"
      suppressHydrationWarning
      className="relative w-full overflow-hidden bg-black border-b border-slate-200/60 dark:border-slate-800"
    >
      {/* 16:9 Cinematic Video starting from the very top (y=0) */}
      <div className="relative w-full aspect-video min-h-[460px] sm:min-h-[580px] lg:min-h-[720px] max-h-screen flex items-center justify-center overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/hero-video-poster.jpg"
          className="w-full h-full object-cover object-center block"
        >
          <source src="/hero-video.mp4?v=2" type="video/mp4" />
          {/* Fallback poster */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-video-poster.jpg"
            alt="Hero Video"
            className="w-full h-full object-cover object-center block"
          />
        </video>
      </div>
    </section>
  );
}
