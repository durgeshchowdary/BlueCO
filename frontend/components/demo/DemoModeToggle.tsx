'use client';

import { MonitorPlay } from 'lucide-react';
import { useDemoMode } from '../../providers/DemoModeProvider';

type DemoModeToggleProps = {
  className?: string;
};

export default function DemoModeToggle({ className = '' }: DemoModeToggleProps) {
  const { enabled, setEnabled } = useDemoMode();

  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black transition ${
        enabled
          ? 'border-orange-100 bg-orange-50 text-orange-700'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 ${className}`}
      aria-pressed={enabled}
      aria-label={enabled ? 'Disable demo mode' : 'Enable demo mode'}
    >
      <MonitorPlay size={16} />
      Demo mode
      <span className={`h-2 w-2 rounded-full ${enabled ? 'bg-orange-500' : 'bg-slate-300'}`} />
    </button>
  );
}
