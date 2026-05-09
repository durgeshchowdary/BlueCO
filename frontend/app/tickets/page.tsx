'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import {
  Archive,
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Search,
  Send,
  X,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import PaginationControls from '../../components/PaginationControls';
import api from '../../lib/api';

type TicketStatus = 'Open' | 'In Progress' | 'Resolved';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

type Ticket = {
  _id?: string;
  id: string;
  subject: string;
  requester: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  message: string;
  createdAt: string;
};

const defaultPagination = { page: 1, limit: 25, total: 0, totalPages: 1 };
const initialTicketForm = {
  category: 'general',
  priority: 'medium' as TicketPriority,
  subject: '',
  message: '',
};

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(defaultPagination);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState(initialTicketForm);

  const showNotice = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3000);
  }, []);

  const fetchTickets = useCallback(async (page = 1, signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await api.get('/tickets', {
        params: { page, limit: pagination.limit },
        signal,
      });
      const items = Array.isArray(res.data?.data) ? res.data.data : res.data;
      setTickets((items as Ticket[]).map((ticket) => ({ ...ticket, id: ticket.id || ticket._id || '' })));
      setPagination(res.data?.pagination || defaultPagination);
    } catch {
      if (signal?.aborted) return;
      setTickets([]);
    } finally {
      if (signal?.aborted) return;
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    if (!localStorage.getItem('isAuthenticated')) {
      router.push('/login');
      return;
    }
    const controller = new AbortController();
    fetchTickets(pagination.page, controller.signal);

    return () => controller.abort();
  }, [fetchTickets, pagination.page, router]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId);

  const filteredTickets = useMemo(() => {
    const q = search.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(q) ||
        ticket.category.toLowerCase().includes(q) ||
        ticket.priority.toLowerCase().includes(q),
    );
  }, [tickets, search]);

  const counts = {
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
    total: tickets.length,
  };

  const submitTicket = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      showNotice('Add a subject and message before submitting the ticket.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/tickets', {
        ...form,
        requester: 'Admin User',
        status: 'Open',
      });
      
      fetchTickets(pagination.page);
      closeTicketModal();
      showNotice('Ticket created. Your support queue is up to date.');
    } catch (err) {
      showNotice('We could not create this ticket. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const closeTicketModal = () => {
    setShowModal(false);
    setForm(initialTicketForm);
  };

  const updateTicketStatus = async (status: TicketStatus) => {
    if (!selectedTicketId) return;
    try {
      await api.put(`/tickets/${selectedTicketId}`, { status });
      setTickets((prev) =>
        prev.map((ticket) =>
          (ticket as any)._id === selectedTicketId || ticket.id === selectedTicketId 
            ? { ...ticket, status } 
            : ticket,
        ),
      );
    } catch (err) {
      showNotice('We could not update this ticket status. Please try again.', 'error');
    }
  };

  const deleteTicket = async (id: string) => {
    if (!window.confirm('Delete this support ticket? This action cannot be undone.')) return;
    try {
      await api.delete(`/tickets/${id}`);
      setTickets((prev) => prev.filter((ticket) => (ticket.id || (ticket as any)._id) !== id));
      if (selectedTicketId === id) setSelectedTicketId(null);
      showNotice('Ticket deleted.');
    } catch (err) {
      showNotice('We could not delete this ticket. Please try again.', 'error');
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f5e8] text-slate-900">
      <Sidebar />
      {notice ? (
        <div
          className={`fixed right-5 top-5 z-[1000] rounded-2xl px-5 py-3 text-sm font-bold shadow-xl ${
            notice.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <section className="lg:pl-[280px]">
        <Topbar />

        <section className="p-5 md:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Tickets</h1>
              <p className="mt-1 text-lg text-slate-500">
                Support tickets & notifications
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex w-fit items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              New Ticket
            </button>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <StatCard title="Open" value={counts.open} icon={Bell} color="blue" />
            <StatCard title="In Progress" value={counts.inProgress} icon={Clock} color="amber" />
            <StatCard title="Resolved" value={counts.resolved} icon={CheckCircle2} color="emerald" />
            <StatCard title="Total" value={counts.total} icon={Archive} color="slate" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h3 className="mb-4 text-xl font-bold">Tickets</h3>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tickets..."
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="h-[360px] overflow-y-auto p-4">
                {filteredTickets.length ? (
                  filteredTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`mb-3 w-full rounded-2xl border p-4 text-left transition ${
                        selectedTicketId === ticket.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-bold">{ticket.subject}</h4>
                        <StatusBadge status={ticket.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {ticket.category} • {ticket.priority}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-slate-500">
                    <div>
                      <MessageSquare className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                      <p>No tickets yet</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4 pb-4">
                <PaginationControls pagination={pagination} onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))} />
              </div>
            </aside>

            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              {selectedTicket ? (
                <div>
                  <h3 className="text-2xl font-black">{selectedTicket.subject}</h3>
                  <p className="mt-2 text-slate-500">
                    {selectedTicket.category} • {selectedTicket.priority} • {selectedTicket.createdAt}
                  </p>
                  <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-slate-700">
                    {selectedTicket.message}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-[340px] items-center justify-center text-center">
                  <div>
                    <MessageSquare className="mx-auto mb-5 h-14 w-14 text-slate-300" />
                    <h3 className="text-xl font-black">Select a ticket</h3>
                    <p className="mt-2 text-slate-500">
                      Click on a ticket to view details and respond
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>
      </section>

      {showModal ? (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#fffdf0] p-8 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="ticket-modal-title">
            <div className="mb-6 flex items-center justify-between">
              <h2 id="ticket-modal-title" className="text-2xl font-black">Create Support Ticket</h2>

              <button
                type="button"
                aria-label="Close ticket form"
                onClick={closeTicketModal}
                className="text-slate-500 hover:text-slate-900"
              >
                <X size={22} />
              </button>
            </div>

            <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); submitTicket(); }}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="general">general</option>
                    <option value="billing">billing</option>
                    <option value="technical">technical</option>
                    <option value="students">students</option>
                    <option value="events">events</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value as TicketPriority })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="urgent">urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Subject *</label>
                  <input
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Fee receipt not delivered"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Message *</label>
                  <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Share what happened, who is affected, and any timing details."
                  className="min-h-[130px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={closeTicketModal}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 py-3 font-black text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send size={18} />
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const styles = {
    Open: 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    Resolved: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
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
  color: 'blue' | 'amber' | 'emerald' | 'slate';
}) {
  const styles = {
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
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
