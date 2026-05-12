'use client';

import { useMemo, useState } from 'react';

import NotificationCard from './NotificationCard';

import { MOCK_NOTIFICATIONS } from '@/lib/mockNotifications';
import type { NotificationCategory } from '@/types/notifications';

const FILTERS: Array<'all' | NotificationCategory> = [
  'all',
  'aiops',
  'billing',
  'attendance',
  'operational',
  'system',
];

export default function NotificationCenter() {
  const [activeFilter, setActiveFilter] =
    useState<'all' | NotificationCategory>('all');

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') {
      return MOCK_NOTIFICATIONS;
    }

    return MOCK_NOTIFICATIONS.filter(
      (item) => item.category === activeFilter,
    );
  }, [activeFilter]);

  const unreadCount = MOCK_NOTIFICATIONS.filter(
    (item) => !item.read,
  ).length;

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />

            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
              Operational Alerts
            </span>
          </div>

          <h2 className="mt-2 text-2xl font-black text-slate-900">
            Notification Center
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
          {unreadCount} unread
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <p className="text-sm font-semibold text-slate-500">
              No notifications available.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <NotificationCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
}