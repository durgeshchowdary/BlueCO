'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import api from '../lib/api';

type NotificationItem = {
  _id: string;
  category: string;
  title: string;
  message: string;
  actionUrl?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  readAt?: string | null;
  createdAt: string;
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications?limit=8');
      setItems(data.data || []);
      setUnreadCount(Number(data.unreadCount || 0));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    await api.post('/notifications/read-all');
    setItems((current) => current.map((item) => ({ ...item, readAt: new Date().toISOString() })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) fetchNotifications();
        }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-200 shadow-sm hover:border-cyan-200/40 hover:text-cyan-100"
        aria-label="Open notifications"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-black text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-40 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/10 bg-[#06111f]/95 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-black">Notifications</p>
              <p className="text-xs font-semibold text-slate-400">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-cyan-200"
              aria-label="Mark all as read"
              title="Mark all as read"
            >
              <CheckCheck size={17} />
            </button>
          </div>

          <div className="max-h-[430px] overflow-y-auto">
            {loading ? (
              <div className="flex min-h-32 items-center justify-center text-slate-400">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : items.length ? items.map((item) => {
              const content = (
                <div className={`border-b border-white/10 px-4 py-3 transition hover:bg-white/[0.06] ${item.readAt ? '' : 'bg-cyan-300/[0.08]'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-white">{item.title}</p>
                    <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-100">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-400">{item.message}</p>
                </div>
              );

              return item.actionUrl ? (
                <Link key={item._id} href={item.actionUrl} onClick={() => setOpen(false)}>
                  {content}
                </Link>
              ) : (
                <div key={item._id}>{content}</div>
              );
            }) : (
              <div className="flex min-h-32 items-center justify-center px-4 text-sm font-semibold text-slate-400">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
