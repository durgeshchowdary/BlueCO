'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Sparkles } from 'lucide-react';

export type MobileInsightItem = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical' | 'info';
  timestamp?: string;
};

type MobileInsightCarouselProps = {
  items: MobileInsightItem[];
  loading?: boolean;
  className?: string;
};

const severityStyle = {
  critical: 'bg-red-50 text-red-700',
  high: 'bg-orange-50 text-orange-700',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
  info: 'bg-cyan-50 text-cyan-700',
};

export default function MobileInsightCarousel({ items, loading = false, className = '' }: MobileInsightCarouselProps) {
  if (loading) {
    return (
      <section className={`overflow-hidden ${className}`}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2].map((item) => (
            <div key={item} className="h-40 min-w-[82%] animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className={`rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center ${className}`}>
        <Sparkles className="mx-auto text-cyan-700" size={20} />
        <p className="mt-3 text-sm font-black text-slate-950">No mobile insights yet</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Generate AI insights to populate the swipeable executive carousel.</p>
      </section>
    );
  }

  return (
    <section className={`overflow-hidden ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Executive insights</p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{items.length}</span>
      </div>
      <div className="flex snap-x gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
        {items.slice(0, 8).map((item) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className="min-w-[82%] snap-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <Sparkles size={17} />
              </div>
              {item.severity ? (
                <span className={`rounded-full px-2 py-1 text-[11px] font-black uppercase ${severityStyle[item.severity]}`}>
                  {item.severity}
                </span>
              ) : null}
            </div>
            <h3 className="mt-3 line-clamp-2 text-base font-black leading-5 text-slate-950">{item.title}</h3>
            {item.description ? <p className="mt-2 line-clamp-3 text-xs font-semibold leading-5 text-slate-500">{item.description}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {item.category ? <span className="max-w-full truncate rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase text-slate-500">{item.category}</span> : null}
              {item.timestamp ? <span className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-black uppercase text-cyan-700">{formatDate(item.timestamp)}</span> : null}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString();
}
