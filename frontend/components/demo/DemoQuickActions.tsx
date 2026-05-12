'use client';

export default function DemoQuickActions() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-black text-slate-900">Quick Actions</h3>
      <div className="mt-4 grid gap-3">
        <a href="/academy/ai-ops" className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white">
          Open AI Ops
        </a>
        <a href="/academy/reports" className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-700">
          View Reports
        </a>
      </div>
    </div>
  );
}
