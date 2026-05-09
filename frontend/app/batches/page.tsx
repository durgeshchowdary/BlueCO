'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { 
  Bell,
  Dribbble,
  MessageSquare, 
  Moon, 
  Plus, 
  Search, 
  User, 
  X, 
  Zap
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import FormInput from '@/components/FormInput';
import DataTable from '@/components/DataTable';
import Loading from '@/components/Loading';
import Toast from '@/components/Toast';
import ToastContainer from '@/components/ToastContainer';
import Modal from '@/components/Modal';
import api from '@/lib/api';

interface Batch {
  _id: string;
  name: string;
  sport: string;
  coachName: string;
  timing: string;
  capacity: number;
}

const initialBatch = { name: '', sport: '', coachName: '', timing: '', capacity: 10 };

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [form, setForm] = useState(initialBatch);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authorized, setAuthorized] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBatches = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await api.get('/batches', { signal });
      setBatches(response.data);
    } catch {
      if (signal?.aborted) return;
      setToast({ message: 'Unable to load batches.', type: 'error' });
    } finally {
      if (signal?.aborted) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      window.location.href = '/login';
      return;
    }
    setAuthorized(true);
    const controller = new AbortController();
    fetchBatches(controller.signal);

    return () => controller.abort();
  }, [fetchBatches]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name) nextErrors.name = 'Batch name is required.';
    if (!form.sport) nextErrors.sport = 'Sport is required.';
    if (!form.coachName) nextErrors.coachName = 'Coach name is required.';
    if (!form.timing) nextErrors.timing = 'Timing is required.';
    if (!form.capacity || form.capacity <= 0) nextErrors.capacity = 'Capacity must be greater than 0.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'capacity' ? Number(value) : value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      setToast({ message: 'Please complete the highlighted session details.', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/batches/${editingId}`, form);
        setToast({ message: 'Training session updated.', type: 'success' });
      } else {
        await api.post('/batches', form);
        setToast({ message: 'Training session created.', type: 'success' });
      }
      closeSessionModal();
      fetchBatches();
    } catch {
      setToast({ message: `We could not ${editingId ? 'update' : 'create'} this session. Please try again.`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const closeSessionModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setForm(initialBatch);
    setErrors({});
  };

  const handleEdit = (batch: Batch) => {
    setEditingId(batch._id);
    setShowAddModal(true);
    setForm({ name: batch.name, sport: batch.sport, coachName: batch.coachName, timing: batch.timing, capacity: batch.capacity });
    setErrors({});
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/batches/${deleteTarget.id}`);
      setToast({ message: 'Batch deleted successfully.', type: 'success' });
      setDeleteTarget(null);
      fetchBatches();
    } catch {
      setToast({ message: 'Unable to delete batch.', type: 'error' });
    }
  };

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      return [batch.name, batch.sport, batch.coachName, batch.timing]
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  }, [batches, searchQuery]);

  if (!authorized || loading) return <Loading />;

  return (
    <main className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <ToastContainer>{toast && <Toast message={toast.message} type={toast.type} />}</ToastContainer>

      <div className="flex-1 lg:ml-[280px]">
        {/* Trial Banner */}
        {showTrialBanner && (
          <div className="flex items-center justify-between bg-blue-600 px-6 py-2 text-white">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap size={16} className="fill-current" />
              <span>Free trial: 14 days remaining</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-md bg-white px-3 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-50">
                Upgrade Plan
              </button>
              <button type="button" aria-label="Dismiss trial banner" onClick={() => setShowTrialBanner(false)} className="opacity-70 hover:opacity-100">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
          <h2 className="text-xl font-bold text-slate-800">Training Sessions</h2>
          <div className="flex items-center gap-5 text-slate-500">
            <button className="relative p-1 hover:text-blue-600">
              <Bell size={20} />
              <span className="absolute right-0 top-0 flex h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <button className="p-1 hover:text-blue-600">
              <MessageSquare size={20} />
            </button>
            <button className="p-1 hover:text-blue-600">
              <Moon size={20} />
            </button>
            <div className="ml-2 h-8 w-8 overflow-hidden rounded-full bg-slate-200">
              <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        <section className="p-8">
          {/* Page Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Training Sessions</h1>
              <p className="mt-1 font-medium text-slate-500">{batches.length} sessions</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => { setEditingId(null); setForm(initialBatch); setErrors({}); setShowAddModal(true); }}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                <Plus size={18} /> New Session
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex border-b border-slate-200">
            {['Upcoming', 'All'].map((tab) => (
              <button
                key={tab}
                // onClick={() => setActiveTab(tab)} // Implement if needed
                className={`px-6 py-3 text-sm font-bold transition-all ${
                  tab === 'All' // Default to 'All' for now
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Filter Row */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by session name, sport, coach..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Batch Table */}
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <Loading />
            ) : filteredBatches.length > 0 ? (
              <DataTable
                columns={['ID', 'name', 'sport', 'coachName', 'timing', 'capacity']}
                rows={filteredBatches.map((batch) => ({
                  id: batch._id,
                  ID: batch._id.substring(batch._id.length - 6).toUpperCase(),
                  name: batch.name,
                  sport: batch.sport,
                  coachName: batch.coachName,
                  timing: batch.timing,
                  capacity: batch.capacity,
                  raw: batch,
                }))}
                renderActions={(row) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(row.raw)}
                      className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      Edit
                    </button>
                  </div>
                )}
                onDelete={(id) => {
                  const batch = batches.find((item) => item._id === id);
                  if (batch) setDeleteTarget({ id, label: batch.name });
                }}
                emptyMessage="No training sessions found."
              />
            ) : (
              <div className="p-20 flex flex-col items-center">
                <Dribbble size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">No sessions yet. Create your first training session above.</p>
              </div>
            )}
          </div>

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900">{editingId ? 'Edit Training Session' : 'Add New Training Session'}</h2>
                  <button type="button" aria-label="Close session form" onClick={closeSessionModal} className="rounded-full p-2 hover:bg-slate-100 text-slate-400">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="Session Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sunrise Cricket Juniors" required />
                    <FormInput label="Sport" name="sport" value={form.sport} onChange={handleChange} placeholder="e.g. Cricket" required />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="Coach Name" name="coachName" value={form.coachName} onChange={handleChange} placeholder="e.g. Vikram Shah" required />
                    <FormInput label="Timing" name="timing" value={form.timing} onChange={handleChange} placeholder="e.g. 6:00 AM - 8:00 AM" required />
                  </div>
                  <FormInput label="Capacity" name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="e.g. 20" required />
                  {Object.keys(errors).length > 0 && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
                      {Object.values(errors).map((err) => <p key={err}>{err}</p>)}
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeSessionModal}
                      disabled={saving}
                      className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                    >
                      {saving ? 'Saving...' : editingId ? 'Update Session' : 'Add Session'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <Modal
            title={`Delete ${deleteTarget?.label ?? 'batch'}?`}
            description="Deleting a batch will remove it from the schedule and student assignments."
            open={Boolean(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
            confirmLabel="Delete"
            cancelLabel="Keep"
          />
        </section>
      </div>
    </main>
  );
}
