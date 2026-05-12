'use client';

import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  Search,
  Shield,
  Users,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

type FAQCategory =
  | 'Getting Started'
  | 'Academy Management'
  | 'Account & Security'
  | 'Coach Tools'
  | 'Student Portal';

type FAQ = {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    id: '1',
    category: 'Getting Started',
    question: 'How do I access the mobile app?',
    answer:
      'You can access OUT-PLAY from any browser. A mobile app can be added later as a PWA or native app.',
  },
  {
    id: '2',
    category: 'Getting Started',
    question: 'How do I log in for the first time?',
    answer:
      'Use the login page with your registered email and password. For demo mode, any valid email/password can log in.',
  },
  {
    id: '3',
    category: 'Getting Started',
    question: "My login says 'Invalid Credentials' — what do I do?",
    answer:
      'Check your email/password and confirm the backend auth service is running. In demo mode, localStorage auth can be used.',
  },
  {
    id: '4',
    category: 'Getting Started',
    question: 'How do I set up my academy after signing up?',
    answer:
      'Go to Settings, update your academy name, owner details, phone, email, address, and logo URL.',
  },
  {
    id: '5',
    category: 'Academy Management',
    question: 'How do I add students in bulk?',
    answer:
      'Use the Students section and import CSV flow. You can also add students manually one by one.',
  },
  {
    id: '6',
    category: 'Academy Management',
    question: 'How do I generate fee invoices?',
    answer:
      'Go to Finance or Students and use Generate Fees. Future versions can support invoice PDFs and WhatsApp reminders.',
  },
  {
    id: '7',
    category: 'Academy Management',
    question: 'How do I run payroll?',
    answer:
      'Open HRMS, review employee salary details, and use payroll metrics to calculate monthly payments.',
  },
  {
    id: '8',
    category: 'Academy Management',
    question: 'How do I manage batches and sessions?',
    answer:
      'Use Training Sessions to create batches with sport, coach, timing, and capacity.',
  },
  {
    id: '9',
    category: 'Academy Management',
    question: 'How do I track attendance?',
    answer:
      'Use Attendance or Training Sessions to mark present/absent status and monitor attendance percentage.',
  },
  {
    id: '10',
    category: 'Account & Security',
    question: 'Can I change my academy profile?',
    answer:
      'Yes. Open Settings and update academy profile data. Demo settings are stored locally.',
  },
  {
    id: '11',
    category: 'Account & Security',
    question: 'How is my data protected?',
    answer:
      'Production apps should use encrypted databases, role-based access, secure auth, and audit logs.',
  },
  {
    id: '12',
    category: 'Account & Security',
    question: 'Can staff have separate roles?',
    answer:
      'Yes, role-based access can be added for admins, coaches, accountants, and support teams.',
  },
];

const categories: {
  name: 'All' | FAQCategory;
  icon: ElementType;
}[] = [
  { name: 'All', icon: HelpCircle },
  { name: 'Academy Management', icon: Users },
  { name: 'Account & Security', icon: Shield },
  { name: 'Coach Tools', icon: Briefcase },
  { name: 'Getting Started', icon: BookOpen },
  { name: 'Student Portal', icon: GraduationCap },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | FAQCategory>(
    'All',
  );
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const q = search.toLowerCase();

    return faqs.filter((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q);

      const matchesCategory =
        activeCategory === 'All' || faq.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const groupedFaqs = useMemo(() => {
    return filteredFaqs.reduce<Record<FAQCategory, FAQ[]>>(
      (acc, faq) => {
        acc[faq.category].push(faq);
        return acc;
      },
      {
        'Getting Started': [],
        'Academy Management': [],
        'Account & Security': [],
        'Coach Tools': [],
        'Student Portal': [],
      },
    );
  }, [filteredFaqs]);

  const categoryCount = (category: 'All' | FAQCategory) => {
    if (category === 'All') return faqs.length;
    return faqs.filter((faq) => faq.category === category).length;
  };

  return (
    <main className="min-h-screen bg-[#f8f5e8] text-slate-900">
      <Sidebar />

      <section className="lg:pl-[280px]">
        <Topbar />

        <section className="p-5 md:p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <HelpCircle className="text-blue-700" size={32} />
              <h1 className="text-3xl font-black text-slate-900">
                Help Center
              </h1>
            </div>

            <p className="mt-1 text-lg text-slate-500">
              Find answers to common questions about OUT-PLAY
            </p>
          </div>

          <div className="relative mb-6 max-w-2xl">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs... e.g. attendance, fees, login"
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base font-medium shadow-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.name;

              return (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold shadow-sm ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} />
                  {category.name} ({categoryCount(category.name)})
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            {Object.entries(groupedFaqs).map(([category, items]) => {
              if (!items.length) return null;

              const CategoryIcon =
                categories.find((item) => item.name === category)?.icon ||
                HelpCircle;

              return (
                <div
                  key={category}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                      <CategoryIcon size={22} />
                    </div>

                    <h2 className="text-xl font-black text-slate-900">
                      {category}
                    </h2>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {items.map((faq) => {
                      const open = openId === faq.id;

                      return (
                        <div
                          key={faq.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50"
                        >
                          <button
                            onClick={() => setOpenId(open ? null : faq.id)}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-black text-slate-900"
                          >
                            {faq.question}

                            <ChevronDown
                              size={20}
                              className={`shrink-0 text-slate-500 transition ${
                                open ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {open ? (
                            <div className="border-t border-slate-200 px-5 py-4 text-slate-600">
                              {faq.answer}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {!filteredFaqs.length ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
                No FAQs found.
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}
