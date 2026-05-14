"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  Clock,
  Crown,
  Download,
  MoreHorizontal,
  Power,
  RefreshCw,
  RotateCcw,
  Search,
  Trophy,
} from "lucide-react";
import api from "../../../lib/api";

type FilterType = "all" | "plan" | "trial" | "deactivated";

type Academy = {
  _id: string;
  name?: string;
  phone?: string;
  city?: string;
  status?: string;
  students?: number;
  studentCount?: number;
  createdAt?: string;
  subscription?: {
    plan?: string;
    status?: string;
    monthlyAmount?: number;
  };
};

export default function SuperAdminAcademiesPage() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const loadAcademies = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get<Academy[]>("/super-admin/academies");
      setAcademies(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load academies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademies();
  }, []);

  const normalized = useMemo(() => {
    return academies.map((a, index) => {
      const status = String(a.status || a.subscription?.status || "trial");
      const plan =
        a.subscription?.monthlyAmount && a.subscription.monthlyAmount > 0
          ? `₹${a.subscription.monthlyAmount}`
          : a.subscription?.plan || "Free";

      return {
        ...a,
        code: `ACE${String(index + 1).padStart(3, "0")}`,
        statusLabel:
          status.toLowerCase() === "active"
            ? "Active"
            : status.toLowerCase() === "trial"
            ? "Trial"
            : status.toLowerCase() === "deactivated" ||
              status.toLowerCase() === "inactive" ||
              status.toLowerCase() === "suspended"
            ? "Deactivated"
            : status,
        planLabel: plan,
        studentsCount: a.students || a.studentCount || 0,
      };
    });
  }, [academies]);

  const allCount = normalized.length;
  const planCount = normalized.filter((a) => a.planLabel !== "Free").length;
  const trialCount = normalized.filter((a) => a.statusLabel === "Trial").length;
  const deactivatedCount = normalized.filter(
    (a) => a.statusLabel === "Deactivated"
  ).length;

  const percent = (count: number) =>
    allCount === 0 ? "0% of total" : `${Math.round((count / allCount) * 100)}% of total`;

  const cards = [
    {
      key: "all" as FilterType,
      title: "All Academies",
      value: allCount,
      percent: percent(allCount),
      icon: Trophy,
      bg: "bg-[#f2faed]",
      iconBg: "bg-[#009f6b]",
      bar: "bg-[#009f6b]",
      width: "100%",
    },
    {
      key: "plan" as FilterType,
      title: "Plan Based",
      value: planCount,
      percent: percent(planCount),
      icon: Crown,
      bg: "bg-[#fff8e8]",
      iconBg: "bg-[#e47a00]",
      bar: "bg-[#e47a00]",
      width: `${Math.max((planCount / Math.max(allCount, 1)) * 100, planCount ? 8 : 2)}%`,
    },
    {
      key: "trial" as FilterType,
      title: "On Trial",
      value: trialCount,
      percent: percent(trialCount),
      icon: Clock,
      bg: "bg-[#f7faf7]",
      iconBg: "bg-[#2563eb]",
      bar: "bg-[#2563eb]",
      width: `${Math.max((trialCount / Math.max(allCount, 1)) * 100, trialCount ? 8 : 2)}%`,
    },
    {
      key: "deactivated" as FilterType,
      title: "Deactivated",
      value: deactivatedCount,
      percent: percent(deactivatedCount),
      icon: Ban,
      bg: "bg-[#fff3e8]",
      iconBg: "bg-[#e5242a]",
      bar: "bg-[#e5242a]",
      width: `${Math.max((deactivatedCount / Math.max(allCount, 1)) * 100, 2)}%`,
    },
  ];

  const filteredAcademies = useMemo(() => {
    let data = [...normalized];

    if (activeFilter === "plan") data = data.filter((a) => a.planLabel !== "Free");
    if (activeFilter === "trial") data = data.filter((a) => a.statusLabel === "Trial");
    if (activeFilter === "deactivated")
      data = data.filter((a) => a.statusLabel === "Deactivated");

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (a) =>
          a.code.toLowerCase().includes(q) ||
          String(a.name || "").toLowerCase().includes(q) ||
          String(a.city || "").toLowerCase().includes(q) ||
          String(a.phone || "").toLowerCase().includes(q)
      );
    }

    return data;
  }, [normalized, activeFilter, search]);

  const exportCSV = () => {
    const rows = [
      ["ID", "Academy", "Phone", "City", "Students", "Plan", "Status"],
      ...filteredAcademies.map((a) => [
        a.code,
        a.name || "",
        a.phone || "",
        a.city || "",
        String(a.studentsCount),
        a.planLabel,
        a.statusLabel,
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${activeFilter}-academies.csv`;
    link.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#fffdf0] px-6 py-6 text-[#061739]">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">
            Academies
          </h1>
          <p className="mt-1 text-[14px] text-[#536987]">
            Live academy directory from MongoDB
          </p>
        </div>

        <button
          onClick={loadAcademies}
          className="flex h-[38px] items-center gap-2 rounded-xl border border-[#d8e0ec] bg-white px-4 text-[13px] font-bold shadow-sm"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-6 font-bold text-[#00796b]">
          Loading live academies...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      ) : (
        <>
          <section className="mb-6 grid grid-cols-4 gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              const active = activeFilter === card.key;

              return (
                <button
                  key={card.key}
                  onClick={() => setActiveFilter(card.key)}
                  className={`rounded-2xl border p-5 text-left shadow-sm transition ${
                    active
                      ? "border-[#00796b] ring-2 ring-[#00796b]/20"
                      : "border-[#d8e0ec]"
                  } ${card.bg}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${card.iconBg}`}
                    >
                      <Icon size={18} />
                    </div>
                    <p className="text-[12px] font-bold text-[#536987]">
                      {card.percent}
                    </p>
                  </div>

                  <p className="text-[14px] font-bold text-[#536987]">
                    {card.title}
                  </p>
                  <h2 className="mt-2 text-[30px] font-black">{card.value}</h2>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/70">
                    <div
                      className={`h-full rounded-full ${card.bar}`}
                      style={{ width: card.width }}
                    />
                  </div>
                </button>
              );
            })}
          </section>

          <section className="rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[18px] font-black">
                {activeFilter === "all"
                  ? "All Academies"
                  : activeFilter === "plan"
                  ? "Plan Based Academies"
                  : activeFilter === "trial"
                  ? "On Trial Academies"
                  : "Deactivated Academies"}
              </h2>

              <div className="flex gap-3">
                <div className="relative w-[300px]">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#536987]"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search academies..."
                    className="h-[40px] w-full rounded-xl border border-[#d8e0ec] bg-white pl-10 pr-4 text-sm outline-none"
                  />
                </div>

                <button
                  onClick={exportCSV}
                  className="flex h-[40px] items-center gap-2 rounded-xl border border-[#d8e0ec] bg-white px-4 text-sm font-bold"
                >
                  <Download size={15} />
                  Export
                </button>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="border-b text-[13px] text-[#536987]">
                <tr>
                  <th className="py-3">ID</th>
                  <th>Academy</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Students</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAcademies.map((academy) => (
                  <tr key={academy._id} className="border-b last:border-b-0">
                    <td className="py-4 font-bold">{academy.code}</td>
                    <td className="font-bold">{academy.name || "Unnamed Academy"}</td>
                    <td>{academy.phone || "-"}</td>
                    <td>{academy.city || "-"}</td>
                    <td>{academy.studentsCount}</td>
                    <td>{academy.planLabel}</td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          academy.statusLabel === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : academy.statusLabel === "Trial"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {academy.statusLabel}
                      </span>
                    </td>
                    <td className="relative text-right">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === academy._id ? null : academy._id)
                        }
                        className="rounded-xl p-2 hover:bg-white"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenu === academy._id && (
                        <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border bg-white p-2 shadow-xl">
                          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-slate-50">
                            <Power size={14} />
                            Deactivate
                          </button>
                          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-slate-50">
                            <RotateCcw size={14} />
                            Reactivate
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredAcademies.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[#536987]">
                      No academies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}