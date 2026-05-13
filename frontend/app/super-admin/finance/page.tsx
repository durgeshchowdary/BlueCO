"use client";

import { useState } from "react";
import {
  BarChart3,
  Building2,
  CreditCard,
  Download,
  FileBarChart,
  FileSpreadsheet,
  Receipt,
  Shield,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from "lucide-react";

const tabs = [
  "Dashboard",
  "Accounts",
  "Transactions",
  "Reports",
  "Taxes",
  "Audit",
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const handleDownload = (name: string) => {
    const content = `Downloaded: ${name}`;
    const blob = new Blob([content], { type: "text/plain" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf0] px-8 py-7">
      <div className="mb-7">
        <h1 className="text-[28px] font-extrabold text-[#061739]">
          Finance
        </h1>

        <p className="mt-1 text-[15px] text-[#536987]">
          Revenue, accounting, tax & audit management
        </p>
      </div>

      <div className="mb-7 grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#9be7cb] bg-[#ecfaf4] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] text-[#536987]">Total Revenue</p>

              <h2 className="mt-2 text-[26px] font-extrabold text-[#008b5d]">
                ₹0.0K
              </h2>

              <p className="mt-1 text-[13px] text-[#008b5d]">
                All academies
              </p>
            </div>

            <TrendingUp className="text-[#00a86b]" size={18} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#bfd0ff] bg-[#eef3ff] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] text-[#536987]">MRR</p>

              <h2 className="mt-2 text-[26px] font-extrabold text-[#2850ff]">
                ₹0.0K
              </h2>

              <p className="mt-1 text-[13px] text-[#2850ff]">
                Monthly recurring
              </p>
            </div>

            <Wallet className="text-[#2850ff]" size={18} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#dec8ff] bg-[#f6efff] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] text-[#536987]">ARR</p>

              <h2 className="mt-2 text-[26px] font-extrabold text-[#8a2be2]">
                ₹0.0K
              </h2>

              <p className="mt-1 text-[13px] text-[#8a2be2]">
                Annual run rate
              </p>
            </div>

            <TrendingUp className="text-[#8a2be2]" size={18} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#f4d06f] bg-[#fff9eb] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] text-[#536987]">Pending</p>

              <h2 className="mt-2 text-[26px] font-extrabold text-[#cc6a00]">
                ₹1.2K
              </h2>

              <p className="mt-1 text-[13px] text-[#cc6a00]">
                1 invoices
              </p>
            </div>

            <TriangleAlert className="text-[#f59e0b]" size={18} />
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-center rounded-2xl bg-[#eef1f6] p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl py-3 text-[15px] font-semibold transition-all ${
              activeTab === tab
                ? "bg-[#fdfbf0] text-[#061739] shadow-sm"
                : "text-[#536987]"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {tab === "Dashboard" && <BarChart3 size={15} />}
              {tab === "Accounts" && <Building2 size={15} />}
              {tab === "Transactions" && <CreditCard size={15} />}
              {tab === "Reports" && <FileBarChart size={15} />}
              {tab === "Taxes" && <Receipt size={15} />}
              {tab === "Audit" && <Shield size={15} />}

              {tab}
            </div>
          </button>
        ))}
      </div>

      {activeTab === "Dashboard" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#d8e0ec] bg-white p-6">
            <h2 className="mb-5 text-[22px] font-bold text-[#061739]">
              Revenue Breakdown
            </h2>

            <div className="space-y-5">
              <div className="flex justify-between text-[18px]">
                <span>Subscription Revenue</span>
                <span className="font-bold">₹0</span>
              </div>

              <div className="flex justify-between text-[18px]">
                <span>Fee Revenue (Academies)</span>
                <span className="font-bold">₹0</span>
              </div>

              <div className="border-t pt-5">
                <div className="flex justify-between text-[24px] font-extrabold">
                  <span>Total</span>
                  <span className="text-[#00a86b]">₹0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d8e0ec] bg-white p-6">
            <h2 className="mb-5 text-[22px] font-bold text-[#061739]">
              Top Academies
            </h2>

            <div className="grid grid-cols-3 border-b pb-3 text-[16px] font-semibold text-[#536987]">
              <span>Academy</span>
              <span>Revenue</span>
              <span>Students</span>
            </div>

            <div className="py-12 text-center text-[20px] text-[#536987]">
              No data
            </div>
          </div>
        </div>
      )}

      {activeTab === "Accounts" && (
        <div className="overflow-hidden rounded-2xl border border-[#d8e0ec] bg-white">
          <table className="w-full">
            <thead className="bg-[#f8fbff]">
              <tr className="text-left text-[17px] text-[#536987]">
                <th className="px-5 py-4">Account</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Balance</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t text-[18px]">
                <td className="px-5 py-4">HDFC Business Account</td>
                <td className="px-5 py-4">Bank</td>
                <td className="px-5 py-4 font-bold">₹12,45,000</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-green-100 px-4 py-1 text-[14px] font-bold text-green-700">
                    Active
                  </span>
                </td>
              </tr>

              <tr className="border-t text-[18px]">
                <td className="px-5 py-4">Razorpay Gateway</td>
                <td className="px-5 py-4">Payment</td>
                <td className="px-5 py-4 font-bold">₹0</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-green-100 px-4 py-1 text-[14px] font-bold text-green-700">
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Transactions" && (
        <div className="rounded-2xl border border-[#d8e0ec] bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[22px] font-bold">
              Recent Transactions
            </h2>

            <button
              onClick={() => handleDownload("transactions")}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold"
            >
              <Download size={16} />
              Export
            </button>
          </div>

          <table className="w-full">
            <thead className="border-b text-left text-[16px] text-[#536987]">
              <tr>
                <th className="py-3">Date</th>
                <th>Description</th>
                <th>Debit ₹</th>
                <th>Credit ₹</th>
              </tr>
            </thead>

            <tbody className="text-[17px]">
              <tr className="border-b">
                <td className="py-4">17/02/2026</td>
                <td>Subscription Revenue (All Academies)</td>
                <td></td>
                <td className="font-bold text-green-600">₹0</td>
              </tr>

              <tr className="border-b">
                <td className="py-4">16/02/2026</td>
                <td>Server & Cloud Hosting (AWS)</td>
                <td className="font-bold text-red-500">₹15,000</td>
                <td></td>
              </tr>

              <tr>
                <td className="py-4">15/02/2026</td>
                <td>Corporate Payroll (15 Staff)</td>
                <td className="font-bold text-red-500">₹9,22,000</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Reports" && (
        <div className="grid grid-cols-2 gap-4">
          {[
            "Profit & Loss (P&L)",
            "Balance Sheet",
            "Cash Flow",
            "Revenue by Academy",
            "Subscription MRR",
            "Pending Collections",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-2xl border border-[#d8e0ec] bg-white p-5"
            >
              <div>
                <h3 className="text-[22px] font-bold">{item}</h3>

                <p className="mt-1 text-[15px] text-[#536987]">
                  Download financial report
                </p>
              </div>

              <button
                onClick={() => handleDownload(item)}
                className="rounded-xl border p-3"
              >
                <Download size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Taxes" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#d8e0ec] bg-white p-5">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-green-100 p-4">
                <FileSpreadsheet className="text-green-700" />
              </div>

              <div>
                <h3 className="text-[22px] font-bold">
                  GST Returns (GSTR-1/3B)
                </h3>

                <p className="text-[15px] text-[#536987]">
                  Due: 20/02/2026
                </p>
              </div>
            </div>

            <div className="space-y-4 text-[18px]">
              <div className="flex justify-between">
                <span>CGST</span>
                <span>₹0</span>
              </div>

              <div className="flex justify-between">
                <span>SGST</span>
                <span>₹0</span>
              </div>

              <div className="border-t pt-4 font-bold">
                <div className="flex justify-between">
                  <span>Total GST</span>
                  <span>₹0</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload("GSTR-1")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border py-3 font-semibold"
            >
              <Download size={16} />
              Download GSTR-1 JSON
            </button>
          </div>

          <div className="rounded-2xl border border-[#d8e0ec] bg-white p-5">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-blue-100 p-4">
                <FileSpreadsheet className="text-blue-700" />
              </div>

              <div>
                <h3 className="text-[22px] font-bold">
                  TDS Reports (26AS)
                </h3>

                <p className="text-[15px] text-[#536987]">
                  Q4 FY 2025-26
                </p>
              </div>
            </div>

            <div className="space-y-4 text-[18px]">
              <div className="flex justify-between">
                <span>TDS Deducted</span>
                <span>₹0</span>
              </div>

              <div className="flex justify-between">
                <span>TDS Deposited</span>
                <span>₹0</span>
              </div>
            </div>

            <button
              onClick={() => handleDownload("26AS")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border py-3 font-semibold"
            >
              <Download size={16} />
              Download 26AS
            </button>
          </div>
        </div>
      )}

      {activeTab === "Audit" && (
        <div className="rounded-2xl border border-[#d8e0ec] bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[22px] font-bold">Audit Trail</h2>

            <button
              onClick={() => handleDownload("audit-trail")}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold"
            >
              <Download size={16} />
              Export Audit
            </button>
          </div>

          <table className="w-full">
            <thead className="border-b text-left text-[16px] text-[#536987]">
              <tr>
                <th className="py-3">Date</th>
                <th>Action</th>
                <th>User</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody className="text-[17px]">
              <tr className="border-b">
                <td className="py-4">17/02/2026</td>
                <td>Invoice Generated</td>
                <td>System</td>
                <td>OUTPLAY-INV006 — ₹1,208.32</td>
              </tr>

              <tr className="border-b">
                <td className="py-4">17/02/2026</td>
                <td>Payment Received</td>
                <td>Razorpay</td>
                <td>₹1,208.32 via UPI</td>
              </tr>

              <tr>
                <td className="py-4">16/02/2026</td>
                <td>Payroll Processed</td>
                <td>Super Admin</td>
                <td>15 corporate staff — ₹9,22,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}