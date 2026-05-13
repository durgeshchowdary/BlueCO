'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Camera, Loader2 } from 'lucide-react';
import { downloadCSV } from '@/lib/utils';

export default function ExportActionsPanel({ reportData }: { reportData: any[] }) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setExporting(type);
    // Simulate export delay for UX/demo impact
    await new Promise(r => setTimeout(r, 1200));
    
    if (type === 'csv') {
      downloadCSV(reportData, `outplay-report-${new Date().toISOString().split('T')[0]}.csv`);
    }
    
    setExporting(null);
  };

  const actions = [
    { id: 'csv', label: 'Export CSV', icon: FileSpreadsheet, tone: 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200' },
    { id: 'summary', label: 'Executive Summary', icon: FileText, tone: 'text-blue-600 hover:bg-blue-50 hover:border-blue-200' },
    { id: 'snapshot', label: 'Operational Snapshot', icon: Camera, tone: 'text-violet-600 hover:bg-violet-50 hover:border-violet-200' },
  ];

  return (
    <div className="rounded-[32px] border border-slate-200 bg-slate-50/50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Export & Actions</h4>
        <Download size={18} className="text-slate-400" />
      </div>

      <div className="grid gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const isCurrent = exporting === action.id;

          return (
            <button
              key={action.id}
              onClick={() => handleExport(action.id)}
              disabled={!!exporting}
              className={`flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all active:scale-[0.98] disabled:opacity-50 ${action.tone}`}
            >
              <div className="flex items-center gap-3">
                {isCurrent ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
                <span className="text-sm font-black">{action.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}