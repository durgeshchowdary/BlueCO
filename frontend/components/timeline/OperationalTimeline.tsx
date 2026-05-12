'use client';

import { AlertCircle, CheckCircle2, Clock3, GitBranch, Radio, Sparkles } from 'lucide-react';
import type { AIInsight } from '../ai/AIInsightStream';

type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'info';
  timestamp?: string;
  category?: string;
  status?: string;
};

type OperationalTimelineProps = {
  insights?: AIInsight[];
  events?: TimelineEvent[];
};

const severityDot = {
  critical: 'bg-rose-500 shadow-rose-200',
  high: 'bg-orange-500 shadow-orange-200',
  medium: 'bg-amber-500 shadow-amber-200',
  low: 'bg-slate-400 shadow-slate-200',
  info: 'bg-cyan-500 shadow-cyan-200',
};

const severityIcon = {
  critical: AlertCircle,
  high: AlertCircle,
  medium: Clock3,
  low: CheckCircle2,
  info: Sparkles,
};

const toTimelineEvents = (insights: AIInsight[] = []): TimelineEvent[] =>
  insights.map((insight) => ({
    id: insight._id,
    title: insight.title,
    description: insight.recommendation,
    severity: insight.severity,
    timestamp: insight.generatedAt || insight.updatedAt,
    category: insight.category,
    status: insight.status,
  }));

export default function OperationalTimeline({ insights = [], events }: OperationalTimelineProps) {
  const timelineEvents = (events || toTimelineEvents(insights))
    .slice()
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <GitBranch size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Operational timeline</p>
            <h2 className="text-base font-black text-slate-950 md:text-lg">Recent intelligence events</h2>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase text-cyan-700">
          <Radio size={13} />
          {timelineEvents.length} events
        </span>
      </div>

      {timelineEvents.length ? (
        <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[18px] before:top-2 before:w-px before:bg-slate-200">
          {timelineEvents.map((event) => {
            const Icon = severityIcon[event.severity] || Sparkles;
            return (
                <li key={event.id} className="relative flex gap-3 md:gap-4">
                <span className={`relative z-10 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-lg ${severityDot[event.severity]}`}>
                  <Icon size={16} />
                </span>
                <article className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-3 md:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-words font-black text-slate-950">{event.title}</p>
                    <span className="text-xs font-bold text-slate-400">
                      {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-600">{event.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.category ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-slate-500">
                        {event.category.replace('_', ' ')}
                      </span>
                    ) : null}
                    {event.status ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-slate-500">
                        {event.status}
                      </span>
                    ) : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <Sparkles className="mx-auto text-cyan-700" />
          <p className="mt-3 font-black text-slate-950">No timeline events yet</p>
          <p className="mt-1 text-sm font-medium text-slate-500">Generate AI insights to populate the operational timeline.</p>
        </div>
      )}
    </section>
  );
}
