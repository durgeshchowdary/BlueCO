'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Brain, ClipboardList, Sparkles, Zap } from 'lucide-react';

export type InsightHighlight = {
  id: string;
  label: string;
  title: string;
  description?: string;
  tone?: 'cyan' | 'emerald' | 'amber' | 'red' | 'slate';
  timestamp?: string;
};

type InsightHighlightsProps = {
  items: InsightHighlight[];
  loading?: boolean;
  className?: string;
};

const toneStyle = {
  cyan: 'bg-cyan-50 text-cyan-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  slate: 'bg-slate-100 text-slate-600',
};

const icons = [Brain, ClipboardList, AlertTriangle, Sparkles, Zap];

export default function InsightHighlights({ items, loading = false, className = '' }: InsightHighlightsProps) {
  if (loading) {
    return (
      <section className={`grid gap-3 lg:grid-cols-5 ${className}`} aria-busy="true">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white" aria-hidden="true" />
        ))}
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className={`rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm font-bold text-slate-500 ${className}`}>
        No insight highlights are available yet.
      </section>
    );
  }

  return (
    <section className={`grid gap-3 md:grid-cols-2 xl:grid-cols-5 ${className}`}>
      {items.slice(0, 5).map((item, index) => {
        const Icon = icons[index % icons.length];
        const tone = item.tone || 'cyan';
        return (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.02 }}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${toneStyle[tone]}`}>
              <Icon size={13} />
              {item.label}
            </div>
            <h3 className="line-clamp-2 text-sm font-black leading-5 text-slate-950">{item.title}</h3>
            {item.description ? <p className="mt-2 line-clamp-3 text-xs font-semibold leading-5 text-slate-500">{item.description}</p> : null}
            {item.timestamp ? <p className="mt-3 text-[11px] font-bold uppercase text-slate-400">{formatDate(item.timestamp)}</p> : null}
          </motion.article>
        );
      })}
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString();
}
