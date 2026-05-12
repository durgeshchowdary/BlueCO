'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityEventCard, { ActivityEvent } from './ActivityEventCard';
import { generateUUID } from '@/lib/liveUtils';

const INITIAL_EVENTS: ActivityEvent[] = [
  { id: generateUUID(), type: 'success', title: 'Payment Received', message: '₹2,500 collected from Student #442.', createdAt: Date.now() - 1000 * 10 },
  { id: generateUUID(), type: 'notice', title: 'Batch Started', message: 'U-16 Cricket evening session is live.', createdAt: Date.now() - 1000 * 60 * 2 },
  { id: generateUUID(), type: 'anomaly', title: 'AI Ops Alert', message: 'High churn risk detected for 3 students.', createdAt: Date.now() - 1000 * 60 * 5 },
];

const NEW_EVENT_POOL: Omit<ActivityEvent, 'id' | 'createdAt'>[] = [
  { type: 'success', title: 'Attendance Marked', message: 'Coach Rajesh marked attendance for Football Batch A.' },
  { type: 'warning', title: 'Fee Overdue', message: 'Invoice #882 is 3 days past due.' },
  { type: 'notice', title: 'New Registration', message: 'Aman Deep joined the Swimming academy.' },
  { type: 'success', title: 'System Healthy', message: 'Weekly operational backup completed.' },
  { type: 'anomaly', title: 'AI Ops Alert', message: 'Unusual activity detected in student portal.' },
];

export default function LiveActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>(INITIAL_EVENTS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const randomTemplate = NEW_EVENT_POOL[Math.floor(Math.random() * NEW_EVENT_POOL.length)];
      const newEvent: ActivityEvent = {
        ...randomTemplate,
        id: generateUUID(),
        createdAt: Date.now(),
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 5)]);
    }, 8000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Live Operations</h3>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Live</span>
        </div>
      </div>

      <div className="relative space-y-3">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <ActivityEventCard event={event} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}