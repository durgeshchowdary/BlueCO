"use client";

import { Suspense } from "react";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  ReceiptText,
  RefreshCw,
  Sparkles,
  Target,
  TriangleAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import api from "../../../lib/api";

type DashboardData = {
  totalAcademies: number;
  activeAcademies: number;
  trialAcademies: number;
  deactivatedAcademies: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  totalUsers: number;
  totalStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  openTickets: number;
  systemHealth: string;
  growth: any[];
  recentLogs: any[];
  recentAcademies: any[];
  generatedAt: string;
};

const money = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value || 0}`;
};

function SuperAdminDashboardContent() {
  const searchParams = useSearchParams();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get<DashboardData>("/super-admin/dashboard");
      setData(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to load live Super Admin dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/`;
      window.history.replaceState({}, "", "/super-admin/dashboard");
    }

    loadDashboard();
  }, [searchParams]);

  const progressPercent = useMemo(() => {
    if (!data) return 0;
    return Math.min((data.totalAcademies / 2000) * 100, 100);
  }, [data]);

  const stats = data
    ? [
        {
          label: "Academies",
          value: String(data.totalAcademies),
          icon: Building2,
          color: "text-teal-600",
        },
        {
          label: "MRR",
          value: money(data.monthlyRevenue),
          icon: TrendingUp,
          color: "text-emerald-600",
        },
        {
          label: "Students",
          value: String(data.totalStudents),
          icon: Users,
          color: "text-blue-600",
        },
        {
          label: "Open Tickets",
          value: String(data.openTickets),
          icon: Target,
          color: "text-purple-600",
        },
        {
          label: "Pending Payments",
          value: String(data.pendingPayments),
          sub: money(data.totalRevenue),
          icon: TriangleAlert,
          color: "text-red-500",
        },
        {
          label: "Trials",
          value: String(data.trialAcademies || data.trialSubscriptions),
          icon: Sparkles,
          color: "text-amber-500",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf0] px-6 py-6 text-[#0f172a]">
        <div className="flex items-center gap-3 rounded-2xl border bg-white p-5 font-bold text-[#00796b] shadow-sm">
          <RefreshCw className="animate-spin" size={18} />
          Loading live platform data...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#fffdf0] px-6 py-6 text-[#0f172a]">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <h2 className="font-black">Dashboard failed to load</h2>
          <p className="mt-2 text-sm">{error}</p>

          <button
            onClick={loadDashboard}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fffdf0] px-6 py-6 text-[#0f172a]">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-black leading-tight">
            Platform Dashboard
          </h1>
          <p className="mt-1 text-[14px] font-medium text-slate-500">
            Enterprise platform overview — live from MongoDB
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="flex h-10 items-center gap-2 rounded-xl border bg-white px-4 text-sm font-bold shadow-sm"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[14px] font-semibold">
            Progress to 2,000 Academies
          </p>
          <p className="text-[15px] font-black">
            {data.totalAcademies}/2,000 ({progressPercent.toFixed(1)}%)
          </p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[#c9dedc]">
          <div
            className="h-full rounded-full bg-teal-600"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-medium text-slate-500">
                  {stat.label}
                </p>
                <Icon size={17} className={stat.color} />
              </div>

              <p
                className={`text-[26px] font-black ${
                  stat.label === "Pending Payments"
                    ? "text-red-500"
                    : "text-slate-900"
                }`}
              >
                {stat.value}
              </p>

              {stat.sub && (
                <p className="mt-1 text-[12px] font-medium text-slate-500">
                  Total revenue: {stat.sub}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ReceiptText size={18} className="text-[#00796b]" />
            <h2 className="font-black">Recent Academies</h2>
          </div>

          <div className="space-y-3">
            {data.recentAcademies.length === 0 ? (
              <p className="text-sm text-slate-500">No academies found.</p>
            ) : (
              data.recentAcademies.map((academy: any) => (
                <div
                  key={academy._id}
                  className="flex items-center justify-between rounded-xl border bg-[#f8fbff] px-4 py-3"
                >
                  <div>
                    <p className="font-bold">{academy.name || "Unnamed Academy"}</p>
                    <p className="text-xs text-slate-500">
                      {academy.city || "No city"} • {academy.status || "unknown"}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#dff1ee] px-3 py-1 text-xs font-bold text-[#00796b]">
                    {academy.status || "active"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ReceiptText size={18} className="text-[#00796b]" />
            <h2 className="font-black">Recent Platform Logs</h2>
          </div>

          <div className="space-y-3">
            {data.recentLogs.length === 0 ? (
              <p className="text-sm text-slate-500">No logs found.</p>
            ) : (
              data.recentLogs.map((log: any) => (
                <div
                  key={log._id}
                  className="rounded-xl border bg-[#f8fbff] px-4 py-3"
                >
                  <p className="font-bold">
                    {log.action || log.event || "Platform activity"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {log.entity || "System"} •{" "}
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "No date"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Last synced: {new Date(data.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}


export default function SuperAdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <SuperAdminDashboardContent />
    </Suspense>
  );
}





