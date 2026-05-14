"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  Clock3,
  IndianRupee,
  MessageSquare,
  Moon,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";

export default function AcademyDashboardPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/`;
      window.history.replaceState({}, "", "/academy/dashboard");
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#fffdf0] text-[#17223b]">
      <div className="flex h-[42px] items-center justify-center bg-[#079663] text-white">
        <div className="flex items-center gap-3 text-[16px] font-bold">
          <Clock3 size={17} />
          <span>Free trial: 9 days remaining</span>

          <button className="ml-2 flex h-7 items-center gap-3 rounded-full bg-white px-4 text-[14px] font-semibold text-slate-900">
            Upgrade
            <span className="text-xl leading-none">→</span>
          </button>

          <X size={16} className="opacity-80" />
        </div>
      </div>

      <header className="flex h-[58px] items-center justify-between border-b border-slate-200 bg-white px-7">
        <h2 className="text-[22px] font-black text-[#17223b]">Dashboard</h2>

        <div className="flex items-center gap-5">
          <div className="relative">
            <Bell size={20} className="text-slate-800" />
            <span className="absolute -right-2 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-400 text-[11px] font-bold text-white">
              4
            </span>
          </div>

          <MessageSquare size={20} className="text-slate-800" />
          <Moon size={20} className="text-slate-800" />

          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-300 to-rose-400" />
        </div>
      </header>

      <div className="px-8 py-7">
        <section>
          <h1 className="text-[29px] font-black leading-tight text-[#07152b]">
            Welcome back, Vijayawada blues
          </h1>

          <div className="mt-2 flex items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] font-black text-[#07152b]">
              ACE004
            </span>

            <p className="text-[16px] text-[#52657d]">
              Here&apos;s what&apos;s happening at your academy today.
            </p>
          </div>
        </section>

        <section className="mt-7 grid grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value="0"
            sub="0 active"
            icon={<Users size={20} />}
            iconClass="bg-teal-50 text-teal-600"
          />

          <StatCard
            title="Attendance Today"
            value="0%"
            sub="0 present"
            icon={<CalendarDays size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Fees Pending"
            value="₹0.0K"
            sub="₹0.0K collected"
            icon={<IndianRupee size={20} />}
            iconClass="bg-orange-50 text-orange-500"
          />

          <StatCard
            title="Net Profit"
            value="₹0.0K"
            sub="0 employees"
            icon={<TrendingUp size={20} />}
            iconClass="bg-teal-50 text-teal-600"
          />
        </section>

        <section className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/academy/students"
            className="flex h-9 items-center gap-2 rounded-xl bg-[#009688] px-4 text-[14px] font-bold text-white shadow-sm hover:bg-[#008579]"
          >
            <UserPlus size={16} />
            Add Student
          </Link>

          <Link
            href="/academy/students"
            className="flex h-9 items-center gap-2 rounded-xl bg-[#2563eb] px-4 text-[14px] font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
          >
            <CheckSquare size={16} />
            Mark Attendance
          </Link>

          <Link
            href="/academy/events"
            className="flex h-9 items-center gap-2 rounded-xl bg-[#ea7b00] px-4 text-[14px] font-bold text-white shadow-sm hover:bg-[#d96f00]"
          >
            <Plus size={16} />
            Create Event
          </Link>

          <Link
            href="/academy/finance"
            className="flex h-9 items-center gap-2 rounded-xl bg-[#42536b] px-4 text-[14px] font-bold text-white shadow-sm hover:bg-[#344258]"
          >
            <WalletCards size={16} />
            Add Expense
          </Link>
        </section>

        <section className="mt-7 grid grid-cols-[2.05fr_1fr] gap-6">
          <div className="h-[370px] rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
            <h3 className="text-[16px] font-black text-[#07152b]">
              Revenue vs Expenses
            </h3>

            <div className="relative mt-4 ml-16 h-[250px] border-l border-b border-slate-400">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={`h-${i}`}
                  className="absolute left-0 w-full border-t border-dashed border-slate-200"
                  style={{ top: `${i * 25}%` }}
                />
              ))}

              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={`v-${i}`}
                  className="absolute top-0 h-full border-l border-dashed border-slate-200"
                  style={{ left: `${8 + i * 17}%` }}
                />
              ))}

              {[
                "Dec 2025",
                "Jan 2026",
                "Feb 2026",
                "Mar 2026",
                "Apr 2026",
                "May 2026",
              ].map((month, i) => (
                <span
                  key={month}
                  className="absolute top-[255px] -translate-x-1/2 text-[12px] text-slate-500"
                  style={{ left: `${8 + i * 17}%` }}
                >
                  {month}
                </span>
              ))}

              {["₹0.004K", "₹0.003K", "₹0.002K", "₹0.001K", "₹0K"].map(
                (amount, i) => (
                  <span
                    key={amount}
                    className="absolute -left-14 text-[12px] text-slate-500"
                    style={{ top: `${i * 25 - 2}%` }}
                  >
                    {amount}
                  </span>
                )
              )}

              <button
                type="button"
                className="group absolute top-0 h-full w-[130px]"
                style={{ left: "34%" }}
              >
                <div className="mx-auto h-full w-[126px] bg-black/20 opacity-0 transition group-hover:opacity-100" />

                <div className="absolute left-[70px] top-[90px] hidden w-[100px] rounded bg-white p-3 text-left shadow-lg group-hover:block">
                  <p className="mb-2 text-[18px] font-medium text-slate-700">
                    Feb 2026
                  </p>

                  <p className="text-[17px] text-rose-500">₹0</p>
                  <p className="mt-2 text-[17px] text-teal-700">₹0</p>
                </div>
              </button>
            </div>

            <div className="mt-9 flex items-center justify-center gap-4 text-[18px]">
              <div className="flex items-center gap-2 text-rose-500">
                <span className="h-3 w-3 bg-rose-500" />
                Expenses
              </div>

              <div className="flex items-center gap-2 text-teal-700">
                <span className="h-3 w-3 bg-teal-700" />
                Revenue
              </div>
            </div>
          </div>

          <div className="h-[370px] rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
            <h3 className="text-[16px] font-black text-[#07152b]">
              Recent Activity
            </h3>

            <div className="flex h-[290px] items-center justify-center">
              <p className="text-[16px] text-[#52657d]">
                No recent activity yet.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="h-[132px] rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-[14px] font-medium text-[#52657d]">{title}</p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-[30px] font-black leading-none text-[#07152b]">
        {value}
      </p>

      <p className="mt-2 text-[14px] text-[#52657d]">{sub}</p>
    </div>
  );
}