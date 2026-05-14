'use client';

import { Download, FileText } from 'lucide-react';

export interface InvoiceRow {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: string;
}

interface InvoiceHistoryTableProps {
  invoices?: InvoiceRow[];
}

const getStatusStyles = (status: string) => {
  const lowerStatus = status.toLowerCase();

  if (lowerStatus === 'paid') {
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  }

  if (lowerStatus === 'pending') {
    return 'bg-amber-50 text-amber-600 border-amber-100';
  }

  if (lowerStatus === 'failed' || lowerStatus === 'overdue') {
    return 'bg-red-50 text-red-600 border-red-100';
  }

  return 'bg-slate-50 text-slate-600 border-slate-100';
};

export default function InvoiceHistoryTable({ invoices }: InvoiceHistoryTableProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Invoice History
          </h3>
        </div>

        <div className="flex flex-col items-center justify-center p-12 text-center">
          <FileText size={40} className="mb-4 text-slate-200" />
          <p className="font-bold text-slate-500">No invoice history found</p>
          <p className="text-xs text-slate-400">Your billing records will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
          Invoice History
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-widest text-slate-500">
              <th className="px-6 py-4">Invoice</th>
              <th className="px-6 py-4">Billing Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50 text-sm">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-6 py-4 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    {invoice.number}
                  </div>
                </td>

                <td className="px-6 py-4 font-medium text-slate-600">{invoice.date}</td>
                <td className="px-6 py-4 font-black text-slate-900">{invoice.amount}</td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${getStatusStyles(
                      invoice.status,
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    aria-label={`Download invoice ${invoice.number}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-white hover:text-blue-600"
                  >
                    <Download size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}