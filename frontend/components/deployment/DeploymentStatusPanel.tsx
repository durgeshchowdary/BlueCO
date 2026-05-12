'use client';

const services = [
  {
    name: 'Frontend',
    status: 'Operational',
    env: 'Vercel Ready',
  },
  {
    name: 'Backend API',
    status: 'Operational',
    env: 'Render/Railway Ready',
  },
  {
    name: 'MongoDB',
    status: 'Connected',
    env: 'Atlas Active',
  },
  {
    name: 'AI Ops Layer',
    status: 'Healthy',
    env: 'Realtime Monitoring Active',
  },
];

export default function DeploymentStatusPanel() {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
            Deployment
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-900">
            Infrastructure Status
          </h2>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />

          <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
            Stable
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.name}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900">
                {service.name}
              </h3>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                {service.status}
              </span>
            </div>

            <p className="mt-3 text-sm font-medium text-slate-500">
              {service.env}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}