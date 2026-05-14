"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Clock,
  AlertTriangle,
  Ban,
  CheckCircle,
  CircleSlash,
  Plus,
  Search,
  RefreshCw,
  X,
} from "lucide-react";
import api from "../../../lib/api";

type FilterType =
  | "all"
  | "pending"
  | "trial"
  | "expiring"
  | "expired"
  | "active"
  | "suspended";

export default function TrialMonitorPage() {
  const [academies, setAcademies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedAcademy, setSelectedAcademy] = useState<any>(null);
  const [extendDays, setExtendDays] = useState(7);

  const loadAcademies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/super-admin/academies");

      const formatted = (res.data || []).map((a: any, index: number) => {
        const rawStatus = String(a.status || a.subscription?.status || "trial").toUpperCase();
        const trialEnds = a.trialEnds || a.subscription?.trialEnds || a.createdAt;

        const remainingDays = trialEnds
          ? Math.ceil((new Date(trialEnds).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          ...a,
          id: a.code || `ACE${String(index + 1).padStart(3, "0")}`,
          students: a.studentCount || a.students || 0,
          trialEnds,
          status:
            rawStatus === "ACTIVE"
              ? "ACTIVE"
              : rawStatus === "SUSPENDED"
              ? "SUSPENDED"
              : rawStatus === "EXPIRED"
              ? "EXPIRED"
              : rawStatus === "PENDING_VERIFICATION"
              ? "PENDING_VERIFICATION"
              : "TRIAL",
          remainingDays,
        };
      });

      setAcademies(formatted);
    } catch (err) {
      console.log(err);
      setAcademies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademies();
  }, []);

  const counts = {
    pending: academies.filter((a) => a.status === "PENDING_VERIFICATION").length,
    trial: academies.filter((a) => a.status === "TRIAL").length,
    expiring: academies.filter(
      (a) => a.remainingDays !== null && a.remainingDays <= 3 && a.remainingDays >= 0
    ).length,
    expired: academies.filter((a) => a.status === "EXPIRED").length,
    active: academies.filter((a) => a.status === "ACTIVE").length,
    suspended: academies.filter((a) => a.status === "SUSPENDED").length,
  };

  const statCards = [
    { key: "pending", label: "Pending", value: counts.pending, icon: Building2 },
    { key: "trial", label: "Trial Active", value: counts.trial, icon: Clock },
    { key: "expiring", label: "Expiring (3d)", value: counts.expiring, icon: AlertTriangle },
    { key: "expired", label: "Expired", value: counts.expired, icon: Ban },
    { key: "active", label: "Active (Paid)", value: counts.active, icon: CheckCircle },
    { key: "suspended", label: "Suspended", value: counts.suspended, icon: CircleSlash },
  ];

  const filteredAcademies = useMemo(() => {
    let data = [...academies];

    if (activeFilter !== "all") {
      if (activeFilter === "expiring") {
        data = data.filter((a) => a.remainingDays <= 3 && a.remainingDays >= 0);
      } else {
        data = data.filter((a) => a.status.toLowerCase() === activeFilter);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (a) =>
          String(a.name || "").toLowerCase().includes(q) ||
          String(a.city || "").toLowerCase().includes(q) ||
          String(a.status || "").toLowerCase().includes(q)
      );
    }

    return data;
  }, [academies, activeFilter, search]);

  const extendTrial = async () => {
    if (!selectedAcademy?._id) return;

    try {
      await api.put(`/super-admin/academies/${selectedAcademy._id}/extend-trial`, {
        days: extendDays,
      });

      setSelectedAcademy(null);
      await loadAcademies();
    } catch (err) {
      console.log(err);
      setSelectedAcademy(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf0] px-6 py-6 text-[#061739]">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Trial Monitor</h1>
          <p className="mt-1 text-[14px] text-[#536987]">
            Track academy trials, conversions & suspensions
          </p>
        </div>

        <button
          onClick={loadAcademies}
          className="flex h-[42px] items-center gap-2 rounded-xl border border-[#d8e0ec] bg-white px-4 text-[14px] font-semibold shadow-sm"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#d8e0ec] bg-white p-6 font-bold text-[#00796b]">
          Loading academies...
        </div>
      ) : (
        <>
          <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {statCards.map((card: any) => {
              const Icon = card.icon;
              const active = activeFilter === card.key;

              return (
                <button
                  key={card.key}
                  onClick={() => setActiveFilter(active ? "all" : (card.key as FilterType))}
                  className={`relative h-[135px] rounded-2xl p-4 text-left transition-all ${
                    active
                      ? "border-2 border-[#00897b] bg-white shadow-sm"
                      : "border-2 border-transparent bg-transparent hover:bg-white/50"
                  }`}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#00796b] text-white">
                    <Icon size={20} />
                  </div>

                  <p className="text-[13px] font-semibold text-[#536987]">{card.label}</p>
                  <h2 className="mt-2 text-[26px] font-extrabold leading-none">{card.value}</h2>
                </button>
              );
            })}
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <h2 className="text-[14px] font-extrabold">
                  {activeFilter === "all" ? "All Academies" : activeFilter}
                </h2>
                <span className="rounded-full bg-[#eef3f8] px-3 py-1 text-[12px] font-bold">
                  {filteredAcademies.length}
                </span>
              </div>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#536987]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search academy, city, status..."
                  className="h-[44px] w-[320px] rounded-xl border border-[#d8e0ec] bg-white pl-10 pr-4 text-[13px] outline-none focus:border-[#00897b]"
                />
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#d8e0ec] text-left text-[13px] font-bold text-[#536987]">
                  <th className="px-3 py-3">ID</th>
                  <th className="px-5 py-3">Academy</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Students</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Trial Ends</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAcademies.map((academy: any) => (
                  <tr
                    key={academy._id || academy.id}
                    className="border-b border-[#d8e0ec] bg-[#f8fbff] text-[13px]"
                  >
                    <td className="px-3 py-3 text-[11px] text-[#536987]">{academy.id}</td>
                    <td className="px-5 py-3 font-bold">{academy.name || "-"}</td>
                    <td className="px-5 py-3">{academy.city || "-"}</td>
                    <td className="px-5 py-3">{academy.students}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={academy.status} />
                    </td>
                    <td className="px-5 py-3">
                      {academy.trialEnds
                        ? new Date(academy.trialEnds).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : "-"}
                    </td>

                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAcademy(academy);
                          setExtendDays(7);
                        }}
                        className="inline-flex h-[38px] items-center gap-2 rounded-xl border border-[#d8e0ec] bg-white px-4 text-[12px] font-bold shadow-sm hover:bg-slate-50"
                      >
                        <Plus size={15} />
                        Extend
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredAcademies.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#536987]">
                      No academies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}

      {selectedAcademy && (
        <div
          onClick={() => setSelectedAcademy(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[430px] rounded-2xl bg-[#fffdf0] p-7 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[20px] font-extrabold text-[#1f2937]">
                Extend Trial — {selectedAcademy.name}
              </h2>

              <button
                onClick={() => setSelectedAcademy(null)}
                className="text-[#536987] hover:text-[#061739]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 flex items-center gap-3 text-[14px] text-[#536987]">
              <span>Current status:</span>
              <StatusBadge status={selectedAcademy.status} />
            </div>

            <label className="mb-2 block text-[13px] font-bold text-[#1f2937]">
              Extend by (days)
            </label>

            <input
              type="number"
              min={1}
              value={extendDays}
              onChange={(e) => setExtendDays(Number(e.target.value))}
              className="mb-5 h-[44px] w-full rounded-xl border border-[#00897b] bg-[#fffdf0] px-4 text-[14px] font-semibold outline-none"
            />

            <button
              onClick={extendTrial}
              className="flex h-[44px] w-full items-center justify-center gap-3 rounded-xl bg-[#00897b] text-[14px] font-extrabold text-white shadow-md hover:bg-[#00796b]"
            >
              <Clock size={17} />
              Extend Trial by {extendDays} Days
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const item =
    status === "ACTIVE"
      ? {
          label: "ACTIVE",
          bg: "bg-blue-100",
          text: "text-blue-700",
          dot: "bg-blue-500",
        }
      : status === "TRIAL"
      ? {
          label: "TRIAL",
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        }
      : status === "PENDING_VERIFICATION"
      ? {
          label: "PENDING_VERIFICATION",
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        }
      : {
          label: status || "UNKNOWN",
          bg: "bg-red-100",
          text: "text-red-700",
          dot: "bg-red-500",
        };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold ${item.bg} ${item.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}