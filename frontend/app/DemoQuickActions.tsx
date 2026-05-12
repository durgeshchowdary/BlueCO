'use client';

import React from 'react';
import { Zap, Bot, ToggleLeft, Clock, Smartphone, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const actions = [
  { label: 'Open AI Ops', icon: Zap, href: '/academy-ops' },
  { label: 'View Copilot', icon: Bot, href: '/copilot' },
  { label: 'Toggle Demo Mode', icon: ToggleLeft, href: '#' },
  { label: 'Operational Timeline', icon: Clock, href: '/timeline' },
  { label: 'Mobile Experience', icon: Smartphone, href: '/mobile' },
  { label: 'KPI Dashboard', icon: BarChart3, href: '/dashboard' },
];

export default function DemoQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="group flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition hover:border-cyan-500/50 hover:bg-cyan-500/10"
        >
          <action.icon className="h-6 w-6 text-slate-400 transition group-hover:scale-110 group-hover:text-cyan-400" />
          <span className="mt-3 text-xs font-semibold text-slate-300 group-hover:text-white">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}