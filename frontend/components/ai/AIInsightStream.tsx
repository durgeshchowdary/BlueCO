'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Brain, CheckCircle2, CircleDot, Loader2, Sparkles, Zap } from 'lucide-react';
import api from '../../lib/api';

export type AIInsight = {
  _id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  recommendation: string;
  impact?: string;
  confidence?: number;
  status: 'open' | 'acknowledged' | 'resolved';
  generatedAt?: string;
  updatedAt?: string;
};

type AIInsightStreamProps = {
  onInsightsChange?: (insights: AIInsight[]) => void;
  onLoadingChange?: (loading: boolean) => void;
  overlayInsights?: AIInsight[];
};

const severityStyle = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  high: 'bg-orange-50 text-orange-700 border-orange-100',
  critical: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function AIInsightStream({ onInsightsChange, onLoadingChange, overlayInsights = [] }: AIInsightStreamProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');

  const setInsightState = (nextInsights: AIInsight[]) => {
    setInsights(nextInsights);
    onInsightsChange?.(nextInsights);
  };

  const fetchInsights = async () => {
    setLoading(true);
    onLoadingChange?.(true);
    setError('');
    try {
      const { data } = await api.get('/ai-insights');
      setInsightState(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load AI insights.');
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const metrics = useMemo(() => {
    const visibleInsights = [...overlayInsights, ...insights];
    const open = visibleInsights.filter((item) => item.status === 'open').length;
    const highPriority = visibleInsights.filter((item) => ['critical', 'high'].includes(item.severity)).length;
    const avgConfidence = visibleInsights.length
      ? Math.round((visibleInsights.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / visibleInsights.length) * 100)
      : 0;
    return { open, highPriority, avgConfidence };
  }, [insights, overlayInsights]);

  const generateInsights = async () => {
    setGenerating(true);
    setError('');
    try {
      await api.post('/ai-insights/generate');
      await fetchInsights();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Insight generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (insight: AIInsight, status: AIInsight['status']) => {
    setUpdatingId(insight._id);
    setError('');
    const previous = insights;
    const optimistic = insights.map((item) => (item._id === insight._id ? { ...item, status } : item));
    setInsightState(optimistic);
    try {
      const { data } = await api.put(`/ai-insights/${insight._id}/status`, { status });
      setInsightState(insights.map((item) => (item._id === insight._id ? data : item)));
    } catch (err: any) {
      setInsightState(previous);
      setError(err?.response?.data?.message || 'Unable to update insight status.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-700">Insight stream</p>
          <h2 className="mt-2 text-xl font-black text-slate-950 md:text-2xl">Live AI recommendations</h2>
        </div>
        <button
          type="button"
          onClick={generateInsights}
          disabled={generating}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-fit"
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          Generate Insights
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={Brain} label="Open insights" value={metrics.open} />
        <Metric icon={AlertTriangle} label="High priority" value={metrics.highPriority} />
        <Metric icon={Zap} label="Avg confidence" value={`${metrics.avgConfidence}%`} />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
          <Loader2 className="animate-spin" />
        </div>
      ) : insights.length || overlayInsights.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[...overlayInsights, ...insights].map((insight) => (
            <article key={insight._id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${severityStyle[insight.severity]}`}>
                    {insight.severity}
                  </span>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-700">
                    {insight.category.replace('_', ' ')}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">
                  <CircleDot size={12} />
                  {insight._id.startsWith('demo-') ? 'demo' : insight.status}
                </span>
              </div>

              <h3 className="mt-4 break-words text-lg font-black text-slate-950 md:text-xl">{insight.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{insight.recommendation}</p>
              {insight.impact ? (
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">{insight.impact}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {!insight._id.startsWith('demo-') && insight.status !== 'acknowledged' ? (
                  <button
                    type="button"
                    disabled={updatingId === insight._id}
                    onClick={() => updateStatus(insight, 'acknowledged')}
                    className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 disabled:opacity-60"
                  >
                    <CheckCircle2 size={15} />
                    Acknowledge
                  </button>
                ) : null}
                {!insight._id.startsWith('demo-') && insight.status !== 'resolved' ? (
                  <button
                    type="button"
                    disabled={updatingId === insight._id}
                    onClick={() => updateStatus(insight, 'resolved')}
                    className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 disabled:opacity-60"
                  >
                    <CheckCircle2 size={15} />
                    Resolve
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
          <Brain className="text-cyan-700" />
          <h2 className="mt-4 text-xl font-black text-slate-950">No active recommendations</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Run the insight engine after attendance, payment, and expense data has been captured.</p>
        </div>
      )}
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Brain; label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-center justify-between">
        <p className="truncate text-sm font-bold text-slate-500">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-4 truncate text-2xl font-black text-slate-950 md:text-3xl">{value}</p>
    </div>
  );
}
