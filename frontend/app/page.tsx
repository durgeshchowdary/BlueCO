'use client';

import Link from 'next/link';
import {
  Mail,
  Menu,
  Trophy,
  X,
} from 'lucide-react';
import { useState, FormEvent, ChangeEvent } from 'react';
import api from '@/lib/api';
import DemoWalkthrough from '../components/demo/DemoWalkthrough';
import DemoQuickActions from '../components/demo/DemoQuickActions';
import DemoHighlightsPanel from '../components/demo/DemoHighlightsPanel';



import HeroSection from '../components/landing/HeroSection'
import AIOperationsShowcase from '../components/landing/AIOperationsShowcase'
import OperationalDashboardPreview from '../components/landing/OperationalDashboardPreview'
import AcademyGrowthSection from '../components/landing/AcademyGrowthSection'
import FeatureHighlights from '../components/landing/FeatureHighlights'

const pricingPlans = [
  { name: 'Starter', price: '₹0', desc: 'Perfect for trying out' },
  { name: 'Pro', price: '₹999', desc: 'Most Popular' },
  { name: 'Enterprise', price: 'Custom', desc: 'Large academies' },
];

const sports = ['Cricket', 'Football', 'Tennis', 'Swimming', 'Badminton', 'Other'];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes, we offer a 14-day free trial with all modules unlocked.' },
  { q: 'How do I collect fees?', a: 'You can generate invoices and collect payments via UPI, Cards, or Netbanking.' },
];

const reviews = [
  {
    name: 'Rajesh Kumar',
    academy: 'Football Academy, Bengaluru',
    text: 'OUT-PLAY completely transformed our operations in under a month.',
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
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    academy: '',
    sport: 'Cricket',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetContactForm = () => {
    setForm({ name: '', email: '', phone: '', message: '', academy: '', sport: 'Cricket' });
  };

  return (
    <main className="overflow-hidden bg-[#060816] text-white">
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#060816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 font-black">
              OP
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">OUT-PLAY</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-8 rounded-full border border-white/10 bg-white/5 px-8 py-4 lg:flex">
            <a href="#features" className="hover:text-cyan-300">Features</a>
            <a href="#reviews" className="hover:text-cyan-300">Reviews</a>
            <a href="#pricing" className="hover:text-cyan-300">Pricing</a>
            <a href="#contact" className="hover:text-cyan-300">Contact</a>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/login"
              className="rounded-full border border-cyan-300/50 bg-white/10 px-7 py-3 font-semibold text-cyan-100 shadow-lg shadow-cyan-500/10 backdrop-blur transition hover:scale-105 hover:border-cyan-200 hover:bg-cyan-300/20 hover:text-white"
            >
              Login
            </Link>

            <a
              href="#contact"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-7 py-3 font-semibold shadow-2xl transition hover:scale-105"
            >
              Start Free Trial
            </a>
          </div>

          <button
            type="button"
            className="rounded-xl p-2 md:hidden"
            aria-label="Toggle mobile menu"
            onClick={() => setMobileMenu((open) => !open)}
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

      <HeroSection />
      <AIOperationsShowcase />
      <OperationalDashboardPreview />
      <AcademyGrowthSection />
      <FeatureHighlights />

      <section id="demo-experience" className="bg-[#060816] px-6 py-28 border-y border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <div className="mx-auto w-fit rounded-full border border-cyan-500/30 px-5 py-2 text-cyan-400 text-sm font-bold tracking-widest uppercase">
              Recruiter Experience
            </div>
            <h2 className="mt-6 text-5xl font-black md:text-6xl text-white">
              Platform Performance Demo
            </h2>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-white">Quick Access Workflows</h3>
                <DemoQuickActions />
              </div>
              <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20">
                <p className="text-slate-400 italic font-medium leading-relaxed">
                  &quot;This demo environment allows recruiters to explore the actual operational flow of an academy managing 500+ students in real-time.&quot;
                </p>
              </div>
            </div>
            <DemoHighlightsPanel />
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-[#f4f1e6] px-6 py-28 text-black">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mx-auto w-fit rounded-full border border-slate-300 px-5 py-2">
              Trusted by Champions
            </div>

            <h2 className="mt-6 text-5xl font-black md:text-6xl">
              Loved by Academy Owners
            </h2>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {reviews.map((review) => (
              <div key={review.name} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                <div className="mb-6 flex text-yellow-500">★★★★★</div>

                <p className="text-lg text-slate-700">“{review.text}”</p>

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h4 className="font-bold">{review.name}</h4>
                  <p className="text-slate-500">{review.academy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#f4f1e6] px-6 py-28 text-black">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-5xl font-black md:text-6xl">
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
                  i === 1 ? 'scale-105 border-cyan-500' : 'border-slate-200'
                }`}
              >
                <h3 className="text-3xl font-black">{plan.name}</h3>
                <p className="mt-2 text-slate-500">{plan.desc}</p>
                <div className="mt-8 text-6xl font-black">{plan.price}</div>

                <a
                  href="#contact"
                  className={`mt-10 block w-full rounded-2xl py-4 text-center font-bold ${
                    i === 1
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white'
                      : 'border border-slate-300'
                  }`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#f4f1e6] px-6 py-28 text-black">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-5xl font-black">FAQs</h2>

          <div className="mt-16 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-3xl border border-slate-200 bg-white p-8">
                <h4 className="text-xl font-bold">{faq.q}</h4>
                <p className="mt-4 text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#f4f1e6] px-6 py-28 text-black">
        <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2">
          <div>
            <div className="w-fit rounded-full border border-slate-300 px-5 py-2">
              Get in Touch
            </div>

            <h2 className="mt-8 text-5xl font-black md:text-6xl">
              Let&apos;s Talk About Your Academy
            </h2>

            <p className="mt-8 text-xl text-slate-500">
              Whether you&apos;re running a 50-student academy or a multi-center organization,
              we&apos;d love to hear from you.
            </p>

            <div className="mt-12 space-y-8">
              <div className="flex items-center gap-5">
                <div className="rounded-2xl bg-cyan-100 p-4">
                  <Mail className="text-cyan-700" />
                </div>

                <div>
                  <h4 className="font-bold">Email us</h4>
                  <p className="text-slate-500">contact@out-play.in</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[40px] bg-white p-10 shadow-2xl">
            <div className="grid gap-6 md:grid-cols-2">
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Durgesh Chowdary"
                className="rounded-2xl border border-slate-200 p-4"
              />

              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="admin@vijayawadablues.in"
                className="rounded-2xl border border-slate-200 p-4"
              />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <input
                name="academy"
                required
                value={form.academy}
                onChange={handleChange}
                placeholder="Vijayawada Blues Cricket Academy"
                className="rounded-2xl border border-slate-200 p-4"
              />

              <input
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="rounded-2xl border border-slate-200 p-4"
              />
            </div>

            <div className="mt-6">
              <select
                name="sport"
                value={form.sport}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 p-4"
              >
                {sports.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              name="message"
              required
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us your sport, student count, and the workflows you want to simplify."
              className="mt-6 h-40 w-full rounded-2xl border border-slate-200 p-4"
            />

            {status === 'success' ? (
              <p className="mt-4 text-center font-bold text-emerald-600">
                Demo request sent. Our team will get back to you shortly.
              </p>
            ) : null}

            {status === 'error' ? (
              <p className="mt-4 text-center font-bold text-red-600">
                We could not send the request. Please check your connection and try again.
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 py-5 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'success' ? (
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
            ) : null}
          </form>
        </div>
      </section>

      <section className="bg-gradient-to-r from-cyan-500 to-blue-700 px-6 py-28 text-center">
        <Trophy className="mx-auto h-16 w-16 text-white" />

        <h2 className="mt-8 text-5xl font-black md:text-6xl">
          Ready to Transform Your Academy?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-xl text-cyan-100">
          Join 500+ academies already scaling with OUT-PLAY.
        </p>

        <a
          href="#contact"
          className="mt-10 inline-block rounded-full bg-white px-10 py-5 text-xl font-black text-blue-700"
        >
          Start Your Free Trial
        </a>
      </section>

      <footer className="border-t border-white/10 bg-[#060816] px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-4">
          <div>
            <h3 className="text-3xl font-black">OUT-PLAY</h3>

            <p className="mt-6 text-slate-400">
              India&apos;s next-generation sports academy operating system.
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

      <DemoWalkthrough />
    </main>
  );
}