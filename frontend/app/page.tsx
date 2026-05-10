'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Mail,
  Menu,
  Shield,
  Smartphone,
  Star,
  Trophy,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useState, FormEvent } from 'react';
import api from '@/lib/api';

const features = [
  {
    title: 'Student Management',
    desc: 'Admissions, attendance, progress tracking & player insights.',
    icon: Users,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Smart HRMS',
    desc: 'Coach payroll, leaves, contracts and salary automation.',
    icon: ClipboardList,
    color: 'from-violet-500 to-fuchsia-500',
  },
  {
    title: 'Event Management',
    desc: 'Trials, tournaments, registrations and certificates.',
    icon: CalendarDays,
    color: 'from-orange-500 to-amber-500',
  },
  {
    title: 'AI Invoicing',
    desc: 'Automated invoices, reminders and fee collections.',
    icon: Wallet,
    color: 'from-emerald-500 to-green-500',
  },
  {
    title: 'Analytics & KPI',
    desc: 'Revenue dashboards and academy growth metrics.',
    icon: BarChart3,
    color: 'from-pink-500 to-rose-500',
  },
  {
    title: 'Enterprise Security',
    desc: 'Role-based access, audit logs and secure cloud backups.',
    icon: Shield,
    color: 'from-slate-500 to-slate-700',
  },
  {
    title: 'CRM & Leads',
    desc: 'Track enquiries and convert prospects faster.',
    icon: Star,
    color: 'from-indigo-500 to-blue-700',
  },
  {
    title: 'Mobile Ready',
    desc: 'Works beautifully on phones, tablets and desktops.',
    icon: Smartphone,
    color: 'from-sky-500 to-cyan-700',
  },
];

const pricingPlans = [
  { name: 'Starter', price: '₹0', desc: 'Perfect for trying out' },
  { name: 'Pro', price: '₹999', desc: 'Most Popular' },
  { name: 'Enterprise', price: 'Custom', desc: 'Large academies' },
];

const sports = [
  'Cricket', 'Football', 'Tennis', 'Swimming', 'Badminton', 'Other'
];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes, we offer a 14-day free trial with all modules unlocked.' },
  { q: 'How do I collect fees?', a: 'You can generate invoices and collect payments via UPI, Cards, or Netbanking.' },
];

const reviews = [
  {
    name: 'Rajesh Kumar',
    academy: 'Football Academy, Bengaluru',
    text: 'PlayGrid AI completely transformed our operations in under a month.',
  },
  {
    name: 'Priya Sharma',
    academy: 'Cricket Academy, Mumbai',
    text: 'Attendance and fee collection are now fully streamlined.',
  },
  {
    name: 'Amit Patel',
    academy: 'Swimming Academy, Delhi',
    text: 'Managing 500+ students is finally stress-free.',
  },
  {
    name: 'Sneha Reddy',
    academy: 'Badminton Academy, Hyderabad',
    text: 'The dashboard analytics helped us scale faster.',
  },
];

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', academy: '', sport: 'Cricket' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/demo-requests', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        academyName: form.academy,
        sportType: form.sport,
      });
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '', academy: '', sport: 'Cricket' });
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetContactForm = () => {
    setForm({ name: '', email: '', phone: '', message: '', academy: '', sport: 'Cricket' });
  };

  return (
    <main className="bg-[#060816] text-white overflow-hidden">
      {/* NAVBAR */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#060816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 font-black">
              P
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">
                PlayGrid AI
              </h1>
            </div>
          </div>

          <nav className="hidden items-center gap-8 rounded-full border border-white/10 bg-white/5 px-8 py-4 lg:flex">
            <a href="#features" className="hover:text-cyan-300">
              Features
            </a>

            <a href="#reviews" className="hover:text-cyan-300">
              Reviews
            </a>

            <a href="#pricing" className="hover:text-cyan-300">
              Pricing
            </a>

            <a href="#contact" className="hover:text-cyan-300">
              Contact
            </a>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/login"
              className="rounded-full border border-cyan-300/50 bg-white/10 px-7 py-3 font-semibold text-cyan-100 shadow-lg shadow-cyan-500/10 backdrop-blur transition hover:scale-105 hover:border-cyan-200 hover:bg-cyan-300/20 hover:text-white"
            >
              Login
            </Link>

            <a href="#contact" className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-7 py-3 font-semibold shadow-2xl transition hover:scale-105">
              Start Free Trial
            </a>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenu ? (
          <div className="mx-auto max-w-7xl px-6 pb-5 lg:hidden">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
              <div className="grid gap-2">
                {[
                  ['#features', 'Features'],
                  ['#reviews', 'Reviews'],
                  ['#pricing', 'Pricing'],
                  ['#contact', 'Contact'],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenu(false)}
                    className="rounded-2xl px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/10 hover:text-cyan-200"
                  >
                    {label}
                  </a>
                ))}
              </div>

              <div className="mt-3 grid gap-3 border-t border-white/10 pt-3 sm:grid-cols-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenu(false)}
                  className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-3 text-center font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-300/20"
                >
                  Login
                </Link>

                <a
                  href="#contact"
                  onClick={() => setMobileMenu(false)}
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-center font-semibold text-white shadow-xl shadow-cyan-500/10"
                >
                  Start Free Trial
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <Image
          src="/images/hero-sports.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-32 text-center">
          <div className="mx-auto mb-8 w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-cyan-300">
            ⚡ India's Smartest Sports Academy Platform
          </div>

          <h1 className="text-6xl font-black leading-none md:text-8xl">
            PlayGrid AI.
          </h1>

          <h2 className="mt-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-5xl font-black text-transparent md:text-7xl">
            Scale Your Academy Smarter
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl text-slate-300">
            AI-powered sports academy management platform for football,
            cricket, swimming and 50+ sports.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
  <Link
    href="/login"
    className="rounded-full border border-cyan-300/50 bg-white/10 px-10 py-5 text-lg font-bold text-cyan-100 backdrop-blur transition hover:scale-105 hover:bg-cyan-300/20"
  >
    Login
  </Link>

  <a href="#contact" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-10 py-5 text-lg font-bold text-white transition hover:scale-105">
    Start Free Trial <ArrowRight />
  </a>

  <a href="#features" className="rounded-full border border-white/20 bg-white/5 px-10 py-5 text-lg font-semibold backdrop-blur hover:bg-white/10">
    View Features
  </a>
</div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-cyan-400" />
              14-day free trial
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-cyan-400" />
              No credit card
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-cyan-400" />
              Razorpay ready
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD SHOWCASE */}
      <section className="relative bg-[#081223] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mx-auto mb-6 w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-2 text-cyan-300">
              🏆 Champions FC — Live Results
            </div>

            <h2 className="text-5xl font-black">
              "Transformed Our Academy in 30 Days"
            </h2>

            <p className="mt-4 text-xl text-slate-400">
              Coach Raj Kumar • Champions Football Academy • Bengaluru
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-4">
            {[
              ['8 → 50+', 'Students'],
              ['₹143K/mo', 'Revenue'],
              ['98%', 'Attendance'],
              ['4.9/5 ⭐', 'Rating'],
            ].map((item) => (
              <div
                key={item[0]}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
              >
                <h3 className="text-5xl font-black">{item[0]}</h3>

                <p className="mt-3 text-slate-400">{item[1]}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 overflow-hidden rounded-[40px] border border-white/10 shadow-2xl">
            <Image
              src="/images/dashboard-showcase.webp"
              alt="dashboard"
              width={1600}
              height={900}
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-10 bg-[#f4f1e6] px-6 py-20 text-center text-black md:grid-cols-4">
        {[
          ['500+', 'Academies'],
          ['25,000+', 'Students'],
          ['99.9%', 'Uptime'],
          ['87%', 'Collection Rate'],
        ].map((item) => (
          <div key={item[0]}>
            <h3 className="text-5xl font-black text-blue-600">{item[0]}</h3>

            <p className="mt-4 text-xl text-slate-600">{item[1]}</p>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="bg-[#f4f1e6] px-6 py-28 text-black"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mx-auto w-fit rounded-full border border-slate-300 px-5 py-2">
              12 Powerful Modules
            </div>

            <h2 className="mt-6 text-6xl font-black">
              Everything Your Academy Needs
            </h2>

            <p className="mt-6 text-xl text-slate-500">
              Built for Indian sports academies.
            </p>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color}`}
                >
                  <feature.icon className="text-white" />
                </div>

                <h3 className="mt-8 text-2xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section
        id="reviews"
        className="bg-[#f4f1e6] px-6 py-28 text-black"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mx-auto w-fit rounded-full border border-slate-300 px-5 py-2">
              Trusted by Champions
            </div>

            <h2 className="mt-6 text-6xl font-black">
              Loved by Academy Owners
            </h2>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
              >
                <div className="mb-6 flex text-yellow-500">
                  ★★★★★
                </div>

                <p className="text-lg text-slate-700">
                  "{review.text}"
                </p>

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h4 className="font-bold">{review.name}</h4>

                  <p className="text-slate-500">{review.academy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="bg-[#f4f1e6] px-6 py-28 text-black"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-6xl font-black">
              Start Free, Scale as You Grow
            </h2>

            <p className="mt-6 text-xl text-slate-500">
              No hidden fees. Cancel anytime.
            </p>
          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <div
                key={plan.name}
                className={`rounded-3xl border bg-white p-10 shadow-2xl ${
                  i === 1
                    ? 'border-cyan-500 scale-105'
                    : 'border-slate-200'
                }`}
              >
                <h3 className="text-3xl font-black">{plan.name}</h3>
                <p className="mt-2 text-slate-500">{plan.desc}</p>
                <div className="mt-8 text-6xl font-black">{plan.price}</div>
                <a href="#contact" className={`mt-10 block w-full rounded-2xl py-4 text-center font-bold ${
                  i === 1 ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white' : 'border border-slate-300'
                }`}>
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#f4f1e6] px-6 py-28 text-black">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-5xl font-black">FAQs</h2>
          <div className="mt-16 space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-white p-8">
                <h4 className="text-xl font-bold">{faq.q}</h4>
                <p className="mt-4 text-slate-600">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="bg-[#f4f1e6] px-6 py-28 text-black"
      >
        <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2">
          <div>
            <div className="w-fit rounded-full border border-slate-300 px-5 py-2">
              Get in Touch
            </div>

            <h2 className="mt-8 text-6xl font-black">
              Let's Talk About Your Academy
            </h2>

            <p className="mt-8 text-xl text-slate-500">
              Whether you're running a 50-student academy or a
              multi-center organization, we'd love to hear from you.
            </p>

            <div className="mt-12 space-y-8">
              <div className="flex items-center gap-5">
                <div className="rounded-2xl bg-cyan-100 p-4">
                  <Mail className="text-cyan-700" />
                </div>

                <div>
                  <h4 className="font-bold">Email us</h4>

                  <p className="text-slate-500">
                    contact@playgrid.ai
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[40px] bg-white p-10 shadow-2xl">
            <div className="grid gap-6 md:grid-cols-2">
              <input
                name="name" required value={form.name} onChange={handleChange}
              placeholder="Durgesh Chowdary" 
                className="rounded-2xl border border-slate-200 p-4"
              />
              <input
                name="email" type="email" required value={form.email} onChange={handleChange}
                placeholder="admin@vijayawadablues.in" 
                className="rounded-2xl border border-slate-200 p-4"
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <input
                name="academy" required value={form.academy} onChange={handleChange}
                placeholder="Vijayawada Blues Cricket Academy" 
                className="rounded-2xl border border-slate-200 p-4"
              />
              <input
                name="phone" required value={form.phone} onChange={handleChange}
                placeholder="+91 98765 43210" 
                className="rounded-2xl border border-slate-200 p-4"
              />
            </div>
            <div className="mt-6">
              <select 
                name="sport" value={form.sport} onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 p-4"
              >
                {sports.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <textarea
              name="message" required value={form.message} onChange={handleChange}
              placeholder="Tell us your sport, student count, and the workflows you want to simplify." 
              className="mt-6 h-40 w-full rounded-2xl border border-slate-200 p-4"
            />
            {status === 'success' && <p className="mt-4 text-center font-bold text-emerald-600">Demo request sent. Our team will get back to you shortly.</p>}
            {status === 'error' && <p className="mt-4 text-center font-bold text-red-600">We could not send the request. Please check your connection and try again.</p>}
            <button 
              type="submit" 
              disabled={status === 'sending'}
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 py-5 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'success' && (
              <button
                type="button"
                onClick={() => {
                  resetContactForm();
                  setStatus('idle');
                }}
                className="mt-3 w-full rounded-2xl border border-slate-200 py-4 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Send another request
              </button>
            )}
          </form>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-cyan-500 to-blue-700 px-6 py-28 text-center">
        <Trophy className="mx-auto h-16 w-16 text-white" />

        <h2 className="mt-8 text-6xl font-black">
          Ready to Transform Your Academy?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-xl text-cyan-100">
          Join 500+ academies already scaling with PlayGrid AI.
        </p>

        <a href="#contact" className="mt-10 inline-block rounded-full bg-white px-10 py-5 text-xl font-black text-blue-700">
          Start Your Free Trial
        </a>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#060816] px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-4">
          <div>
            <h3 className="text-3xl font-black">PlayGrid AI</h3>

            <p className="mt-6 text-slate-400">
              India's next-generation sports academy operating system.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold">Product</h4>

            <ul className="mt-6 space-y-4 text-slate-400">
              <li>Features</li>
              <li>Pricing</li>
              <li>Dashboard</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold">Company</h4>

            <ul className="mt-6 space-y-4 text-slate-400">
              <li>About</li>
              <li>Contact</li>
              <li>Blog</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold">Support</h4>

            <ul className="mt-6 space-y-4 text-slate-400">
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
