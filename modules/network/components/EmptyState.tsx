// modules/network/components/EmptyState.tsx
import * as React from "react";
import { Search } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ded8d1] bg-white p-8 text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f5f4] text-[#77716b]" aria-hidden="true">
        {icon ?? <Search className="h-6 w-6 text-[#77716b]" />}
      </div>
      <p className="mt-3 text-sm font-semibold text-[#171717]">{title}</p>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#77716b]">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {actionText && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#12569f]"
          >
            {actionText}
          </button>
        )}
        {secondaryActionText && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-medium text-[#5d5854] transition hover:bg-[#f8f7f6]"
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
}
