'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export type OnboardingChecklistItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
  completed: boolean;
};

type OnboardingChecklistProps = {
  items: OnboardingChecklistItem[];
  loading?: boolean;
  className?: string;
};

export default function OnboardingChecklist({ items, loading = false, className = '' }: OnboardingChecklistProps) {
  const completed = items.filter((item) => item.completed).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 ${className}`} aria-busy={loading}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Setup checklist</p>
          <h2 className="mt-2 text-xl font-black text-slate-950 md:text-2xl">Academy readiness</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {completed}/{items.length} operational setup items completed.
          </p>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-xl font-black text-cyan-700">
          {loading ? <Loader2 className="animate-spin" size={22} /> : `${progress}%`}
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-cyan-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.length ? items.map((item) => <ChecklistRow key={item.id} item={item} />) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm font-bold text-slate-500">
            No setup signals are available yet.
          </div>
        )}
      </div>
    </section>
  );
}

function ChecklistRow({ item }: { item: OnboardingChecklistItem }) {
  const Icon = item.completed ? CheckCircle2 : Circle;
  const content = (
    <div className={`flex h-full gap-3 rounded-2xl border p-4 transition ${item.completed ? 'border-emerald-100 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}>
      <Icon className={`mt-0.5 shrink-0 ${item.completed ? 'text-emerald-700' : 'text-slate-400'}`} size={18} />
      <div className="min-w-0">
        <p className={`text-sm font-black ${item.completed ? 'text-emerald-900' : 'text-slate-950'}`}>{item.title}</p>
        <p className={`mt-1 text-xs font-semibold leading-5 ${item.completed ? 'text-emerald-700' : 'text-slate-500'}`}>{item.description}</p>
      </div>
    </div>
  );

  if (!item.href || item.completed) return content;
  return <Link href={item.href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2">{content}</Link>;
}
