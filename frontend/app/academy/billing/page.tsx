'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, FileText, Loader2, ReceiptText, ShieldCheck } from 'lucide-react';
import RoleShell from '../../../components/RoleShell';
import api, { API_BASE_URL } from '../../../lib/api';

type Invoice = {
  _id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  total: number;
  dueAt?: string;
  createdAt: string;
};

type BillingOverview = {
  academy?: {
    name: string;
    status: string;
    subscription?: {
      plan?: string;
      status?: string;
      trialEndsAt?: string;
      currentPeriodEnd?: string;
    };
  };
  invoices?: Invoice[];
  totals?: { _id: string; total: number; count: number }[];
};

export default function BillingPage() {
  const [overview, setOverview] = useState<BillingOverview>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/billing/overview');
        setOverview(data || {});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const invoiceTotal = useMemo(() => (
    overview.totals?.reduce((sum, item) => sum + Number(item.total || 0), 0) || 0
  ), [overview.totals]);

  return (
    <RoleShell role="academy_admin" title="Billing Ops">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-700">Revenue engine</p>
          <h1 className="mt-3 text-3xl font-black md:text-5xl">Billing & Invoices</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Subscription lifecycle, invoice PDFs, payment recovery, and customer billing history.
          </p>
        </div>
        <Link
          href="/academy/subscription"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-700"
        >
          <ShieldCheck size={18} />
          Manage Subscription
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <SummaryCard icon={ShieldCheck} label="Workspace status" value={overview.academy?.subscription?.status || overview.academy?.status || 'trial'} />
            <SummaryCard icon={ReceiptText} label="Invoice value" value={`Rs ${invoiceTotal.toLocaleString('en-IN')}`} />
            <SummaryCard icon={FileText} label="Recent invoices" value={overview.invoices?.length || 0} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-black">Invoice history</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Issued</th>
                    <th className="px-5 py-3 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview.invoices?.length ? overview.invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-black text-slate-950">{invoice.invoiceNumber}</td>
                      <td className="px-5 py-4 text-slate-600">{invoice.type.replace('_', ' ')}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-700">{invoice.status}</span>
                      </td>
                      <td className="px-5 py-4 font-bold">Rs {Number(invoice.total || 0).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-slate-600">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={`${API_BASE_URL}/billing/invoices/${invoice._id}/download`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-cyan-700"
                          aria-label={`Download ${invoice.invoiceNumber}`}
                          title="Download invoice"
                        >
                          <Download size={17} />
                        </a>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-5 py-12 text-center text-sm font-semibold text-slate-500" colSpan={6}>No invoices generated yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </RoleShell>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-4 text-2xl font-black capitalize text-slate-950">{value}</p>
    </div>
  );
}
