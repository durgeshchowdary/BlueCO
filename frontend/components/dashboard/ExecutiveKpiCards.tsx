'use client';

import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Brain, Radio, ShieldCheck, Sparkles } from 'lucide-react';

export type ExecutiveKpi = {
  id: string;
  label: string;
  value: string | number;
  helper?: string;
  tone?: 'cyan' | 'emerald' | 'amber' | 'red' | 'slate';
};

type ExecutiveKpiCardsProps = {
  items: ExecutiveKpi[];
  loading?: boolean;
  className?: string;
};

const toneStyle = {
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  slate: 'bg-slate-50 text-slate-600 border-slate-200',
};

const icons = [ShieldCheck, Activity, Radio, AlertTriangle, Sparkles, Brain];

export default function ExecutiveKpiCards({ items, loading = false, className = '' }: ExecutiveKpiCardsProps) {
  if (loading) {
    return (
      <section className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-6 ${className}`} aria-busy="true">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" aria-hidden="true" />
        ))}
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className={`rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm font-bold text-slate-500 ${className}`}>
        No executive KPI data is available yet.
      </section>
    );
  }

  return (
    <section className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-6 ${className}`}>
      {items.slice(0, 6).map((item, index) => {
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
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl border ${toneStyle[tone]}`}>
              <Icon size={17} />
            </div>
            <p className="truncate text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
            <p className="mt-1 truncate text-xl font-black text-slate-950">{item.value}</p>
            {item.helper ? <p className="mt-1 line-clamp-2 text-xs font-semibold leading-4 text-slate-500">{item.helper}</p> : null}
          </motion.article>
        );
      })}
    </section>
  );
}
