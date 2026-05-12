'use client';

import type { NotificationItem } from '@/types/notifications';

function formatTime(createdAt: number) {
  const diff = Math.max(0, Date.now() - createdAt);
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function NotificationCard({ item }: { item: NotificationItem }) {
  const variantStyles = {
    success: 'border-emerald-200 bg-emerald-50',
    warning: 'border-amber-200 bg-amber-50',
    info: 'border-blue-200 bg-blue-50',
    anomaly: 'border-red-200 bg-red-50',
  };

  return (
    <div className={`rounded-2xl border p-4 ${variantStyles[item.variant]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
            {item.message}
          </p>
        </div>

        {!item.read ? (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>{item.category}</span>
        <span>{formatTime(item.createdAt)}</span>
      </div>
    </div>
  );
}