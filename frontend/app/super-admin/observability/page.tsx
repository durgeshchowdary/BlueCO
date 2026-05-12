'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { Activity, AlertTriangle, Clock3, Database, Gauge, MessageSquareWarning, RefreshCw, ShieldAlert, Zap } from 'lucide-react';
import RoleShell from '../../../components/RoleShell';
import AIWeeklySummaryCard from '../../../components/ai/AIWeeklySummaryCard';
import ExecutiveKpiCards, { type ExecutiveKpi } from '../../../components/dashboard/ExecutiveKpiCards';
import InsightHighlights, { type InsightHighlight } from '../../../components/dashboard/InsightHighlights';
import OperationalHealthStrip, { type HealthStripItem } from '../../../components/dashboard/OperationalHealthStrip';
import GlobalOperationalSearch, { type OperationalSearchItem } from '../../../components/search/GlobalOperationalSearch';
import api from '../../../lib/api';

type ObservabilityPayload = {
  generatedAt: string;
  requests: {
    total: number;
    failed: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    slowestRoutes: { method: string; route: string; statusCode: number; latencyMs: number }[];
  };
  counters: Record<string, number>;
  delivery: {
    whatsappDeliveryRate: number;
    emailDeliveryRate: number;
    whatsappFailed: number;
    emailFailed: number;
    relayUsagePercent: number;
    messageQueueHealth: string;
    stuckTwilioCodes: { code: string; count: number; severity: string }[];
  };
  relayHealth: {
    relayUsagePercent: number;
    academyKeyAdoptionPercent: number;
    failoverFrequency: number;
    academyThenRelayFrequency: number;
    messagingReliabilityPercent: number;
  };
  storage: { failures: number; uploadFailures: number; failedDownloads: number };
  compliance: { dltCompletionPercent: number; completeAcademies: number; totalAcademies: number };
  incidents: { type: string; severity: string; title: string; description: string }[];
  recentFailures: { timestamp: string; category: string; reason?: string; errorMessage?: string; route?: string; code?: string }[];
};

const emptyPayload: ObservabilityPayload = {
  generatedAt: '',
  requests: { total: 0, failed: 0, averageLatencyMs: 0, p95LatencyMs: 0, slowestRoutes: [] },
  counters: {},
  delivery: { whatsappDeliveryRate: 100, emailDeliveryRate: 100, whatsappFailed: 0, emailFailed: 0, relayUsagePercent: 0, messageQueueHealth: 'healthy', stuckTwilioCodes: [] },
  relayHealth: { relayUsagePercent: 0, academyKeyAdoptionPercent: 0, failoverFrequency: 0, academyThenRelayFrequency: 0, messagingReliabilityPercent: 100 },
  storage: { failures: 0, uploadFailures: 0, failedDownloads: 0 },
  compliance: { dltCompletionPercent: 0, completeAcademies: 0, totalAcademies: 0 },
  incidents: [],
  recentFailures: [],
};

export default function ObservabilityPage() {
  const [data, setData] = useState<ObservabilityPayload>(emptyPayload);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<ObservabilityPayload>('/super-admin/observability');
      setData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load observability metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const summary = useMemo(() => [
    ['API latency', `${data.requests.p95LatencyMs} ms`, Clock3, 'text-cyan-700 bg-cyan-100'],
    ['Failed requests', data.requests.failed, ShieldAlert, data.requests.failed ? 'text-red-700 bg-red-100' : 'text-emerald-700 bg-emerald-100'],
    ['Message reliability', `${data.relayHealth.messagingReliabilityPercent}%`, Zap, 'text-emerald-700 bg-emerald-100'],
    ['DLT completion', `${data.compliance.dltCompletionPercent}%`, Database, 'text-orange-700 bg-orange-100'],
  ] as const, [data]);

  const weeklySummaryMetrics = useMemo(() => {
    const anomalyCount = data.incidents.length + data.delivery.stuckTwilioCodes.length + data.storage.failures + data.storage.failedDownloads;
    const operationalHealth = Math.max(
      0,
      Math.min(
        100,
        data.relayHealth.messagingReliabilityPercent -
          data.requests.failed * 2 -
          data.incidents.length * 8 -
          data.storage.failures * 3 -
          data.delivery.stuckTwilioCodes.length * 6,
      ),
    );

    return {
      operationalHealth,
      relayReliability: data.relayHealth.messagingReliabilityPercent,
      anomalyCount,
      failedRequests: data.requests.failed,
      incidentCount: data.incidents.length,
      relayUsagePercent: data.relayHealth.relayUsagePercent,
    };
  }, [data]);

  const searchItems = useMemo<OperationalSearchItem[]>(() => {
    const summaryItems: OperationalSearchItem[] = [
      {
        id: 'platform-weekly-ai-summary',
        type: 'Insights',
        title: 'Platform AI operational briefing',
        description: `Messaging reliability ${data.relayHealth.messagingReliabilityPercent}%, DLT completion ${data.compliance.dltCompletionPercent}%, failed requests ${data.requests.failed}.`,
        category: 'AI summary',
        timestamp: data.generatedAt,
      },
      {
        id: 'platform-relay-health',
        type: 'Insights',
        title: 'Relay health',
        description: `Relay dependency ${data.relayHealth.relayUsagePercent}% and own-key adoption ${data.relayHealth.academyKeyAdoptionPercent}%.`,
        category: 'Messaging',
        timestamp: data.generatedAt,
      },
    ];

    const incidentItems = data.incidents.map((incident, index) => ({
      id: `incident-${incident.type}-${index}`,
      type: 'Operational Alerts' as const,
      title: incident.title,
      description: incident.description,
      category: incident.severity,
      timestamp: data.generatedAt,
    }));

    const recommendationItems = data.incidents.map((incident, index) => ({
      id: `recommendation-${incident.type}-${index}`,
      type: 'Recommendations' as const,
      title: incident.title,
      description: incident.description,
      category: incident.type,
      timestamp: data.generatedAt,
    }));

    const failureItems = data.recentFailures.map((failure, index) => ({
      id: `failure-${failure.timestamp}-${index}`,
      type: 'Timeline Events' as const,
      title: failure.reason || failure.errorMessage || failure.route || failure.code || failure.category,
      description: failure.errorMessage || failure.route || failure.code || 'Operational failure recorded',
      category: failure.category,
      timestamp: failure.timestamp,
    }));

    const stuckMessageItems = data.delivery.stuckTwilioCodes.map((item) => ({
      id: `twilio-stuck-${item.code}`,
      type: 'Operational Alerts' as const,
      title: `Twilio ${item.code}: ${item.count} repeated failures`,
      description: 'Stuck message detector found repeated provider failures with the same error code.',
      category: item.severity,
      timestamp: data.generatedAt,
    }));

    const routeItems = data.requests.slowestRoutes.map((route, index) => ({
      id: `slow-route-${route.method}-${route.route}-${index}`,
      type: 'Timeline Events' as const,
      title: `${route.method} ${route.route}`,
      description: `HTTP ${route.statusCode} completed in ${route.latencyMs} ms.`,
      category: 'API latency',
      timestamp: data.generatedAt,
    }));

    return [...summaryItems, ...incidentItems, ...recommendationItems, ...failureItems, ...stuckMessageItems, ...routeItems];
  }, [data]);

  const executiveKpis = useMemo<ExecutiveKpi[]>(() => {
    const anomalyCount = data.incidents.length + data.delivery.stuckTwilioCodes.length + data.storage.failures + data.storage.failedDownloads;
    const health = weeklySummaryMetrics.operationalHealth || 0;
    return [
      { id: 'health', label: 'Operational health', value: `${health}%`, helper: 'Platform composite', tone: health >= 85 ? 'emerald' : health >= 70 ? 'amber' : 'red' },
      { id: 'attendance', label: 'Attendance movement', value: 'Global', helper: 'No direct platform signal', tone: 'slate' },
      { id: 'relay', label: 'Relay reliability', value: `${data.relayHealth.messagingReliabilityPercent}%`, helper: `${data.relayHealth.relayUsagePercent}% relay use`, tone: data.relayHealth.messagingReliabilityPercent >= 95 ? 'emerald' : data.relayHealth.messagingReliabilityPercent >= 90 ? 'amber' : 'red' },
      { id: 'anomalies', label: 'Anomaly count', value: anomalyCount, helper: 'Incidents/storage/provider', tone: anomalyCount ? 'amber' : 'emerald' },
      { id: 'ai-recs', label: 'AI recommendations', value: data.incidents.length, helper: 'Incident actions', tone: data.incidents.length ? 'cyan' : 'slate' },
      { id: 'alerts', label: 'Active alerts', value: data.delivery.stuckTwilioCodes.length + data.incidents.length, helper: 'Operational warnings', tone: data.delivery.stuckTwilioCodes.length || data.incidents.length ? 'red' : 'emerald' },
    ];
  }, [data, weeklySummaryMetrics]);

  const healthStripItems = useMemo<HealthStripItem[]>(() => {
    const health = weeklySummaryMetrics.operationalHealth || 0;
    const anomalyCount = data.incidents.length + data.delivery.stuckTwilioCodes.length + data.storage.failures + data.storage.failedDownloads;
    return [
      { id: 'overall', label: 'Overall health', value: `${health}%`, status: health >= 85 ? 'healthy' : health >= 70 ? 'watch' : 'risk' },
      { id: 'attendance', label: 'Attendance trend', value: 'N/A', status: 'neutral' },
      { id: 'relay', label: 'Relay status', value: `${data.relayHealth.messagingReliabilityPercent}%`, status: data.relayHealth.messagingReliabilityPercent >= 95 ? 'healthy' : data.relayHealth.messagingReliabilityPercent >= 90 ? 'watch' : 'risk' },
      { id: 'anomaly', label: 'Anomaly severity', value: anomalyCount ? 'Watch' : 'Clear', status: anomalyCount ? 'watch' : 'healthy' },
      { id: 'ai-ops', label: 'AI ops activity', value: data.incidents.length ? 'Active' : 'Quiet', status: data.incidents.length ? 'watch' : 'healthy' },
      { id: 'confidence', label: 'Confidence', value: data.requests.total ? 'High' : 'Building', status: data.requests.total ? 'healthy' : 'neutral' },
    ];
  }, [data, weeklySummaryMetrics]);

  const insightHighlights = useMemo<InsightHighlight[]>(() => {
    const latestIncident = data.incidents[0];
    const latestFailure = data.recentFailures[0];
    const stuckCode = data.delivery.stuckTwilioCodes[0];
    return [
      {
        id: 'top-insight',
        label: 'Top insight',
        title: `Messaging reliability ${data.relayHealth.messagingReliabilityPercent}%`,
        description: `Relay dependency is ${data.relayHealth.relayUsagePercent}% with ${data.relayHealth.failoverFrequency} failovers.`,
        tone: data.relayHealth.messagingReliabilityPercent >= 95 ? 'emerald' : 'amber',
        timestamp: data.generatedAt,
      },
      {
        id: 'top-recommendation',
        label: 'Recommendation',
        title: latestIncident?.title || 'No active incident recommendation',
        description: latestIncident?.description || 'Continue monitoring relay, storage, and request health.',
        tone: latestIncident ? 'amber' : 'emerald',
        timestamp: data.generatedAt,
      },
      {
        id: 'latest-anomaly',
        label: 'Latest anomaly',
        title: stuckCode ? `Twilio ${stuckCode.code}` : latestFailure?.category || 'No recent anomaly',
        description: stuckCode ? `${stuckCode.count} repeated failures detected.` : latestFailure?.reason || latestFailure?.errorMessage || 'No anomaly cluster detected.',
        tone: stuckCode || latestFailure ? 'red' : 'emerald',
        timestamp: latestFailure?.timestamp || data.generatedAt,
      },
      {
        id: 'summary',
        label: 'Summary',
        title: `DLT completion ${data.compliance.dltCompletionPercent}%`,
        description: `${data.compliance.completeAcademies}/${data.compliance.totalAcademies} academies complete.`,
        tone: data.compliance.dltCompletionPercent >= 80 ? 'emerald' : 'amber',
        timestamp: data.generatedAt,
      },
      {
        id: 'predictive',
        label: 'Predictive warning',
        title: data.requests.failed ? 'Request failures need review' : 'No request failure warning',
        description: data.requests.failed ? `${data.requests.failed} failed requests in the current process window.` : 'Current request failure signal is clear.',
        tone: data.requests.failed ? 'amber' : 'emerald',
        timestamp: data.generatedAt,
      },
    ];
  }, [data]);

  return (
    <RoleShell role="super_admin" title="Observability Center">
      <section className="rounded-[30px] border border-white/10 bg-white p-5 text-slate-900 shadow-[0_24px_90px_rgba(0,0,0,0.2)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-600">Operational maturity</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Production health diagnostics</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Request tracing, relay health, storage signals, compliance progress, and incident warnings from protected platform telemetry.
            </p>
          </div>
          <button type="button" onClick={load} className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800">
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {error ? <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

        <GlobalOperationalSearch
          items={searchItems}
          loading={loading}
          placeholder="Search platform incidents, relay health, failures, and operational signals..."
          className="mt-6"
        />

        <AIWeeklySummaryCard
          title="Platform AI operational briefing"
          generatedAt={data.generatedAt}
          metrics={weeklySummaryMetrics}
          loading={loading}
          error={error}
          className="mt-6"
        />

        <ExecutiveKpiCards items={executiveKpis} loading={loading} className="mt-6" />
        <OperationalHealthStrip items={healthStripItems} loading={loading} className="mt-4" />
        <InsightHighlights items={insightHighlights} loading={loading} className="mt-4" />

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {summary.map(([label, value, Icon, style]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${style}`}>
                <Icon size={20} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        {data.delivery.stuckTwilioCodes.length ? (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <MessageSquareWarning className="mt-1 text-red-700" />
              <div>
                <p className="font-black text-red-900">Stuck message detector triggered</p>
                <p className="mt-1 text-sm font-semibold text-red-700">
                  {data.delivery.stuckTwilioCodes.map((item) => `Twilio ${item.code}: ${item.count} failures`).join(', ')}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Panel title="Relay Health" icon={Gauge}>
            <Metric label="WhatsApp delivery" value={`${data.delivery.whatsappDeliveryRate}%`} />
            <Metric label="Email delivery" value={`${data.delivery.emailDeliveryRate}%`} />
            <Metric label="Relay dependency" value={`${data.relayHealth.relayUsagePercent}%`} />
            <Metric label="Own-key adoption" value={`${data.relayHealth.academyKeyAdoptionPercent}%`} />
            <Metric label="Failovers" value={data.relayHealth.failoverFrequency} />
            <Metric label="Academy then relay" value={data.relayHealth.academyThenRelayFrequency} />
          </Panel>

          <Panel title="Storage And Compliance" icon={Database}>
            <Metric label="Storage failures" value={data.storage.failures} />
            <Metric label="Upload failures" value={data.storage.uploadFailures} />
            <Metric label="Failed downloads" value={data.storage.failedDownloads} />
            <Metric label="DLT complete academies" value={`${data.compliance.completeAcademies}/${data.compliance.totalAcademies}`} />
          </Panel>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Panel title="Incident Center" icon={AlertTriangle}>
            {data.incidents.length ? data.incidents.map((incident) => (
              <div key={`${incident.type}-${incident.title}`} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="font-black text-amber-900">{incident.title}</p>
                <p className="mt-1 text-sm font-semibold text-amber-700">{incident.description}</p>
              </div>
            )) : <EmptyLine text="No active platform incidents detected." />}
          </Panel>

          <Panel title="Slowest Routes" icon={Activity}>
            {data.requests.slowestRoutes.length ? data.requests.slowestRoutes.map((route) => (
              <div key={`${route.method}-${route.route}-${route.latencyMs}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{route.method} {route.route}</p>
                  <p className="text-xs font-bold text-slate-400">HTTP {route.statusCode}</p>
                </div>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">{route.latencyMs} ms</span>
              </div>
            )) : <EmptyLine text="No request samples in the rolling process window." />}
          </Panel>
        </div>

        <Panel title="Recent Failure Feed" icon={ShieldAlert} className="mt-6">
          {data.recentFailures.length ? data.recentFailures.map((item, index) => (
            <div key={`${item.timestamp}-${index}`} className="grid gap-2 rounded-2xl bg-slate-50 p-3 text-sm md:grid-cols-[0.8fr_0.8fr_1.4fr]">
              <p className="font-black text-slate-900">{item.category}</p>
              <p className="font-semibold text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
              <p className="font-semibold text-slate-600">{item.reason || item.errorMessage || item.route || item.code || 'Operational event recorded'}</p>
            </div>
          )) : <EmptyLine text="No recent operational failures in memory." />}
        </Panel>
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
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-slate-500">{label}</span>
      <span className="text-sm font-black text-slate-950">{value}</span>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm font-bold text-slate-400">{text}</div>;
}
