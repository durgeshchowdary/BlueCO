'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, BrainCircuit, GitBranch, Radio, SearchCheck } from 'lucide-react';
import type { CopilotResponsePayload } from './CopilotConversation';

type CopilotEvidenceCardProps = {
  response: CopilotResponsePayload;
};

export default function CopilotEvidenceCard({ response }: CopilotEvidenceCardProps) {
  const evidence = useMemo(() => {
    const explainability = response.explainability || {};
    return {
      telemetry: explainability.telemetryReferences || [],
      anomalies: explainability.anomaliesUsed || [],
      trends: explainability.trendsUsed || [],
      grounding: response.groundingSignals?.evidenceRefs || [],
      recommendationBasis: explainability.recommendationBasis || [],
      reasoning: explainability.confidenceReasoning || '',
    };
  }, [response]);

  const hasEvidence =
    evidence.telemetry.length ||
    evidence.anomalies.length ||
    evidence.trends.length ||
    evidence.grounding.length ||
    evidence.recommendationBasis.length ||
    evidence.reasoning;

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700">
          <SearchCheck size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-950">Operational evidence</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
            {evidence.reasoning || 'No detailed evidence was returned for this copilot response.'}
          </p>
        </div>
      </div>

      {hasEvidence ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <EvidenceGroup icon={Radio} label="Telemetry" items={evidence.telemetry} />
          <EvidenceGroup icon={Activity} label="Anomalies" items={evidence.anomalies} />
          <EvidenceGroup icon={GitBranch} label="Trends" items={evidence.trends} />
          <EvidenceGroup icon={BrainCircuit} label="Grounding" items={[...evidence.grounding, ...evidence.recommendationBasis]} />
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-cyan-200 bg-white/70 p-3 text-xs font-bold text-slate-500">
          Empty evidence fallback: the answer was received, but no telemetry, anomaly, trend, or grounding references were attached.
        </div>
      )}
    </motion.article>
  );
}

function EvidenceGroup({
  icon: Icon,
  label,
  items,
}: {
  icon: typeof SearchCheck;
  label: string;
  items: string[];
}) {
  if (!items.length) return null;

  return (
    <div className="min-w-0 rounded-xl bg-white/80 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        <Icon size={13} />
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 4).map((item) => (
          <span key={`${label}-${item}`} className="max-w-full truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
