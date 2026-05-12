'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ClipboardList } from 'lucide-react';
import AISetupAssistant from './AISetupAssistant';
import OnboardingChecklist, { type OnboardingChecklistItem } from './OnboardingChecklist';

type OnboardingWizardProps = {
  items: OnboardingChecklistItem[];
  loading?: boolean;
  className?: string;
};

const stepLabels: Record<string, string> = {
  academy_profile: 'Academy setup',
  coaches_added: 'Coach setup',
  students_added: 'Student onboarding',
  batches_configured: 'Batch setup',
  attendance_enabled: 'Attendance setup',
  ai_ops_viewed: 'AI Ops introduction',
};

export default function OnboardingWizard({ items, loading = false, className = '' }: OnboardingWizardProps) {
  const completed = items.filter((item) => item.completed).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;
  const nextItem = items.find((item) => !item.completed);
  const complete = items.length > 0 && completed === items.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`rounded-[30px] border border-white/10 bg-white p-5 text-slate-900 shadow-[0_24px_90px_rgba(0,0,0,0.18)] md:p-6 ${className}`}
    >
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="min-w-0 rounded-3xl bg-slate-950 p-4 text-white md:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200">
              {complete ? <CheckCircle2 size={20} /> : <ClipboardList size={20} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200/80">Onboarding</p>
              <h2 className="break-words text-xl font-black">{complete ? 'Setup complete' : 'Finish academy setup'}</h2>
            </div>
          </div>

          <p className="mt-4 text-sm font-semibold leading-6 text-slate-300">
            {complete
              ? 'Core academy setup is complete. Your team can keep using dashboard, attendance, and AI Ops workflows.'
              : nextItem
                ? `Next step: ${nextItem.title}.`
                : 'Setup signals are loading from the existing dashboard data.'}
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm font-black text-cyan-100">{progress}% ready</p>

          <div className="mt-5 grid gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-2">
                <span className="truncate text-sm font-bold text-slate-200">{stepLabels[item.id] || item.title}</span>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-black uppercase ${item.completed ? 'bg-emerald-400/15 text-emerald-100' : 'bg-amber-400/15 text-amber-100'}`}>
                  {item.completed ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          {nextItem?.href ? (
            <Link href={nextItem.href} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
              Continue setup
              <ArrowRight size={16} />
            </Link>
          ) : null}
        </div>

        <div className="space-y-5">
          <OnboardingChecklist items={items} loading={loading} />
          {!complete ? <AISetupAssistant nextAction={nextItem ? nextItem.description : undefined} /> : null}
        </div>
      </div>
    </motion.section>
  );
}
