'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bot, RotateCcw } from 'lucide-react';
import api from '../../lib/api';
import CopilotConversation, { type CopilotMessage, type CopilotResponsePayload } from './CopilotConversation';
import CopilotEvidenceCard from './CopilotEvidenceCard';
import CopilotInput from './CopilotInput';
import CopilotRecommendationCard from './CopilotRecommendationCard';

type CopilotPanelProps = {
  title?: string;
  subtitle?: string;
  className?: string;
};

const starterPrompts = [
  'Summarize this week',
  'What needs attention?',
  'Check churn risk',
  'Explain relay health',
];

export default function CopilotPanel({
  title = 'OUT-PLAY Copilot',
  subtitle = 'Grounded conversation for operational decisions.',
  className = '',
}: CopilotPanelProps) {
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const existing = window.localStorage.getItem('outplay_copilot_conversation_id');
    const next = existing || `COPILOT_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem('outplay_copilot_conversation_id', next);
    setConversationId(next);
  }, []);

  const canSend = useMemo(() => Boolean(conversationId) && !loading, [conversationId, loading]);
  const latestResponse = useMemo(() => {
    return [...messages].reverse().find((message) => message.role === 'assistant' && message.response)?.response;
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!conversationId || loading) return;

    const timestamp = new Date().toISOString();
    const userMessage: CopilotMessage = {
      id: `USER_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp,
    };

    setMessages((current) => [...current, userMessage]);
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post<CopilotResponsePayload & { conversationId?: string }>('/copilot/query', {
        text,
        conversationId,
      });
      const assistantMessage: CopilotMessage = {
        id: `ASSISTANT_${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'I could not generate a grounded response for that query.',
        timestamp: String(data.timestamp || new Date().toISOString()),
        response: data,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Copilot could not reach the intelligence service.';
      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: `ASSISTANT_ERROR_${Date.now()}`,
          role: 'assistant',
          content: message,
          timestamp: new Date().toISOString(),
          response: {
            answer: message,
            isHallucinationSafe: false,
            groundingSignals: { score: 0, evidenceRefs: [] },
            explainability: { confidenceReasoning: 'API request failed before a grounded response was produced.' },
            suggestedActions: [],
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = () => {
    const next = `COPILOT_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem('outplay_copilot_conversation_id', next);
    setConversationId(next);
    setMessages([]);
    setError('');
  };

  return (
    <section className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:p-6 ${className}`}>
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
            <Bot size={14} />
            Copilot
          </div>
          <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 md:text-2xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={resetConversation}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2"
          aria-label="Reset copilot conversation"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {error ? (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[1fr_0.72fr]">
        <CopilotConversation messages={messages} loading={loading} />
        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-white bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Session</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-700">Authenticated</span>
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase text-cyan-700">Grounded</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">
                {conversationId ? 'Ready' : 'Starting'}
              </span>
            </div>
          </div>

          {latestResponse?.suggestedActions?.length ? (
            <CopilotRecommendationCard
              recommendation={latestResponse.suggestedActions[0]}
              confidenceScore={latestResponse.groundingSignals?.score}
              generatedAt={latestResponse.timestamp}
            />
          ) : null}

          {latestResponse && hasPanelEvidence(latestResponse) ? <CopilotEvidenceCard response={latestResponse} /> : null}

          <CopilotInput onSubmit={sendMessage} disabled={!canSend} loading={loading} suggestions={starterPrompts} />
        </div>
      </div>
    </section>
  );
}

function hasPanelEvidence(response: CopilotResponsePayload) {
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
