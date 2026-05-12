'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock3, Flag, Layers3, ShieldCheck } from 'lucide-react';
import type { CopilotAction } from './CopilotConversation';

type CopilotRecommendationCardProps = {
  recommendation: CopilotAction;
  confidenceScore?: number;
  generatedAt?: string;
};

const priorityStyle: Record<string, string> = {
  critical: 'border-red-100 bg-red-50 text-red-700',
  high: 'border-orange-100 bg-orange-50 text-orange-700',
  medium: 'border-amber-100 bg-amber-50 text-amber-700',
  low: 'border-emerald-100 bg-emerald-50 text-emerald-700',
};

export default function CopilotRecommendationCard({
  recommendation,
  confidenceScore,
  generatedAt,
}: CopilotRecommendationCardProps) {
  const priority = recommendation.priority || 'medium';
  const confidence = normalizeConfidence(confidenceScore);
  const category = formatLabel(recommendation.impactArea || 'operations');
  const summary = recommendation.description || recommendation.rationale || 'Operational recommendation generated from the grounded copilot response.';

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm"
    >
      <div className="border-b border-emerald-50 bg-emerald-50/70 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase ${priorityStyle[priority] || priorityStyle.medium}`}>
            <Flag size={13} />
            {priority}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-slate-500">
            <Layers3 size={13} />
            {category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-sm font-black leading-5 text-slate-950">{recommendation.title}</h4>
        <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{summary}</p>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Recommended action</p>
          <p className="mt-1 flex items-start gap-2 text-sm font-bold leading-5 text-slate-800">
            <ArrowRight size={15} className="mt-0.5 shrink-0 text-emerald-700" />
            {recommendation.rationale || recommendation.description || recommendation.title}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase text-cyan-700">
            <ShieldCheck size={13} />
            {confidence}% confidence
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-500">
            <Clock3 size={13} />
            {formatGeneratedAt(generatedAt)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function normalizeConfidence(score?: number) {
  if (typeof score !== 'number' || Number.isNaN(score)) return 76;
  const percent = score <= 1 ? score * 100 : score;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function formatGeneratedAt(value?: string) {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Generated';
  return date.toLocaleString();
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ');
}
