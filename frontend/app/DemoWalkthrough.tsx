'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, PlayCircle, X } from 'lucide-react';

const steps = [
  {
    title: 'Academy Dashboard',
    description: 'Executive overview of multi-center academy operations.',
  },
  {
    title: 'AI Ops Overview',
    description: 'Real-time operational reasoning and anomaly detection.',
  },
  {
    title: 'Copilot Recommendations',
    description: 'AI-driven decision support for academy managers.',
  },
  {
    title: 'Operational Timeline',
    description: 'Unified stream of all academy activities and alerts.',
  },
  {
    title: 'Demo Mode Activity',
    description: 'Interactive scenarios to simulate high-load academy days.',
  },
  {
    title: 'Mobile Executive Experience',
    description: 'Optimized dashboard for on-field operational visibility.',
  },
];

export default function DemoWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const step = steps[currentStep];

  return (
    <div className="fixed bottom-6 left-6 z-[100] w-[calc(100%-48px)] sm:w-80 rounded-2xl border border-cyan-500/30 bg-[#060816]/95 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400">
          <PlayCircle className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Demo Walkthrough</span>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-slate-500 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-bold text-white tracking-tight">{step.title}</h4>
        <p className="mt-1 text-sm text-slate-400 leading-relaxed">{step.description}</p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentStep ? 'w-6 bg-cyan-400' : 'w-3 bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={prev} disabled={currentStep === 0} className="rounded-lg bg-white/5 p-2 text-white transition hover:bg-white/10 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} disabled={currentStep === steps.length - 1} className="rounded-lg bg-cyan-500 p-2 text-white transition hover:bg-cyan-600 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}