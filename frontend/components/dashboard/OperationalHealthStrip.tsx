'use client';

import { Activity, AlertTriangle, Brain, Radio, ShieldCheck, TrendingUp } from 'lucide-react';

export type HealthStripItem = {
  id: string;
  label: string;
  value: string | number;
  status?: 'healthy' | 'watch' | 'risk' | 'neutral';
};

type OperationalHealthStripProps = {
  items: HealthStripItem[];
  loading?: boolean;
  className?: string;
};

const statusStyle = {
  healthy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  watch: 'bg-amber-50 text-amber-700 border-amber-100',
  risk: 'bg-red-50 text-red-700 border-red-100',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
};

const icons = [ShieldCheck, TrendingUp, Radio, AlertTriangle, Activity, Brain];

export default function OperationalHealthStrip({ items, loading = false, className = '' }: OperationalHealthStripProps) {
  if (loading) {
    return (
      <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 ${className}`} aria-busy="true">
        <div className="flex gap-3 overflow-x-auto">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-12 min-w-36 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />)}
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className={`rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm font-bold text-slate-500 ${className}`}>
        Operational health signals are not available yet.
      </section>
    );
  }

  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${className}`}>
      <div className="flex gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]" role="list" aria-label="Operational health signals">
        {items.slice(0, 6).map((item, index) => {
          const Icon = icons[index % icons.length];
          const status = item.status || 'neutral';
          return (
            <div key={item.id} role="listitem" className={`flex min-w-40 items-center gap-3 rounded-xl border px-3 py-2 ${statusStyle[status]}`}>
              <Icon size={16} className="shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-black uppercase tracking-[0.12em] opacity-75">{item.label}</p>
                <p className="truncate text-sm font-black">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
