'use client';

const checks = [
  { label: 'Frontend build passing', status: 'ready' },
  { label: 'TypeScript validation passing', status: 'ready' },
  { label: 'Auth security UX added', status: 'ready' },
  { label: 'Billing UX stabilized', status: 'ready' },
  { label: 'Realtime operations stable', status: 'ready' },
  { label: 'Notifications UX added', status: 'ready' },
  { label: 'Deployment env review needed', status: 'pending' },
  { label: 'Backend production smoke test needed', status: 'pending' },
];

export default function ProductionReadinessPanel() {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-slate-900">
        Production Readiness
      </h2>

      <p className="mt-2 text-sm font-medium text-slate-500">
        Final launch checklist for OUT-PLAY deployment and recruiter demo stability.
      </p>

      <div className="mt-6 grid gap-3">
        {checks.map((check) => (
          <div
            key={check.label}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <span className="text-sm font-bold text-slate-700">
              {check.label}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                check.status === 'ready'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {check.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}