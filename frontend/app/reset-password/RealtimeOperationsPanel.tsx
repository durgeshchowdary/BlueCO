'use client';

import React from 'react';
import { Activity, Zap, ShieldCheck, BarChart3 } from 'lucide-react';
import SystemPulseCard from './SystemPulseCard';
import LiveActivityFeed from './LiveActivityFeed';
import LiveStatusIndicator from './LiveStatusIndicator';

export default function RealtimeOperationsPanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="font-black text-slate-900">Operational Pulse</h2>
              <p className="text-xs font-semibold text-slate-500">Real-time academy health monitoring</p>
            </div>
          </div>
          <LiveStatusIndicator status="healthy" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SystemPulseCard label="Operational Load" value="24%" trend="+2% active" icon={BarChart3} color="blue" />
          <SystemPulseCard label="AI Ops Activity" value="Active" trend="98% confidence" icon={Zap} color="purple" />
          <SystemPulseCard label="Relay Reliability" value="99.9%" trend="Stable" icon={ShieldCheck} color="emerald" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm">
        <LiveActivityFeed />
      </div>
    </div>
  );
}