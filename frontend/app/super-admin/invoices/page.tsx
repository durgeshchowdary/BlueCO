"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock3,
  FileText,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const invoices = [
  {
    id: "OUTPLAY-INV002",
    academy: "abc",
    code: "ACE002",
    plan: "Pro",
    amount: "₹1,178.82",
    due: "2026-05-15",
    status: "pending",
  },
  {
    id: "OUTPLAY-INV001",
    academy: "Vijayawada Blues Football Club",
    code: "ACE001",
    plan: "Pro",
    amount: "₹1,178.82",
    due: "2026-05-15",
    status: "pending",
  },
];

export default function InvoicesPage() {
  const [activeCard, setActiveCard] = useState("all");
  const [activeTab, setActiveTab] = useState<"invoices" | "duplicates">(
    "invoices"
  );
  const [toast, setToast] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanToast, setScanToast] = useState("");
  const [search, setSearch] = useState("");

  const filteredInvoices = useMemo(() => {
    let data = invoices;

    if (activeCard === "overdue") data = [];
    if (activeCard === "paid") data = [];
    if (activeCard === "pending") {
      data = invoices.filter((i) => i.status === "pending");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.academy.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q)
      );
    }

    return data;
  }, [activeCard, search]);

  const tableTitle =
    activeCard === "all"
      ? "All Invoices"
      : activeCard === "overdue"
      ? "Overdue Invoices"
      : activeCard === "pending"
      ? "Pending Invoices"
      : "Paid Invoices";

  return (
    <div className="min-h-screen bg-[#fffdf0] px-6 py-6 text-[#061739]">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">
            Subscription Invoices
          </h1>
          <p className="mt-1 text-[14px] text-[#536987]">
            AI-powered billing & duplicate detection
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setScanLoading(true);
              setTimeout(() => {
                setScanLoading(false);
                setScanToast("No duplicate invoices found");
                setActiveTab("duplicates");
                setTimeout(() => setScanToast(""), 3000);
              }, 1500);
            }}
            className="flex h-[38px] items-center gap-2 rounded-xl border border-[#d8e0ec] bg-white px-4 text-[13px] font-bold shadow-sm transition hover:bg-[#f5f7fb]"
          >
            {scanLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#061739] border-t-transparent" />
            ) : (
              <ShieldAlert size={15} />
            )}
            {scanLoading ? "Scanning..." : "AI Scan"}
          </button>

          <button
            onClick={() => {
              setToast(true);
              setTimeout(() => setToast(false), 2500);
            }}
            className="flex h-[38px] items-center gap-2 rounded-xl bg-[#00796b] px-4 text-[13px] font-bold text-white shadow-sm"
          >
            <Sparkles size={15} />
            Auto-Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-5">
        <div>
          <section className="mb-5 grid grid-cols-4 gap-4">
            <InvoiceCard
              active={activeCard === "all"}
              onClick={() => {
                setActiveCard("all");
                setActiveTab("invoices");
              }}
              icon={<FileText size={17} />}
              iconBg="bg-[#4d596f]"
              label="Total Invoices"
              value="2"
              sub="₹2,357.64"
            />

            <InvoiceCard
              active={activeCard === "overdue"}
              onClick={() => {
                setActiveCard("overdue");
                setActiveTab("invoices");
              }}
              icon={<AlertTriangle size={17} />}
              iconBg="bg-[#e5242a]"
              label="Overdue"
              value="0"
              sub="₹0"
            />

            <InvoiceCard
              active={activeCard === "pending"}
              onClick={() => {
                setActiveCard("pending");
                setActiveTab("invoices");
              }}
              icon={<Clock3 size={17} />}
              iconBg="bg-[#e47a00]"
              label="Pending"
              value="2"
              sub="₹2,357.64"
            />

            <InvoiceCard
              active={activeCard === "paid"}
              onClick={() => {
                setActiveCard("paid");
                setActiveTab("invoices");
              }}
              icon={<CheckCircle size={17} />}
              iconBg="bg-[#009f6b]"
              label="Paid"
              value="0"
              sub="₹0"
            />
          </section>

          <button className="mb-4 flex h-[36px] items-center gap-2 rounded-xl border border-[#d8e0ec] bg-white px-4 text-[13px] font-bold shadow-sm">
            <Plus size={15} />
            Manual Invoice
          </button>

          <div className="mb-3 flex w-fit rounded-2xl bg-[#e8ebf1] p-1">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`rounded-xl px-4 py-2 text-[13px] font-bold ${
                activeTab === "invoices"
                  ? "bg-[#fffdf0] text-[#061739] shadow-sm"
                  : "text-[#65738f]"
              }`}
            >
              Invoices
            </button>

            <button
              onClick={() => setActiveTab("duplicates")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold ${
                activeTab === "duplicates"
                  ? "bg-[#fffdf0] text-[#061739] shadow-sm"
                  : "text-[#65738f]"
              }`}
            >
              <Shield size={14} />
              AI Duplicates
            </button>
          </div>

          {activeTab === "duplicates" ? (
            <section className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-[#d8e0ec] bg-[#f8fbff] shadow-sm">
              <div className="text-center">
                <Shield size={52} className="mx-auto text-[#8ddfcf]" />
                <h2 className="mt-4 text-[18px] font-extrabold text-[#009f6b]">
                  All Clear
                </h2>
                <p className="mt-2 text-[14px] text-[#536987]">
                  No duplicates. 0 invoices scanned.
                </p>
              </div>
            </section>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] shadow-sm">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-[14px] font-extrabold">{tableTitle}</h2>
                  <span className="rounded-full bg-[#eef3f8] px-3 py-1 text-[12px] font-bold">
                    {filteredInvoices.length}
                  </span>
                </div>

                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#536987]"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="h-[38px] w-[250px] rounded-xl border border-[#d8e0ec] bg-white pl-10 pr-4 text-[13px] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[40px_1.1fr_1.6fr_0.7fr_0.9fr_0.9fr_0.8fr_40px] border-t border-[#d8e0ec] px-5 py-3 text-[13px] font-bold text-[#536987]">
                <div />
                <div>Invoice</div>
                <div>Academy</div>
                <div>Plan</div>
                <div>Amount</div>
                <div>Due</div>
                <div>Status</div>
                <div />
              </div>

              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="grid grid-cols-[40px_1.1fr_1.6fr_0.7fr_0.9fr_0.9fr_0.8fr_40px] items-center border-t border-[#dfe3ec] px-5 py-3 text-[13px]"
                  >
                    <div className="h-4 w-4 rounded-full border border-[#00897b]" />

                    <div className="text-[12px] font-semibold text-[#0f7d7c]">
                      {invoice.id}
                    </div>

                    <div>
                      <p className="font-bold text-[#061739]">
                        {invoice.academy}
                      </p>
                      <p className="text-[11px] text-[#536987]">
                        {invoice.code}
                      </p>
                    </div>

                    <div>
                      <span className="rounded-full border border-[#d7dce8] bg-white px-3 py-1 text-[12px] font-bold">
                        {invoice.plan}
                      </span>
                    </div>

                    <div className="font-extrabold">{invoice.amount}</div>
                    <div>{invoice.due}</div>

                    <div>
                      <span className="rounded-full bg-[#fff0cf] px-3 py-1 text-[12px] font-bold text-[#c67a00]">
                        pending
                      </span>
                    </div>

                    <div className="text-right text-[#78859d]">•••</div>
                  </div>
                ))
              ) : (
                <div className="flex h-[190px] flex-col items-center justify-center border-t border-[#dfe3ec] text-center">
                  {activeCard === "overdue" ? (
                    <AlertTriangle size={42} className="text-[#c9ced8]" />
                  ) : (
                    <CheckCircle size={42} className="text-[#c9ced8]" />
                  )}

                  <p className="mt-3 text-[14px] text-[#6d7a92]">
                    {activeCard === "paid"
                      ? "No paid invoices"
                      : "No overdue invoices"}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="pt-[228px]">
          <div className="rounded-2xl border border-[#d7dce7] bg-[#f8fbff] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-[#00897b]">♙</span>
              <h2 className="text-[15px] font-extrabold">
                AI Recommendations
              </h2>
            </div>

            <div className="flex h-[145px] items-center justify-center text-[13px] text-[#75829a]">
              No recommendations
            </div>
          </div>
        </div>
      </div>

      {scanToast && (
        <div className="fixed right-10 top-24 z-[999] flex w-[320px] items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-[13px] font-bold text-cyan-800 shadow-lg">
          <ShieldAlert size={17} />
          {scanToast}
        </div>
      )}

      {toast && (
        <div className="fixed right-10 top-24 z-[999] flex w-[300px] items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-[13px] font-bold text-emerald-700 shadow-lg">
          <CheckCircle size={17} />
          Generated 0 invoices
        </div>
      )}
    </div>
  );
}

function InvoiceCard({
  active,
  onClick,
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative min-h-[145px] rounded-2xl border px-4 py-4 text-left transition ${
        active
          ? "border-[#00897b] bg-[#fffdf0] shadow-md"
          : "border-transparent bg-transparent"
      }`}
    >
      {active && (
        <span className="absolute right-4 top-4 rounded-md bg-[#00796b] px-2 py-1 text-[10px] font-bold text-white">
          Filtered
        </span>
      )}

      <div
        className={`mb-4 flex h-[38px] w-[38px] items-center justify-center rounded-xl text-white ${iconBg}`}
      >
        {icon}
      </div>

      <p className="text-[13px] font-semibold text-[#536987]">{label}</p>

      <h2 className="mt-1 text-[22px] font-extrabold leading-none">
        {value}
      </h2>

      <p className="mt-2 text-[12px] text-[#536987]">{sub}</p>
    </button>
  );
}