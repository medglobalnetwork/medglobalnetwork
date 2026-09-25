import React from "react";

export type CallChipStatus = "idle" | "running" | "done" | "error";
export type CallChipIcon = "terminal" | "file" | "search" | "edit" | "upload" | "image" | React.ReactNode;

export interface CallChipProps {
  icon?: CallChipIcon;
  name?: string;
  argument?: string;
  status?: CallChipStatus;
  expectedMs?: number;
  size?: number;
  radius?: number;
  color?: string;
  surfaceColor?: string;
  progressColor?: string;
  progressOpacity?: number;
  doneColor?: string;
  errorColor?: string;
  washOpacity?: number;
  shake?: number;
  showTimer?: boolean;
  onRetry?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

declare const CallChip: React.FC<CallChipProps>;
export default CallChip;
