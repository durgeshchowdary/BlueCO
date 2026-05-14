"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  Search,
  Shield,
  Ticket,
  Users,
} from "lucide-react";

type Category =
  | "All"
  | "Academy Management"
  | "Account & Security"
  | "Coach Tools"
  | "Getting Started"
  | "Student Portal";

const categories: { name: Category; count: number; icon?: any }[] = [
  { name: "All", count: 12 },
  { name: "Academy Management", count: 5, icon: Users },
  { name: "Account & Security", count: 3, icon: Shield },
  { name: "Coach Tools", count: 0, icon: Briefcase },
  { name: "Getting Started", count: 4, icon: BookOpen },
  { name: "Student Portal", count: 0, icon: GraduationCap },
];

const faqGroups = [
  {
    category: "Getting Started" as Category,
    color: "bg-emerald-100 text-emerald-600",
    icon: BookOpen,
    questions: [
      "How do I access the mobile app?",
      "How do I log in for the first time?",
      "My login says 'Invalid Credentials' — what do I do?",
      "How do I set up my academy after signing up?",
    ],
  },
  {
    category: "Academy Management" as Category,
    color: "bg-amber-100 text-amber-600",
    icon: Users,
    questions: [
      "How do I add students in bulk?",
      "How do I generate fee invoices?",
      "How do I run payroll?",
      "How do I create events and tournaments?",
      "How do I track my academy's financial health?",
    ],
  },
  {
    category: "Account & Security" as Category,
    color: "bg-slate-100 text-slate-600",
    icon: Shield,
    questions: [
      "How do I change my password?",
      "How do I contact support?",
      "Is my data secure?",
    ],
  },
];

export default function SuperAdminHelpCenterPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");

  const visibleGroups = useMemo(() => {
    let groups =
      activeCategory === "All"
        ? faqGroups
        : faqGroups.filter((group) => group.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();

      groups = groups
        .map((group) => ({
          ...group,
          questions: group.questions.filter((item) =>
            item.toLowerCase().includes(q)
          ),
        }))
        .filter((group) => group.questions.length > 0);
    }

    return groups;
  }, [activeCategory, search]);

  return (
    <main className="min-h-screen bg-[#fffdf0] px-8 py-8 text-[#061739]">
      <section>
        <div className="flex items-center gap-3">
          <HelpCircle size={26} className="text-[#00897b]" />

          <h1 className="text-[30px] font-black leading-none">
            Help Center
          </h1>
        </div>

        <p className="mt-2 text-[16px] text-[#536987]">
          Find answers to common questions about Out-Play
        </p>

        <div className="relative mt-6 w-[560px] max-w-full">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7f99]"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs... e.g. attendance, fees, login"
            className="h-[46px] w-full rounded-xl border border-[#d8e0ec] bg-white px-12 text-[16px] outline-none focus:border-[#00897b]"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex h-[36px] items-center gap-2 rounded-xl border px-4 text-[14px] font-bold shadow-sm transition ${
                  active
                    ? "border-[#00897b] bg-[#00897b] text-white"
                    : "border-[#d8e0ec] bg-white text-[#061739] hover:border-[#00897b]"
                }`}
              >
                {Icon && <Icon size={16} />}
                {cat.name} ({cat.count})
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        {visibleGroups.length > 0 ? (
          <div className="space-y-6">
            {visibleGroups.map((group) => {
              const Icon = group.icon;

              return (
                <div
                  key={group.category}
                  className="rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] p-7 shadow-sm"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${group.color}`}
                    >
                      <Icon size={18} />
                    </div>

                    <h2 className="text-[17px] font-black">
                      {group.category}
                    </h2>

                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-[12px] font-bold text-[#536987]">
                      {group.questions.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.questions.map((question) => (
                      <button
                        key={question}
                        className="flex h-[52px] w-full items-center justify-between rounded-xl border border-[#d8e0ec] bg-[#f8fbff] px-4 text-left text-[16px] font-bold text-[#061739]"
                      >
                        {question}

                        <ChevronDown
                          size={18}
                          className="text-[#536987]"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-[315px] items-center justify-center rounded-2xl border border-dashed border-[#d8e0ec] bg-[#f8fbff] shadow-sm">
            <div className="text-center">
              <Search size={58} className="mx-auto text-slate-300" />

              <h2 className="mt-5 text-[21px] font-black">
                No results found
              </h2>

              <p className="mt-2 text-[15px] text-[#536987]">
                Try different keywords or browse categories
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="mt-5 rounded-xl border border-[#d8e0ec] bg-white px-4 py-2 text-[14px] font-semibold shadow-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 flex items-center justify-between rounded-2xl border border-emerald-100 bg-[#f3faef] px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-[#00897b]">
            <Ticket size={21} />
          </div>

          <div>
            <h3 className="text-[16px] font-black">
              Didn&apos;t find what you need?
            </h3>

            <p className="text-[14px] text-[#536987]">
              Open a support ticket and our team will respond within 24 hours
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            window.location.href = "/super-admin/tickets";
          }}
          className="flex h-10 items-center gap-3 rounded-xl border border-[#d8e0ec] bg-white px-4 text-[14px] font-semibold shadow-sm hover:border-[#00897b]"
        >
          Open a Ticket
          <span className="text-xl leading-none">→</span>
        </button>
      </section>
    </main>
  );
}