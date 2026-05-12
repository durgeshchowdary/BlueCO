'use client';

import Link from 'next/link';
import { Bot, GitBranch, MessageSquareText, Sparkles } from 'lucide-react';

type AISetupAssistantProps = {
  nextAction?: string;
  className?: string;
};

export default function AISetupAssistant({
  nextAction = 'Complete academy setup, then generate AI insights from the AI Ops page.',
  className = '',
}: AISetupAssistantProps) {
  return (
    <section className={`rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-orange-50 p-5 shadow-sm md:p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm">
          <Bot size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">AI setup assistant</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Turn operational data into AI Ops</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{nextAction}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Guide icon={Sparkles} title="Insights" text="AI Ops summarizes attendance, payments, utilization, payroll, and cost signals into operational recommendations." />
        <Guide icon={GitBranch} title="Timeline" text="The operational timeline shows recent AI signals in chronological order so teams can track what changed." />
        <Guide icon={MessageSquareText} title="Copilot" text="Copilot answers grounded questions using the existing copilot and intelligence response data." />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/academy/ai-ops" className="inline-flex min-h-10 items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2">
          Open AI Ops
        </Link>
        <Link href="/academy/attendance" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2">
          Review attendance
        </Link>
      </div>
    </section>
  );
}

function Guide({ icon: Icon, title, text }: { icon: typeof Sparkles; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white bg-white/80 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
        <Icon size={18} />
      </div>
      <p className="mt-3 text-sm font-black text-slate-950">{title}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{text}</p>
    </div>
  );
}
