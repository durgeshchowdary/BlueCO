'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ElementType } from 'react';
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  IndianRupee,
  Pencil,
  Play,
  Search,
  Trash2,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import PaginationControls from '../../components/PaginationControls';
import api from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';
import { csvValue, missingFields, parseCSVFile } from '../../lib/csv';
import { downloadCSV } from '../../lib/utils';

type Coach = {
  _id: string;
  name: string;
  sport: string;
  phone: string;
  salary: number;
  status: 'Active' | 'Inactive';
};

type CoachForm = {
  name: string;
  sport: string;
  phone: string;
  salary: string;
  status: 'Active' | 'Inactive';
};

type Tab = 'Employees' | 'Payroll' | 'Leaves' | 'Attendance';

const emptyForm: CoachForm = {
  name: '',
  sport: '',
  phone: '',
  salary: '',
  status: 'Active',
};

const defaultPagination = { page: 1, limit: 25, total: 0, totalPages: 1 };

export default function CoachesPage() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [form, setForm] = useState<CoachForm>(emptyForm);
  const [activeTab, setActiveTab] = useState<Tab>('Employees');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pagination, setPagination] = useState(defaultPagination);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchCoaches = useCallback(async (page = 1, signal?: AbortSignal) => {
    try {
      setLoading(true);
      setLoadError('');
      const res = await api.get('/coaches', {
        params: { page, limit: pagination.limit },
        signal,
      });
      const items = Array.isArray(res.data?.data) ? res.data.data : res.data;
      setCoaches(Array.isArray(items) ? items : []);
      setPagination(res.data?.pagination || defaultPagination);
    } catch {
      if (signal?.aborted) return;
      setLoadError('We could not load employees. Check the backend connection and retry.');
      showToast('We could not load employees. Please retry.');
      setCoaches([]);
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
    fetchCoaches(pagination.page, controller.signal);

    return () => controller.abort();
  }, [fetchCoaches, pagination.page, router]);

  const departments = useMemo(() => {
    return [
      'All Departments',
      ...Array.from(new Set(coaches.map((coach) => coach.sport).filter(Boolean))),
    ];
  }, [coaches]);

  const filteredCoaches = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return coaches.filter((coach) => {
      const matchesSearch =
        coach.name?.toLowerCase().includes(query) ||
        coach.sport?.toLowerCase().includes(query) ||
        coach.phone?.toLowerCase().includes(query);

      const matchesDepartment =
        departmentFilter === 'All Departments' || coach.sport === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [coaches, searchQuery, departmentFilter]);

  const metrics = useMemo(() => {
    const total = coaches.length;
    const active = coaches.filter((coach) => coach.status === 'Active').length;
    const payroll = coaches.reduce((sum, coach) => sum + Number(coach.salary || 0), 0);
    const avgSalary = total ? Math.round(payroll / total) : 0;

    return { total, active, payroll, avgSalary };
  }, [coaches]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.sport.trim() || !form.phone.trim()) {
      showToast('Please complete the required employee details.');
      return;
    }

    const payload = {
      name: form.name,
      sport: form.sport,
      phone: form.phone,
      salary: Number(form.salary || 0),
      status: form.status,
    };

    try {
      if (editingId) {
        await api.put(`/coaches/${editingId}`, payload);
        showToast('Employee profile updated.');
      } else {
        await api.post('/coaches', payload);
        showToast('Employee added to the team.');
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchCoaches(pagination.page);
    } catch {
      showToast('We could not save this employee. Please try again.');
    }
  };

  const closeEmployeeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (coach: Coach) => {
    setEditingId(coach._id);
    setForm({
      name: coach.name || '',
      sport: coach.sport || '',
      phone: coach.phone || '',
      salary: String(coach.salary || ''),
      status: coach.status || 'Active',
    });
    setShowForm(true);
    setActiveTab('Employees');
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/coaches/${deleteId}`);
      showToast('Employee profile deleted.');
      setDeleteId(null);
      fetchCoaches(pagination.page);
    } catch {
      showToast('We could not delete this employee. Please try again.');
    }
  };

  const exportCSV = () => {
    const header = ['ID', 'Name', 'Role', 'Department', 'Phone', 'Salary', 'Status'];
    const rows = coaches.map((coach, index) => [
      index + 1,
      coach.name,
      'Coach',
      coach.sport,
      coach.phone,
      coach.salary,
      coach.status,
    ]);

    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'out-play-hrms-employees.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const downloadCoachSample = () => {
    downloadCSV(
      [
        {
          name: 'Vikram Shah',
          sport: 'Cricket - U14 Batch',
          phone: '+91 98765 43210',
          salary: 45000,
          status: 'Active',
        },
      ],
      'employees-import-sample.csv',
    );
  };

  const importCoaches = async (file: File) => {
    try {
      setImporting(true);
      const rows = await parseCSVFile(file);
      const invalidRow = rows.findIndex((row) => missingFields(row, ['name', 'sport', 'phone', 'salary']).length > 0);
      if (invalidRow >= 0) {
        showToast(`Row ${invalidRow + 2} is missing required employee fields.`);
        return;
      }

      const payload = rows.map((row) => ({
        name: csvValue(row, 'name'),
        sport: csvValue(row, 'sport'),
        phone: csvValue(row, 'phone'),
        salary: Number(csvValue(row, 'salary')),
        status: csvValue(row, 'status') === 'Inactive' ? 'Inactive' : 'Active',
      }));

      if (payload.some((row) => !Number.isFinite(row.salary) || row.salary < 0)) {
        showToast('Salary must be a valid number.');
        return;
      }

      const response = await api.post('/coaches/import', { rows: payload });
      showToast(`Imported ${response.data.inserted} employees. Skipped ${response.data.skipped} duplicates.`);
      fetchCoaches(1);
      setPagination((prev) => ({ ...prev, page: 1 }));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'We could not import employees. Please check the CSV and retry.');
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f5e8] text-slate-900">
      <Sidebar />

      {toast ? (
        <div className="fixed right-6 top-6 z-[999] rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      ) : null}

      {deleteId ? (
        <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h3 className="text-xl font-bold">Delete employee?</h3>
            <p className="mt-2 text-slate-500">This action cannot be undone.</p>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-200 px-5 py-2 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-red-500 px-5 py-2 font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="lg:pl-[280px]">
        <Topbar />

        <section className="p-5 md:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">HRMS</h1>
              <p className="mt-1 text-lg text-slate-500">{coaches.length} employees</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportCSV}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-slate-50"
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
                  if (file) importCoaches(file);
                }}
              />

              <button type="button" onClick={() => importInputRef.current?.click()} disabled={importing} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                <Upload size={17} />
                {importing ? 'Importing...' : 'Import CSV'}
              </button>

              <button type="button" onClick={downloadCoachSample} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-slate-50">
                <Download size={17} />
                Sample CSV
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                  setShowForm(true);
                  setActiveTab('Employees');
                }}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700"
              >
                <UserPlus size={17} />
                Add Employee
              </button>
            </div>
          </div>

          <div className="mb-5 flex w-fit items-center gap-1 rounded-2xl bg-slate-100 p-1">
            {[
              { label: 'Employees' as Tab, icon: Briefcase },
              { label: 'Payroll' as Tab, icon: IndianRupee },
              { label: 'Leaves' as Tab, icon: CalendarDays },
              { label: 'Attendance' as Tab, icon: CalendarDays },
            ].map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.label}
                  type="button"
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

          {activeTab === 'Employees' ? (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-4">
                <MetricCard title="Employees" value={metrics.total} label="Active" color="cyan" />
                <MetricCard title="Coaches" value={metrics.active} label="0%" color="blue" />
                <MetricCard title="Payroll" value={`₹${(metrics.payroll / 1000).toFixed(0)}K`} label="Monthly" color="amber" />
                <MetricCard title="Avg Salary" value={`₹${(metrics.avgSalary / 1000).toFixed(0)}K`} label="Average" color="violet" />
              </div>

              {showForm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
                  <div className="w-full max-w-2xl rounded-[32px] bg-[#f8f5e8] p-8 shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-2xl font-black text-slate-900">
                        {editingId ? 'Edit Employee' : 'Add New Employee'}
                      </h2>
                      <button 
                        type="button"
                        aria-label="Close employee form"
                        onClick={closeEmployeeForm}
                        className="rounded-full p-2 hover:bg-slate-200 transition"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 ml-1">Full Name *</label>
                        <input required placeholder="Vikram Shah" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 ml-1">Department / Sport *</label>
                        <input required placeholder="Cricket - U14 Batch" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 ml-1">Phone *</label>
                        <input required placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 ml-1">Salary</label>
                        <input type="number" placeholder="45000" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm" />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 shadow-sm">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="flex gap-3 mt-4 md:col-span-2">
                        <button
                          type="button"
                          onClick={closeEmployeeForm}
                          className="flex-1 rounded-2xl border border-slate-200 bg-white py-4 font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-[2] rounded-2xl bg-blue-600 py-4 font-black text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                        >
                          {editingId ? 'Update Employee' : 'Save Employee'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-4 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, role, phone..."
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold outline-none focus:border-blue-500"
                  >
                    {departments.map((department) => (
                      <option key={department}>{department}</option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                      <tr>
                        <th className="px-5 py-4">ID</th>
                        <th className="px-5 py-4">Name</th>
                        <th className="px-5 py-4">Role</th>
                        <th className="px-5 py-4">Department</th>
                        <th className="px-5 py-4">Salary</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-16 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-3">
                              <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                              <span className="text-sm font-bold">Loading employees...</span>
                            </div>
                          </td>
                        </tr>
                      ) : loadError ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center gap-4 text-slate-500">
                              <p className="font-bold text-slate-700">{loadError}</p>
                              <button
                                type="button"
                                onClick={() => fetchCoaches(pagination.page)}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                              >
                                Retry
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : filteredCoaches.length ? (
                        filteredCoaches.map((coach, index) => (
                          <tr key={coach._id} className="border-b border-slate-100 text-sm hover:bg-slate-50">
                            <td className="px-5 py-4 font-bold text-slate-500">
                              EMP{String(index + 1).padStart(3, '0')}
                            </td>
                            <td className="px-5 py-4 font-bold text-slate-900">{coach.name}</td>
                            <td className="px-5 py-4">Coach</td>
                            <td className="px-5 py-4">{coach.sport}</td>
                            <td className="px-5 py-4">₹{Number(coach.salary || 0).toLocaleString('en-IN')}</td>
                            <td className="px-5 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-bold ${coach.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                {coach.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <button type="button" aria-label={`Edit ${coach.name}`} onClick={() => handleEdit(coach)} className="rounded-xl bg-blue-50 p-2 text-blue-700 hover:bg-blue-100">
                                  <Pencil size={16} />
                                </button>
                                <button type="button" aria-label={`Delete ${coach.name}`} onClick={() => setDeleteId(coach._id)} className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-5 py-20 text-center text-slate-500">
                            No employees found.
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

          {activeTab === 'Payroll' ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <MetricCard title="Paid This Period" value="0/0" label="Processed" color="cyan" />
                <MetricCard title="Total Disbursed" value="₹0K" label="Payroll" color="blue" />
                <MetricCard title="Bonuses" value="₹0K" label="Bonus" color="amber" />
                <MetricCard title="Pending Approval" value="0" label="Pending" color="violet" />
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-3">
                  <select className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold outline-none focus:border-blue-500">
                    <option>May</option>
                    <option>June</option>
                    <option>July</option>
                  </select>

                  <input value="2026" readOnly className="w-32 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold outline-none" />

                  <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold hover:bg-slate-50">
                    <Clock size={17} />
                    Refresh from Attendance
                  </button>
                </div>

                <button type="button" onClick={() => showToast('Payroll generation coming soon')} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-blue-700">
                  <Play size={17} />
                  Run Payroll
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-500">
                  <p>Employee</p>
                  <p>Period</p>
                  <p>Attendance</p>
                  <p>Base</p>
                  <p>Bonus</p>
                  <p>Deductions</p>
                  <p>Net</p>
                  <p>Status</p>
                </div>

                <div className="py-20 text-center text-lg text-slate-500">
                  No payroll records. Click &quot;Run Payroll&quot; to generate.
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'Leaves' ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <MetricCard title="Pending Approval" value="0" label="Pending" color="blue" />
                <MetricCard title="Approved" value="0" label="Approved" color="cyan" />
                <MetricCard title="Total Days Used" value="0" label="Used" color="amber" />
                <MetricCard title="Rejected" value="0" label="Rejected" color="red" />
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => showToast('Leave application feature coming soon')} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700">
                  <CalendarDays size={18} />
                  Apply Leave
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-500">
                  <p>Employee</p>
                  <p>Type</p>
                  <p>Dates</p>
                  <p>Days</p>
                  <p>Status</p>
                </div>

                <div className="py-20 text-center text-lg text-slate-500">
                  No leave requests.
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'Attendance' ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-5">
                <MetricCard title="Present" value="0" label="Today" color="cyan" />
                <MetricCard title="Absent" value="0" label="Today" color="red" />
                <MetricCard title="Late" value="0" label="Today" color="amber" />
                <MetricCard title="Leave" value="0" label="Today" color="blue" />
                <MetricCard title="Half-Day" value="0" label="Today" color="violet" />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  <input type="month" defaultValue="2026-05" className="rounded-xl border border-slate-200 bg-white px-5 py-3 outline-none focus:border-blue-500" />

                  <select className="rounded-xl border border-slate-200 bg-white px-5 py-3 outline-none focus:border-blue-500">
                    <option>Select Employee</option>
                    {coaches.map((coach) => (
                      <option key={coach._id}>{coach.name}</option>
                    ))}
                  </select>

                  <select className="rounded-xl border border-slate-200 bg-white px-5 py-3 outline-none focus:border-blue-500">
                    <option>All Departments</option>
                    {departments
                      .filter((department) => department !== 'All Departments')
                      .map((department) => (
                        <option key={department}>{department}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-black">Quick Mark — 09/05/2026</h3>

                  <div className="flex flex-wrap gap-3">
                    <input type="date" defaultValue="2026-05-09" className="rounded-xl border border-slate-200 bg-white px-5 py-3 outline-none focus:border-blue-500" />

                    <button type="button" onClick={() => showToast('All employees marked present')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold hover:bg-slate-50">
                      <CheckCircle2 size={18} />
                      All Present
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-6 border-b border-slate-200 pb-3 font-bold text-slate-500">
                  <p>ID</p>
                  <p>Employee</p>
                  <p>Role</p>
                  <p>Dept</p>
                  <p>Status</p>
                  <p>Action</p>
                </div>

                {coaches.length ? (
                  <div className="divide-y divide-slate-100">
                    {coaches.map((coach, index) => (
                      <div key={coach._id} className="grid grid-cols-6 py-4 text-sm">
                        <p className="font-bold text-slate-600">
                          EMP{String(index + 1).padStart(3, '0')}
                        </p>
                        <p className="font-bold text-slate-900">{coach.name}</p>
                        <p>Coach</p>
                        <p>{coach.sport}</p>
                        <p className="text-slate-500">Not marked</p>
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">
                            Present
                          </button>
                          <button className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                            Absent
                          </button>
                          <button className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-600">
                            Late
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500">
                    No employees available to mark attendance.
                  </div>
                )}
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
  color: 'cyan' | 'blue' | 'amber' | 'violet' | 'red';
}) {
  const styles = {
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    red: 'border-red-200 bg-red-50 text-red-700',
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
