'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityEventCard, { ActivityEvent } from './ActivityEventCard';

const INITIAL_EVENTS: ActivityEvent[] = [
  { id: '1', type: 'success', title: 'Payment Received', message: '₹2,500 collected from Student #442.', timestamp: 'Just now' },
  { id: '2', type: 'notice', title: 'Batch Started', message: 'U-16 Cricket evening session is live.', timestamp: '2m ago' },
  { id: '3', type: 'anomaly', title: 'AI Ops Alert', message: 'High churn risk detected for 3 students.', timestamp: '5m ago' },
];

const NEW_EVENT_POOL: Omit<ActivityEvent, 'id' | 'timestamp'>[] = [
  { type: 'success', title: 'Attendance Marked', message: 'Coach Rajesh marked attendance for Football Batch A.' },
  { type: 'warning', title: 'Fee Overdue', message: 'Invoice #882 is 3 days past due.' },
  { type: 'notice', title: 'New Registration', message: 'Aman Deep joined the Swimming academy.' },
  { type: 'success', title: 'System Healthy', message: 'Weekly operational backup completed.' },
];

export default function LiveActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomTemplate = NEW_EVENT_POOL[Math.floor(Math.random() * NEW_EVENT_POOL.length)];
      const newEvent: ActivityEvent = {
        ...randomTemplate,
        id: Date.now().toString(),
        timestamp: 'Just now'
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 5)]);
    }, 8000); // Poll/Simulate every 8 seconds

    return () => clearInterval(interval);
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