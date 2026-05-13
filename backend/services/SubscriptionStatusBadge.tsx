'use client';

import React from 'react';

interface SubscriptionStatusBadgeProps {
  status: 'active' | 'trial' | 'expiring' | 'overdue' | 'suspended';
}

export default function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  const config = {
    active: { label: 'Active', classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    trial: { label: 'Trial', classes: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    expiring: { label: 'Expiring Soon', classes: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    overdue: { label: 'Overdue', classes: 'bg-red-500/10 text-red-500 border-red-500/20' },
    suspended: { label: 'Suspended', classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  };

  const { label, classes } = config[status] || config.active;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${classes}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}