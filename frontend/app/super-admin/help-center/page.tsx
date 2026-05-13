"use client";

import Link from "next/link";
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

type FAQ = {
  id: string;
  category: Exclude<Category, "All">;
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    id: "1",
    category: "Getting Started",
    question: "How do I access the mobile app?",
    answer:
      "You can access Out-Play from any browser. Mobile app support can be added later as PWA or native app.",
  },
  {
    id: "2",
    category: "Getting Started",
    question: "How do I log in for the first time?",
    answer:
      "Use your registered email and password from the login page. Contact support if your account is not activated.",
  },
  {
    id: "3",
    category: "Getting Started",
    question: "My login says 'Invalid Credentials' — what do I do?",
    answer:
      "Check your email/password and confirm your academy account is active. If it still fails, open a support ticket.",
  },
  {
    id: "4",
    category: "Account & Security",
    question: "How do I change my password?",
    answer:
      "Go to Settings, open Security, and update your password. Use a strong password with letters, numbers, and symbols.",
  },
  {
    id: "5",
    category: "Account & Security",
    question: "How do I contact support?",
    answer:
      "Use the Tickets section to create a support ticket. Our team will respond from the support panel.",
  },
  {
    id: "6",
    category: "Account & Security",
    question: "Is my data secure?",
    answer:
      "Production systems should use secure authentication, role-based access, encrypted storage, and audit logs.",
  },
];

const categories: {
  name: Category;
  icon: React.ElementType;
}[] = [
  { name: "All", icon: HelpCircle },
  { name: "Academy Management", icon: Users },
  { name: "Account & Security", icon: Shield },
  { name: "Coach Tools", icon: Briefcase },
  { name: "Getting Started", icon: BookOpen },
  { name: "Student Portal", icon: GraduationCap },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const q = search.toLowerCase();

    return faqs.filter((faq) => {
      const searchMatch =
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q);

      const categoryMatch =
        activeCategory === "All" || faq.category === activeCategory;

      return searchMatch && categoryMatch;
    });
  }, [search, activeCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, FAQ[]> = {};

    filteredFaqs.forEach((faq) => {
      if (!groups[faq.category]) groups[faq.category] = [];
      groups[faq.category].push(faq);
    });

    return groups;
  }, [filteredFaqs]);

  const categoryCount = (category: Category) => {
    if (category === "All") return faqs.length;
    return faqs.filter((faq) => faq.category === category).length;
  };

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setOpenId(null);
  };

  return (
    <div className="min-h-screen bg-[#fffdf0] px-6 py-6 text-[#061739]">
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <HelpCircle size={24} className="text-[#00796b]" />
          <h1 className="text-[26px] font-extrabold tracking-tight">
            Help Center
          </h1>
        </div>

        <p className="mt-1 text-[14px] text-[#536987]">
          Find answers to common questions about Out-Play
        </p>
      </div>

      <div className="relative mb-5 w-[540px]">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#536987]"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search FAQs... e.g. attendance, fees, login"
          className="h-[44px] w-full rounded-xl border border-[#d8e0ec] bg-white pl-10 pr-4 text-[14px] outline-none focus:border-[#00897b]"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const active = activeCategory === category.name;

          return (
            <button
              key={category.name}
              onClick={() => {
                setActiveCategory(category.name);
                setOpenId(null);
              }}
              className={`flex h-[36px] items-center gap-2 rounded-xl border px-4 text-[13px] font-bold shadow-sm ${
                active
                  ? "border-[#00796b] bg-[#00796b] text-white"
                  : "border-[#d8e0ec] bg-white text-[#061739] hover:bg-slate-50"
              }`}
            >
              <Icon size={15} />
              {category.name} ({categoryCount(category.name)})
            </button>
          );
        })}
      </div>

      {filteredFaqs.length === 0 ? (
        <section className="flex h-[310px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8e0ec] bg-[#f8fbff] shadow-sm">
          <Search size={54} className="text-[#c4ccd8]" />

          <h2 className="mt-5 text-[20px] font-extrabold">
            No results found
          </h2>

          <p className="mt-2 text-[14px] text-[#536987]">
            Try different keywords or browse categories
          </p>

          <button
            onClick={clearFilters}
            className="mt-5 rounded-xl border border-[#d8e0ec] bg-white px-4 py-2 text-[13px] font-bold shadow-sm"
          >
            Clear Filters
          </button>
        </section>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([category, items]) => {
            const found = categories.find((c) => c.name === category);
            const Icon = found?.icon || HelpCircle;

            return (
              <section
                key={category}
                className="rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-[#00796b]">
                    <Icon size={18} />
                  </div>

                  <h2 className="text-[16px] font-extrabold">{category}</h2>

                  <span className="rounded-full bg-[#eef3f8] px-3 py-1 text-[12px] font-bold">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {items.map((faq) => {
                    const open = openId === faq.id;

                    return (
                      <div
                        key={faq.id}
                        className="overflow-hidden rounded-xl border border-[#d8e0ec] bg-[#f8fbff]"
                      >
                        <button
                          onClick={() => setOpenId(open ? null : faq.id)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-[14px] font-extrabold"
                        >
                          {faq.question}

                          <ChevronDown
                            size={17}
                            className={`text-[#536987] transition ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {open && (
                          <div className="border-t border-[#d8e0ec] px-4 py-3 text-[14px] leading-6 text-[#536987]">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <section className="mt-5 flex items-center justify-between rounded-2xl border border-emerald-100 bg-[#f4fbef] px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-[#00796b]">
            <Ticket size={20} />
          </div>

          <div>
            <h2 className="text-[15px] font-extrabold">
              Didn't find what you need?
            </h2>

            <p className="mt-1 text-[13px] text-[#536987]">
              Open a support ticket and our team will respond within 24 hours
            </p>
          </div>
        </div>

        <Link
          href="/super-admin/tickets"
          className="flex h-[38px] items-center gap-3 rounded-xl border border-[#d8e0ec] bg-white px-4 text-[13px] font-bold shadow-sm hover:bg-slate-50"
        >
          Open a Ticket
          <span className="text-[18px]">→</span>
        </Link>
      </section>
    </div>
  );
}