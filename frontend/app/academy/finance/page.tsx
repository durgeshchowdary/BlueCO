"use client";

import { useState } from "react";
import {
  Bell,
  BarChart3,
  Calendar,
  ChevronDown,
  Clock3,
  IndianRupee,
  MessageSquare,
  Moon,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";

type Tab = "overview" | "expenses" | "ai" | "maintenance";

const months = ["Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026"];

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
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

      {toast && (
        <div className="fixed right-12 top-[116px] z-50 flex h-14 w-[380px] items-center gap-3 rounded-lg bg-emerald-50 px-5 text-emerald-700 shadow-lg">
          <ShieldCheck size={20} fill="currentColor" />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      <div className="px-8 py-7">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-black">Finance</h1>
            <p className="mt-1 text-[16px] text-[#52657d]">
              Track revenue, expenses, and profitability
            </p>
          </div>

          <button
            onClick={() => setExpenseOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#007f72] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#006f64]"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>

        <section className="mt-7 grid grid-cols-3 gap-5">
          <StatCard
            title="Total Revenue"
            value="₹0"
            sub="From fee collections"
            icon={<TrendingUp size={20} />}
            iconClass="bg-emerald-100 text-emerald-600"
            valueClass="text-[#07152b]"
            subClass="text-emerald-700"
          />

          <StatCard
            title="Total Expenses"
            value="₹0"
            sub="0 categories"
            icon={<TrendingDown size={20} />}
            iconClass="bg-red-100 text-red-500"
            valueClass="text-[#07152b]"
            subClass="text-[#52657d]"
          />

          <StatCard
            title="Net Profit"
            value="₹0"
            sub="0% margin"
            icon={<TrendingUp size={20} />}
            iconClass="bg-emerald-100 text-emerald-600"
            valueClass="text-emerald-600"
            subClass="text-[#52657d]"
          />
        </section>

        <div className="mt-6 inline-flex h-11 items-center gap-1 rounded-xl bg-[#eef2f6] p-1">
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")} icon={<BarChart3 size={17} />} label="Overview" />
          <TabButton active={tab === "expenses"} onClick={() => setTab("expenses")} icon={<IndianRupee size={17} />} label="Expenses" />
          <TabButton active={tab === "ai"} onClick={() => setTab("ai")} icon={<Sparkles size={17} />} label="AI Insights" />
          <TabButton active={tab === "maintenance"} onClick={() => setTab("maintenance")} icon={<Wrench size={17} />} label="Data Maintenance" />
        </div>

        {tab === "overview" && (
          <section className="mt-4 grid grid-cols-[2.05fr_1fr] gap-6">
            <div className="h-[405px] rounded-xl border border-slate-200 bg-[#f8fafc] p-7 shadow-sm">
              <h3 className="text-[16px] font-black">Revenue vs Expenses Trend</h3>

              <FinanceChart hoveredMonth={hoveredMonth} setHoveredMonth={setHoveredMonth} />
            </div>

            <div className="h-[405px] rounded-xl border border-slate-200 bg-[#f8fafc] p-7 shadow-sm">
              <h3 className="text-[16px] font-black">Expense Breakdown</h3>

              <div className="flex h-[300px] items-center justify-center">
                <p className="text-[16px] text-[#52657d]">
                  No expenses recorded yet.
                </p>
              </div>
            </div>
          </section>
        )}

        {tab === "expenses" && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-[#f8fafc] shadow-sm">
            <div className="grid h-12 grid-cols-6 items-center border-b border-slate-200 px-3 text-[15px] font-medium text-[#52657d]">
              <div>ID</div>
              <div>Category</div>
              <div>Amount</div>
              <div>Date</div>
              <div>Vendor</div>
              <div>Status</div>
            </div>

            <div className="flex h-[145px] items-center justify-center text-[16px] text-[#52657d]">
              No expenses recorded yet.
            </div>
          </div>
        )}

        {tab === "ai" && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-[#f8fafc] p-7 shadow-sm">
            <h3 className="text-[18px] font-black">AI Finance Insights</h3>
            <p className="mt-3 text-[#52657d]">
              No finance patterns available yet. Add revenue and expense data to generate AI insights.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-4">
              <InsightCard title="Profit Health" value="0%" tone="green" />
              <InsightCard title="Expense Risk" value="Low" tone="blue" />
              <InsightCard title="Anomalies" value="0" tone="orange" />
            </div>
          </div>
        )}

        {tab === "maintenance" && (
          <section className="mt-4 grid grid-cols-[2.05fr_1fr] gap-6">
            <div className="rounded-xl border border-slate-200 border-l-4 border-l-orange-500 bg-[#f8fafc] p-7 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-[18px] font-black">
                    <Wrench size={19} className="text-orange-600" />
                    Scan & Fix Duplicate Bills
                  </h3>

                  <p className="mt-2 max-w-[720px] text-[14px] leading-relaxed text-[#52657d]">
                    One-click cleanup for accidental double-billing. Keeps the oldest pending invoice per
                    (student · billing-type · period) and removes the rest. Paid invoices are never touched.
                  </p>
                </div>

                <button
                  onClick={() => setScanOpen(true)}
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#dc7700] px-5 font-bold text-white shadow-sm hover:bg-[#c86d00]"
                >
                  <Wrench size={17} />
                  Scan & Fix Duplicate Bills
                </button>
              </div>

              <div className="mt-8 rounded-xl border border-dashed border-orange-300 bg-[#fffdf0] p-5">
                <p className="mb-3 text-[13px] font-black tracking-wide text-orange-700">
                  HOW IT WORKS
                </p>

                <div className="space-y-2 text-[15px] leading-relaxed text-[#52657d]">
                  <p>
                    <b>1. Scan</b> — finds groups of identical pending fees same student, type, period.
                  </p>
                  <p>
                    <b>2. Review</b> — confirm in the dialog before anything is deleted.
                  </p>
                  <p>
                    <b>3. Self-Heal</b> — duplicates are removed and the unique-billing safeguard is auto-activated to block future double-bills.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-7 shadow-sm">
              <h3 className="flex items-center gap-2 text-[18px] font-black">
                <ShieldCheck size={18} className="text-orange-600" />
                Billing Engine Status
              </h3>

              <div className="mt-8 rounded-xl border border-orange-300 bg-orange-50 p-4">
                <p className="flex items-center gap-2 text-[16px] font-black text-orange-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                  Maintenance Required
                </p>

                <p className="mt-2 text-[14px] leading-relaxed text-[#52657d]">
                  Maintenance Required — unique-billing index not yet created. A backend restart will activate it.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-bold tracking-wider text-slate-400">UNIQUE INDEX</p>
                  <p className="mt-1 text-[14px] font-bold text-orange-600">⚠ Pending</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-bold tracking-wider text-slate-400">DUPLICATE GROUPS</p>
                  <p className="mt-1 text-[16px] font-black">0</p>
                </div>
              </div>

              <button
                onClick={() => showToast("Billing engine status re-checked")}
                className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white font-semibold shadow-sm"
              >
                <RefreshCw size={17} />
                Re-check status
              </button>
            </div>

            <div className="col-span-2 border-t border-slate-200 pt-3">
              <div className="ml-auto w-fit rounded-full border border-orange-300 bg-orange-50 px-5 py-2 text-sm font-bold text-orange-700">
                ● Maintenance Required
              </div>
            </div>
          </section>
        )}
      </div>

      {expenseOpen && <AddExpenseModal onClose={() => setExpenseOpen(false)} />}
      {scanOpen && (
        <ScanFixModal
          onClose={() => setScanOpen(false)}
          onConfirm={() => {
            setScanOpen(false);
            showToast("Duplicate bill scan completed");
          }}
        />
      )}
    </main>
  );
}

function FinanceChart({
  hoveredMonth,
  setHoveredMonth,
}: {
  hoveredMonth: number | null;
  setHoveredMonth: (n: number | null) => void;
}) {
  return (
    <>
      <div className="relative mt-4 ml-16 h-[250px] border-l border-b border-slate-400">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 w-full border-t border-dashed border-slate-200"
            style={{ top: `${i * 25}%` }}
          />
        ))}

        {months.map((month, i) => (
          <div
            key={`v-${month}`}
            className="absolute top-0 h-full border-l border-dashed border-slate-200"
            style={{ left: `${8 + i * 17}%` }}
          />
        ))}

        {months.map((month, i) => (
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

        {months.map((month, i) => (
          <button
            key={`hover-${month}`}
            type="button"
            onMouseEnter={() => setHoveredMonth(i)}
            onMouseLeave={() => setHoveredMonth(null)}
            className="absolute top-0 h-full w-[110px]"
            style={{ left: `calc(${8 + i * 17}% - 55px)` }}
          >
            <div
              className={`mx-auto h-full w-[100px] bg-black/20 transition ${
                hoveredMonth === i ? "opacity-100" : "opacity-0"
              }`}
            />

            {hoveredMonth === i && (
              <div className="absolute left-[62px] top-[56px] z-20 w-[105px] rounded-sm border border-slate-300 bg-white px-3 py-3 text-left shadow-sm">
                <p className="mb-3 text-[18px] font-medium text-slate-700">
                  {month}
                </p>
                <p className="text-[17px] text-rose-500">₹0</p>
                <p className="mt-3 text-[17px] text-teal-700">₹0</p>
              </div>
            )}
          </button>
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
    </>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon,
  iconClass,
  valueClass,
  subClass,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass: string;
  subClass: string;
}) {
  return (
    <div className="h-[132px] rounded-xl border border-slate-200 bg-[#f8fafc] px-5 py-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-[14px] font-medium text-[#52657d]">{title}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${iconClass}`}>
          {icon}
        </div>
      </div>

      <p className={`mt-3 text-[30px] font-black leading-none ${valueClass}`}>
        {value}
      </p>

      <p className={`mt-2 text-[14px] ${subClass}`}>{sub}</p>
    </div>
  );
}

function InsightCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "green" | "blue" | "orange";
}) {
  const toneClass = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
  };

  return (
    <div className={`rounded-xl border p-5 ${toneClass[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-[26px] font-black">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 items-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition ${
        active
          ? "bg-[#fffdf0] text-slate-950 shadow-sm ring-1 ring-black/5"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function AddExpenseModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="relative w-[620px] rounded-xl bg-[#fffdf0] p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-500 hover:text-slate-800">
          <X size={20} />
        </button>

        <h2 className="mb-6 text-[22px] font-black">Add Expense</h2>

        <ModalSelect label="Category *" placeholder="Select category" focused />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <ModalInput label="Amount (₹) *" placeholder="5000" />
          <ModalInput label="Date *" placeholder="14-05-2026" icon={<Calendar size={17} />} />
        </div>

        <div className="mt-4">
          <ModalInput label="Description" placeholder="Monthly rent" />
        </div>

        <div className="mt-4">
          <ModalInput label="Vendor" placeholder="Vendor name" />
        </div>

        <button onClick={onClose} className="mt-4 h-11 w-full rounded-xl bg-[#0f8277] font-bold text-white hover:bg-[#0b746a]">
          Add Expense
        </button>
      </div>
    </div>
  );
}

function ScanFixModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="relative w-[560px] rounded-xl bg-[#fffdf0] p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-6 top-6 text-slate-500 hover:text-slate-800">
          <X size={20} />
        </button>

        <h2 className="mb-3 text-[22px] font-black">Scan & Fix Duplicate Bills</h2>

        <p className="text-[15px] leading-relaxed text-[#52657d]">
          This will scan pending invoices, find duplicate billing groups, and keep only the oldest valid invoice.
          Paid invoices will not be touched.
        </p>

        <div className="mt-5 rounded-xl border border-orange-300 bg-orange-50 p-4 text-orange-700">
          <b>Safe cleanup:</b> No duplicate groups found right now, but this action will still re-check your billing index.
        </div>

        <button onClick={onConfirm} className="mt-5 h-11 w-full rounded-xl bg-[#dc7700] font-bold text-white hover:bg-[#c86d00]">
          Run Scan
        </button>
      </div>
    </div>
  );
}

function ModalInput({
  label,
  placeholder,
  icon,
}: {
  label: string;
  placeholder: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <div className="mt-2 flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4">
        <input
          placeholder={placeholder}
          className="w-full bg-transparent outline-none placeholder:text-slate-500"
        />
        {icon}
      </div>
    </div>
  );
}

function ModalSelect({
  label,
  placeholder,
  focused,
}: {
  label: string;
  placeholder: string;
  focused?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <button
        className={`mt-2 flex h-11 w-full items-center justify-between rounded-xl border bg-white px-4 text-left ${
          focused ? "border-teal-600" : "border-slate-200"
        }`}
      >
        {placeholder}
        <ChevronDown size={17} />
      </button>
    </div>
  );
}