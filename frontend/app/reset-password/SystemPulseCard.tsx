'use client';

import React from 'react';
import { Activity, LucideIcon } from 'lucide-react';

interface SystemPulseCardProps {
  label: string;
  value: string | number;
  trend: string;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'emerald';
}

export default function SystemPulseCard({ label, value, trend, icon: Icon, color }: SystemPulseCardProps) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    emerald: 'text-emerald-600 bg-emerald-50',
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-2 ${colors[color]}`}>
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600">
          <Activity size={10} className="animate-pulse" />
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <h4 className="mt-1 text-2xl font-black text-slate-900">{value}</h4>
      </div>
    </div>
  );
}