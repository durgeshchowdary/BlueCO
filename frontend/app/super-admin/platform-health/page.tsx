'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { AlertTriangle, Brain, Clock3, Database, HeartPulse, Play, RefreshCw, Repeat2, Router, ServerCog } from 'lucide-react';
import RoleShell from '../../../components/RoleShell';
import api from '../../../lib/api';

type HealthPayload = {
  generatedAt: string;
  scheduler: {
    recentJobs: Array<{ _id: string; jobName: string; status: string; attempts: number; updatedAt: string; errorMessage?: string; metadata?: any }>;
    failedJobs: number;
    runningJobs: number;
    lastRunAt: string | null;
  };
  retryQueue: {
    queued: number;
    running: number;
    deadLetter: number;
    recent: Array<{ _id: string; channel: string; status: string; attempts: number; providerCode?: string; lastError?: string }>;
  };
  storage: { failures: number; uploadFailures: number; failedDownloads: number };
  providers: { whatsappDeliveryRate: number; emailDeliveryRate: number; relayUsagePercent: number; messageQueueHealth: string };
  incidents: Array<{ key: string; title: string; count: number; severity: string; diagnostics: string }>;
  relay: { relayUsagePercent: number; academyKeyAdoptionPercent: number; failoverFrequency: number; messagingReliabilityPercent: number };
  compliance: { dltCompletionPercent: number; completeAcademies: number; totalAcademies: number };
  intelligence: Array<{ academyId: string; name: string; churnRisk: number; deliveryRisk: number; relayDependency: number; failedPayments: number; lowEngagement: boolean; complianceComplete: boolean; insight: string }>;
};

const emptyHealth: HealthPayload = {
  generatedAt: '',
  scheduler: { recentJobs: [], failedJobs: 0, runningJobs: 0, lastRunAt: null },
  retryQueue: { queued: 0, running: 0, deadLetter: 0, recent: [] },
  storage: { failures: 0, uploadFailures: 0, failedDownloads: 0 },
  providers: { whatsappDeliveryRate: 100, emailDeliveryRate: 100, relayUsagePercent: 0, messageQueueHealth: 'healthy' },
  incidents: [],
  relay: { relayUsagePercent: 0, academyKeyAdoptionPercent: 0, failoverFrequency: 0, messagingReliabilityPercent: 100 },
  compliance: { dltCompletionPercent: 0, completeAcademies: 0, totalAcademies: 0 },
  intelligence: [],
};

export default function PlatformHealthPage() {
  const [health, setHealth] = useState<HealthPayload>(emptyHealth);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<HealthPayload>('/super-admin/platform-health');
      setHealth(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load platform health.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const runJob = async (jobName: string) => {
    setRunningJob(jobName);
    setError('');
    try {
      await api.post(`/super-admin/automation/${jobName}/run`, jobName === 'feeDedupe' ? { dryRun: true } : {});
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Automation run failed.');
    } finally {
      setRunningJob('');
    }
  };

  const cards = useMemo(() => [
    ['Scheduler failures', health.scheduler.failedJobs, ServerCog, health.scheduler.failedJobs ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'],
    ['Retry queue', health.retryQueue.queued, Repeat2, health.retryQueue.queued ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'],
    ['Relay saturation', `${health.relay.relayUsagePercent}%`, Router, health.relay.relayUsagePercent > 70 ? 'bg-red-100 text-red-700' : 'bg-cyan-100 text-cyan-700'],
    ['Storage errors', health.storage.failures, Database, health.storage.failures ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'],
  ] as const, [health]);

  return (
    <RoleShell role="super_admin" title="Platform Health Center">
      <section className="rounded-[30px] border border-white/10 bg-white p-5 text-slate-900 shadow-[0_24px_90px_rgba(0,0,0,0.2)] md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">Automation and resilience</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Platform Health Center</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Scheduler status, retry queues, automated repair diagnostics, incident grouping, and platform intelligence.
            </p>
          </div>
          <button type="button" onClick={load} className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800">
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {error ? <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

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

        <Panel title="Manual Automation Controls" icon={Play} className="mt-6">
          <div className="flex flex-wrap gap-2">
            {[
              ['feeDedupe', 'Fee dedupe dry-run'],
              ['conflictScan', 'Conflict scan'],
              ['relayHealth', 'Relay alerts'],
              ['deliveryRetry', 'Retry worker'],
              ['selfHealing', 'Self-healing diagnostics'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => runJob(key)}
                disabled={Boolean(runningJob)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-60"
              >
                {runningJob === key ? 'Running...' : label}
              </button>
            ))}
          </div>
        </Panel>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Panel title="Scheduler Health" icon={Clock3}>
            {health.scheduler.recentJobs.length ? health.scheduler.recentJobs.slice(0, 8).map((job) => (
              <Row key={job._id} left={job.jobName} middle={`${job.status} / ${job.attempts} attempts`} right={new Date(job.updatedAt).toLocaleString()} tone={job.status === 'failed' ? 'red' : job.status === 'running' ? 'cyan' : 'slate'} />
            )) : <Empty text="No automation runs recorded yet." />}
          </Panel>

          <Panel title="Retry Diagnostics" icon={Repeat2}>
            <Metric label="Queued" value={health.retryQueue.queued} />
            <Metric label="Running" value={health.retryQueue.running} />
            <Metric label="Dead letter" value={health.retryQueue.deadLetter} />
            {health.retryQueue.recent.slice(0, 4).map((retry) => (
              <Row key={retry._id} left={retry.channel} middle={`${retry.status} / ${retry.attempts} attempts`} right={retry.providerCode || 'provider'} tone={retry.status === 'dead_letter' ? 'red' : 'slate'} />
            ))}
          </Panel>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Panel title="Incident Response Automation" icon={AlertTriangle}>
            {health.incidents.length ? health.incidents.slice(0, 8).map((incident) => (
              <div key={incident.key} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-amber-950">{incident.title}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-amber-700">{incident.severity}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-amber-700">{incident.diagnostics}</p>
              </div>
            )) : <Empty text="No grouped incidents in the last 24 hours." />}
          </Panel>

          <Panel title="Platform Intelligence" icon={Brain}>
            {health.intelligence.length ? health.intelligence.slice(0, 8).map((item) => (
              <div key={item.academyId} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-slate-950">{item.name}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${item.churnRisk >= 60 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.churnRisk}% risk</span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-5 text-slate-600">{item.insight}</p>
              </div>
            )) : <Empty text="No academy intelligence signals available yet." />}
          </Panel>
        </div>
      </section>
    </RoleShell>
  );
}

function Panel({ title, icon: Icon, children, className = '' }: { title: string; icon: ElementType; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
          <Icon size={19} />
        </div>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span className="font-bold text-slate-500">{label}</span><span className="font-black text-slate-950">{value}</span></div>;
}

function Row({ left, middle, right, tone }: { left: string; middle: string; right: string; tone: 'red' | 'cyan' | 'slate' }) {
  const styles = tone === 'red' ? 'bg-red-100 text-red-700' : tone === 'cyan' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-600';
  return <div className="grid gap-2 rounded-2xl bg-slate-50 p-3 text-sm md:grid-cols-[1fr_1fr_auto]"><span className="font-black text-slate-950">{left}</span><span className="font-semibold text-slate-500">{middle}</span><span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${styles}`}>{right}</span></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm font-bold text-slate-400">{text}</div>;
}
