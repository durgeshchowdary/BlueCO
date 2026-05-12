'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownAZ, Building2, Download, FileCheck2, Search, ShieldAlert } from 'lucide-react';
import RoleShell from '../../../components/RoleShell';
import api from '../../../lib/api';

type ComplianceStatus = 'all' | 'complete' | 'partial' | 'pending';
type SortKey = 'updatedAt' | 'name' | 'city' | 'status';

type QueueRow = {
  academyId: string;
  name: string;
  city: string;
  academyStatus: string;
  subscriptionStatus: string;
  subscriptionPlan: string;
  complianceStatus: Exclude<ComplianceStatus, 'all'>;
  documents: Record<'registration' | 'authorization', { fileName: string; size: number; uploadedAt: string | null; isUploaded: boolean }>;
  updatedAt: string;
};

type QueueResponse = {
  totals: Record<'total' | 'complete' | 'partial' | 'pending', number>;
  rows: QueueRow[];
};

const filters: { key: ComplianceStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'complete', label: 'Complete' },
  { key: 'partial', label: 'Partial' },
  { key: 'pending', label: 'Pending' },
];

const statusStyles = {
  complete: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  pending: 'bg-slate-100 text-slate-600',
};

export default function SuperAdminCompliancePage() {
  const [data, setData] = useState<QueueResponse>({ totals: { total: 0, complete: 0, partial: 0, pending: 0 }, rows: [] });
  const [status, setStatus] = useState<ComplianceStatus>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('updatedAt');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    api.get<QueueResponse>('/super-admin/compliance', {
      signal: controller.signal,
      params: { status, q: query, sort },
    })
      .then((response) => setData(response.data))
      .catch((err) => {
        if (!controller.signal.aborted) setError(err?.response?.data?.message || 'Unable to load compliance queue.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [status, query, sort]);

  const cards = useMemo(() => [
    ['Total academies', data.totals.total, Building2, 'bg-cyan-100 text-cyan-700'],
    ['Complete', data.totals.complete, FileCheck2, 'bg-emerald-100 text-emerald-700'],
    ['Partial', data.totals.partial, ShieldAlert, 'bg-amber-100 text-amber-700'],
    ['Pending', data.totals.pending, ShieldAlert, 'bg-slate-100 text-slate-600'],
  ] as const, [data.totals]);

  const downloadDoc = async (academyId: string, docType: 'registration' | 'authorization', fileName: string) => {
    const response = await api.get(`/super-admin/compliance/${academyId}/${docType}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `${docType}-dlt-document`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <RoleShell role="super_admin" title="Compliance Review">
      <section className="rounded-[30px] border border-white/10 bg-white p-5 text-slate-900 shadow-[0_24px_90px_rgba(0,0,0,0.2)] md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-600">DLT compliance</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Academy document queue</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Review tenant-submitted communication compliance documents without crossing academy data boundaries.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-w-[260px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search academy, city, status"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
              />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
              <ArrowDownAZ size={17} />
              <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="bg-transparent outline-none">
                <option value="updatedAt">Latest</option>
                <option value="name">Academy</option>
                <option value="city">City</option>
                <option value="status">Compliance</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {cards.map(([label, value, Icon, style]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${style}`}>
                <Icon size={20} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setStatus(filter.key)}
              className={`rounded-full px-4 py-2 text-sm font-black capitalize transition ${
                status === filter.key ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[1.2fr_0.7fr_0.8fr_0.7fr_1.2fr] gap-4 bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-400 max-lg:hidden">
            <span>Academy</span>
            <span>City</span>
            <span>Subscription</span>
            <span>Status</span>
            <span>Documents</span>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm font-bold text-red-600">{error}</div>
          ) : data.rows.length === 0 ? (
            <div className="p-10 text-center">
              <FileCheck2 className="mx-auto text-slate-300" size={34} />
              <p className="mt-3 font-black text-slate-900">No academies match this queue view.</p>
              <p className="mt-1 text-sm font-medium text-slate-500">Adjust filters or search terms to review more tenants.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.rows.map((row) => (
                <div key={row.academyId} className="grid gap-4 px-5 py-4 text-sm lg:grid-cols-[1.2fr_0.7fr_0.8fr_0.7fr_1.2fr] lg:items-center">
                  <div>
                    <p className="font-black text-slate-950">{row.name}</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">{row.academyStatus}</p>
                  </div>
                  <p className="font-bold text-slate-600">{row.city || 'Unassigned'}</p>
                  <div>
                    <p className="font-black text-slate-900">{row.subscriptionStatus}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-slate-400">{row.subscriptionPlan}</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${statusStyles[row.complianceStatus]}`}>
                    {row.complianceStatus}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(['registration', 'authorization'] as const).map((docType) => {
                      const doc = row.documents[docType];
                      return doc.isUploaded ? (
                        <button
                          key={docType}
                          type="button"
                          onClick={() => downloadDoc(row.academyId, docType, doc.fileName)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                          <Download size={14} />
                          {docType === 'registration' ? 'Registration' : 'Authorization'}
                        </button>
                      ) : (
                        <span key={docType} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-400">
                          {docType === 'registration' ? 'Registration' : 'Authorization'} missing
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </RoleShell>
  );
}
