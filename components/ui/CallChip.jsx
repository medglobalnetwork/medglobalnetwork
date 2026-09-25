"use client";

import React, { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CommandLineIcon,
  File02Icon,
  Search01Icon,
  PencilEdit01Icon,
  Tick02Icon,
  RefreshIcon,
  Upload01Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import "./CallChip.css";

const ICONS = {
  terminal: CommandLineIcon,
  file: File02Icon,
  search: Search01Icon,
  edit: PencilEdit01Icon,
  upload: Upload01Icon,
  image: Image01Icon,
};

export default function CallChip({
  icon = "terminal",
  name = "bash",
  argument = "",
  status = "idle",
  expectedMs = 2500,
  size = 34,
  radius = 10,
  color = "currentColor",
  surfaceColor = "#27272a",
  progressColor = "currentColor",
  progressOpacity = 0.08,
  doneColor = "#22c55e",
  errorColor = "#ef4444",
  washOpacity = 0.14,
  shake = 6,
  showTimer = false,
  onRetry = () => {},
  className = "",
  style = {},
}) {
  const [mounted, setMounted] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "running") {
      startTimeRef.current = performance.now();
      setElapsedMs(0);
      timerRef.current = setInterval(() => {
        setElapsedMs(Math.round(performance.now() - startTimeRef.current));
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  const renderIcon = () => {
    if (typeof icon === "string" && ICONS[icon]) {
      return <HugeiconsIcon icon={ICONS[icon]} size={Math.round(size * 0.42)} strokeWidth={2} />;
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    return <HugeiconsIcon icon={CommandLineIcon} size={Math.round(size * 0.42)} strokeWidth={2} />;
  };

  const isResolved = status === "done" || status === "error";
  const timerText = `${(elapsedMs / 1000).toFixed(1)}s`;

  return (
    <div
      className={`call-chip${className ? ` ${className}` : ""}`}
      data-status={status}
      data-mounted={mounted ? "" : undefined}
      data-pressed={pressed ? "" : undefined}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        "--cc-size": `${size}px`,
        "--cc-radius": `${radius}px`,
        "--cc-color": color,
        "--cc-surface": surfaceColor,
        "--cc-progress": progressColor,
        "--cc-progress-pct": `${Math.round(progressOpacity * 100)}%`,
        "--cc-done": doneColor,
        "--cc-error": errorColor,
        "--cc-wash-pct": `${Math.round(washOpacity * 100)}%`,
        "--cc-expected": `${expectedMs}ms`,
        ...style,
      }}
    >
      <span
        className="call-chip__fill"
        style={{
          transform: status === "running" ? "scaleX(1)" : isResolved ? "scaleX(1)" : "scaleX(0)",
        }}
        aria-hidden="true"
      />

      <span className="call-chip__slot">
        {/* Active Tool Glyph */}
        <span
          className="call-chip__glyph"
          data-state={!isResolved ? "in" : "out"}
          aria-hidden={isResolved}
        >
          {renderIcon()}
        </span>

        {/* Resolved Glyph (Checkmark or Retry) */}
        <span
          className="call-chip__glyph"
          data-state={isResolved ? "in" : "out"}
          aria-hidden={!isResolved}
        >
          {status === "done" ? (
            <HugeiconsIcon icon={Tick02Icon} size={Math.round(size * 0.42)} strokeWidth={2.2} />
          ) : (
            <HugeiconsIcon icon={RefreshIcon} size={Math.round(size * 0.42)} strokeWidth={2.2} />
          )}
        </span>
      </span>

      <span className="call-chip__name">{name}</span>

      {argument ? <span className="call-chip__arg">{argument}</span> : null}

      {showTimer ? (
        <span className="call-chip__timer" aria-label={`Elapsed time: ${timerText}`}>
          {timerText}
        </span>
      ) : null}

      {status === "error" && (
        <button
          type="button"
          className="call-chip__retry"
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          aria-label="Retry action"
        >
          <span className="call-chip__sr">Retry</span>
        </button>
      )}
    </div>
  );
}
