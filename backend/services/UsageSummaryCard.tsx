'use client';

import React from 'react';
import { Users, UserCheck, Bot, BarChart3 } from 'lucide-react';

export default function UsageSummaryCard() {
  const metrics = [
    { label: 'Active Students', value: 142, limit: 200, displayValue: '142', displayLimit: '200', icon: Users, color: 'text-blue-600' },
    { label: 'Coaches', value: 8, limit: 10, displayValue: '8', displayLimit: '10', icon: UserCheck, color: 'text-emerald-600' },
    { label: 'AI Ops Tokens', value: 4200, limit: 10000, displayValue: '4.2k', displayLimit: '10k', icon: Bot, color: 'text-purple-600' },
    { label: 'Reports Gen', value: 24, limit: 50, displayValue: '24', displayLimit: '50', icon: BarChart3, color: 'text-cyan-600' },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-black text-slate-900 mb-6">Plan Usage</h3>
      <div className="space-y-6">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <m.icon size={16} className={m.color} />
                <span className="text-sm font-bold text-slate-700">{m.label}</span>
              </div>
              <span className="text-xs font-black text-slate-900">
                {m.displayValue} / {m.displayLimit}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${(m.value / m.limit) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}