"use client";

import * as React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Subtitles,
  Sparkles,
  CheckCircle2,
  Tv,
  HelpCircle,
  X,
  Sliders,
  Check,
  Headphones,
  PictureInPicture2,
  ShieldAlert,
} from "lucide-react";
import {
  VideoChapter,
  VideoCaption,
  VideoQuality,
  VideoPlaybackSession,
  VideoTranscriptCue,
} from "../types";

interface VideoPlayerProps {
  lessonId: string;
  courseId: string;
  courseTitle?: string;
  lessonTitle: string;
  mediaUrl?: string | null;
  durationSeconds?: number;
  initialPositionSeconds?: number;
  onLessonCompleted?: (certCode?: string) => void;
  onTimeUpdate?: (currentTimeSeconds: number) => void;
  onOpenAskAI?: () => void;
  onSeekRequestRef?: React.MutableRefObject<((sec: number) => void) | null>;
  theaterMode?: boolean;
  onToggleTheater?: () => void;
}

export function VideoPlayer({
  lessonId,
  courseId,
  courseTitle,
  lessonTitle,
  mediaUrl,
  durationSeconds = 1800,
  initialPositionSeconds = 0,
  onLessonCompleted,
  onTimeUpdate,
  onOpenAskAI,
  onSeekRequestRef,
  theaterMode = false,
  onToggleTheater,
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(durationSeconds || 1);
  const [buffered, setBuffered] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [selectedQuality, setSelectedQuality] = React.useState<VideoQuality>("auto");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isPipActive, setIsPipActive] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [isBuffering, setIsBuffering] = React.useState(false);

  // Stream & Variants
  const [currentStreamSrc, setCurrentStreamSrc] = React.useState<string>(
    mediaUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  );
  const [variants, setVariants] = React.useState<
    { quality: VideoQuality; label: string; url: string; bitrate?: number; resolution?: string }[]
  >([]);

  // Seek policy & Protection
  const [seekPolicy, setSeekPolicy] = React.useState<"free" | "strict_unwatched">("free");
  const [maxWatchedPosition, setMaxWatchedPosition] = React.useState(initialPositionSeconds || 0);
  const [showSeekBlockedToast, setShowSeekBlockedToast] = React.useState(false);

  // Chapters, Transcript & Captions
  const [chapters, setChapters] = React.useState<VideoChapter[]>([]);
  const [captions, setCaptions] = React.useState<VideoCaption[]>([]);
  const [transcriptCues, setTranscriptCues] = React.useState<VideoTranscriptCue[]>([]);
  const [activeCaptionLanguage, setActiveCaptionLanguage] = React.useState<string | null>(null);
  const [currentCueText, setCurrentCueText] = React.useState<string | null>(null);

  // Gesture Feedback
  const [gestureToast, setGestureToast] = React.useState<string | null>(null);
  const lastTapRef = React.useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  // Menus & Modals
  const [showSettingsMenu, setShowSettingsMenu] = React.useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);
  const [showQualityMenu, setShowQualityMenu] = React.useState(false);
  const [showCaptionsMenu, setShowCaptionsMenu] = React.useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = React.useState(false);
  const [showResumePrompt, setShowResumePrompt] = React.useState(false);

  // Scrub bar hover tooltip
  const [hoverTime, setHoverTime] = React.useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = React.useState<number | null>(null);

  // Hide controls timer
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load saved playback speed from localStorage
  React.useEffect(() => {
    try {
      const savedSpeed = localStorage.getItem("mgn_video_speed");
      if (savedSpeed) {
        const parsed = parseFloat(savedSpeed);
        if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 2) {
          setPlaybackSpeed(parsed);
          if (videoRef.current) videoRef.current.playbackRate = parsed;
        }
      }
    } catch {}
  }, []);

  // Fetch secure playback authorization & session metadata
  React.useEffect(() => {
    if (!lessonId) return;

    fetch(`/api/learn/lessons/${lessonId}/playback`)
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data: VideoPlaybackSession) => {
        if (data.streamUrl) {
          setCurrentStreamSrc(data.streamUrl);
        }
        if (data.variants && data.variants.length > 0) {
          setVariants(data.variants);
        }
        if (data.chapters) setChapters(data.chapters);
        if (data.captions) {
          setCaptions(data.captions);
          const def = data.captions.find((c) => c.is_default);
          if (def) setActiveCaptionLanguage(def.language);
        }
        if (data.transcript?.cues) {
          setTranscriptCues(data.transcript.cues);
        }
        if (data.seekPolicy) {
          setSeekPolicy(data.seekPolicy);
        }
        if (data.lastPositionSeconds && data.lastPositionSeconds > 5) {
          setMaxWatchedPosition(data.lastPositionSeconds);
          setShowResumePrompt(true);
        }
      })
      .catch(() => {
        // Fallback for demo or offline playback
      });
  }, [lessonId]);

  // Expose seek function to parent with seek policy enforcement
  React.useEffect(() => {
    if (onSeekRequestRef) {
      onSeekRequestRef.current = (sec: number) => {
        if (!videoRef.current) return;
        let target = Math.max(0, Math.min(duration, sec));

        if (seekPolicy === "strict_unwatched" && target > maxWatchedPosition + 10) {
          target = maxWatchedPosition;
          setShowSeekBlockedToast(true);
          setTimeout(() => setShowSeekBlockedToast(false), 3000);
        }

        videoRef.current.currentTime = target;
        if (!isPlaying) {
          videoRef.current.play().catch(() => {});
        }
        sendHeartbeat("SEEK", target);
      };
    }
  }, [duration, isPlaying, maxWatchedPosition, onSeekRequestRef, seekPolicy]);

  // Handle Play / Pause toggle
  const togglePlay = React.useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          sendHeartbeat("PLAY");
        })
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      sendHeartbeat("PAUSE");
    }
  }, []);

  // Seek relative with strict policy validation
  const seekRelative = React.useCallback(
    (seconds: number) => {
      if (!videoRef.current) return;
      let newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));

      if (seconds > 0 && seekPolicy === "strict_unwatched" && newTime > maxWatchedPosition + 10) {
        newTime = maxWatchedPosition;
        setShowSeekBlockedToast(true);
        setTimeout(() => setShowSeekBlockedToast(false), 3000);
      }

      videoRef.current.currentTime = newTime;
      sendHeartbeat("SEEK", newTime);
    },
    [duration, maxWatchedPosition, seekPolicy]
  );

  // Resume playback from saved position
  const handleResumePlayback = () => {
    if (videoRef.current && initialPositionSeconds > 0) {
      videoRef.current.currentTime = initialPositionSeconds;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      sendHeartbeat("PLAY", initialPositionSeconds);
    }
    setShowResumePrompt(false);
  };

  // Change speed
  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    setShowSpeedMenu(false);
    setShowSettingsMenu(false);
    try {
      localStorage.setItem("mgn_video_speed", speed.toString());
    } catch {}
  };

  // Switch Quality Variant seamlessly
  const handleSetQuality = (quality: VideoQuality) => {
    setSelectedQuality(quality);
    setShowQualityMenu(false);

    if (!videoRef.current) return;
    const currentPos = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;

    const matchedVariant = variants.find((v) => v.quality === quality);
    const newSrc = matchedVariant ? matchedVariant.url : mediaUrl || currentStreamSrc;

    if (newSrc && newSrc !== currentStreamSrc) {
      setCurrentStreamSrc(newSrc);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentPos;
          if (wasPlaying) {
            videoRef.current.play().catch(() => {});
          }
        }
      }, 100);
    }
  };

  // Toggle Picture-in-Picture
  const togglePictureInPicture = React.useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else if (videoRef.current && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (err) {
      console.warn("PiP toggle error:", err);
    }
  }, []);

  // Toggle Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.8;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Fullscreen & PiP change listeners
  React.useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Send Authoritative Heartbeat Event
  const sendHeartbeat = React.useCallback(
    async (eventType: "PLAY" | "PAUSE" | "SEEK" | "PROGRESS" | "COMPLETE", posSec?: number) => {
      if (!lessonId) return;
      const cur =
        posSec !== undefined
          ? posSec
          : videoRef.current
          ? Math.floor(videoRef.current.currentTime)
          : 0;

      try {
        const res = await fetch(`/api/learn/lessons/${lessonId}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType,
            positionSeconds: cur,
            playbackRate: playbackSpeed,
          }),
        });
        const data = await res.json();
        if (data.lessonCompleted && onLessonCompleted) {
          onLessonCompleted(data.verificationCode);
        }
      } catch {}
    },
    [lessonId, onLessonCompleted, playbackSpeed]
  );

  // Periodic progress heartbeat (every 5 seconds during active playback)
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      sendHeartbeat("PROGRESS");
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, sendHeartbeat]);

  // Keyboard Shortcuts Handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
        case "j":
        case "J":
          e.preventDefault();
          seekRelative(-10);
          break;
        case "ArrowRight":
        case "l":
        case "L":
          e.preventDefault();
          seekRelative(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (videoRef.current) {
            const nextVol = Math.min(1, (videoRef.current.volume || 0) + 0.05);
            setVolume(nextVol);
            videoRef.current.volume = nextVol;
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (videoRef.current) {
            const nextVol = Math.max(0, (videoRef.current.volume || 0) - 0.05);
            setVolume(nextVol);
            videoRef.current.volume = nextVol;
          }
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "p":
        case "P":
          e.preventDefault();
          togglePictureInPicture();
          break;
        case "t":
        case "T":
          e.preventDefault();
          if (onToggleTheater) onToggleTheater();
          break;
        case "c":
        case "C":
          e.preventDefault();
          setActiveCaptionLanguage((prev) => (prev ? null : captions[0]?.language || "en"));
          break;
        case "?":
          e.preventDefault();
          setShowShortcutsModal((prev) => !prev);
          break;
        default:
          if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            const pct = parseInt(e.key, 10) / 10;
            if (videoRef.current && duration > 0) {
              const target = duration * pct;
              if (seekPolicy === "strict_unwatched" && target > maxWatchedPosition + 10) {
                setShowSeekBlockedToast(true);
                setTimeout(() => setShowSeekBlockedToast(false), 3000);
                return;
              }
              videoRef.current.currentTime = target;
              sendHeartbeat("SEEK", target);
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    captions,
    duration,
    maxWatchedPosition,
    onToggleTheater,
    seekPolicy,
    seekRelative,
    togglePictureInPicture,
    togglePlay,
  ]);

  // Video Time Update & Synchronized Live Captions / Cues Calculation
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    if (cur > maxWatchedPosition) {
      setMaxWatchedPosition(cur);
    }

    if (onTimeUpdate) onTimeUpdate(cur);

    // Calculate synchronized subtitle cue text
    if (activeCaptionLanguage && transcriptCues.length > 0) {
      const activeCue = transcriptCues.find((c) => cur >= c.start && cur <= c.end);
      setCurrentCueText(activeCue ? activeCue.text : null);
    } else {
      if (currentCueText) setCurrentCueText(null);
    }

    // Buffer calculation
    if (videoRef.current.buffered.length > 0) {
      const buffEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(buffEnd);
    }
  };

  // Mobile Touch Gestures (Double Tap to Seek)
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const touch = e.changedTouches[0];
    if (!touch || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const width = rect.width;

    const timeSinceLast = now - lastTapRef.current.time;
    if (timeSinceLast < 300) {
      if (touchX < width * 0.35) {
        seekRelative(-10);
        setGestureToast("⏪ 10s");
      } else if (touchX > width * 0.65) {
        seekRelative(10);
        setGestureToast("⏩ 10s");
      } else {
        togglePlay();
      }
      setTimeout(() => setGestureToast(null), 1000);
      lastTapRef.current = { time: 0, x: 0 };
    } else {
      lastTapRef.current = { time: now, x: touchX };
    }
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Find active chapter
  const currentChapter = React.useMemo(() => {
    return chapters.find(
      (ch) =>
        currentTime >= ch.start_seconds &&
        (ch.end_seconds ? currentTime <= ch.end_seconds : true)
    );
  }, [chapters, currentTime]);

  // Mouse movement on player container to auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettingsMenu && !showShortcutsModal) {
          setShowControls(false);
        }
      }, 3500);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`group relative overflow-hidden bg-black text-white select-none transition-all duration-300 ${
        theaterMode
          ? "w-full aspect-[21/9] sm:aspect-[16/9] max-h-[80vh] rounded-2xl shadow-2xl"
          : "w-full aspect-video rounded-3xl border border-black/20 shadow-xl"
      }`}
    >
      {/* 1. HTML5 NATIVE VIDEO ELEMENT */}
      <video
        ref={videoRef}
        src={currentStreamSrc}
        playsInline
        className={`size-full object-contain cursor-pointer ${
          selectedQuality === "audio" ? "opacity-0" : "opacity-100"
        }`}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration || durationSeconds);
            if (initialPositionSeconds > 0) {
              videoRef.current.currentTime = initialPositionSeconds;
            }
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          sendHeartbeat("COMPLETE", duration);
        }}
      />

      {/* 2. AUDIO-ONLY PODCAST MODE OVERLAY */}
      {selectedQuality === "audio" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a192f] via-[#0f4c81] to-[#1e3a8a] text-center p-6 space-y-3">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl animate-pulse">
            <Headphones className="size-8 text-[#38bdf8]" />
          </div>
          <div>
            <span className="rounded-full bg-[#38bdf8]/20 px-3 py-1 text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider">
              Audio-Only Podcast Mode
            </span>
            <h3 className="mt-2 text-base font-bold text-white max-w-md truncate">{lessonTitle}</h3>
            <p className="text-xs text-white/70">Optimized for low-bandwidth mobile listening</p>
          </div>
        </div>
      )}

      {/* 3. GESTURE PULSE TOAST */}
      {gestureToast && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
          <div className="rounded-2xl bg-black/80 px-5 py-3 text-lg font-bold text-white shadow-2xl backdrop-blur-md border border-white/20 animate-in zoom-in-75">
            {gestureToast}
          </div>
        </div>
      )}

      {/* 4. SEEK BLOCKED TOAST (SEEK PROTECTION) */}
      {showSeekBlockedToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-2xl bg-amber-500/95 px-4 py-2 text-xs font-bold text-slate-950 backdrop-blur-md shadow-2xl animate-in slide-in-from-top-2 border border-amber-300">
          <ShieldAlert className="size-4 shrink-0" />
          <span>Certification Lecture: Skipping ahead is restricted until watched.</span>
        </div>
      )}

      {/* 5. LIVE SYNCHRONIZED CAPTION OVERLAY */}
      {activeCaptionLanguage && currentCueText && (
        <div className="pointer-events-none absolute bottom-20 inset-x-0 flex justify-center px-6 z-20">
          <div className="max-w-3xl rounded-xl bg-black/85 px-4 py-2 text-center text-xs sm:text-sm md:text-base font-semibold text-white backdrop-blur-md shadow-2xl border border-white/15 leading-snug animate-in fade-in">
            {currentCueText}
          </div>
        </div>
      )}

      {/* 6. RESUME PLAYBACK NOTIFICATION TOAST */}
      {showResumePrompt && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-3 rounded-2xl bg-[#0f4c81]/90 p-3 text-xs backdrop-blur-md border border-white/20 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div>
            <p className="font-bold text-white">Resume Lecture?</p>
            <p className="text-white/80 text-[11px]">
              Last watched at {formatTime(initialPositionSeconds)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResumePlayback}
            className="rounded-xl bg-white px-3 py-1.5 font-bold text-[#0f4c81] hover:bg-white/90 transition cursor-pointer shadow-xs"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={() => setShowResumePrompt(false)}
            className="text-white/60 hover:text-white p-1"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* 7. BUFFERING SPINNER */}
      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-2xs z-10">
          <div className="flex size-14 items-center justify-center rounded-full bg-black/70 border border-white/20 animate-spin">
            <div className="size-6 rounded-full border-2 border-white border-t-transparent" />
          </div>
        </div>
      )}

      {/* 8. CENTER PLAY BUTTON */}
      {!isPlaying && !isBuffering && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto flex size-20 items-center justify-center rounded-full bg-[#0f4c81]/90 text-white shadow-2xl backdrop-blur-md transition transform hover:scale-110 active:scale-95 cursor-pointer border border-white/20 z-10"
          aria-label="Play video"
        >
          <Play className="ml-1 size-8 fill-current" />
        </button>
      )}

      {/* 9. TOP BAR OVERLAY */}
      <div
        className={`absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-300 z-20 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <p className="text-[11px] font-semibold text-white/70 truncate">{courseTitle}</p>
            <h3 className="text-sm sm:text-base font-bold text-white truncate flex items-center gap-2">
              <span>{lessonTitle}</span>
              {currentChapter && (
                <span className="hidden sm:inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white/90">
                  Chapter: {currentChapter.title}
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAskAI && (
              <button
                type="button"
                onClick={onOpenAskAI}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0f4c81] to-[#1769c2] px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 transition shadow-md cursor-pointer border border-white/20"
              >
                <Sparkles className="size-3.5 text-amber-300" />
                <span className="hidden xs:inline">Ask AI</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowShortcutsModal(true)}
              className="rounded-xl bg-black/40 p-2 text-white/80 hover:bg-black/70 hover:text-white transition border border-white/10"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 10. BOTTOM CONTROLS CHROME */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-4 pt-8 transition-opacity duration-300 z-20 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrub Bar & Chapter Markers */}
        <div
          className="relative mb-3 flex h-4 w-full cursor-pointer items-center group/scrub"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            setHoverPosition(pos);
            setHoverTime(pos * duration);
          }}
          onMouseLeave={() => {
            setHoverPosition(null);
            setHoverTime(null);
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const targetSec = pos * duration;

            if (seekPolicy === "strict_unwatched" && targetSec > maxWatchedPosition + 10) {
              setShowSeekBlockedToast(true);
              setTimeout(() => setShowSeekBlockedToast(false), 3000);
              return;
            }

            if (videoRef.current) {
              videoRef.current.currentTime = targetSec;
              sendHeartbeat("SEEK", targetSec);
            }
          }}
        >
          {/* Background Track */}
          <div className="relative h-1.5 w-full rounded-full bg-white/20 transition-all group-hover/scrub:h-2.5 overflow-hidden">
            {/* Buffered Progress */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-white/40 transition-all"
              style={{ width: `${Math.min(100, (buffered / duration) * 100)}%` }}
            />
            {/* Played Progress */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#1769c2] to-[#38bdf8]"
              style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
            />
          </div>

          {/* Chapter Markers on Track */}
          {chapters.map((ch) => {
            const leftPct = (ch.start_seconds / duration) * 100;
            return (
              <div
                key={ch.id}
                style={{ left: `${leftPct}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-black/80 pointer-events-none"
                title={ch.title}
              />
            );
          })}

          {/* Scrubber Thumb */}
          <div
            className="absolute size-4 -ml-2 rounded-full bg-white shadow-lg transition-transform scale-0 group-hover/scrub:scale-100"
            style={{ left: `${Math.min(100, (currentTime / duration) * 100)}%` }}
          />

          {/* Hover Time & Chapter Tooltip */}
          {hoverTime !== null && hoverPosition !== null && (
            <div
              className="pointer-events-none absolute -top-9 -translate-x-1/2 rounded-lg bg-black/90 px-2 py-1 text-[10px] font-bold text-white shadow-md border border-white/20 whitespace-nowrap"
              style={{ left: `${hoverPosition * 100}%` }}
            >
              <span>{formatTime(hoverTime)}</span>
            </div>
          )}
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="rounded-xl p-2 text-white hover:bg-white/20 transition cursor-pointer"
              title={isPlaying ? "Pause (Space/K)" : "Play (Space/K)"}
            >
              {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
            </button>

            <button
              type="button"
              onClick={() => seekRelative(-10)}
              className="rounded-xl p-2 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
              title="Rewind 10s (J/Left Arrow)"
            >
              <RotateCcw className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => seekRelative(10)}
              className="rounded-xl p-2 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
              title="Forward 10s (L/Right Arrow)"
            >
              <RotateCw className="size-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                className="rounded-xl p-2 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="size-4 text-rose-400" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/vol:w-16 group-hover/vol:opacity-100 transition-all duration-200 h-1 accent-[#38bdf8] cursor-pointer"
              />
            </div>

            {/* Time Indicator */}
            <div className="text-xs font-semibold text-white/80 ml-2">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/40 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 relative">
            {/* Speed Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowSpeedMenu((prev) => !prev);
                  setShowQualityMenu(false);
                  setShowCaptionsMenu(false);
                }}
                className={`rounded-xl px-2 py-1.5 text-xs font-bold transition cursor-pointer ${
                  playbackSpeed !== 1 ? "bg-[#1769c2] text-white" : "text-white/80 hover:bg-white/20"
                }`}
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-10 right-0 z-40 w-28 rounded-2xl border border-white/20 bg-black/95 p-1.5 backdrop-blur-xl shadow-2xl space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-white/40 uppercase">Speed</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSetSpeed(s)}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                        playbackSpeed === s ? "bg-[#1769c2] text-white" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span>{s}x</span>
                      {playbackSpeed === s && <Check className="size-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Closed Captions Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowCaptionsMenu((prev) => !prev);
                  setShowSpeedMenu(false);
                  setShowQualityMenu(false);
                }}
                className={`rounded-xl p-2 transition cursor-pointer ${
                  activeCaptionLanguage ? "bg-[#1769c2] text-white" : "text-white/80 hover:bg-white/20"
                }`}
                title="Captions / Subtitles (C)"
              >
                <Subtitles className="size-4" />
              </button>

              {showCaptionsMenu && (
                <div className="absolute bottom-10 right-0 z-40 w-44 rounded-2xl border border-white/20 bg-black/95 p-1.5 backdrop-blur-xl shadow-2xl space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-white/40 uppercase">Captions</div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCaptionLanguage(null);
                      setShowCaptionsMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      !activeCaptionLanguage ? "bg-[#1769c2] text-white" : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <span>Off</span>
                    {!activeCaptionLanguage && <Check className="size-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCaptionLanguage("en");
                      setShowCaptionsMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      activeCaptionLanguage === "en" ? "bg-[#1769c2] text-white" : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <span>English (Verified)</span>
                    {activeCaptionLanguage === "en" && <Check className="size-3" />}
                  </button>
                  {captions.filter((c) => c.language !== "en").map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setActiveCaptionLanguage(c.language);
                        setShowCaptionsMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        activeCaptionLanguage === c.language ? "bg-[#1769c2] text-white" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span>{c.label}</span>
                      {activeCaptionLanguage === c.language && <Check className="size-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowQualityMenu((prev) => !prev);
                  setShowSpeedMenu(false);
                  setShowCaptionsMenu(false);
                }}
                className="rounded-xl p-2 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
                title="Quality"
              >
                <Sliders className="size-4" />
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-10 right-0 z-40 w-44 rounded-2xl border border-white/20 bg-black/95 p-1.5 backdrop-blur-xl shadow-2xl space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-white/40 uppercase">Quality</div>
                  {(["auto", "1080p", "720p", "480p", "360p", "audio"] as VideoQuality[]).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSetQuality(q)}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        selectedQuality === q ? "bg-[#1769c2] text-white" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span className="capitalize">{q === "audio" ? "Audio Only (Podcast)" : q === "auto" ? "Auto Bitrate" : `${q.toUpperCase()} HD`}</span>
                      {selectedQuality === q && <Check className="size-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture-in-Picture */}
            <button
              type="button"
              onClick={togglePictureInPicture}
              className={`rounded-xl p-2 transition cursor-pointer ${
                isPipActive ? "text-[#38bdf8]" : "text-white/80 hover:bg-white/20 hover:text-white"
              }`}
              title="Picture-in-Picture (P)"
            >
              <PictureInPicture2 className="size-4" />
            </button>

            {/* Theater Mode */}
            {onToggleTheater && (
              <button
                type="button"
                onClick={onToggleTheater}
                className={`rounded-xl p-2 transition cursor-pointer ${
                  theaterMode ? "text-[#38bdf8]" : "text-white/80 hover:bg-white/20 hover:text-white"
                }`}
                title="Theater Mode (T)"
              >
                <Tv className="size-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-xl p-2 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
            >
              {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 11. KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-[#161b22] p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <HelpCircle className="size-4 text-[#38bdf8]" />
                <span>Player Keyboard Shortcuts</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="rounded-lg p-1 text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { key: "Space / K", action: "Play / Pause" },
                { key: "Left / J", action: "Seek -10s" },
                { key: "Right / L", action: "Seek +10s" },
                { key: "Up / Down", action: "Volume +/- 5%" },
                { key: "M", action: "Mute / Unmute" },
                { key: "F", action: "Toggle Fullscreen" },
                { key: "P", action: "Picture-in-Picture" },
                { key: "T", action: "Theater Mode" },
                { key: "C", action: "Toggle Captions" },
                { key: "0 - 9", action: "Jump 0% to 90%" },
                { key: "?", action: "Shortcuts Guide" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 border border-white/5"
                >
                  <span className="text-white/60">{item.action}</span>
                  <kbd className="rounded-lg bg-white/15 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
