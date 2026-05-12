'use client';

import { MOCK_NOTIFICATIONS } from '@/lib/mockNotifications';

export default function OperationalAlertsPanel() {
  const unread = MOCK_NOTIFICATIONS.filter((item) => !item.read).length;
  const anomalies = MOCK_NOTIFICATIONS.filter((item) => item.variant === 'anomaly').length;
  const warnings = MOCK_NOTIFICATIONS.filter((item) => item.variant === 'warning').length;

  return (
    <div className="rounded-[32px] border border-slate-200 bg-slate-50/70 p-6 shadow-sm">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
        Operational Alert Summary
      </h3>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-bold text-slate-500">Unread</p>
          <p className="mt-2 text-3xl font-black text-blue-600">{unread}</p>
        </div>

        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-bold text-slate-500">Anomalies</p>
          <p className="mt-2 text-3xl font-black text-red-600">{anomalies}</p>
        </div>

        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-bold text-slate-500">Warnings</p>
          <p className="mt-2 text-3xl font-black text-amber-600">{warnings}</p>
        </div>
      </div>
    </div>
  );
}