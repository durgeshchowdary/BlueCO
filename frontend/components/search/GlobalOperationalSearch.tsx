'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Brain, Clock3, Loader2, Search, Sparkles } from 'lucide-react';

export type OperationalSearchType = 'Insights' | 'Recommendations' | 'Timeline Events' | 'Operational Alerts';

export type OperationalSearchItem = {
  id: string;
  type: OperationalSearchType;
  title: string;
  description?: string;
  category?: string;
  timestamp?: string;
};

type GlobalOperationalSearchProps = {
  items: OperationalSearchItem[];
  loading?: boolean;
  placeholder?: string;
  className?: string;
  onSelect?: (item: OperationalSearchItem) => void;
};

const groupOrder: OperationalSearchType[] = ['Insights', 'Recommendations', 'Timeline Events', 'Operational Alerts'];

const groupIcon = {
  Insights: Brain,
  Recommendations: Sparkles,
  'Timeline Events': Clock3,
  'Operational Alerts': AlertTriangle,
};

export default function GlobalOperationalSearch({
  items,
  loading = false,
  placeholder = 'Search insights, recommendations, timeline events, and alerts...',
  className = '',
  onSelect,
}: GlobalOperationalSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 160);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const suggestions = useMemo(() => {
    const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean) as string[]));
    return categories.slice(0, 4);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery) return items.slice(0, 8);
    return items
      .filter((item) => {
        const haystack = [item.title, item.description, item.category, item.type].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(debouncedQuery);
      })
      .slice(0, 12);
  }, [items, debouncedQuery]);

  const groupedItems = useMemo(() => {
    return groupOrder
      .map((type) => [type, filteredItems.filter((item) => item.type === type)] as const)
      .filter(([, results]) => results.length);
  }, [filteredItems]);

  const selectItem = (item: OperationalSearchItem) => {
    setQuery(item.title);
    setOpen(false);
    onSelect?.(item);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) setOpen(true);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(filteredItems.length - 1, 0)));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }
    if (event.key === 'Enter' && filteredItems[activeIndex]) {
      event.preventDefault();
      selectItem(filteredItems[activeIndex]);
    }
    if (event.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Search size={19} className="shrink-0 text-cyan-700" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search operational signals"
            aria-expanded={open}
            className="min-h-10 w-full min-w-0 bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
          />
          {loading ? <Loader2 size={18} className="shrink-0 animate-spin text-slate-400" /> : null}
        </div>

        {!query && suggestions.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setQuery(suggestion);
                  setOpen(true);
                }}
                className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase text-cyan-700 transition hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className="absolute left-0 right-0 z-30 mt-2 max-h-[62vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10 md:max-h-[70vh]"
        >
          {loading ? (
            <StateLine icon={Loader2} text="Loading operational signals..." spinning />
          ) : !items.length ? (
            <StateLine icon={Search} text="No operational data is available to search yet." />
          ) : !filteredItems.length ? (
            <StateLine icon={Search} text="No results match this search." />
          ) : (
            <div className="space-y-3">
              {groupedItems.map(([type, results]) => {
                const Icon = groupIcon[type];
                return (
                  <section key={type}>
                    <div className="mb-1 flex items-center gap-2 px-2 py-1 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      <Icon size={13} />
                      {type}
                    </div>
                    <div className="grid gap-1">
                      {results.map((item) => {
                        const active = filteredItems[activeIndex]?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onMouseEnter={() => setActiveIndex(filteredItems.findIndex((result) => result.id === item.id))}
                            onClick={() => selectItem(item)}
                            className={`min-w-0 rounded-xl p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-1 ${active ? 'bg-cyan-50' : 'hover:bg-slate-50'}`}
                          >
                            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-slate-950">{item.title}</p>
                                {item.description ? <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{item.description}</p> : null}
                              </div>
                              {item.timestamp ? <span className="shrink-0 text-xs font-bold text-slate-400">{formatTimestamp(item.timestamp)}</span> : null}
                            </div>
                            {item.category ? (
                              <span className="mt-2 inline-flex max-w-full rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-slate-500">
                                <span className="truncate">{item.category}</span>
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}

function StateLine({ icon: Icon, text, spinning = false }: { icon: typeof Search; text: string; spinning?: boolean }) {
  return (
    <div className="flex min-h-24 items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm font-bold text-slate-500">
      <Icon size={17} className={spinning ? 'animate-spin' : ''} />
      {text}
    </div>
  );
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString();
}
