'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Zap, Info, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/liveUtils';

export interface ActivityEvent {
  id: string;
  type: 'success' | 'warning' | 'anomaly' | 'notice';
  title: string;
  message: string;
  createdAt: number;
}

export default function ActivityEventCard({ event }: { event: ActivityEvent }) {
  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-500" />,
    warning: <AlertCircle size={16} className="text-amber-500" />,
    anomaly: <Zap size={16} className="text-red-500" />,
    notice: <Info size={16} className="text-blue-500" />,
  };

  return (
    <div className="group flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
      <div className="mt-0.5 shrink-0">
        {icons[event.type]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="truncate text-sm font-bold text-slate-900">{event.title}</h4>
          <span className="flex items-center gap-1 shrink-0 text-[10px] font-bold uppercase text-slate-400">
            <Clock size={10} />
            {formatRelativeTime(event.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {event.message}
        </p>
      </div>
    </div>
  );
}