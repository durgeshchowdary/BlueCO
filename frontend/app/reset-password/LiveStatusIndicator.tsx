'use client';

import React from 'react';

export type LiveStatus = 'healthy' | 'delayed' | 'warning' | 'disconnected';

interface LiveStatusIndicatorProps {
  status: LiveStatus;
  label?: string;
  showPulse?: boolean;
}

export default function LiveStatusIndicator({ 
  status, 
  label, 
  showPulse = true 
}: LiveStatusIndicatorProps) {
  const config = {
    healthy: { color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Operational' },
    delayed: { color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', label: 'Delayed' },
    warning: { color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', label: 'Attention' },
    disconnected: { color: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', label: 'Offline' },
  };

  const current = config[status];

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-current/10 px-3 py-1 ${current.bg} ${current.text}`}>
      <div className="relative flex h-2 w-2">
        {showPulse && status !== 'disconnected' && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${current.color}`}></span>
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${current.color}`}></span>
      </div>
      <span className="text-xs font-black uppercase tracking-wider">{label || current.label}</span>
    </div>
  );
}