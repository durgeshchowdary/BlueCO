'use client';

import { AlertTriangle, Activity, Radio, Sparkles, Users, Zap } from 'lucide-react';

export type MobileExecutiveMetric = {
  id: string;
  label: string;
  value: string | number;
  helper?: string;
  tone?: 'cyan' | 'emerald' | 'amber' | 'red' | 'slate';
};

type MobileExecutiveCardsProps = {
  metrics: MobileExecutiveMetric[];
  loading?: boolean;
  className?: string;
};

const toneClass = {
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  slate: 'bg-slate-50 text-slate-600 border-slate-200',
};

const icons = [Activity, Users, AlertTriangle, Radio, Sparkles, Zap];

export default function MobileExecutiveCards({ metrics, loading = false, className = '' }: MobileExecutiveCardsProps) {
  if (loading) {
    return (
      <section className={`grid grid-cols-2 gap-3 ${className}`}>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </section>
    );
  }

  if (!metrics.length) {
    return (
      <section className={`rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm font-bold text-slate-500 ${className}`}>
        No executive mobile signals are available yet.
      </section>
    );
  }

  return (
    <section className={`grid grid-cols-2 gap-3 ${className}`}>
      {metrics.slice(0, 6).map((metric, index) => {
        const Icon = icons[index % icons.length];
        const tone = metric.tone || 'cyan';
        return (
          <article key={metric.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl border ${toneClass[tone]}`}>
              <Icon size={17} />
            </div>
            <p className="truncate text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{metric.label}</p>
            <p className="mt-1 truncate text-xl font-black text-slate-950">{metric.value}</p>
            {metric.helper ? <p className="mt-1 line-clamp-2 text-xs font-semibold leading-4 text-slate-500">{metric.helper}</p> : null}
          </article>
        );
      })}
    </section>
  );
}
