'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type DemoScenario = {
  id: string;
  title: string;
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  recommendation: string;
};

type DemoModeContextValue = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  scenario: DemoScenario | null;
  scenarioIndex: number;
  generatedAt: string;
};

const scenarios: DemoScenario[] = [
  {
    id: 'attendance-drop',
    title: 'Attendance drop detected',
    summary: 'U14 football batch attendance fell below the weekly baseline and needs coach follow-up.',
    severity: 'high',
    category: 'attendance',
    recommendation: 'Ask coaches to contact absent students and review the next two training sessions.',
  },
  {
    id: 'relay-instability',
    title: 'Relay instability warning',
    summary: 'WhatsApp delivery is showing repeated provider fallback activity during parent updates.',
    severity: 'medium',
    category: 'relay',
    recommendation: 'Review relay health and confirm academy messaging keys before the next campaign.',
  },
  {
    id: 'operational-recovery',
    title: 'Operational recovery improving',
    summary: 'Recent AI signals show attendance and delivery reliability moving back toward normal.',
    severity: 'low',
    category: 'operations',
    recommendation: 'Keep monitoring the operational timeline and close resolved recommendations.',
  },
  {
    id: 'engagement-surge',
    title: 'Engagement surge',
    summary: 'Student activity increased after recent coach interventions and schedule consistency improved.',
    severity: 'low',
    category: 'engagement',
    recommendation: 'Capture the playbook and repeat this intervention for similar batches.',
  },
];

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [generatedAt, setGeneratedAt] = useState('');

  useEffect(() => {
    try {
      setEnabledState(window.localStorage.getItem('outplay_demo_mode') === 'true');
    } catch {
      setEnabledState(false);
    }
    setGeneratedAt(new Date().toISOString());
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = window.setInterval(() => {
      setScenarioIndex((current) => (current + 1) % scenarios.length);
      setGeneratedAt(new Date().toISOString());
    }, 9000);
    return () => window.clearInterval(timer);
  }, [enabled]);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      window.localStorage.setItem('outplay_demo_mode', String(next));
    } catch {
      // Local storage can be unavailable in restricted browser modes.
    }
    setGeneratedAt(new Date().toISOString());
  }, []);

  const value = useMemo<DemoModeContextValue>(() => ({
    enabled,
    setEnabled,
    scenario: enabled ? scenarios[scenarioIndex] : null,
    scenarioIndex,
    generatedAt,
  }), [enabled, generatedAt, scenarioIndex, setEnabled]);

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    return {
      enabled: false,
      setEnabled: () => undefined,
      scenario: null,
      scenarioIndex: 0,
      generatedAt: '',
    } satisfies DemoModeContextValue;
  }
  return context;
}
