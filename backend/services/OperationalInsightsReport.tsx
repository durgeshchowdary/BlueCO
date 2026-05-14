'use client';

import React from 'react';
import ExecutiveReportCard from './ExecutiveReportCard';
import ReportSummaryGrid from './ReportSummaryGrid';
import ReportFiltersBar from './ReportFiltersBar';
import ExportActionsPanel from './ExportActionsPanel';

import { MOCK_EXECUTIVE_REPORTS } from '@/lib/mockExecutiveReports';

export default function OperationalInsightsReport() {
  return (
    <div className="p-8">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />

            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
              Enterprise Ready
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Executive Reports
          </h1>

          <p className="mt-2 font-medium text-slate-500">
            Verified operational performance and AI-driven intelligence.
          </p>
        </div>

        <div className="flex h-fit gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Academy Health
            </p>

            <p className="text-xl font-black tracking-tight text-emerald-600">
              A+ Stable
            </p>
          </div>
        </div>
      </div>

      <ReportFiltersBar />

      <div className="mb-10">
        <ReportSummaryGrid />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-2">
          {MOCK_EXECUTIVE_REPORTS.map((report) => (
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

        <ExportActionsPanel reportData={MOCK_EXECUTIVE_REPORTS} />
      </div>
    </div>
  );
}