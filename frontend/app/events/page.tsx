'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  Plus,
  X,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import PaginationControls from '../../components/PaginationControls';
import api from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';

type EventRecord = {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  sport?: string;
  venue?: string;
  location?: string;
  startDate?: string;
  date?: string;
  entryFee?: number;
};

const defaultPagination = { page: 1, limit: 25, total: 0, totalPages: 1 };
const initialEventForm = {
  title: '',
  description: '',
  type: 'Tournament',
  venue: '',
  startDate: '',
  endDate: '',
  maxParticipants: '',
  entryFee: '0',
};

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-600">Loading academy data...</div>}>
      <EventsContent />
    </Suspense>
  );
}

function EventsContent() {
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(defaultPagination);
  const [form, setForm] = useState(initialEventForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async (page = 1, signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await api.get('/events', {
        params: { page, limit: pagination.limit },
        signal,
      });
      const items = Array.isArray(res.data?.data) ? res.data.data : res.data;
      setEvents(Array.isArray(items) ? items : []);
      setPagination(res.data?.pagination || defaultPagination);
    } catch {
      if (signal?.aborted) return;
      setEvents([]);
    } finally {
      if (signal?.aborted) return;
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
    const controller = new AbortController();
    fetchEvents(pagination.page, controller.signal);

    return () => controller.abort();
  }, [fetchEvents, pagination.page]);

  useEffect(() => {
    if (searchParams.get('openModal') === 'true') {
      setShowModal(true);
    }
  }, [searchParams]);

  const createEvent = async () => {
    if (!form.title.trim() || !form.startDate) {
      setError('Please add an event title and start date.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.post('/events', {
        ...form,
        date: form.startDate,
        location: form.venue || 'TBD',
        sport: form.type,
        entryFee: Number(form.entryFee || 0),
        maxParticipants: Number(form.maxParticipants || 0),
      });
      closeEventModal();
      fetchEvents(pagination.page);
    } catch (err) {
      setError('We could not create this event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const closeEventModal = () => {
    setShowModal(false);
    setForm(initialEventForm);
    setError('');
  };

  return (
    <main className="min-h-screen bg-[#f8f5e8] text-slate-900">
      <Sidebar />

      <section className="lg:pl-[280px]">
        <Topbar />

        <section className="p-5 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black">Events</h1>
              <p className="mt-1 text-lg text-slate-500">{events.length} events</p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Event
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500">Loading academy data...</div>
          ) : events.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <div key={event._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {event.type || event.sport}
                    </span>
                    <p className="text-sm font-bold text-slate-500">{new Date(event.startDate || event.date || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <h3 className="text-xl font-black">{event.title}</h3>
                  <p className="mt-2 text-slate-500 line-clamp-2">{event.description}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="text-sm font-bold">₹{event.entryFee}</p>
                    <p className="text-sm text-slate-500">{event.venue || event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center shadow-sm">
              <div>
                <CalendarDays className="mx-auto mb-4 h-14 w-14 text-slate-300" />
                <h2 className="text-xl font-black">No events yet</h2>
                <p className="mt-2 text-slate-500">
                  Create your first event to start organizing tournaments or camps.
                </p>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
                >
                  Create Event
                </button>
              </div>
            </div>
          )}
          <PaginationControls pagination={pagination} onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))} />
        </section>
      </section>

      {showModal ? (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#fffdf0] p-8 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
            <div className="mb-6 flex items-center justify-between">
              <h2 id="event-modal-title" className="text-2xl font-black">Create Event</h2>

              <button
                type="button"
                aria-label="Close event form"
                onClick={closeEventModal}
                className="text-slate-500 hover:text-slate-900"
              >
                <X size={22} />
              </button>
            </div>

            <form className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  required
                  placeholder="Vijayawada Junior Cricket Cup"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Share format, eligibility, reporting time, and parent instructions."
                  className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">Type</label>
                  <select 
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option>Tournament</option>
                    <option>Training Camp</option>
                    <option>Trial</option>
                    <option>Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">Venue</label>
                  <input
                    value={form.venue}
                    onChange={e => setForm({...form, venue: e.target.value})}
                    placeholder="Indira Gandhi Municipal Stadium, Vijayawada"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Start Date *
                  </label>
                  <input
                    value={form.startDate}
                    onChange={e => setForm({...form, startDate: e.target.value})}
                    type="date"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    End Date
                  </label>
                  <input
                    value={form.endDate}
                    onChange={e => setForm({...form, endDate: e.target.value})}
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Max Participants
                  </label>
                  <input
                    value={form.maxParticipants}
                    onChange={e => setForm({...form, maxParticipants: e.target.value})}
                    type="number"
                    placeholder="120"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Entry Fee (₹)
                  </label>
                  <input
                    value={form.entryFee}
                    onChange={e => setForm({...form, entryFee: e.target.value})}
                    type="number"
                    placeholder="499"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
                  {error}
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={closeEventModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createEvent}
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 py-3 font-black text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
