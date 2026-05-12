'use client';

import React from 'react';
import { ShieldCheck, Activity, TrendingUp, Layers, Smartphone, Eye, Zap } from 'lucide-react';

const highlights = [
  { title: 'AI operational intelligence', icon: Zap, color: 'text-cyan-400' },
  { title: 'anomaly detection', icon: ShieldCheck, color: 'text-emerald-400' },
  { title: 'operational analytics', icon: Activity, color: 'text-blue-400' },
  { title: 'academy automation', icon: Layers, color: 'text-purple-400' },
  { title: 'mobile-first dashboards', icon: Smartphone, color: 'text-orange-400' },
  { title: 'relay reliability', icon: TrendingUp, color: 'text-yellow-400' },
  { title: 'operational visibility', icon: Eye, color: 'text-pink-400' },
];

export default function DemoHighlightsPanel() {
  return (
    <div className="rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
      <div className="mb-10 text-left">
        <h3 className="text-2xl font-black text-white">Recruiter Highlights</h3>
        <p className="mt-2 text-slate-400">Core architectural strengths of the OUT-PLAY platform.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {highlights.map((h) => (
          <div 
            key={h.title} 
            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10"
          >
            <div className={`rounded-xl bg-black/40 p-3 ${h.color}`}>
              <h.icon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold capitalize text-slate-200">{h.title}</h4>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-1 w-3 rounded-full bg-cyan-500/20" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 border-t border-white/10 pt-8 text-center">
        <p className="text-xs font-mono text-cyan-500/60 uppercase tracking-widest">
          Operational Reliability Verified
        </p>
      </div>
    </div>
  );
}