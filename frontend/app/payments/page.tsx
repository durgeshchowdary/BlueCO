'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Download, 
  Filter, 
  Plus, 
  Search, 
  X, 
  Zap,
  Wallet,
  Pencil,
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Upload,
} from 'lucide-react';

import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import FormInput from '../../components/FormInput';
import DataTable from '../../components/DataTable';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import ToastContainer from '../../components/ToastContainer';
import Modal from '../../components/Modal';
import PaginationControls from '../../components/PaginationControls';
import { downloadCSV } from '../../lib/utils';
import { csvValue, missingFields, parseCSVFile } from '../../lib/csv';
import api from '../../lib/api';

const FinanceAreaChart = dynamic(
  () => import('../../components/FinanceAreaChart'),
  { ssr: false },
);

interface PaymentRecord {
  _id: string;
  studentName: string;
  amount: number;
  status: string;
  month: string;
  paidAt: string;
}

const initialPayment = { studentName: '', amount: 0, status: 'Paid', month: '', paidAt: '' };
const defaultPagination = { page: 1, limit: 25, total: 0, totalPages: 1 };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [form, setForm] = useState(initialPayment);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authorized, setAuthorized] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const [pagination, setPagination] = useState(defaultPagination);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchPayments = useCallback(async (page = 1, signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await api.get('/payments', {
        params: { page, limit: pagination.limit },
        signal,
      });
      const items = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setPayments(
        items.map((item: any) => ({
          ...item,
          paidAt: new Date(item.paidAt).toLocaleDateString(),
        }))
      );
      setPagination(response.data?.pagination || defaultPagination);
    } catch {
      if (signal?.aborted) return;
      setToast({ message: 'We could not load payment records. Please retry.', type: 'error' });
    } finally {
      if (signal?.aborted) return;
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      window.location.href = '/login';
      return;
    }

    const controller = new AbortController();
    setAuthorized(true);
    fetchPayments(pagination.page, controller.signal);

    return () => controller.abort();
  }, [fetchPayments, pagination.page]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.studentName) nextErrors.studentName = 'Student name is required.';
    if (!form.month) nextErrors.month = 'Month is required.';
    if (!form.amount || form.amount <= 0) nextErrors.amount = 'Amount must be greater than 0.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      setToast({ message: 'Please complete the required payment details.', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/payments/${editingId}`, { ...form, paidAt: new Date(form.paidAt || new Date()) });
        setToast({ message: 'Payment record updated.', type: 'success' });
      } else {
        await api.post('/payments', { ...form, paidAt: new Date(form.paidAt || new Date()) });
        setToast({ message: 'Payment recorded for the selected student.', type: 'success' });
      }
      closePaymentModal();
      fetchPayments(pagination.page);
    } catch {
      setToast({ message: `We could not ${editingId ? 'update' : 'record'} this payment. Please try again.`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const closePaymentModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setForm(initialPayment);
    setErrors({});
  };

  const handleEdit = (payment: PaymentRecord) => {
    setEditingId(payment._id);
    setShowAddModal(true);
    setForm({
      studentName: payment.studentName,
      amount: payment.amount,
      status: payment.status,
      month: payment.month,
      paidAt: new Date(payment.paidAt).toISOString().substring(0, 10),
    });
    setErrors({});
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/payments/${deleteTarget.id}`);
      setToast({ message: 'Payment record deleted.', type: 'success' });
      setDeleteTarget(null);
      fetchPayments(pagination.page);
    } catch {
      setToast({ message: 'We could not delete this payment. Please try again.', type: 'error' });
    }
  };

  const metrics = useMemo(() => {
    const totalRevenue = payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = 0; // Placeholder as no expense model exists
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      netProfit
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch = [payment.studentName, payment.status, payment.month, payment.paidAt]
        .join(' ')
        .toLowerCase()
        .includes(query);
      const matchesStatus = statusFilter ? payment.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  const chartData = useMemo(
    () =>
      payments.map((payment) => ({
        month: payment.month,
        revenue: payment.status === 'Paid' ? payment.amount : 0,
        expenses: 0,
      })),
    [payments],
  );

  const paymentRows = useMemo(
    () =>
      filteredPayments.map((payment) => ({
        id: payment._id,
        ID: payment._id.substring(payment._id.length - 6).toUpperCase(),
        studentName: payment.studentName,
        amount: `₹${payment.amount.toLocaleString()}`,
        status: (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
              payment.status === 'Paid'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            {payment.status}
          </span>
        ),
        month: payment.month,
        paidAt: new Date(payment.paidAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        raw: payment,
      })),
    [filteredPayments],
  );

  const exportData = () => {
    if (!filteredPayments.length) {
      setToast({ message: 'No payments available to export.', type: 'info' });
      return;
    }
    downloadCSV(
      filteredPayments.map((payment) => ({
        Student: payment.studentName,
        Amount: payment.amount,
        Status: payment.status,
        Month: payment.month,
        PaidAt: payment.paidAt,
      })),
      'payments.csv'
    );
  };

  const downloadPaymentSample = () => {
    downloadCSV(
      [
        {
          studentName: 'Aarav Sharma',
          amount: 2500,
          status: 'Paid',
          month: 'May 2026',
          paidAt: '2026-05-09',
        },
      ],
      'payments-import-sample.csv',
    );
  };

  const importPayments = async (file: File) => {
    try {
      setImporting(true);
      const rows = await parseCSVFile(file);
      const invalidRow = rows.findIndex((row) => missingFields(row, ['studentName', 'amount', 'status', 'month']).length > 0);
      if (invalidRow >= 0) {
        setToast({ message: `Row ${invalidRow + 2} is missing required payment fields.`, type: 'error' });
        return;
      }

      const payload = rows.map((row) => ({
        studentName: csvValue(row, 'studentName'),
        amount: Number(csvValue(row, 'amount')),
        status: csvValue(row, 'status') === 'Pending' ? 'Pending' : 'Paid',
        month: csvValue(row, 'month'),
        paidAt: csvValue(row, 'paidAt'),
      }));

      if (payload.some((row) => !Number.isFinite(row.amount) || row.amount <= 0)) {
        setToast({ message: 'Amount must be a valid number greater than 0.', type: 'error' });
        return;
      }

      const response = await api.post('/payments/import', { rows: payload });
      setToast({ message: `Imported ${response.data.inserted} payments. Skipped ${response.data.skipped} duplicates.`, type: 'success' });
      fetchPayments(1);
      setPagination((prev) => ({ ...prev, page: 1 }));
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'We could not import payments. Please check the CSV and retry.', type: 'error' });
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

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
              <button type="button" onClick={() => setToast({ message: 'Plan upgrade is ready to connect to billing.', type: 'info' })} className="rounded-md bg-white px-3 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-50">
                Upgrade Plan
              </button>
              <button type="button" aria-label="Dismiss trial banner" onClick={() => setShowTrialBanner(false)} className="opacity-70 hover:opacity-100">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <Topbar />

        <section className="p-8">
          {/* Page Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Finance</h1>
              <p className="mt-1 font-medium text-slate-500">Track revenue, expenses, and profitability</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setToast({ message: 'Expense tracking is ready to connect to your expense model.', type: 'info' })} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
                <Plus size={18} /> Add Expense
              </button>
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm(initialPayment); setErrors({}); setShowAddModal(true); }}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                <Plus size={18} /> Add Payment
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex border-b border-slate-200">
            {['Overview', 'Expenses', 'AI Insights', 'Data Maintenance'].map((tab) => (
              <button
                key={tab}
                // onClick={() => setActiveTab(tab)} // Implement if needed
                className={`px-6 py-3 text-sm font-bold transition-all ${
                  tab === 'Overview' // Default to 'Overview' for now
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Metric Cards */}
          <div className="mb-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { label: 'Total Revenue', value: `₹${metrics.totalRevenue.toLocaleString()}`, color: 'text-emerald-600', icon: TrendingUp },
              { label: 'Total Expenses', value: `₹${metrics.totalExpenses.toLocaleString()}`, color: 'text-red-600', icon: TrendingDown },
              { label: 'Net Profit', value: `₹${metrics.netProfit.toLocaleString()}`, color: 'text-violet-600', icon: DollarSign },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[24px] bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color.replace('text-', 'bg-')}/10 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <h3 className={`mt-1 text-2xl font-black ${stat.color}`}>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-8 lg:grid-cols-2 mb-10">
            <div className="rounded-[28px] bg-white p-8 shadow-sm border border-slate-100">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Revenue vs Expenses Trend</h3>
                <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-2 py-1 outline-none">
                  <option>Last 6 Months</option>
                </select>
              </div>
              <div className="h-72">
                <FinanceAreaChart data={chartData} />
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-8 shadow-sm border border-slate-100">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Expense Breakdown</h3>
                <button type="button" onClick={() => setToast({ message: 'Expense breakdown will appear after expenses are connected.', type: 'info' })} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
              </div>
              <div className="p-20 flex flex-col items-center">
                <DollarSign size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">No expenses recorded yet.</p>
                <button type="button" onClick={() => setToast({ message: 'Expense tracking is ready to connect to your expense model.', type: 'info' })} className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
                  <Plus size={18} /> Add First Expense
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Row */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, month, status..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <Filter size={16} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-600 outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Paid">Paid Only</option>
                  <option value="Pending">Pending Only</option>
                </select>
              </div>
              <button
                type="button"
                onClick={exportData}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Download size={18} /> Export CSV
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) importPayments(file);
                }}
              />
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                disabled={importing}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload size={18} /> {importing ? 'Importing...' : 'Import CSV'}
              </button>
              <button
                type="button"
                onClick={downloadPaymentSample}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Download size={18} /> Sample CSV
              </button>
            </div>
          </div>

          {/* Payment Table */}
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <Loading />
            ) : filteredPayments.length > 0 ? (
              <DataTable
                columns={['ID', 'studentName', 'amount', 'status', 'month', 'paidAt']}
                rows={paymentRows}
                renderActions={(row) => (
                  <>
                    <button
                      type="button"
                      aria-label={`Edit payment for ${row.raw.studentName}`}
                      onClick={() => handleEdit(row.raw)}
                      className="rounded-xl bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition"
                    >
                      <Pencil size={16} />
                    </button>
                  </>
                )}
                onDelete={(id) => {
                  const payment = payments.find((item) => item._id === id);
                  if (payment) setDeleteTarget({ id, label: payment.studentName });
                }}
                emptyMessage="No payments recorded yet."
              />
            ) : (
              <div className="p-20 flex flex-col items-center">
                <Wallet size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">No payments recorded yet.</p>
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setForm(initialPayment); setErrors({}); setShowAddModal(true); }}
                  className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                  <Plus size={18} /> Record First Payment
                </button>
              </div>
            )}
          </div>
          <PaginationControls pagination={pagination} onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))} />

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900">{editingId ? 'Edit Payment Record' : 'Add New Payment Record'}</h2>
                  <button type="button" aria-label="Close payment form" onClick={closePaymentModal} className="rounded-full p-2 hover:bg-slate-100 text-slate-400">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FormInput label="Student Name" name="studentName" value={form.studentName} onChange={handleChange} placeholder="e.g. Aarav Sharma" required />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="Amount (₹)" name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="e.g. 5000" required />
                    <FormInput label="Month" name="month" value={form.month} onChange={handleChange} placeholder="e.g. May 2026" required />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput
                      label="Status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      inputType="select"
                      options={['Paid', 'Pending']}
                    />
                    <FormInput label="Paid At" name="paidAt" type="date" value={form.paidAt} onChange={handleChange} />
                  </div>
                  {Object.keys(errors).length > 0 && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
                      {Object.values(errors).map((err) => <p key={err}>{err}</p>)}
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closePaymentModal}
                      disabled={saving}
                      className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? 'Saving...' : editingId ? 'Update Record' : 'Record Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <Modal
            title={`Delete ${deleteTarget?.label ?? 'payment'} record?`}
            description="This action cannot be undone. Confirm to remove the payment entry permanently."
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
