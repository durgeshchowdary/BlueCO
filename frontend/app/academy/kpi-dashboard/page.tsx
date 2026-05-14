"use client";

import {
  Bell,
  BarChart3,
  CalendarCheck,
  Clock3,
  Download,
  IndianRupee,
  MessageSquare,
  Moon,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

const kpis = [
  { name: "Fee Collection", target: "75%", value: "0%", status: "Critical", tone: "red" },
  { name: "Attendance", target: "85%", value: "0%", status: "Critical", tone: "red" },
  { name: "Revenue Growth", target: "20%", value: "0%", status: "Needs Attention", tone: "orange" },
  { name: "Active Students", target: "0", value: "0", status: "On Track", tone: "green" },
  { name: "Employee Count", target: "10", value: "0", status: "Critical", tone: "red" },
];

export default function KPIDashboardPage() {
  function exportReport() {
    const headers = ["KPI", "Target", "Current Value", "Status"];
    const rows = kpis.map((kpi) => [kpi.name, kpi.target, kpi.value, kpi.status]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "outplay-kpi-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#fffdf0] text-[#17223b]">
      <div className="flex h-[42px] items-center justify-center bg-[#079663] text-white">
        <div className="flex items-center gap-3 text-[16px] font-bold">
          <Clock3 size={17} />
          <span>Free trial: 9 days remaining</span>
          <button className="ml-2 flex h-7 items-center gap-3 rounded-full bg-white px-4 text-[14px] font-semibold text-slate-900">
            Upgrade <span className="text-xl leading-none">→</span>
          </button>
          <X size={16} className="opacity-80" />
        </div>
      </div>

      <header className="flex h-[58px] items-center justify-between border-b border-slate-200 bg-white px-7">
        <h2 className="text-[22px] font-black">Welcome, Vijayawada blues</h2>

        <div className="flex items-center gap-5">
          <div className="relative">
            <Bell size={20} />
            <span className="absolute -right-2 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-400 text-[11px] font-bold text-white">
              4
            </span>
          </div>
          <MessageSquare size={20} />
          <Moon size={20} />
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-300 to-rose-400" />
        </div>
      </header>

      <div className="px-8 py-7">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-black">Executive KPI Dashboard</h1>
            <p className="mt-1 text-[16px] text-[#52657d]">
              5-second business snapshot
            </p>
          </div>

          <button
            onClick={exportReport}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold shadow-sm hover:bg-slate-50"
          >
            <Download size={17} />
            Export Report
          </button>
        </div>

        <section className="mt-7 grid grid-cols-4 gap-4">
          <TopCard
            title="Revenue Collected"
            value="₹0.0K"
            sub="₹0.0K pending"
            icon={<IndianRupee size={18} className="text-emerald-600" />}
          />

          <TopCard
            title="Collection Rate"
            value="0%"
            sub=""
            icon={<Target size={18} className="text-orange-600" />}
            progress
          />

          <TopCard
            title="Attendance"
            value="0%"
            sub=""
            icon={<CalendarCheck size={18} className="text-blue-600" />}
            progress
          />

          <TopCard
            title="Revenue Growth"
            value="0%"
            sub="vs last month"
            icon={<TrendingUp size={18} className="text-emerald-600" />}
            greenValue
          />
        </section>

        <section className="mt-7 rounded-xl border border-slate-200 bg-[#f8fafc] p-7 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-[17px] font-black">
            <BarChart3 size={18} className="text-teal-700" />
            Key Performance Indicators
          </h2>

          <div className="space-y-3">
            {kpis.map((kpi) => (
              <KpiRow
                key={kpi.name}
                name={kpi.name}
                target={kpi.target}
                value={kpi.value}
                status={kpi.status}
                tone={kpi.tone as "red" | "orange" | "green"}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function TopCard({
  title,
  value,
  sub,
  icon,
  progress = false,
  greenValue = false,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  progress?: boolean;
  greenValue?: boolean;
}) {
  return (
    <div className="h-[118px] rounded-xl border border-slate-200 bg-[#f8fafc] px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-[14px] font-medium text-[#52657d]">{title}</p>
        {icon}
      </div>

      <p
        className={`mt-3 text-[28px] font-black leading-none ${
          greenValue ? "text-emerald-600" : "text-[#07152b]"
        }`}
      >
        {value}
      </p>

      {progress ? (
        <div className="mt-4 h-2 rounded-full bg-[#c7dfde]" />
      ) : (
        <p className="mt-3 text-[14px] text-[#52657d]">{sub}</p>
      )}
    </div>
  );
}

function KpiRow({
  name,
  target,
  value,
  status,
  tone,
}: {
  name: string;
  target: string;
  value: string;
  status: string;
  tone: "red" | "orange" | "green";
}) {
  const rowStyles = {
    red: "border-red-200 bg-red-50 text-red-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  const dotStyles = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    green: "bg-emerald-500",
  };

  return (
    <div
      className={`flex h-[74px] items-center justify-between rounded-xl border px-4 ${rowStyles[tone]}`}
    >
      <div className="flex items-center gap-4">
        <span className={`h-3.5 w-3.5 rounded-full ${dotStyles[tone]}`} />

        <div>
          <h3 className="text-[16px] font-black text-[#17223b]">{name}</h3>
          <p className="text-[14px] text-[#52657d]">Target: {target}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-[22px] font-black">{value}</p>
        <p className="text-[14px] text-[#52657d]">{status}</p>
      </div>
    </div>
  );
}