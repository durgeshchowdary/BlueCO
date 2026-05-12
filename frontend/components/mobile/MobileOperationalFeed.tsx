'use client';

import { AlertTriangle, CheckCircle2, Clock3, Sparkles } from 'lucide-react';

export type MobileFeedItem = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical' | 'info';
  timestamp?: string;
};

type MobileOperationalFeedProps = {
  items: MobileFeedItem[];
  loading?: boolean;
  className?: string;
};

const dotStyle = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-400',
  info: 'bg-cyan-500',
};

export default function MobileOperationalFeed({ items, loading = false, className = '' }: MobileOperationalFeedProps) {
  if (loading) {
    return (
      <section className={`rounded-2xl border border-slate-200 bg-white p-4 ${className}`}>
        {[1, 2, 3].map((item) => (
          <div key={item} className="mb-3 h-16 animate-pulse rounded-xl bg-slate-100 last:mb-0" />
        ))}
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className={`rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center ${className}`}>
        <CheckCircle2 className="mx-auto text-emerald-700" size={20} />
        <p className="mt-3 text-sm font-black text-slate-950">No operational feed items</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Timeline events, alerts, and recommendations will appear here.</p>
      </section>
    );
  }

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Operational feed</p>
        <Clock3 size={16} className="text-slate-400" />
      </div>
      <ol className="space-y-3">
        {items.slice(0, 6).map((item) => {
          const severity = item.severity || 'info';
          const Icon = severity === 'critical' || severity === 'high' ? AlertTriangle : Sparkles;
          return (
            <li key={item.id} className="flex gap-3">
              <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${dotStyle[severity]}`} />
              <article className="min-w-0 flex-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex min-w-0 items-start gap-2">
                  <Icon size={15} className="mt-0.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-black leading-5 text-slate-950">{item.title}</p>
                    {item.description ? <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{item.description}</p> : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.category ? <span className="max-w-full truncate rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black uppercase text-slate-500">{item.category}</span> : null}
                      {item.timestamp ? <span className="rounded-full bg-cyan-50 px-2 py-1 text-[11px] font-black uppercase text-cyan-700">{formatDate(item.timestamp)}</span> : null}
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString();
}
