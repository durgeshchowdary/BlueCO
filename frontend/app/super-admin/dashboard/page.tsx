"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  ReceiptText,
  Sparkles,
  Target,
  TriangleAlert,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  { label: "Academies", value: "4", icon: Building2, color: "text-teal-600" },
  { label: "MRR", value: "₹0.4K", icon: TrendingUp, color: "text-emerald-600" },
  { label: "Students", value: "2", icon: Users, color: "text-blue-600" },
  { label: "Pipeline", value: "0", icon: Target, color: "text-purple-600" },
  {
    label: "Overdue",
    value: "0",
    sub: "₹0.0K",
    icon: TriangleAlert,
    color: "text-red-500",
  },
  {
    label: "Trials Ending",
    value: "2",
    icon: Sparkles,
    color: "text-amber-500",
  },
];

export default function SuperAdminDashboardPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/`;
      window.history.replaceState({}, "", "/super-admin/dashboard");
    }
  }, [searchParams]);

  return (
    <div className="w-full bg-[#fffdf0] px-6 py-6 text-[#0f172a]">
      <div className="mb-6">
        <h1 className="text-[26px] font-black leading-tight">
          Platform Dashboard
        </h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500">
          Enterprise platform overview
        </p>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[14px] font-semibold">
            Progress to 2,000 Academies
          </p>
          <p className="text-[15px] font-black">4/2,000 (0.2%)</p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[#c9dedc]">
          <div className="h-full w-[0.2%] rounded-full bg-teal-600" />
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
                  stat.label === "Overdue" ? "text-red-500" : "text-slate-900"
                }`}
              >
                {stat.value}
              </p>

              {stat.sub && (
                <p className="mt-1 text-[12px] font-medium text-slate-500">
                  {stat.sub}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_1.4fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-[16px] font-black">
            Academy Distribution
          </h3>

          <div className="space-y-3">
            {[
              ["bangalore", "2", "bg-teal-600"],
              ["Vijayawada", "1", "bg-teal-400"],
              ["Krishna", "1", "bg-slate-700"],
            ].map(([city, count, color]) => (
              <div key={city} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${color}`} />
                  <span className="text-[14px] font-medium">{city}</span>
                </div>
                <span className="text-[14px] font-black">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-[16px] font-black">Recent Activity</h3>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <ReceiptText size={17} />
            </div>

            <div>
              <p className="text-[14px] font-medium">
                OUTPLAY-INV001 - Vijayawada Blues Football Club ₹1178.82
              </p>

              <div className="mt-2 flex items-center gap-3">
                <span className="rounded-md bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-600">
                  pending
                </span>
                <span className="text-[12px] text-slate-500">5/8/2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}