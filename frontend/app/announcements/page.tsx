'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  CreditCard,
  Filter,
  Search,
  Send,
  TrendingUp,
  UserPlus,
  Wallet,
  X,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import PaginationControls from '../../components/PaginationControls';
import api from '../../lib/api';

type Priority = 'Normal' | 'High' | 'Urgent';

type Announcement = {
  _id?: string;
  id: string;
  title: string;
  type: string;
  priority: Priority;
  read: boolean;
  time: string;
  icon: ElementType;
  iconStyle: string;
  dotStyle: string;
};

const defaultPagination = { page: 1, limit: 25, total: 0, totalPages: 1 };
const initialAnnouncementForm = {
  title: '',
  message: '',
  audience: 'All (Students + Employees)',
  inApp: true,
  whatsapp: false,
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [pagination, setPagination] = useState(defaultPagination);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState(initialAnnouncementForm);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchAnnouncements = useCallback(async (page = 1, signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await api.get('/announcements', {
        params: { page, limit: pagination.limit },
        signal,
      });
      const items = Array.isArray(res.data?.data) ? res.data.data : res.data;
      setAnnouncements(
        (items as Announcement[]).map((item) => {
          const urgent = item.priority === 'Urgent';

          return {
            ...item,
            id: item.id || item._id || '',
            icon: urgent ? AlertTriangle : Bell,
            iconStyle: item.iconStyle || (urgent ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'),
            dotStyle: item.dotStyle || (item.read ? 'bg-slate-300' : urgent ? 'bg-red-500' : 'bg-blue-500'),
          };
        }),
      );
      setPagination(res.data?.pagination || defaultPagination);
    } catch {
      if (signal?.aborted) return;
      showToast('We could not load announcements. Please retry.');
    } finally {
      if (signal?.aborted) return;
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    if (!localStorage.getItem('isAuthenticated')) {
      window.location.href = '/login';
      return;
    }
    const controller = new AbortController();
    fetchAnnouncements(pagination.page, controller.signal);

    return () => controller.abort();
  }, [fetchAnnouncements, pagination.page]);

  const types = useMemo(() => {
    return ['All', ...Array.from(new Set(announcements.map((item) => item.type)))];
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    const q = search.toLowerCase();

    return announcements.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q);

      const matchesType = typeFilter === 'All' || item.type === typeFilter;
      const matchesPriority =
        priorityFilter === 'All Priority' || item.priority === priorityFilter;

      return matchesSearch && matchesType && matchesPriority;
    });
  }, [announcements, search, typeFilter, priorityFilter]);

  const stats = useMemo(() => {
    return {
      total: announcements.length,
      unread: announcements.filter((item) => !item.read).length,
      urgent: announcements.filter((item) => item.priority === 'Urgent').length,
      types: types.length - 1,
    };
  }, [announcements, types]);

  const markAllRead = async () => {
    try {
      await api.put('/announcements/mark-all-read');
      fetchAnnouncements(pagination.page);
    } catch {
      showToast('Could not mark announcements as read. Please try again.');
    }
  };

  const toggleRead = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/announcements/${id}`, { read: !currentStatus });
      fetchAnnouncements(pagination.page);
    } catch {
      showToast('Could not update this announcement. Please try again.');
    }
  };

  const sendAnnouncement = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      showToast('Please add a title and message before sending.');
      return;
    }

    setSending(true);
    try {
      await api.post('/announcements', { ...form, time: 'Just now' });
      showToast('Announcement sent to the selected audience.');
      closeAnnouncementModal();
      fetchAnnouncements(pagination.page);
    } catch {
      showToast('Could not send the announcement. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const closeAnnouncementModal = () => {
    setShowModal(false);
    setForm(initialAnnouncementForm);
  };

  return (
    <main className="min-h-screen bg-[#f8f5e8] text-slate-900">
      <Sidebar />

      {toast && (
        <div className="fixed right-6 top-6 z-[999] rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}

      <section className="lg:pl-[280px]">
        <Topbar />

        <section className="p-5 md:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Send className="text-blue-700" size={32} />
                <h1 className="text-3xl font-black text-slate-900">
                  Announcements
                </h1>
              </div>

              <p className="mt-1 text-lg text-slate-500">
                {stats.unread} unread • {stats.urgent} urgent
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Check size={18} />
                Mark All Read
              </button>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700"
              >
                <Send size={18} />
                Create Announcement
              </button>
            </div>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <StatCard title="Total" value={stats.total} icon={Bell} color="blue" />
            <StatCard title="Unread" value={stats.unread} icon={Bell} color="emerald" />
            <StatCard title="Urgent" value={stats.urgent} icon={AlertTriangle} color="red" />
            <StatCard title="Types" value={stats.types} icon={Filter} color="slate" />
          </div>

          <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full max-w-md">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium shadow-sm outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm outline-none focus:border-blue-500"
            >
              {types.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm outline-none focus:border-blue-500"
            >
              <option>All Priority</option>
              <option>Normal</option>
              <option>High</option>
              <option>Urgent</option>
            </select>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
              {filteredAnnouncements.length} results
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {filteredAnnouncements.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-6 border-b border-slate-200 px-6 py-5 last:border-b-0 ${
                    item.read ? 'bg-white' : 'bg-blue-50/40'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconStyle}`}
                    >
                      <Icon size={24} />
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        {item.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span>{item.time}</span>
                        <span>•</span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                          {item.type}
                        </span>

                        {item.priority === 'Urgent' ? (
                          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                            Urgent
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Mark ${item.title} as ${item.read ? 'unread' : 'read'}`}
                    onClick={() => toggleRead(item.id, item.read)}
                    className="flex items-center gap-3 text-sm font-bold text-slate-700"
                  >
                    <Check size={16} />
                    {item.read ? 'Unread' : 'Read'}
                    <span className={`h-3 w-3 rounded-full ${item.dotStyle}`} />
                  </button>
                </div>
              );
            })}
          </div>
          <PaginationControls pagination={pagination} onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))} />
        </section>
      </section>

      {showModal ? (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-[#fffdf0] p-8 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="announcement-modal-title">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Send className="text-blue-700" size={22} />
                <h2 id="announcement-modal-title" className="text-2xl font-black">Create Announcement</h2>
              </div>

              <button
                type="button"
                aria-label="Close announcement form"
                onClick={closeAnnouncementModal}
                className="text-slate-500 hover:text-slate-900"
              >
                <X size={22} />
              </button>
            </div>

            <form className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Announcement Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g., Rain update for evening training"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Message *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  placeholder="Share the exact update parents, students, or staff need to know."
                  className="min-h-[130px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Send To</label>
                <select
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option>All (Students + Employees)</option>
                  <option>Students Only</option>
                  <option>Employees Only</option>
                  <option>Parents Only</option>
                </select>
              </div>

              <div>
                <p className="mb-3 text-sm font-bold">Delivery Channels</p>

                <label className="mb-3 flex items-center gap-3 text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.inApp}
                    onChange={(e) =>
                      setForm({ ...form, inApp: e.target.checked })
                    }
                    className="h-5 w-5 accent-blue-600"
                  />
                  Send In-App Notification
                </label>

                <label className="flex items-center gap-3 text-slate-500">
                  <input
                    type="checkbox"
                    checked={form.whatsapp}
                    onChange={(e) =>
                      setForm({ ...form, whatsapp: e.target.checked })
                    }
                    className="h-5 w-5 accent-blue-600"
                  />
                  Send WhatsApp Message
                  <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold text-amber-700">
                    Configure Twilio in Settings
                  </span>
                </label>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
                <p className="text-sm text-slate-500">Preview:</p>
                <h3 className="mt-3 font-black">
                  {form.title || 'Announcement title...'}
                </h3>
                <p className="mt-2 text-slate-500">
                  {form.message || 'Message content...'}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  Audience:{' '}
                  <span className="font-bold text-slate-700">
                    {form.audience}
                  </span>
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={closeAnnouncementModal}
                  disabled={sending}
                  className="rounded-xl border border-slate-200 bg-white py-3 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={sendAnnouncement}
                  disabled={sending}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-black text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Send size={18} />
                  {sending ? 'Sending...' : 'Send Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: ElementType;
  color: 'blue' | 'emerald' | 'red' | 'slate';
}) {
  const styles = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    slate: 'text-slate-500',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <Icon size={20} className={styles[color]} />
      </div>

      <h3 className="mt-4 text-3xl font-black text-slate-900">{value}</h3>
    </div>
  );
}
