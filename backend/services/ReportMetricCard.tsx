'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ReportMetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color: 'blue' | 'cyan' | 'amber' | 'emerald' | 'violet';
}

export default function ReportMetricCard({ label, value, change, isPositive, icon: Icon, color }: ReportMetricCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`rounded-2xl p-3 ${colorStyles[color]}`}>
          <Icon size={20} />
        </div>
        {change && (
          <span className={`text-xs font-black ${isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <h3 className="mt-2 text-3xl font-black text-slate-900">{value}</h3>
      </div>
    </div>
  );
}