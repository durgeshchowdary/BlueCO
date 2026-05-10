'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import FormInput from '@/components/FormInput';
import DataTable from '@/components/DataTable';
import Loading from '@/components/Loading';
import Toast from '@/components/Toast';
import ToastContainer from '@/components/ToastContainer';
import Modal from '@/components/Modal';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

interface AttendanceRecord {
  _id: string;
  studentName: string;
  sport: string;
  date: string;
  status: string;
}

const initialAttendance = { studentName: '', sport: '', date: '', status: 'Present' };

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [form, setForm] = useState(initialAttendance);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchAttendance = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await api.get('/attendance', { signal });
      setRecords(
        response.data.map((item: any) => ({
          ...item,
          date: new Date(item.date).toISOString().substring(0, 10),
        }))
      );
    } catch {
      if (signal?.aborted) return;
      setToast({ message: 'We could not load attendance records. Please retry.', type: 'error' });
    } finally {
      if (signal?.aborted) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    const controller = new AbortController();
    fetchAttendance(controller.signal);

    return () => controller.abort();
  }, [fetchAttendance]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.studentName) nextErrors.studentName = 'Student name is required.';
    if (!form.sport) nextErrors.sport = 'Sport is required.';
    if (!form.date) nextErrors.date = 'Date is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      setToast({ message: 'Please complete the required attendance details.', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/attendance/${editingId}`, { ...form, date: new Date(form.date) });
        setToast({ message: 'Attendance record updated.', type: 'success' });
      } else {
        await api.post('/attendance', { ...form, date: new Date(form.date) });
        setToast({ message: 'Attendance recorded.', type: 'success' });
      }
      setForm(initialAttendance);
      setEditingId(null);
      fetchAttendance();
    } catch {
      setToast({ message: `We could not ${editingId ? 'update' : 'add'} this attendance record. Please try again.`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditingId(record._id);
    setForm({ studentName: record.studentName, sport: record.sport, date: record.date, status: record.status });
    setErrors({});
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/attendance/${deleteTarget.id}`);
      setToast({ message: 'Attendance record deleted.', type: 'success' });
      setDeleteTarget(null);
      fetchAttendance();
    } catch {
      setToast({ message: 'We could not delete this attendance record. Please try again.', type: 'error' });
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch = [record.studentName, record.sport, record.date, record.status].join(' ').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter ? record.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  return (
    <main>
      <Navbar />
      <ToastContainer>{toast && <Toast message={toast.message} type={toast.type} />}</ToastContainer>
      <div className="container grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <section className="space-y-8">
          <div className="card-glass p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-accent">Attendance</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Track daily attendance</h1>
              </div>
              <button
                type="button"
                onClick={() => fetchAttendance()}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="card-glass p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{editingId ? 'Edit attendance' : 'Mark attendance'}</h2>
                  <p className="mt-2 text-slate-400">Capture daily presence for every student.</p>
                </div>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(initialAttendance);
                      setErrors({});
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput label="Student name" name="studentName" value={form.studentName} onChange={handleChange} placeholder="e.g. Aarav Sharma" required />
                  <FormInput label="Sport" name="sport" value={form.sport} onChange={handleChange} placeholder="e.g. Cricket" required />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput label="Date" name="date" type="date" value={form.date} onChange={handleChange} placeholder="" required />
                  <FormInput
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    inputType="select"
                    options={['Present', 'Absent']}
                  />
                </div>
                {Object.keys(errors).length > 0 && (
                  <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                    {Object.values(errors).map((errorMessage) => (
                      <p key={errorMessage}>{errorMessage}</p>
                    ))}
                  </div>
                )}
                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accentSoft disabled:cursor-not-allowed disabled:opacity-70">
                    {saving ? 'Saving...' : editingId ? 'Update record' : 'Add attendance'}
                  </button>
                </div>
              </form>
            </div>

            <div className="card-glass p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Attendance log</h2>
                  <p className="mt-2 text-slate-400">Search and manage daily attendance entries.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by student, sport, date, or status..."
                    className="rounded-3xl border border-white/10 bg-[#08131f] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-accent/70"
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-3xl border border-white/10 bg-[#08131f] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-accent/70"
                  >
                    <option value="">All status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
              {loading ? (
                <Loading />
              ) : (
                <DataTable
                  columns={['studentName', 'sport', 'date', 'status']}
                  rows={filteredRecords.map((record) => ({
                    id: record._id,
                    studentName: record.studentName,
                    sport: record.sport,
                    date: record.date,
                    status: record.status,
                    raw: record,
                  }))}
                  renderActions={(row) => (
                    <button
                      type="button"
                      aria-label={`Edit attendance for ${row.studentName}`}
                      onClick={() => handleEdit(row.raw)}
                      className="rounded-full border border-slate-600 bg-white/5 px-3 py-1 text-sm text-slate-200 transition hover:border-accent/40 hover:text-white"
                    >
                      Edit
                    </button>
                  )}
                  onDelete={(id) => {
                    const record = records.find((item) => item._id === id);
                    if (record) setDeleteTarget({ id, label: record.studentName });
                  }}
                  emptyMessage="No matching attendance entries found."
                />
              )}
            </div>
          </div>

          <Modal
            title={`Delete ${deleteTarget?.label ?? 'attendance'} record?`}
            description="This action cannot be undone. Confirm to remove the attendance entry permanently."
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
