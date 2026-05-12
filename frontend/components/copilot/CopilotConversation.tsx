'use client';

import { motion } from 'framer-motion';
import { Bot, Clock3, UserRound } from 'lucide-react';
import CopilotConfidenceIndicator from './CopilotConfidenceIndicator';
import CopilotEvidenceCard from './CopilotEvidenceCard';
import CopilotRecommendationCard from './CopilotRecommendationCard';

export type CopilotAction = {
  id?: string;
  title: string;
  description?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  rationale?: string;
  impactArea?: string;
  actionLink?: string;
};

export type CopilotResponsePayload = {
  answer: string;
  groundingSignals?: {
    score?: number;
    trendDirection?: 'up' | 'down' | 'flat';
    evidenceRefs?: string[];
  };
  explainability?: {
    contributingMetrics?: Record<string, number>;
    anomaliesUsed?: string[];
    trendsUsed?: string[];
    confidenceReasoning?: string;
    telemetryReferences?: string[];
    replayReferences?: string[];
    recommendationBasis?: string[];
  };
  suggestedActions?: CopilotAction[];
  isHallucinationSafe?: boolean;
  timestamp?: string;
};

export type CopilotMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  response?: CopilotResponsePayload;
};

type CopilotConversationProps = {
  messages: CopilotMessage[];
  loading?: boolean;
};

export default function CopilotConversation({ messages, loading = false }: CopilotConversationProps) {
  if (!messages.length && !loading) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 text-center md:min-h-72 md:px-6">
        <Bot className="text-cyan-700" size={26} />
        <h3 className="mt-4 text-lg font-black text-slate-950">Ask the operations copilot</h3>
        <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
          Use grounded questions about attendance, churn, relay reliability, incidents, and weekly operational summaries.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] min-w-0 space-y-4 overflow-y-auto pr-1 md:max-h-[560px]">
      {messages.map((message) => (
        <motion.article
          key={message.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex min-w-0 gap-2 md:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' ? <Avatar role="assistant" /> : null}
          <div className={`min-w-0 max-w-[88%] rounded-2xl p-3 md:max-w-[92%] md:p-4 ${message.role === 'user' ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-800 shadow-sm'}`}>
            <div className="whitespace-pre-wrap break-words text-sm font-semibold leading-6">{message.content}</div>

            {message.response ? (
              <div className="mt-4 space-y-3">
                <CopilotConfidenceIndicator
                  score={message.response.groundingSignals?.score}
                  isSafe={message.response.isHallucinationSafe}
                  reasoning={message.response.explainability?.confidenceReasoning}
                />
                {hasEvidence(message.response) ? <CopilotEvidenceCard response={message.response} /> : null}
                {message.response.suggestedActions?.length ? (
                  <div className="grid gap-3">
                    {message.response.suggestedActions.slice(0, 3).map((action, index) => (
                      <CopilotRecommendationCard
                        key={action.id || `${action.title}-${index}`}
                        recommendation={action}
                        confidenceScore={message.response?.groundingSignals?.score}
                        generatedAt={message.response?.timestamp || message.timestamp}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className={`mt-3 flex items-center gap-2 text-xs font-bold ${message.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
              <Clock3 size={13} />
              {formatTime(message.timestamp)}
            </div>
          </div>
          {message.role === 'user' ? <Avatar role="user" /> : null}
        </motion.article>
      ))}

      {loading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm font-black text-cyan-700">
          <Bot size={18} />
          Grounding response against current OUT-PLAY signals...
        </motion.div>
      ) : null}
    </div>
  );
}

function Avatar({ role }: { role: 'user' | 'assistant' }) {
  const Icon = role === 'assistant' ? Bot : UserRound;
  return (
    <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${role === 'assistant' ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-slate-700'}`}>
      <Icon size={18} />
    </div>
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function hasEvidence(response: CopilotResponsePayload) {
  return Boolean(
    response.explainability?.confidenceReasoning ||
      response.groundingSignals?.evidenceRefs?.length ||
      response.explainability?.telemetryReferences?.length ||
      response.explainability?.replayReferences?.length ||
      response.explainability?.anomaliesUsed?.length ||
      response.explainability?.trendsUsed?.length ||
      response.explainability?.recommendationBasis?.length,
  );
}
