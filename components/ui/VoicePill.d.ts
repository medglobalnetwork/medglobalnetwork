import React from "react";

export interface VoicePillProps {
  accentColor?: string;
  iconColor?: string;
  background?: string;
  size?: number;
  shape?: "pill" | "rounded";
  reach?: number;
  showTime?: boolean;
  waveform?: boolean;
  slideToCancel?: boolean;
  cancelDistance?: number;
  attack?: number;
  release?: number;
  sensitivity?: number;
  floor?: number;
  openDuration?: number;
  pressScale?: number;
  mode?: "auto" | "hold" | "toggle";
  holdAfter?: number;
  reactive?: "simulated" | "mic";
  disabled?: boolean;
  ariaLabel?: string;
  onStart?: (info: { source: string }) => void;
  onStop?: (info: { reason: string; duration: number }) => void;
  className?: string;
}

declare const VoicePill: React.FC<VoicePillProps>;
export default VoicePill;
