'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Radio,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { AIInsight } from './AIInsightStream';

type SummaryMetrics = {
  attendanceRate?: number;
  attendanceDelta?: number;
  operationalHealth?: number;
  relayReliability?: number;
  anomalyCount?: number;
  failedRequests?: number;
  incidentCount?: number;
  relayUsagePercent?: number;
};

type Tone = 'green' | 'amber' | 'red' | 'slate';

type AIWeeklySummaryCardProps = {
  title?: string;
  insights?: AIInsight[];
  generatedAt?: string;
  metrics?: SummaryMetrics;
  loading?: boolean;
  error?: string;
  className?: string;
};

const severityWeight: Record<AIInsight['severity'], number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export default function AIWeeklySummaryCard({
  title = 'AI operational briefing',
  insights = [],
  generatedAt,
  metrics,
  loading = false,
  error = '',
  className = '',
}: AIWeeklySummaryCardProps) {
  const summary = useMemo(() => buildSummary(insights, metrics, generatedAt), [insights, metrics, generatedAt]);

  if (loading) {
    return (
      <section className={`overflow-hidden rounded-3xl border border-cyan-100 bg-white p-4 shadow-sm md:p-6 ${className}`}>
        <div className="flex min-h-56 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-cyan-700" size={24} />
            <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Generating weekly signal</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-sm ${className}`}
    >
      <div className="bg-gradient-to-br from-cyan-50 via-white to-orange-50 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
              <Sparkles size={13} />
              Weekly AI summary
            </div>
            <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 md:text-2xl">{title}</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{error || summary.narrative}</p>
          </div>
          <div className={`inline-flex w-fit max-w-full items-center gap-2 rounded-full px-3 py-2 text-xs font-black uppercase ${summary.confidenceStyle}`}>
            <ShieldCheck size={14} />
            {summary.confidence}% confidence
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Indicator
            icon={summary.attendanceIcon}
            label="Attendance movement"
            value={summary.attendanceLabel}
            tone={summary.attendanceTone}
          />
          <Indicator icon={ShieldCheck} label="Operational health" value={summary.healthLabel} tone={summary.healthTone} />
          <Indicator icon={AlertTriangle} label="Anomalies" value={summary.anomalyLabel} tone={summary.anomalyTone} />
          <Indicator icon={Radio} label="Relay reliability" value={summary.relayLabel} tone={summary.relayTone} />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Recommended next action</p>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{summary.recommendedAction}</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-xs font-black uppercase text-slate-500">
            <Clock3 size={15} />
            {summary.generatedLabel}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function buildSummary(insights: AIInsight[], metrics: SummaryMetrics = {}, generatedAt?: string) {
  const activeInsights = insights.filter((item) => item.status !== 'resolved');
  const highPriority = activeInsights.filter((item) => item.severity === 'high' || item.severity === 'critical');
  const attendanceSignals = activeInsights.filter((item) => item.category.toLowerCase().includes('attendance'));
  const relayReliability = clampNumber(metrics.relayReliability, 0, 100);
  const healthScore = clampNumber(
    metrics.operationalHealth ?? 100 - highPriority.length * 12 - Number(metrics.failedRequests || 0) * 2 - Number(metrics.incidentCount || 0) * 10,
    0,
    100,
  );
  const anomalyCount = Math.max(0, Math.round(metrics.anomalyCount ?? highPriority.length));
  const avgConfidence = insights.length
    ? Math.round((insights.reduce((sum, item) => sum + Number(item.confidence || 0.72), 0) / insights.length) * 100)
    : metrics.operationalHealth !== undefined || metrics.relayReliability !== undefined
      ? 74
      : 0;

  const attendanceDelta = metrics.attendanceDelta;
  const attendanceTrend =
    typeof attendanceDelta === 'number'
      ? attendanceDelta > 1
        ? 'up'
        : attendanceDelta < -1
          ? 'down'
          : 'stable'
      : attendanceSignals.some((item) => item.severity === 'high' || item.severity === 'critical')
        ? 'down'
        : attendanceSignals.length
          ? 'watch'
          : 'stable';

  const primaryRisk = highPriority.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity])[0];
  const recommendedAction =
    primaryRisk?.recommendation ||
    (relayReliability < 92
      ? 'Review provider delivery failures and academy relay dependency before the next campaign window.'
      : anomalyCount
        ? 'Acknowledge the open anomaly cluster and assign an owner for follow-up today.'
        : 'Keep the current operating cadence and refresh the briefing after the next data sync.');

  const healthLabel = healthScore >= 90 ? 'Strong' : healthScore >= 75 ? 'Watch' : 'At risk';
  const relayLabel = metrics.relayReliability === undefined ? 'No signal' : `${Math.round(relayReliability)}%`;
  const generatedLabel = formatGeneratedAt(generatedAt || latestInsightDate(insights));
  const attendanceTone: Tone = attendanceTrend === 'down' ? 'red' : attendanceTrend === 'up' ? 'green' : attendanceTrend === 'watch' ? 'amber' : 'slate';
  const healthTone: Tone = healthScore >= 90 ? 'green' : healthScore >= 75 ? 'amber' : 'red';
  const anomalyTone: Tone = anomalyCount > 2 ? 'red' : anomalyCount ? 'amber' : 'green';
  const relayTone: Tone = metrics.relayReliability === undefined ? 'slate' : relayReliability >= 95 ? 'green' : relayReliability >= 90 ? 'amber' : 'red';

  return {
    narrative: buildNarrative({ activeInsights, anomalyCount, healthLabel, relayReliability, attendanceTrend, hasRelaySignal: metrics.relayReliability !== undefined }),
    recommendedAction,
    confidence: avgConfidence,
    confidenceStyle: avgConfidence >= 80 ? 'bg-emerald-50 text-emerald-700' : avgConfidence >= 60 ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-slate-500',
    attendanceIcon: attendanceTrend === 'up' ? ArrowUpRight : attendanceTrend === 'down' ? ArrowDownRight : ArrowRight,
    attendanceLabel: formatAttendanceLabel(attendanceTrend, metrics.attendanceRate, attendanceDelta),
    attendanceTone,
    healthLabel,
    healthTone,
    anomalyLabel: anomalyCount ? `${anomalyCount} flagged` : 'None flagged',
    anomalyTone,
    relayLabel,
    relayTone,
    generatedLabel,
  };
}

function buildNarrative({
  activeInsights,
  anomalyCount,
  healthLabel,
  relayReliability,
  attendanceTrend,
  hasRelaySignal,
}: {
  activeInsights: AIInsight[];
  anomalyCount: number;
  healthLabel: string;
  relayReliability: number;
  attendanceTrend: 'up' | 'down' | 'stable' | 'watch';
  hasRelaySignal: boolean;
}) {
  if (!activeInsights.length && !hasRelaySignal) {
    return 'No weekly intelligence has been generated yet. Run the insight stream once operational data is available.';
  }

  const attendanceText =
    attendanceTrend === 'up'
      ? 'attendance is moving upward'
      : attendanceTrend === 'down'
        ? 'attendance needs attention'
        : attendanceTrend === 'watch'
          ? 'attendance has watchlist signals'
          : 'attendance is steady';
  const relayText = hasRelaySignal ? `relay reliability is ${Math.round(relayReliability)}%` : 'relay reliability has no new signal';
  const anomalyText = anomalyCount ? `${anomalyCount} operational anomaly${anomalyCount === 1 ? '' : 'ies'} need review` : 'no major anomaly cluster is open';

  return `This week, ${attendanceText}, ${relayText}, and ${anomalyText}. Overall platform health is ${healthLabel.toLowerCase()} based on the current operational signals.`;
}

function formatAttendanceLabel(trend: 'up' | 'down' | 'stable' | 'watch', attendanceRate?: number, attendanceDelta?: number) {
  const rate = typeof attendanceRate === 'number' ? `${Math.round(attendanceRate)}%` : '';
  const delta = typeof attendanceDelta === 'number' ? `${attendanceDelta > 0 ? '+' : ''}${attendanceDelta.toFixed(1)}%` : '';
  const base = trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : trend === 'watch' ? 'Watchlist' : 'Stable';
  return [base, rate || delta].filter(Boolean).join(' / ');
}

function formatGeneratedAt(value?: string) {
  if (!value) return 'Waiting for signal';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Signal received';
  return `Generated ${date.toLocaleString()}`;
}

function latestInsightDate(insights: AIInsight[]) {
  const dates = insights.map((item) => item.generatedAt || item.updatedAt).filter(Boolean) as string[];
  return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}

function clampNumber(value: number | undefined, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return max;
  return Math.min(max, Math.max(min, value));
}

function Indicator({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
  tone: Tone;
}) {
  const toneClass = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
  }[tone];

  return (
    <div className="min-w-0 rounded-2xl border border-white/80 bg-white/80 p-4">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${toneClass}`}>
        <Icon size={18} />
      </div>
      <p className="truncate text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}
