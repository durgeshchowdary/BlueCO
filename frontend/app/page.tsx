"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  ClipboardCheck,
  Dumbbell,
  IndianRupee,
  Mail,
  Shield,
  Smartphone,
  Star,
  Trophy,
  Users,
} from "lucide-react";

export default function HomePage() {
  const modules: [
    string,
    string,
    React.ElementType,
    string
  ][] = [
    [
      "Student Management",
      "Enroll, track attendance, fees & progress cards.",
      Users,
      "border-t-emerald-500",
    ],
    [
      "Smart HRMS",
      "Payroll, leaves & automated calculations.",
      Trophy,
      "border-t-blue-500",
    ],
    [
      "Event Management",
      "AI posters, QR registration & certificates.",
      CalendarDays,
      "border-t-orange-500",
    ],
    [
      "AI Invoicing",
      "GST invoices, duplicate detection.",
      IndianRupee,
      "border-t-emerald-500",
    ],
    [
      "Analytics & KPI",
      "Revenue dashboards & AI recommendations.",
      BarChart3,
      "border-t-purple-500",
    ],
    [
      "Enterprise Security",
      "RBAC, audit logs & encrypted data.",
      Shield,
      "border-t-slate-500",
    ],
    [
      "CRM & Leads",
      "Track inquiries & convert prospects.",
      Star,
      "border-t-pink-500",
    ],
    [
      "Mobile Ready",
      "Responsive for coaches & parents.",
      Smartphone,
      "border-t-cyan-500",
    ],
    [
      "Progress Cards",
      "Skill ratings, coach notes & PDF reports.",
      BookOpen,
      "border-t-yellow-500",
    ],
    [
      "Fitness Tracking",
      "BMI auto-calc & performance benchmarks.",
      Dumbbell,
      "border-t-rose-500",
    ],
    [
      "Attendance System",
      "QR marking, streaks & gamification.",
      ClipboardCheck,
      "border-t-emerald-500",
    ],
    [
      "AI Insights",
      "Revenue forecasts & smart scheduling.",
      Brain,
      "border-t-violet-500",
    ],
  ];

  return (
    <main className="min-h-screen bg-[#f8f7ec] text-[#17223b]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[86px] max-w-[1280px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-white shadow-sm">
              <span className="text-[10px] font-black text-red-500">
                OUT
              </span>
            </div>

            <div className="text-[28px] font-black">
              Out-<span className="text-red-500">Play</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-10 rounded-2xl bg-slate-100 px-8 py-5 lg:flex">
            <a href="#features" className="font-semibold">
              Features
            </a>

            <a href="#reviews" className="font-semibold">
              Reviews
            </a>

            <a href="#pricing" className="font-semibold">
              Pricing
            </a>

            <a href="#contact" className="font-semibold">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="font-semibold text-slate-700"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-7 py-4 font-bold text-white shadow-lg transition hover:scale-105 hover:bg-emerald-700"
            >
              Start Free Trial
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=2000&auto=format&fit=crop')",
          }}
        />

        <div className="absolute inset-0 bg-[#04132c]/75" />

        <div className="relative mx-auto flex min-h-[920px] max-w-[1280px] flex-col items-center justify-center px-6 text-center text-white">
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-6 py-3 text-lg font-bold text-emerald-200 backdrop-blur">
            ⚡ India’s #1 Sports Academy Platform
          </div>

          <h1 className="mt-10 text-[95px] font-black leading-[0.95] tracking-[-4px]">
            Play Pro.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
              Scale Your Academy 10X
            </span>
          </h1>

          <p className="mt-10 max-w-[900px] text-[26px] font-medium text-slate-200">
            AI-powered management for football, cricket, swimming &
            50+ sports. Students, coaching, payments, events — all
            in one platform.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/signup"
              className="flex items-center gap-3 rounded-3xl bg-emerald-500 px-12 py-6 text-[22px] font-black text-white shadow-2xl transition hover:scale-105"
            >
              Start Free Trial
              <ArrowRight size={22} />
            </Link>

            <a
              href="#features"
              className="rounded-3xl border border-white/20 bg-white/10 px-12 py-6 text-[22px] font-bold text-white backdrop-blur"
            >
              View Features
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-lg text-slate-300">
            <span>✅ 14-day free trial</span>
            <span>✅ No credit card</span>
            <span>✅ UPI + Razorpay</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-slate-200 bg-[#f8f7ec] py-16">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-10 px-6 md:grid-cols-4">
          {[
            ["500+", "Academies", "text-emerald-600"],
            ["25,000+", "Students", "text-blue-600"],
            ["99.9%", "Uptime", "text-orange-500"],
            ["87%", "Collection Rate", "text-violet-500"],
          ].map(([num, label, color]) => (
            <div key={label} className="text-center">
              <h3 className={`text-6xl font-black ${color}`}>
                {num}
              </h3>

              <p className="mt-3 text-xl text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        className="mx-auto max-w-[1280px] px-6 py-28"
        id="features"
      >
        <div className="text-center">
          <span className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold">
            12 Powerful Modules
          </span>

          <h2 className="mt-8 text-6xl font-black">
            Everything Your Academy Needs
          </h2>

          <p className="mt-5 text-2xl text-slate-500">
            From enrollment to alumni tracking.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
          {modules.map(([title, desc, Icon, border]) => (
            <div
              key={title}
              className={`rounded-3xl border border-slate-200 border-t-4 ${border} bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl`}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Icon size={28} />
              </div>

              <h3 className="text-[28px] font-black">
                {title}
              </h3>

              <p className="mt-4 text-lg leading-8 text-slate-500">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        className="bg-[#f8f7ec] py-28"
        id="pricing"
      >
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="text-center">
            <span className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold">
              Simple Pricing
            </span>

            <h2 className="mt-8 text-6xl font-black">
              Start Free, Scale as You Grow
            </h2>
          </div>

          <div className="mt-20 grid gap-10 lg:grid-cols-3">
            {/* STARTER */}
            <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
              <h3 className="text-4xl font-black">Starter</h3>

              <p className="mt-3 text-slate-500">
                Perfect for trying out
              </p>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-6xl font-black">₹0</span>
                <span className="mb-2 text-xl text-slate-500">
                  14 days free
                </span>
              </div>

              <div className="mt-10 space-y-5">
                {[
                  "Up to 50 students",
                  "Basic attendance",
                  "Fee tracking",
                  "Email support",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <Check className="text-emerald-500" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className="mt-12 block rounded-2xl border border-slate-300 py-5 text-center text-xl font-bold"
              >
                Start Free Trial
              </Link>
            </div>

            {/* PRO */}
            <div className="relative rounded-3xl border-2 border-emerald-500 bg-white p-10 shadow-2xl">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-6 py-2 text-sm font-black text-white">
                Most Popular
              </div>

              <h3 className="text-4xl font-black">Pro</h3>

              <p className="mt-3 text-slate-500">
                For growing academies
              </p>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-6xl font-black">₹999</span>
                <span className="mb-2 text-xl text-slate-500">
                  /month
                </span>
              </div>

              <div className="mt-10 space-y-5">
                {[
                  "Unlimited students",
                  "Full HRMS + Payroll",
                  "AI Invoicing",
                  "Event management",
                  "WhatsApp reminders",
                  "Priority support",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <Check className="text-emerald-500" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className="mt-12 block rounded-2xl bg-emerald-600 py-5 text-center text-xl font-black text-white"
              >
                Get Started
              </Link>
            </div>

            {/* ENTERPRISE */}
            <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
              <h3 className="text-4xl font-black">
                Enterprise
              </h3>

              <p className="mt-3 text-slate-500">
                Multi-center academies
              </p>

              <div className="mt-8">
                <span className="text-5xl font-black">
                  Contact Sales
                </span>
              </div>

              <div className="mt-10 space-y-5">
                {[
                  "Everything in Pro",
                  "Custom branding",
                  "API access",
                  "Dedicated manager",
                  "SLA guarantee",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <Check className="text-emerald-500" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="#contact"
                className="mt-12 block rounded-2xl border border-slate-300 py-5 text-center text-xl font-bold"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        className="mx-auto max-w-[1280px] px-6 py-28"
        id="contact"
      >
        <div className="grid gap-20 lg:grid-cols-2">
          <div>
            <span className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold">
              Get in Touch
            </span>

            <h2 className="mt-8 text-6xl font-black">
              Let's Talk About Your Academy
            </h2>

            <p className="mt-8 text-2xl leading-10 text-slate-500">
              Whether you're running a 50-student academy or a
              multi-center organization, we'd love to hear from you.
            </p>

            <div className="mt-12 flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <Mail className="text-emerald-600" />
              </div>

              <div>
                <p className="font-bold">Email us</p>

                <p className="text-lg text-slate-500">
                  contact@out-play.in
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
            <div className="grid gap-6 md:grid-cols-2">
              <input
                placeholder="Your name"
                className="rounded-2xl border border-slate-300 px-5 py-4 outline-none"
              />

              <input
                placeholder="you@academy.com"
                className="rounded-2xl border border-slate-300 px-5 py-4 outline-none"
              />
            </div>

            <textarea
              placeholder="Tell us about your academy..."
              className="mt-6 h-40 w-full rounded-2xl border border-slate-300 px-5 py-4 outline-none"
            />

            <button className="mt-8 w-full rounded-2xl bg-emerald-600 py-5 text-xl font-black text-white">
              Send Message
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-500 py-28 text-white">
        <div className="mx-auto max-w-[1000px] px-6 text-center">
          <h2 className="text-6xl font-black">
            Ready to Transform Your Academy?
          </h2>

          <p className="mt-8 text-2xl text-emerald-50">
            Join 500+ academies. 14-day free trial with all 12
            modules.
          </p>

          <Link
            href="/signup"
            className="mt-12 inline-flex items-center gap-4 rounded-3xl bg-white px-12 py-6 text-2xl font-black text-emerald-700 shadow-2xl"
          >
            Start Your Free Trial
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto grid max-w-[1280px] gap-16 px-6 lg:grid-cols-4">
          <div>
            <div className="text-[36px] font-black">
              Out-<span className="text-red-500">Play</span>
            </div>

            <p className="mt-5 text-lg leading-8 text-slate-500">
              India's #1 AI Sports Academy Platform.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-black">Product</h4>

            <div className="mt-5 space-y-4 text-lg text-slate-500">
              <p>Features</p>
              <p>Pricing</p>
              <p>Free Trial</p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-black">Company</h4>

            <div className="mt-5 space-y-4 text-lg text-slate-500">
              <p>About</p>
              <p>Contact</p>
              <p>Blog</p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-black">Support</h4>

            <div className="mt-5 space-y-4 text-lg text-slate-500">
              <p>Help Center</p>
              <p>Privacy Policy</p>
              <p>Terms of Service</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}