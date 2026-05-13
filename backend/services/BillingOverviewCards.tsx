'use client';

import React from 'react';
import { CreditCard, Calendar, ShieldCheck, Zap } from 'lucide-react';
import SubscriptionStatusBadge from './SubscriptionStatusBadge';

export default function BillingOverviewCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">Current Plan</p>
          <Zap size={18} className="text-blue-500" />
        </div>
        <h3 className="mt-4 text-2xl font-black text-slate-900">Pro Academy</h3>
        <p className="mt-1 text-sm font-semibold text-blue-600">₹999 / month</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">Status</p>
          <ShieldCheck size={18} className="text-emerald-500" />
        </div>
        <div className="mt-4">
          <SubscriptionStatusBadge status="active" />
        </div>
        <p className="mt-1 text-sm text-slate-500">Verified payment method</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">Next Renewal</p>
          <Calendar size={18} className="text-amber-500" />
        </div>
        <h3 className="mt-4 text-2xl font-black text-slate-900">Aug 24, 2024</h3>
        <p className="mt-1 text-sm text-slate-500">Auto-renew enabled</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">Payment Method</p>
          <CreditCard size={18} className="text-slate-400" />
        </div>
        <h3 className="mt-4 text-2xl font-black text-slate-900">•••• 4242</h3>
        <p className="mt-1 text-sm text-slate-500">Visa ending in 4242</p>
      </div>
    </div>
  );
}