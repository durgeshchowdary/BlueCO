'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Clock3, Radio } from 'lucide-react';
import { useDemoMode } from '../../providers/DemoModeProvider';

const severityStyle = {
  critical: 'bg-red-50 text-red-700 border-red-100',
  high: 'bg-orange-50 text-orange-700 border-orange-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

type DemoScenarioBannerProps = {
  className?: string;
};

export default function DemoScenarioBanner({ className = '' }: DemoScenarioBannerProps) {
  const { enabled, scenario, generatedAt } = useDemoMode();

  if (!enabled) return null;

  if (!scenario) {
    return (
      <section className={`rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm font-bold text-slate-500 ${className}`}>
        Demo mode is active, but no scenario is available.
      </section>
    );
  }

  return (
    <motion.section
      key={scenario.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-cyan-50 p-4 shadow-sm md:p-5 ${className}`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-orange-700">
            <Radio size={13} />
            Live demo scenario
          </div>
          <h2 className="mt-3 break-words text-xl font-black text-slate-950">{scenario.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{scenario.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase ${severityStyle[scenario.severity]}`}>
            <AlertTriangle size={13} />
            {scenario.severity}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-slate-500">
            <Clock3 size={13} />
            {formatTime(generatedAt)}
          </span>
        </div>
      </div>
    </motion.section>
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Rotating now';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
