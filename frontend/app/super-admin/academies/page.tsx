"use client";

import React, { useMemo, useState } from "react";
import {
  Trophy,
  Crown,
  Clock,
  Ban,
  Download,
  Search,
  MoreHorizontal,
  Power,
  RotateCcw,
} from "lucide-react";

type FilterType = "all" | "plan" | "trial" | "deactivated";
type Status = "Active" | "Trial" | "Deactivated";
type Plan = "Free" | "₹999";

type Academy = {
  id: string;
  name: string;
  phone: string;
  city: string;
  students: number;
  plan: Plan;
  status: Status;
};

const initialAcademies: Academy[] = [
  {
    id: "ACE001",
    name: "Vijayawada Blues Football Club",
    phone: "9490919097",
    city: "Vijayawada",
    students: 2,
    plan: "₹999",
    status: "Active",
  },
  {
    id: "ACE002",
    name: "abc",
    phone: "+919876543212",
    city: "bangalore",
    students: 0,
    plan: "Free",
    status: "Trial",
  },
  {
    id: "ACE003",
    name: "kca",
    phone: "+91987654322",
    city: "bangalore",
    students: 0,
    plan: "Free",
    status: "Trial",
  },
  {
    id: "ACE004",
    name: "Vijayawada blues",
    phone: "+919346701583",
    city: "Krishna",
    students: 0,
    plan: "Free",
    status: "Trial",
  },
];

export default function SuperAdminAcademiesPage() {
  const [academies, setAcademies] =
    useState<Academy[]>(initialAcademies);

  const [activeFilter, setActiveFilter] =
    useState<FilterType>("all");

  const [search, setSearch] = useState("");

  const [openMenu, setOpenMenu] =
    useState<string | null>(null);

  const allCount = academies.length;

  const planCount = academies.filter(
    (a) => a.plan === "₹999"
  ).length;

  const trialCount = academies.filter(
    (a) => a.status === "Trial"
  ).length;

  const deactivatedCount = academies.filter(
    (a) => a.status === "Deactivated"
  ).length;

  const percent = (count: number) =>
    allCount === 0
      ? "0% of total"
      : `${Math.round((count / allCount) * 100)}% of total`;

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
      width: `${Math.max(
        (planCount / allCount) * 100,
        planCount ? 8 : 2
      )}%`,
      price: "₹999",
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
      width: `${Math.max(
        (trialCount / allCount) * 100,
        trialCount ? 8 : 2
      )}%`,
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
      width: `${Math.max(
        (deactivatedCount / allCount) * 100,
        2
      )}%`,
    },
  ];

  const filteredAcademies = useMemo(() => {
    let data = [...academies];

    if (activeFilter === "plan")
      data = data.filter((a) => a.plan === "₹999");

    if (activeFilter === "trial")
      data = data.filter((a) => a.status === "Trial");

    if (activeFilter === "deactivated")
      data = data.filter(
        (a) => a.status === "Deactivated"
      );

    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q)
      );
    }

    return data;
  }, [academies, activeFilter, search]);

  const tableTitle =
    activeFilter === "all"
      ? "All Academies"
      : activeFilter === "plan"
      ? "Plan Based Academies"
      : activeFilter === "trial"
      ? "On Trial Academies"
      : "Deactivated Academies";

  const exportCSV = () => {
    const rows = [
      [
        "ID",
        "Academy",
        "Phone",
        "City",
        "Students",
        "Plan",
        "Status",
      ],

      ...filteredAcademies.map((a) => [
        a.id,
        a.name,
        a.phone,
        a.city,
        String(a.students),
        a.plan,
        a.status,
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${activeFilter}-academies.csv`;

    link.click();

    window.URL.revokeObjectURL(url);
  };

  const updateAcademy = (
    id: string,
    status: Status,
    plan?: Plan
  ) => {
    setAcademies((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              plan: plan ?? a.plan,
            }
          : a
      )
    );

    setOpenMenu(null);
  };

  return (
    <div className="w-full bg-[#fffdf0] px-6 py-6 text-[#061739]">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">
            Academies
          </h1>

          <p className="mt-1 text-[14px] text-[#536987]">
            {academies.length} registered academies
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex h-[42px] items-center gap-2 rounded-xl border border-[#d8e0ec] bg-white px-4 text-[13px] font-bold shadow-sm hover:bg-slate-50"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          const isActive = activeFilter === card.key;

          return (
            <button
              key={card.key}
              onClick={() => setActiveFilter(card.key)}
              className={`relative h-[150px] rounded-2xl p-4 text-left transition-all duration-200 ${
                card.bg
              } ${
                isActive
                  ? "border-2 border-[#00897b] shadow-md"
                  : "border-2 border-transparent hover:border-[#d8e0ec]"
              }`}
            >
              {isActive && (
                <span className="absolute right-4 top-5 rounded-full bg-[#00796b] px-2 py-1 text-[10px] font-bold text-white">
                  Active
                </span>
              )}

              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-white ${card.iconBg}`}
              >
                <Icon size={20} />
              </div>

              <p className="text-[13px] font-semibold text-[#536987]">
                {card.title}
              </p>

              <div className="mt-2 flex items-end justify-between">
                <h2 className="text-[26px] font-extrabold leading-none">
                  {card.value}
                </h2>

                {card.price && (
                  <div className="text-right">
                    <p className="text-[14px] font-extrabold">
                      {card.price}
                    </p>

                    <p className="text-[10px] text-[#536987]">
                      /month
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-2 text-[12px] text-[#536987]">
                {card.percent}
              </p>

              <div className="mt-3 h-1 rounded-full bg-white">
                <div
                  className={`h-1 rounded-full ${card.bar}`}
                  style={{ width: card.width }}
                />
              </div>
            </button>
          );
        })}
      </section>

      <section className="mt-5 overflow-visible rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] shadow-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[14px] font-extrabold">
              {tableTitle}
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
              placeholder="Search name, city, ID..."
              className="h-[44px] w-[280px] rounded-xl border border-[#d8e0ec] bg-white pl-10 pr-4 text-[13px] outline-none focus:border-[#00897b]"
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
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {filteredAcademies.length > 0 ? (
              filteredAcademies.map((academy) => (
                <tr
                  key={academy.id}
                  className="border-b border-[#d8e0ec] bg-[#f8fbff] text-[13px]"
                >
                  <td className="px-3 py-3 text-[11px] text-[#536987]">
                    {academy.id}
                  </td>

                  <td className="px-5 py-3">
                    <p className="font-bold">
                      {academy.name}
                    </p>

                    <p className="text-[11px] text-[#536987]">
                      {academy.phone}
                    </p>
                  </td>

                  <td className="px-5 py-3">
                    {academy.city}
                  </td>

                  <td className="px-5 py-3">
                    {academy.students}
                  </td>

                  <td className="px-5 py-3">
                    <span className="rounded-full border border-[#d8e0ec] bg-white px-3 py-1 text-[11px] font-bold">
                      {academy.plan}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <StatusBadge status={academy.status} />
                  </td>

                  <td className="relative px-5 py-3 text-right">
                    <button
                      onClick={() =>
                        setOpenMenu(
                          openMenu === academy.id
                            ? null
                            : academy.id
                        )
                      }
                      className="rounded-lg p-2 hover:bg-slate-100"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {openMenu === academy.id && (
                      <div className="absolute right-8 top-10 z-50 w-52 rounded-xl border border-[#d8e0ec] bg-white p-2 text-left shadow-xl">
                        <button
                          onClick={() =>
                            updateAcademy(
                              academy.id,
                              "Active",
                              "₹999"
                            )
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold hover:bg-emerald-50"
                        >
                          <Crown size={14} />
                          Make Plan Based
                        </button>

                        <button
                          onClick={() =>
                            updateAcademy(
                              academy.id,
                              "Trial",
                              "Free"
                            )
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold hover:bg-blue-50"
                        >
                          <RotateCcw size={14} />
                          Move To Trial
                        </button>

                        <button
                          onClick={() =>
                            updateAcademy(
                              academy.id,
                              "Deactivated"
                            )
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50"
                        >
                          <Power size={14} />
                          Deactivate
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="flex h-[220px] flex-col items-center justify-center text-center">
                    <Ban
                      size={42}
                      className="mb-3 text-slate-300"
                    />

                    <p className="text-[14px] font-medium text-[#536987]">
                      No academies found
                    </p>

                    <p className="mt-2 text-[12px] text-[#536987]">
                      No academies for this filter
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }

  if (status === "Trial") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        Trial
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-100 px-3 py-1 text-[11px] font-bold text-red-700">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      Deactivated
    </span>
  );
}