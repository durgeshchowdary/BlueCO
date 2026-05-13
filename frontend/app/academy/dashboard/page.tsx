"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  Clock3,
  Grid2X2,
  HelpCircle,
  IndianRupee,
  MessageSquare,
  Moon,
  Plus,
  Target,
  Ticket,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  BarChart3,
  BriefcaseBusiness,
  PackageCheck,
  X,
} from "lucide-react";

const sidebarGroups = [
  {
    title: "ACTIVE PITCH",
    items: [
      { label: "Dashboard", href: "/academy/dashboard", icon: Grid2X2, active: true },
      { label: "Students", href: "/academy/students", icon: Users },
      { label: "HRMS", href: "/academy/hrms", icon: BriefcaseBusiness },
      { label: "Events", href: "/academy/events", icon: CalendarDays },
      { label: "Training Sessions", href: "/academy/training-sessions", icon: CheckSquare },
    ],
  },
  {
    title: "BACK-OFFICE",
    items: [
      { label: "Finance", href: "/academy/finance", icon: IndianRupee },
      { label: "KPI Dashboard", href: "/academy/kpi-dashboard", icon: BarChart3 },
      { label: "CRM", href: "/academy/crm", icon: Target },
      { label: "Chat", href: "/academy/chat", icon: MessageSquare },
      { label: "Delivery Logs", href: "/academy/delivery-logs", icon: PackageCheck },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      { label: "Tickets", href: "/academy/tickets", icon: Ticket },
      { label: "Announcements", href: "/academy/announcements", icon: Bell },
      { label: "Help Center", href: "/academy/help-center", icon: HelpCircle },
    ],
  },
];

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
    <main className="min-h-screen bg-[#fbf9eb] text-[#17223b]">
      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 z-30 h-screen w-[260px] border-r border-slate-200 bg-[#f8fafc]">
          <div className="flex h-[80px] items-center gap-3 border-b border-slate-200 px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
              <span className="text-[7px] font-black text-red-500">OUT</span>
            </div>
            <h1 className="text-[22px] font-black">
              <span className="text-slate-900">Out-</span>
              <span className="text-red-500">Play</span>
            </h1>
          </div>

          <nav className="h-[calc(100vh-80px)] overflow-y-auto pb-16">
            {sidebarGroups.map((group) => (
              <div key={group.title} className="border-b border-slate-200 px-2 py-4">
                <p className="mb-2 px-2 text-[11px] font-bold tracking-[0.18em] text-slate-400">
                  {group.title}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`flex h-11 items-center gap-3 rounded-xl px-4 text-[16px] font-medium transition ${
                          item.active
                            ? "bg-[#d8ece9] text-[#047c73]"
                            : "text-[#52657d] hover:bg-slate-100"
                        }`}
                      >
                        <Icon size={18} strokeWidth={2} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 flex h-11 w-full items-center justify-center border-t border-slate-200 bg-[#f8fafc] text-slate-500">
            ‹
          </div>
        </aside>

        <section className="ml-[260px] flex min-h-screen flex-1 flex-col">
          <div className="flex h-11 items-center justify-center bg-[#079663] text-white">
            <div className="flex items-center gap-3 text-[16px] font-bold">
              <Clock3 size={17} />
              <span>Free trial: 10 days remaining</span>
              <button className="ml-2 flex h-7 items-center gap-3 rounded-full bg-white px-4 text-[14px] font-medium text-slate-900">
                Upgrade <span className="text-xl leading-none">→</span>
              </button>
              <X size={16} className="opacity-80" />
            </div>
          </div>

          <header className="flex h-[64px] items-center justify-between border-b border-slate-200 bg-white px-7">
            <h2 className="text-[22px] font-black text-[#17223b]">Dashboard</h2>

            <div className="flex items-center gap-5">
              <div className="relative">
                <Bell size={20} className="text-slate-700" />
                <span className="absolute -right-2 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-400 text-[11px] font-bold text-white">
                  4
                </span>
              </div>
              <MessageSquare size={20} className="text-slate-700" />
              <Moon size={20} className="text-slate-700" />
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-300 to-rose-400" />
            </div>
          </header>

          <div className="px-9 py-7">
            <section>
              <h1 className="text-[29px] font-black leading-tight text-[#07152b]">
                Welcome back, Vijayawada blues
              </h1>

              <div className="mt-2 flex items-center gap-3">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] font-bold text-[#07152b]">
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

                <div className="relative mt-4 h-[250px] border-l border-b border-slate-400">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="absolute left-0 w-full border-t border-dashed border-slate-200"
                      style={{ top: `${i * 25}%` }}
                    />
                  ))}

                  {["Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026"].map(
                    (month, i) => (
                      <span
                        key={month}
                        className="absolute top-[255px] -translate-x-1/2 text-[12px] text-slate-500"
                        style={{ left: `${8 + i * 17}%` }}
                      >
                        {month}
                      </span>
                    )
                  )}

                  {["₹0.004K", "₹0.003K", "₹0.002K", "₹0.001K", "₹0K"].map((amount, i) => (
                    <span
                      key={amount}
                      className="absolute -left-14 text-[12px] text-slate-500"
                      style={{ top: `${i * 25 - 2}%` }}
                    >
                      {amount}
                    </span>
                  ))}
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
                  <p className="text-[16px] text-[#52657d]">No recent activity yet.</p>
                </div>
              </div>
            </section>
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
    <div className="h-[138px] rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-[14px] font-medium text-[#52657d]">{title}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${iconClass}`}>
          {icon}
        </div>
      </div>

      <p className="mt-3 text-[30px] font-black leading-none text-[#07152b]">{value}</p>
      <p className="mt-2 text-[14px] text-[#52657d]">{sub}</p>
    </div>
  );
}