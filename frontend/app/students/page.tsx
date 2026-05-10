'use client';

import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Download,
  IndianRupee,
  Plus,
  Search,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import PaginationControls from '../../components/PaginationControls';
import api from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';
import { csvValue, missingFields, parseCSVFile } from '../../lib/csv';
import { downloadCSV } from '../../lib/utils';

type Student = {
  _id: string;
  name: string;
  age?: number;
  sport: string;
  batch: string;
  phone: string;
  parentName?: string;
  monthlyFee?: number;
  feeStatus?: 'Paid' | 'Pending';
  joinedAt?: string;
};

type StudentForm = {
  name: string;
  age: string;
  sport: string;
  batch: string;
  phone: string;
  parentName: string;
  monthlyFee: string;
  feeStatus: 'Paid' | 'Pending';
};

type Tab = 'Students' | 'Attendance' | 'Fees' | 'Progress';

const emptyForm: StudentForm = {
  name: '',
  age: '',
  sport: '',
  batch: '',
  phone: '',
  parentName: '',
  monthlyFee: '',
  feeStatus: 'Pending',
};

const defaultPagination = { page: 1, limit: 25, total: 0, totalPages: 1 };

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-600">Loading students...</div>}>
      <StudentsContent />
    </Suspense>
  );
}

function StudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get('tab') === 'attendance' ? 'Attendance' : 'Students';

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [pagination, setPagination] = useState(defaultPagination);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const fetchStudents = useCallback(async (page = 1, signal?: AbortSignal) => {
    try {
      setLoading(true);
      const response = await api.get('/students', {
        params: { page, limit: pagination.limit },
        signal,
      });
      const items = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setStudents(Array.isArray(items) ? items : []);
      setPagination(response.data?.pagination || defaultPagination);
    } catch {
      if (signal?.aborted) return;
      setStudents([]);
    } finally {
      if (signal?.aborted) return;
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const controller = new AbortController();
    fetchStudents(pagination.page, controller.signal);

    return () => controller.abort();
  }, [fetchStudents, pagination.page, router]);

  useEffect(() => {
    if (searchParams.get('tab') === 'attendance') {
      setActiveTab('Attendance');
    }
  }, [searchParams]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  };

  const batches = useMemo(() => {
    return [
      'All Batches',
      ...Array.from(
        new Set(students.map((student) => student.batch).filter(Boolean)),
      ),
    ];
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        student.name?.toLowerCase().includes(q) ||
        student.sport?.toLowerCase().includes(q) ||
        student.batch?.toLowerCase().includes(q) ||
        student.phone?.toLowerCase().includes(q);

      const matchesBatch =
        batchFilter === 'All Batches' || student.batch === batchFilter;

      return matchesSearch && matchesBatch;
    });
  }, [students, search, batchFilter]);

  const feeMetrics = useMemo(() => {
    const collected = students
      .filter((student) => student.feeStatus === 'Paid')
      .reduce((sum, student) => sum + Number(student.monthlyFee || 0), 0);

    const pending = students
      .filter((student) => student.feeStatus !== 'Paid')
      .reduce((sum, student) => sum + Number(student.monthlyFee || 0), 0);

    const paidCount = students.filter((student) => student.feeStatus === 'Paid')
      .length;

    const collectionRate = students.length
      ? Math.round((paidCount / students.length) * 100)
      : 0;

    const overdue = students.filter((student) => student.feeStatus !== 'Paid')
      .length;

    return { collected, pending, collectionRate, overdue };
  }, [students]);

  const metrics = useMemo(() => {
    const pending = students.filter(
      (student) => student.feeStatus === 'Pending',
    ).length;

    return {
      attendanceRate: 0,
      lowAttendance: 0,
      pending,
      collected: feeMetrics.collected,
    };
  }, [students, feeMetrics.collected]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.sport.trim() || !form.batch.trim()) {
      showToast('Please complete the required student details.');
      return;
    }

    const payload = {
      name: form.name,
      age: Number(form.age || 0),
      sport: form.sport,
      batch: form.batch,
      phone: form.phone,
      parentName: form.parentName,
      monthlyFee: Number(form.monthlyFee || 0),
      feeStatus: form.feeStatus,
      joinedAt: new Date(),
    };

    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, payload);
        showToast('Student profile updated.');
      } else {
        await api.post('/students', payload);
        showToast('Student added to the academy.');
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchStudents(pagination.page);
    } catch {
      showToast('We could not save this student. Please try again.');
    }
  };

  const closeStudentForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const editStudent = (student: Student) => {
    setEditingId(student._id);
    setForm({
      name: student.name || '',
      age: String(student.age || ''),
      sport: student.sport || '',
      batch: student.batch || '',
      phone: student.phone || '',
      parentName: student.parentName || '',
      monthlyFee: String(student.monthlyFee || ''),
      feeStatus: student.feeStatus || 'Pending',
    });
    setShowForm(true);
    setActiveTab('Students');
  };

  const deleteStudent = async (id: string) => {
    const ok = window.confirm('Delete this student profile? This action cannot be undone.');
    if (!ok) return;

    try {
      await api.delete(`/students/${id}`);
      showToast('Student profile deleted.');
      fetchStudents(pagination.page);
    } catch {
      showToast('We could not delete this student. Please try again.');
    }
  };

  const exportCSV = () => {
    const header = ['ID', 'Name', 'Sport', 'Batch', 'Phone', 'Fee Status'];
    const rows = students.map((student, index) => [
      index + 1,
      student.name,
      student.sport,
      student.batch,
      student.phone,
      student.feeStatus || '',
    ]);

    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'playgrid-students.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const downloadStudentSample = () => {
    downloadCSV(
      [
        {
          name: 'Aarav Sharma',
          age: 12,
          sport: 'Cricket',
          batch: 'Sunrise Cricket Juniors',
          phone: '+91 98765 43210',
          parentName: 'Priya Sharma',
          monthlyFee: 2500,
          feeStatus: 'Pending',
          joinedAt: '2026-05-09',
        },
      ],
      'students-import-sample.csv',
    );
  };

  const importStudents = async (file: File) => {
    try {
      setImporting(true);
      const rows = await parseCSVFile(file);
      const invalidRow = rows.findIndex((row) => missingFields(row, ['name', 'age', 'sport', 'batch', 'phone', 'parentName', 'monthlyFee']).length > 0);
      if (invalidRow >= 0) {
        showToast(`Row ${invalidRow + 2} is missing required student fields.`);
        return;
      }

      const payload = rows.map((row) => ({
        name: csvValue(row, 'name'),
        age: Number(csvValue(row, 'age')),
        sport: csvValue(row, 'sport'),
        batch: csvValue(row, 'batch'),
        phone: csvValue(row, 'phone'),
        parentName: csvValue(row, 'parentName'),
        monthlyFee: Number(csvValue(row, 'monthlyFee')),
        feeStatus: csvValue(row, 'feeStatus') === 'Paid' ? 'Paid' : 'Pending',
        joinedAt: csvValue(row, 'joinedAt'),
      }));

      if (payload.some((row) => !Number.isFinite(row.age) || row.age <= 0 || !Number.isFinite(row.monthlyFee))) {
        showToast('Age and monthlyFee must be valid numbers.');
        return;
      }

      const response = await api.post('/students/import', { rows: payload });
      showToast(`Imported ${response.data.inserted} students. Skipped ${response.data.skipped} duplicates.`);
      fetchStudents(1);
      setPagination((prev) => ({ ...prev, page: 1 }));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'We could not import students. Please check the CSV and retry.');
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const markAllPresent = () => {
    showToast('Attendance marked as present for visible students');
  };

  return (
    <main className="min-h-screen bg-[#f8f5e8] text-slate-900">
      <Sidebar />

      {toast ? (
        <div className="fixed right-6 top-6 z-[999] rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      ) : null}

      <section className="lg:pl-[280px]">
        <Topbar />

        <section className="p-5 md:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Students</h1>
              <p className="mt-1 text-lg text-slate-500">
                {students.length} students enrolled
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportCSV}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm"
              >
                <Download size={17} />
                Export
              </button>

              <input
                ref={importInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) importStudents(file);
                }}
              />

              <button type="button" onClick={() => importInputRef.current?.click()} disabled={importing} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
                <Upload size={17} />
                {importing ? 'Importing...' : 'Import CSV'}
              </button>

              <button type="button" onClick={downloadStudentSample} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm">
                <Download size={17} />
                Sample CSV
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('Fees')}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm"
              >
                <IndianRupee size={17} />
                Generate Fees
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                  setShowForm(true);
                  setActiveTab('Students');
                }}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700"
              >
                <UserPlus size={17} />
                Add Student
              </button>
            </div>
          </div>

          <div className="mb-5 flex w-fit items-center gap-1 rounded-2xl bg-slate-100 p-1">
            {[
              { label: 'Students' as Tab, icon: Users },
              { label: 'Attendance' as Tab, icon: CalendarDays },
              { label: 'Fees' as Tab, icon: IndianRupee },
              { label: 'Progress' as Tab, icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
                    activeTab === tab.label
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  <Icon size={17} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'Students' ? (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-4">
                <MetricCard title="Attendance Rate" value="0%" label="This Month" color="cyan" />
                <MetricCard title="Low Attendance" value={metrics.lowAttendance} label="Action" color="amber" />
                <MetricCard title="Fees Overdue" value={metrics.pending} label="0%" color="red" />
                <MetricCard title="Collected" value={`₹${metrics.collected}`} label="Revenue" color="blue" />
              </div>

        {showForm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-[32px] bg-[#f8f5e8] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">
                  {editingId ? 'Edit Student' : 'Add New Student'}
                </h2>
                <button 
                  type="button"
                  aria-label="Close student form"
                  onClick={closeStudentForm}
                  className="rounded-full p-2 hover:bg-slate-200 transition"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name *</label>
                  <input
                    required
                    placeholder="Aarav Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Age</label>
                  <input
                    placeholder="12"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Sport *</label>
                  <input
                    required
                    placeholder="Cricket"
                    value={form.sport}
                    onChange={(e) => setForm({ ...form, sport: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Batch *</label>
                  <input
                    required
                    placeholder="Sunrise Cricket Juniors"
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                  <input
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Parent Name</label>
                  <input
                    placeholder="Priya Sharma"
                    value={form.parentName}
                    onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Monthly Fee (₹)</label>
                  <input
                    placeholder="2500"
                    value={form.monthlyFee}
                    onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Fee Status</label>
                  <select
                    value={form.feeStatus}
                    onChange={(e) => setForm({ ...form, feeStatus: e.target.value as 'Paid' | 'Pending' })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-4 md:col-span-2">
                  <button
                    type="button"
                    onClick={closeStudentForm}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white py-4 font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] rounded-2xl bg-blue-600 py-4 font-black text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                  >
                    {editingId ? 'Update Student' : 'Save Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
              )}

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name, ID, email..."
                      className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold outline-none focus:border-blue-500"
                  >
                    {batches.map((batch) => (
                      <option key={batch}>{batch}</option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                      <tr>
                        <th className="px-5 py-4">ID</th>
                        <th className="px-5 py-4">Name</th>
                        <th className="px-5 py-4">Sport</th>
                        <th className="px-5 py-4">Batch</th>
                        <th className="px-5 py-4">Phone</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">BMI</th>
                        <th className="px-5 py-4">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="px-5 py-16 text-center text-slate-500">
                            Loading students...
                          </td>
                        </tr>
                      ) : filteredStudents.length ? (
                        filteredStudents.map((student, index) => (
                          <tr key={student._id} className="border-b border-slate-100">
                            <td className="px-5 py-4 font-bold">
                              STU{String(index + 1).padStart(3, '0')}
                            </td>
                            <td className="px-5 py-4 font-bold">{student.name}</td>
                            <td className="px-5 py-4">{student.sport}</td>
                            <td className="px-5 py-4">{student.batch}</td>
                            <td className="px-5 py-4">{student.phone || '—'}</td>
                            <td className="px-5 py-4">{student.feeStatus || 'Pending'}</td>
                            <td className="px-5 py-4">—</td>
                            <td className="px-5 py-4">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => editStudent(student)}
                                  className="font-bold text-blue-600"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteStudent(student._id)}
                                  className="font-bold text-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-5 py-20 text-center text-slate-500">
                            No students yet. Add your first student to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <PaginationControls pagination={pagination} onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))} />
            </>
          ) : null}

          {activeTab === 'Attendance' ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  <input
                    type="month"
                    defaultValue="2026-05"
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <select className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500">
                    <option>Select student</option>
                    {students.map((student) => (
                      <option key={student._id}>{student.name}</option>
                    ))}
                  </select>

                  <select className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500">
                    <option>Batch</option>
                    {batches
                      .filter((batch) => batch !== 'All Batches')
                      .map((batch) => (
                        <option key={batch}>{batch}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-black">
                    Quick Mark — {new Date(attendanceDate).toLocaleDateString('en-GB')}
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    <button
                      onClick={markAllPresent}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-bold hover:bg-slate-50"
                    >
                      <CheckCircle2 size={18} />
                      All Present
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 border-b border-slate-200 pb-3 font-bold text-slate-500">
                  <p>Student</p>
                  <p>Batch</p>
                  <p>Status</p>
                  <p>Action</p>
                </div>

                {students.length ? (
                  <div className="divide-y divide-slate-100">
                    {students.map((student) => (
                      <div key={student._id} className="grid grid-cols-4 py-4">
                        <p className="font-bold">{student.name}</p>
                        <p>{student.batch}</p>
                        <p className="text-slate-500">Not marked</p>
                        <div className="flex gap-2">
                          <button className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white">
                            Present
                          </button>
                          <button className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                            Absent
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500">
                    No students available to mark attendance.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activeTab === 'Fees' ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <MetricCard
                  title="Collected"
                  value={`₹${(feeMetrics.collected / 1000).toFixed(0)}K`}
                  label="Paid"
                  color="cyan"
                />

                <MetricCard
                  title="Pending"
                  value={`₹${(feeMetrics.pending / 1000).toFixed(0)}K`}
                  label="Due"
                  color="amber"
                />

                <MetricCard
                  title="Collection Rate"
                  value={`${feeMetrics.collectionRate}%`}
                  label="Rate"
                  color="blue"
                />

                <MetricCard
                  title="Overdue"
                  value={feeMetrics.overdue}
                  label="Action"
                  color="red"
                />
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-500">
                  <p>Fee ID</p>
                  <p>Student</p>
                  <p>Amount</p>
                  <p>Type</p>
                  <p>Due Date</p>
                  <p>Status</p>
                </div>

                {students.length ? (
                  <div className="divide-y divide-slate-100">
                    {students.map((student, index) => (
                      <div
                        key={student._id}
                        className="grid grid-cols-6 px-5 py-4 text-sm"
                      >
                        <p className="font-bold text-slate-600">
                          FEE{String(index + 1).padStart(3, '0')}
                        </p>

                        <p className="font-bold text-slate-900">
                          {student.name}
                        </p>

                        <p>
                          ₹
                          {Number(student.monthlyFee || 0).toLocaleString(
                            'en-IN',
                          )}
                        </p>

                        <p>Monthly Fee</p>

                        <p>{new Date().toLocaleDateString('en-GB')}</p>

                        <p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              student.feeStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {student.feeStatus || 'Pending'}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-lg text-slate-500">
                    No fees yet. Click &quot;Generate Fees&quot; to create.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activeTab === 'Progress' ? (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-4">
      <MetricCard
        title="Cards Generated"
        value="0"
        label="Progress"
        color="blue"
      />

      <MetricCard
        title="Avg Rating"
        value="0/5"
        label="Rating"
        color="cyan"
      />

      <MetricCard
        title="Pending Assessment"
        value="0"
        label="Pending"
        color="blue"
      />

      <MetricCard
        title="Total Students"
        value={students.length}
        label="Students"
        color="amber"
      />
    </div>

    <div className="flex justify-end">
      <button
        onClick={() => showToast('Progress card feature coming soon')}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700"
      >
        <Award size={18} />
        Add Progress Card
      </button>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-black text-slate-900">
        Student Progress Cards
      </h3>

      <p className="mt-2 text-slate-500">
        Click on a card below to view detailed Digital Athlete ID
      </p>

      <div className="flex min-h-[230px] items-center justify-center text-center">
        <p className="text-lg text-slate-500">
          No progress cards yet. Add your first assessment.
        </p>
      </div>
    </div>
  </div>
) : null}
        </section>
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  label,
  color,
}: {
  title: string;
  value: string | number;
  label: string;
  color: 'cyan' | 'amber' | 'red' | 'blue';
}) {
  const styles = {
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${styles[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">{title}</p>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black">
          {label}
        </span>
      </div>
      <h3 className="mt-5 text-3xl font-black">{value}</h3>
    </div>
  );
}
