"use client";

import React, { useMemo, useState } from "react";
import {
  Building2,
  Clock,
  AlertTriangle,
  Ban,
  CheckCircle,
  CircleSlash,
  Plus,
  Search,
  X,
} from "lucide-react";

type TrialStatus =
  | "PENDING_VERIFICATION"
  | "TRIAL"
  | "ACTIVE"
  | "EXPIRED"
  | "SUSPENDED";

type FilterType =
  | "all"
  | "pending"
  | "trial"
  | "expiring"
  | "expired"
  | "active"
  | "suspended";

type Academy = {
  id: string;
  name: string;
  city: string;
  students: number;
  status: TrialStatus;
  trialEnds: string;
  urgent?: "today" | "1d";
};

const initialAcademies: Academy[] = [
  {
    id: "ACE002",
    name: "abc",
    city: "bangalore",
    students: 0,
    status: "PENDING_VERIFICATION",
    trialEnds: "12 May",
    urgent: "today",
  },
  {
    id: "ACE003",
    name: "kca",
    city: "bangalore",
    students: 0,
    status: "PENDING_VERIFICATION",
    trialEnds: "13 May",
    urgent: "1d",
  },
  {
    id: "ACE004",
    name: "Vijayawada blues",
    city: "Krishna",
    students: 0,
    status: "TRIAL",
    trialEnds: "23 May",
  },
  {
    id: "ACE001",
    name: "Vijayawada Blues Football Club",
    city: "Vijayawada",
    students: 2,
    status: "ACTIVE",
    trialEnds: "1 Jun",
  },
];

export default function TrialMonitorPage() {
  const [academies, setAcademies] = useState<Academy[]>(initialAcademies);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  const [extendDays, setExtendDays] = useState(7);

  const counts = {
    pending: academies.filter((a) => a.status === "PENDING_VERIFICATION")
      .length,
    trial: academies.filter((a) => a.status === "TRIAL").length,
    expiring: academies.filter(
      (a) => a.urgent === "today" || a.urgent === "1d"
    ).length,
    expired: academies.filter((a) => a.status === "EXPIRED").length,
    active: academies.filter((a) => a.status === "ACTIVE").length,
    suspended: academies.filter((a) => a.status === "SUSPENDED").length,
  };

  const statCards = [
    {
      key: "pending" as FilterType,
      label: "Pending",
      value: counts.pending,
      icon: Building2,
      iconBg: "bg-[#72839f]",
    },
    {
      key: "trial" as FilterType,
      label: "Trial Active",
      value: counts.trial,
      icon: Clock,
      iconBg: "bg-[#009f6b]",
    },
    {
      key: "expiring" as FilterType,
      label: "Expiring (3d)",
      value: counts.expiring,
      icon: AlertTriangle,
      iconBg: "bg-[#e47a00]",
    },
    {
      key: "expired" as FilterType,
      label: "Expired",
      value: counts.expired,
      icon: Ban,
      iconBg: "bg-[#e5242a]",
    },
    {
      key: "active" as FilterType,
      label: "Active Paid",
      value: counts.active,
      icon: CheckCircle,
      iconBg: "bg-[#2563eb]",
    },
    {
      key: "suspended" as FilterType,
      label: "Suspended",
      value: counts.suspended,
      icon: CircleSlash,
      iconBg: "bg-[#a5161e]",
    },
  ];

  const filteredAcademies = useMemo(() => {
    let data = [...academies];

    if (activeFilter === "pending") {
      data = data.filter((a) => a.status === "PENDING_VERIFICATION");
    }

    if (activeFilter === "trial") {
      data = data.filter((a) => a.status === "TRIAL");
    }

    if (activeFilter === "active") {
      data = data.filter((a) => a.status === "ACTIVE");
    }

    if (activeFilter === "expiring") {
      data = data.filter((a) => a.urgent === "today" || a.urgent === "1d");
    }

    if (activeFilter === "expired") {
      data = data.filter((a) => a.status === "EXPIRED");
    }

    if (activeFilter === "suspended") {
      data = data.filter((a) => a.status === "SUSPENDED");
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.status.toLowerCase().includes(q)
      );
    }

    return data;
  }, [academies, activeFilter, search]);

  const tableTitle =
    activeFilter === "all"
      ? "All Academies"
      : statCards.find((c) => c.key === activeFilter)?.label ||
        "All Academies";

  const extendTrial = (id: string) => {
    setAcademies((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "TRIAL",
              trialEnds: "30 May",
              urgent: undefined,
            }
          : a
      )
    );
  };

  return (
    <div className="w-full bg-[#fffdf0] px-6 py-6 text-[#061739]">
      <div className="mb-6">
        <h1 className="text-[26px] font-extrabold tracking-tight">
          Trial Monitor
        </h1>
        <p className="mt-1 text-[14px] text-[#536987]">
          Track academy trials, conversions & suspensions
        </p>
      </div>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isActive = activeFilter === card.key;

          return (
            <button
              key={card.key}
              onClick={() =>
                setActiveFilter(activeFilter === card.key ? "all" : card.key)
              }
              className={`relative h-[135px] rounded-2xl p-4 text-left transition-all ${
                isActive
                  ? "border-2 border-[#00897b] bg-white shadow-sm"
                  : "border-2 border-transparent hover:bg-white/50"
              }`}
            >
              {isActive && (
                <span className="absolute right-4 top-4 rounded-full bg-[#eef3f8] px-3 py-1 text-[10px] font-bold text-[#536987]">
                  Filtered
                </span>
              )}

              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-white ${card.iconBg}`}
              >
                <Icon size={20} />
              </div>

              <p className="text-[13px] font-semibold text-[#536987]">
                {card.label}
              </p>

              <h2 className="mt-2 text-[26px] font-extrabold leading-none">
                {card.value}
              </h2>
            </button>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] shadow-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[14px] font-extrabold">{tableTitle}</h2>
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
            {filteredAcademies.map((academy) => (
              <tr
                key={academy.id}
                className="border-b border-[#d8e0ec] bg-[#f8fbff] text-[13px]"
              >
                <td className="px-3 py-3 text-[11px] text-[#536987]">
                  {academy.id}
                </td>

                <td className="px-5 py-3 font-bold">{academy.name}</td>

                <td className="px-5 py-3">{academy.city}</td>

                <td className="px-5 py-3">{academy.students}</td>

                <td className="px-5 py-3">
                  <StatusBadge status={academy.status} />
                </td>

                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span>{academy.trialEnds}</span>

                    {academy.urgent === "today" && (
                      <span className="rounded-full bg-[#e5242a] px-3 py-1 text-[11px] font-bold text-white">
                        Today!
                      </span>
                    )}

                    {academy.urgent === "1d" && (
                      <span className="rounded-full bg-[#e5242a] px-3 py-1 text-[11px] font-bold text-white">
                        1d
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-5 py-3">
                  {academy.status !== "ACTIVE" && (
                    <button
                      onClick={() => {
                        setSelectedAcademy(academy);
                        setExtendDays(7);
                      }}
                      className="inline-flex h-[38px] items-center gap-2 rounded-xl border border-[#d8e0ec] bg-white px-4 text-[12px] font-bold shadow-sm hover:bg-slate-50"
                    >
                      <Plus size={15} />
                      Extend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedAcademy && (
        <div
          onClick={() => setSelectedAcademy(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[430px] rounded-2xl bg-[#fffdf0] p-6 shadow-2xl"
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
              onClick={() => {
                extendTrial(selectedAcademy.id);
                setSelectedAcademy(null);
              }}
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

function StatusBadge({ status }: { status: TrialStatus }) {
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
          label: status,
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