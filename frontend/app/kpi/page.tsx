'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  Target,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import api from '../../lib/api';

type SummaryData = {
  totalStudents?: number;
  activeCoaches?: number;
  pendingFees?: number;
  monthlyRevenue?: number;
  todayAttendancePercentage?: number;
  revenueHistory?: { month: string; amount: number }[];
  pendingFeeStudentsList?: { monthlyFee: number }[];
};

type KPIType = 'percent' | 'count';

type KPIItem = {
  name: string;
  target: number;
  targetLabel: string;
  actual: number;
  type: KPIType;
  forcedStatus?: 'On Track';
};

type StatusInfo = {
  label: 'Critical' | 'Needs Attention' | 'On Track';
  color: string;
  dot: string;
  icon: typeof AlertCircle;
};

export default function KPIPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(true);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');

    if (!isAuth) {
      window.location.href = '/login';
      return;
    }

    setAuthorized(true);

    const controller = new AbortController();

    const fetchSummary = async () => {
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

    fetchSummary();

    return () => controller.abort();
  }, []);

  const analytics = useMemo(() => {
    if (!summary) return null;

    const monthlyRevenue = Number(summary.monthlyRevenue || 0);
    const pendingAmount = (summary.pendingFeeStudentsList || []).reduce(
      (acc, curr) => acc + Number(curr.monthlyFee || 0),
      0,
    );

    const totalExpected = monthlyRevenue + pendingAmount;
    const collectionRate =
      totalExpected > 0 ? Math.round((monthlyRevenue / totalExpected) * 100) : 0;

    const history = summary.revenueHistory || [];
    const currentMonthRevenue = Number(history[history.length - 1]?.amount || 0);
    const previousMonthRevenue = Number(history[history.length - 2]?.amount || 0);

    const revenueGrowth =
      previousMonthRevenue > 0
        ? Math.round(
            ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
              100,
          )
        : 0;

    return {
      monthlyRevenue,
      pendingAmount,
      collectionRate,
      revenueGrowth,
      attendance: Number(summary.todayAttendancePercentage || 0),
      totalStudents: Number(summary.totalStudents || 0),
      activeCoaches: Number(summary.activeCoaches || 0),
    };
  }, [summary]);

  const kpis: KPIItem[] = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        name: 'Fee Collection',
        target: 75,
        targetLabel: '75%',
        actual: analytics.collectionRate,
        type: 'percent',
      },
      {
        name: 'Attendance',
        target: 85,
        targetLabel: '85%',
        actual: analytics.attendance,
        type: 'percent',
      },
      {
        name: 'Revenue Growth',
        target: 20,
        targetLabel: '20%',
        actual: analytics.revenueGrowth,
        type: 'percent',
      },
      {
        name: 'Active Students',
        target: analytics.totalStudents,
        targetLabel: String(analytics.totalStudents),
        actual: analytics.totalStudents,
        type: 'count',
        forcedStatus: 'On Track',
      },
      {
        name: 'Employee Count',
        target: 10,
        targetLabel: '10',
        actual: analytics.activeCoaches,
        type: 'count',
      },
    ];
  }, [analytics]);

  if (!authorized || loading) {
    return <Loading />;
  }

  if (!summary || !analytics) {
    return (
      <EmptyState
        title="No KPI data"
        description="Unable to compute performance indicators."
      />
    );
  }

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

            <button className="rounded-full bg-white px-5 py-1 text-sm font-bold text-blue-700">
              Upgrade
            </button>

            <button
              type="button"
              onClick={() => setShowTrialBanner(false)}
              className="opacity-80 hover:opacity-100"
              aria-label="Close trial banner"
            >
              <X size={18} />
            </button>
          </div>
        ) : null}

        <Topbar />

        <section className="p-5 md:p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                Executive KPI Dashboard
              </h1>
              <p className="mt-1 font-medium text-slate-500">
                5-second business snapshot
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>

          <div className="mb-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Revenue Collected"
              value={`₹${(analytics.monthlyRevenue / 1000).toFixed(1)}K`}
              subtitle={`₹${(analytics.pendingAmount / 1000).toFixed(1)}K pending`}
              icon={TrendingUp}
              color="text-emerald-600"
            />

            <MetricCard
              title="Collection Rate"
              value={`${analytics.collectionRate}%`}
              subtitle="Paid vs total"
              icon={Target}
              color="text-blue-600"
            />

            <MetricCard
              title="Attendance"
              value={`${analytics.attendance}%`}
              subtitle="Daily presence rate"
              icon={Activity}
              color="text-violet-600"
            />

            <MetricCard
              title="Revenue Growth"
              value={`${analytics.revenueGrowth}%`}
              subtitle="vs last month"
              icon={TrendingUp}
              color="text-cyan-600"
            />
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex items-center gap-3">
              <BarChart3 size={22} className="text-blue-600" />
              <h3 className="text-xl font-bold text-slate-800">
                Key Performance Indicators
              </h3>
            </div>

            <div className="space-y-4">
              {kpis.map((kpi) => {
                const status = kpi.forcedStatus
                  ? getForcedStatus()
                  : getStatus(kpi.actual, kpi.target, kpi.type);

                const Icon = status.icon;

                return (
                  <div
                    key={kpi.name}
                    className={`rounded-2xl border p-5 ${status.color}`}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <span
                          className={`h-3 w-3 rounded-full ${status.dot}`}
                        />

                        <div>
                          <p className="text-lg font-bold text-slate-900">
                            {kpi.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            Target: {kpi.targetLabel}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">
                          {kpi.type === 'percent'
                            ? `${kpi.actual}%`
                            : kpi.actual}
                        </p>

                        <div className="mt-1 flex items-center justify-end gap-1 text-sm font-semibold text-slate-500">
                          <Icon size={14} />
                          {status.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function getForcedStatus(): StatusInfo {
  return {
    label: 'On Track',
    color: 'border-emerald-200 bg-emerald-50',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  };
}

function getStatus(actual: number, target: number, type: KPIType): StatusInfo {
  if (type === 'percent') {
    if (actual < 50) {
      return {
        label: 'Critical',
        color: 'border-red-200 bg-red-50',
        dot: 'bg-red-500',
        icon: AlertCircle,
      };
    }

    if (actual < target) {
      return {
        label: 'Needs Attention',
        color: 'border-amber-200 bg-amber-50',
        dot: 'bg-amber-500',
        icon: Clock,
      };
    }

    return {
      label: 'On Track',
      color: 'border-emerald-200 bg-emerald-50',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
    };
  }

  if (actual < 5) {
    return {
      label: 'Critical',
      color: 'border-red-200 bg-red-50',
      dot: 'bg-red-500',
      icon: AlertCircle,
    };
  }

  if (actual < target) {
    return {
      label: 'Needs Attention',
      color: 'border-amber-200 bg-amber-50',
      dot: 'bg-amber-500',
      icon: Clock,
    };
  }

  return {
    label: 'On Track',
    color: 'border-emerald-200 bg-emerald-50',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  };
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-4 text-3xl font-black text-slate-900">{value}</h3>
        </div>

        <div className={`rounded-2xl bg-slate-50 p-3 ${color}`}>
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-3 text-sm font-medium text-slate-500">{subtitle}</p>
    </div>
  );
}
