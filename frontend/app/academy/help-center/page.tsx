"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Briefcase,
  ChevronDown,
  CircleHelp,
  Clock3,
  GraduationCap,
  Search,
  Shield,
  Ticket,
  UserRound,
  X,
} from "lucide-react";

type Category =
  | "All"
  | "Academy Management"
  | "Account & Security"
  | "Coach Tools"
  | "Getting Started"
  | "Student Portal";

const faqs = [
  {
    category: "Getting Started",
    question: "How do I access the mobile app?",
    answer: "Use your registered phone or email to log in. If your academy has enabled student access, students can use the student portal directly.",
  },
  {
    category: "Getting Started",
    question: "How do I log in for the first time?",
    answer: "Open the login page, choose your portal, enter your registered email and password, then complete verification if required.",
  },
  {
    category: "Getting Started",
    question: "My login says 'Invalid Credentials' — what do I do?",
    answer: "Check your portal type, email, and password. If the issue continues, reset your password or raise a ticket.",
  },
  {
    category: "Getting Started",
    question: "How do I set up my academy after signing up?",
    answer: "Complete academy profile, add batches/courses, add students, then configure fees and attendance.",
  },
  {
    category: "Academy Management",
    question: "How do I add students in bulk?",
    answer: "Go to Students → Import CSV. Upload the CSV with name, phone, batch, course, guardian, and basic student details.",
  },
  {
    category: "Academy Management",
    question: "How do I generate fee invoices?",
    answer: "Open Students → Fees → Generate Fees. Select one student, multiple students, or all active students.",
  },
  {
    category: "Academy Management",
    question: "How do I run payroll?",
    answer: "Go to HRMS → Payroll, select month and year, then click Run Payroll.",
  },
  {
    category: "Academy Management",
    question: "How do I create events and tournaments?",
    answer: "Open Events and click Create Event. Add title, venue, dates, type, participants, and entry fee.",
  },
  {
    category: "Academy Management",
    question: "How do I track my academy's financial health?",
    answer: "Use Finance and KPI Dashboard to track revenue, expenses, attendance, collection rate, and growth.",
  },
  {
    category: "Account & Security",
    question: "How do I change my password?",
    answer: "Go to account settings and choose change password. Enter old password and set a new strong password.",
  },
  {
    category: "Account & Security",
    question: "How do I contact support?",
    answer: "Open the Tickets section and create a support ticket with category, priority, subject, and message.",
  },
  {
    category: "Account & Security",
    question: "Is my data secure?",
    answer: "Yes. Role-based access and academy-level isolation help keep user data separated and protected.",
  },
];

const categories: { name: Category; icon: any }[] = [
  { name: "All", icon: CircleHelp },
  { name: "Academy Management", icon: UserRound },
  { name: "Account & Security", icon: Shield },
  { name: "Coach Tools", icon: Briefcase },
  { name: "Getting Started", icon: BookOpen },
  { name: "Student Portal", icon: GraduationCap },
];

export default function HelpCenterPage() {
  const [active, setActive] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      const categoryOk = active === "All" || faq.category === active;
      const searchOk =
        !query ||
        faq.question.toLowerCase().includes(query.toLowerCase()) ||
        faq.answer.toLowerCase().includes(query.toLowerCase());

      return categoryOk && searchOk;
    });
  }, [active, query]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof faqs> = {};

    filtered.forEach((faq) => {
      if (!map[faq.category]) map[faq.category] = [];
      map[faq.category].push(faq);
    });

    return map;
  }, [filtered]);

  function countCategory(category: Category) {
    if (category === "All") return faqs.length;
    return faqs.filter((faq) => faq.category === category).length;
  }

  function clearFilters() {
    setActive("All");
    setQuery("");
    setOpenFaq(null);
  }

  return (
    <main className="min-h-screen bg-[#fffdf0] text-[#17223b]">
      <TopBar />

      <div className="px-8 py-7">
        <div>
          <h1 className="flex items-center gap-3 text-[30px] font-black">
            <CircleHelp size={27} className="text-[#007f72]" />
            Help Center
          </h1>
          <p className="mt-1 text-[16px] text-[#52657d]">
            Find answers to common questions about Out-Play
          </p>
        </div>

        <div className="mt-5 flex h-12 w-[590px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4">
          <Search size={19} className="text-[#52657d]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQs... e.g. attendance, fees, login"
            className="w-full bg-transparent outline-none placeholder:text-[#52657d]"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = active === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => {
                  setActive(cat.name);
                  setOpenFaq(null);
                }}
                className={`flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm ${
                  isActive
                    ? "border-[#007f72] bg-[#007f72] text-white"
                    : "border-slate-200 bg-white text-[#17223b] hover:bg-slate-50"
                }`}
              >
                <Icon size={17} />
                {cat.name} ({countCategory(cat.name)})
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 flex h-[305px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] shadow-sm">
            <Search size={56} className="text-slate-300" />
            <h2 className="mt-5 text-[21px] font-black">No results found</h2>
            <p className="mt-2 text-[16px] text-[#52657d]">
              Try different keywords or browse categories
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold shadow-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {Object.entries(grouped).map(([category, list]) => (
              <div
                key={category}
                className="rounded-xl border border-slate-200 bg-[#f8fafc] p-7 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-[#007f72]">
                    <BookOpen size={18} />
                  </span>
                  <h2 className="text-[17px] font-black">{category}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-[#52657d]">
                    {list.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {list.map((faq) => {
                    const opened = openFaq === faq.question;

                    return (
                      <div
                        key={faq.question}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                      >
                        <button
                          onClick={() =>
                            setOpenFaq(opened ? null : faq.question)
                          }
                          className="flex min-h-[50px] w-full items-center justify-between px-4 text-left text-[16px] font-black"
                        >
                          {faq.question}
                          <ChevronDown
                            size={18}
                            className={`transition ${
                              opened ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {opened && (
                          <div className="border-t border-slate-200 px-4 py-4 text-[15px] leading-relaxed text-[#52657d]">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex h-[88px] items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-7 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-[#007f72]">
              <Ticket size={21} />
            </div>
            <div>
              <h3 className="font-black">Didn't find what you need?</h3>
              <p className="text-[14px] text-[#52657d]">
                Open a support ticket and our team will respond within 24 hours
              </p>
            </div>
          </div>

          <Link
            href="/academy/tickets"
            className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold shadow-sm hover:bg-slate-50"
          >
            Open a Ticket <span className="text-xl leading-none">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <>
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
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-300 to-rose-400" />
        </div>
      </header>
    </>
  );
}