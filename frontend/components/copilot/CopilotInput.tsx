'use client';

import { KeyboardEvent, useState } from 'react';
import { Loader2, SendHorizontal, Sparkles } from 'lucide-react';

type CopilotInputProps = {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  suggestions?: string[];
};

export default function CopilotInput({
  onSubmit,
  disabled = false,
  loading = false,
  placeholder = 'Ask about attendance, churn risk, relay health, or incidents...',
  suggestions = [],
}: CopilotInputProps) {
  const [value, setValue] = useState('');

  const submit = (text = value) => {
    const next = text.trim();
    if (!next || disabled || loading) return;
    onSubmit(next);
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="space-y-3">
      {suggestions.length ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={disabled || loading}
              onClick={() => submit(suggestion)}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700 transition hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={13} />
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          rows={3}
          maxLength={600}
          placeholder={placeholder}
          aria-label="Copilot message"
          className="min-h-20 w-full resize-none bg-transparent text-sm font-semibold leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus-visible:ring-0 disabled:cursor-not-allowed"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-slate-400">{value.length}/600</p>
          <button
            type="button"
            onClick={() => submit()}
            disabled={disabled || loading || !value.trim()}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send copilot message"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
