"use client";

import { LucideIcon } from "lucide-react";

export default function SystemPulseCard({
  label,
  value,
  trend,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-2xl p-3 bg-${color}-50 text-${color}-600`}>
          <Icon size={18} />
        </div>

        <span className="text-xs font-bold text-slate-400">
          LIVE
        </span>
      </div>

      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <h3 className="mt-2 text-2xl font-black text-slate-900">
        {value}
      </h3>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        {trend}
      </p>
    </div>
  );
}
