'use client';

import React from 'react';
import ExecutiveReportCard from './ExecutiveReportCard';
import ReportSummaryGrid from './ReportSummaryGrid';
import ReportFiltersBar from './ReportFiltersBar';
import ExportActionsPanel from './ExportActionsPanel';

const MOCK_REPORT_DATA = [
  { title: 'Attendance Stability', value: '96%', trend: 4.2, category: 'Operations', description: 'Student attendance has stabilized across U-14 batches following the new schedule implementation.' },
  { title: 'Churn Risk Mitigation', value: '12%', trend: -18.5, category: 'AI Ops', description: 'Predictive churn alerts have led to a significant reduction in inactive student rates this month.' },
  { title: 'Collection Efficiency', value: '₹8.4L', trend: 12.0, category: 'Billing', description: 'Automated fee reminders have improved payment collection speed by an average of 3.2 days.' },
];

export default function OperationalInsightsReport() {
  return (
    <div className="p-8">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Enterprise Ready</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive Reports</h1>
          <p className="mt-2 text-slate-500 font-medium">Verified operational performance and AI-driven intelligence.</p>
        </div>
        
        <div className="flex h-fit gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academy Health</p>
            <p className="text-xl font-black text-emerald-600 tracking-tight">A+ Stable</p>
          </div>
        </div>
      </div>

      <ReportFiltersBar />
      
      <div className="mb-10">
        <ReportSummaryGrid />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2">
          {MOCK_REPORT_DATA.map((report) => (
            <ExecutiveReportCard 
              key={report.title}
              title={report.title}
              value={report.value}
              trend={report.trend}
              category={report.category}
              description={report.description}
            />
          ))}
        </div>
        
        <ExportActionsPanel reportData={MOCK_REPORT_DATA} />
      </div>
    </div>
  );
}