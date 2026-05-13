'use client';

import React from 'react';
import { Filter, Calendar } from 'lucide-react';

export default function ReportFiltersBar() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 px-2">
        <Filter size={16} className="text-slate-400" />
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Filters</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <select className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-8 text-xs font-bold text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
            <option>This Year</option>
            <option>Custom Range</option>
          </select>
        </div>

        <select className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-4 text-xs font-bold text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option>All Operations</option>
          <option>Attendance</option>
          <option>Billing</option>
          <option>AI Insights</option>
        </select>

        <div className="h-6 w-px bg-slate-200" />

        <button className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-black text-white transition hover:bg-blue-600">
          Generate Report
        </button>
      </div>
    </div>
  );
}