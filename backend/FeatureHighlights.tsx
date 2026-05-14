'use client';

import React from 'react';
import { Bot, LineChart, Smartphone, Repeat } from 'lucide-react';

const features = [
  { title: 'AI Ops', desc: 'Predictive churn & risk analysis.', icon: Bot },
  { title: 'Copilot', desc: 'Conversational data retrieval.', icon: Repeat },
  { title: 'Analytics', desc: 'Real-time performance metrics.', icon: LineChart },
  { title: 'Mobile', desc: 'Coach-first field experience.', icon: Smartphone },
];

export default function FeatureHighlights() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {features.map((f) => (
            <div key={f.title} className="group rounded-3xl border border-white bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-900 group-hover:bg-cyan-50 group-hover:text-cyan-600">
                <f.icon size={20} />
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">{f.title}</h3>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
