'use client';

import { ShieldCheck, ShieldQuestion } from 'lucide-react';

type CopilotConfidenceIndicatorProps = {
  score?: number;
  isSafe?: boolean;
  reasoning?: string;
  compact?: boolean;
};

export default function CopilotConfidenceIndicator({
  score,
  isSafe = true,
  reasoning,
  compact = false,
}: CopilotConfidenceIndicatorProps) {
  const confidence = normalizeScore(score, isSafe);
  const tone =
    !isSafe || confidence < 50
      ? 'border-red-100 bg-red-50 text-red-700'
      : confidence < 75
        ? 'border-amber-100 bg-amber-50 text-amber-700'
        : 'border-emerald-100 bg-emerald-50 text-emerald-700';
  const Icon = isSafe ? ShieldCheck : ShieldQuestion;

  return (
    <div className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${tone}`}>
      <Icon size={14} className="shrink-0" />
      <span className="shrink-0">{confidence}% grounded</span>
      {!compact && reasoning ? <span className="truncate font-bold opacity-80">{reasoning}</span> : null}
    </div>
  );
}

function normalizeScore(score: number | undefined, isSafe: boolean) {
  if (typeof score !== 'number' || Number.isNaN(score)) return isSafe ? 76 : 35;
  const percent = score <= 1 ? score * 100 : score;
  return Math.max(0, Math.min(100, Math.round(percent)));
}
