'use client';

import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

export default function BillingHealthPanel() {
  return (
    <div className="rounded-3xl border border-blue-100 bg-blue-50/30 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
          <Activity size={20} />
        </div>
        <div>
          <h4 className="font-black text-slate-900">Billing Health</h4>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
            <ShieldCheck size={14} />
            Subscription Secure
          </div>
        </div>
      </div>
      <div className="mt-6 border-t border-blue-100 pt-4">
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          Your academy operations are fully covered under the <strong>Pro Plan</strong>. All AI modules and executive dashboards are active.
        </p>
      </div>
    </div>
  );
}