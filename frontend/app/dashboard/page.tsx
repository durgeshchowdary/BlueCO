'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ElementType } from 'react';
import {
  CalendarDays,
  ClipboardCheck,
  IndianRupee,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';

import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Loading from '../../components/Loading';
import api from '../../lib/api';

const RevenueBarChart = dynamic(
  () => import('../../components/RevenueBarChart'),
  { ssr: false },
);

type SummaryData = {
  totalStudents?: number;
  activeCoaches?: number;
  totalBatches?: number;
  pendingFees?: number;
  monthlyRevenue?: number;
  todayAttendancePercentage?: number;
  revenueHistory?: { month: string; amount: number }[];
  recentPayments?: {
    _id: string;
    studentName: string;
    amount: number;
    status: string;
    month: string;
  }[];
  upcomingEventsList?: {
    _id: string;
    title: string;
    sport: string;
    date: string;
    location: string;
  }[];
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const [academyName, setAcademyName] = useState('Vijayawada Blues');

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');

    if (!isAuth) {
      window.location.href = '/login';
      return;
    }

    const settings = localStorage.getItem('academySettings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        if (parsed?.academyName) setAcademyName(parsed.academyName);
      } catch {
        localStorage.removeItem('academySettings');
      }
    }

    const controller = new AbortController();

    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/summary', {
          signal: controller.signal,
        });
        setSummary(response.data || {});
      } catch {
        if (controller.signal.aborted) return;
        setSummary({});
      } finally {
        if (controller.signal.aborted) return;
        setLoading(false);
      }
    };

    fetchDashboard();

    return () => controller.abort();
  }, []);

  const stats = useMemo(() => {
    return {
      totalStudents: Number(summary?.totalStudents || 0),
      pendingFees: Number(summary?.pendingFees || 0),
      monthlyRevenue: Number(summary?.monthlyRevenue || 0),
      attendance: Number(summary?.todayAttendancePercentage || 0),
    };
  }, [summary]);

  const revenueChart = summary?.revenueHistory?.length
    ? summary.revenueHistory
    : [
        { month: 'Jan', amount: 0 },
        { month: 'Feb', amount: 0 },
        { month: 'Mar', amount: 0 },
        { month: 'Apr', amount: 0 },
        { month: 'May', amount: 0 },
      ];

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen bg-[#f8f5e8] text-slate-900">
      <Sidebar />

      <section className="lg:pl-[280px]">
        {showTrialBanner ? (
          <div className="flex items-center justify-center gap-4 bg-blue-600 px-6 py-2 text-white">
            <div className="flex items-center gap-2 text-sm font-bold md:text-base">
              <Zap size={16} className="fill-current" />
              Free trial: 14 days remaining
            </div>

            <Link href="/settings" className="rounded-full bg-white px-5 py-1 text-sm font-bold text-blue-700">
              Upgrade
            </Link>

            <button
              type="button"
              aria-label="Dismiss trial banner"
              onClick={() => setShowTrialBanner(false)}
              className="opacity-80 hover:opacity-100"
            >
              <X size={18} />
            </button>
          </div>
        ) : null}

        <Topbar academyName={academyName} />

        <section className="p-5 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
            <p className="mt-1 text-slate-500">
              Here&apos;s what&apos;s happening at your academy today.
            </p>
          </div>

          <div className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              subtitle={`${stats.totalStudents} active`}
              icon={Users}
              color="blue"
            />

            <StatCard
              title="Attendance Today"
              value={`${stats.attendance}%`}
              subtitle="Present rate"
              icon={CalendarDays}
              color="cyan"
            />

            <StatCard
              title="Fees Pending"
              value={stats.pendingFees}
              subtitle="Students pending"
              icon={IndianRupee}
              color="amber"
            />

            <StatCard
              title="Monthly Revenue"
              value={`₹${(stats.monthlyRevenue / 1000).toFixed(1)}K`}
              subtitle="Collected"
              icon={TrendingUp}
              color="violet"
            />
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            <Link
              href="/students"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700"
            >
              <UserPlus size={18} />
              Add Student
            </Link>

            <Link
              href="/students?tab=attendance"
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-cyan-700"
            >
              <ClipboardCheck size={18} />
              Mark Attendance
            </Link>

            <Link
              href="/events?openModal=true"
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-violet-700"
            >
              <Plus size={18} />
              Create Event
            </Link>

            <Link
              href="/payments"
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-amber-700"
            >
              <IndianRupee size={18} />
              Add Expense
            </Link>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-xl font-black text-slate-900">
                Revenue Trend
              </h3>

              <div className="h-[340px]">
                <RevenueBarChart data={revenueChart} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-xl font-black text-slate-900">
                Recent Activity
              </h3>

              {summary?.recentPayments?.length ? (
                <div className="space-y-4">
                  {summary.recentPayments.slice(0, 5).map((payment) => (
                    <div
                      key={payment._id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <p className="font-bold text-slate-900">
                        {payment.studentName}
                      </p>
                      <p className="text-sm text-slate-500">
                        ₹{payment.amount} • {payment.month} • {payment.status}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[250px] items-center justify-center text-slate-500">
                  No recent activity yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-xl font-black text-slate-900">
              Upcoming Events
            </h3>

            {summary?.upcomingEventsList?.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {summary.upcomingEventsList.slice(0, 6).map((event) => (
                  <div
                    key={event._id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <p className="font-black text-slate-900">{event.title}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {event.sport} • {event.location}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[160px] items-center justify-center text-slate-500">
                No upcoming events.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ElementType;
  color: 'blue' | 'cyan' | 'amber' | 'violet';
}) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    cyan: 'bg-cyan-50 text-cyan-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-4 text-3xl font-black text-slate-900">{value}</h3>
        </div>

        <div className={`rounded-2xl p-3 ${styles[color]}`}>
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
