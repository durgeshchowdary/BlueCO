'use client';

import Link from 'next/link';
import type { ElementType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react';
import { BrandMark } from '@/components/outplay/DesignSystem';

const sideHighlights = [
  {
    label: 'Academy operations',
    copy: 'Students, staff, fees, batches and reports in one calm workspace.',
    icon: Users,
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Enterprise controls',
    copy: 'RBAC, audit-friendly flows and secure dashboard access.',
    icon: ShieldCheck,
    tone: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Smart performance',
    copy: 'Insights for attendance, revenue and training utilization.',
    icon: BarChart3,
    tone: 'bg-orange-50 text-orange-600',
  },
];

export function AuthShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf8ef] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(37,99,235,0.12),transparent_28%),radial-gradient(circle_at_52%_82%,rgba(249,115,22,0.10),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:78px_78px] opacity-35" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="hidden lg:block"
          >
            <Link href="/" className="inline-flex">
              <BrandMark variant="light" />
            </Link>

            <div className="mt-14 max-w-xl">
              <div className="inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-700 shadow-sm">
                {eyebrow}
              </div>
              <h1 className="mt-7 text-5xl font-black tracking-tight text-slate-950 xl:text-6xl">
                {title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                {subtitle}
              </p>
            </div>

            <div className="mt-10 grid max-w-xl gap-4">
              {sideHighlights.map(({ label, copy, icon: Icon, tone }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -3 }}
                  className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur"
                >
                  <div className="flex gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
                      <Icon size={21} />
                    </div>
                    <div>
                      <p className="font-black text-slate-950">{label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mx-auto w-full max-w-xl"
          >
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <Link href="/" className="inline-flex">
                <BrandMark variant="light" />
              </Link>
            </div>
            {children}
          </motion.section>
        </div>
      </div>
    </main>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[32px] border border-white/80 bg-white/[0.92] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-8 lg:p-10">
      {children}
    </div>
  );
}

export function AuthHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
        <Sparkles size={14} />
        {eyebrow}
      </div>
      <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{subtitle}</p>
    </div>
  );
}

export function AuthInput({
  id,
  label,
  icon: Icon,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: ElementType;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-slate-700">
        {label}
      </label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
        <input
          id={id}
          className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 pl-12 font-semibold text-slate-950 outline-none shadow-sm placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

export function PrimaryAuthButton({
  children,
  loading = false,
}: {
  children: ReactNode;
  loading?: boolean;
}) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={loading ? undefined : { y: -2 }}
      whileTap={loading ? undefined : { scale: 0.99 }}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-4 font-black text-white shadow-[0_16px_34px_rgba(16,185,129,0.24)] transition hover:from-emerald-700 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : null}
      {children}
    </motion.button>
  );
}

export function AuthFooterNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 text-center text-sm font-semibold text-slate-500">
      {children}
    </p>
  );
}

export function TrustStrip() {
  return (
    <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-3">
      {['RBAC secure', 'JWT access', 'Fast onboarding'].map((item) => (
        <div key={item} className="flex items-center gap-2 text-xs font-black text-slate-600">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {item}
        </div>
      ))}
    </div>
  );
}

export function AuthMiniStat() {
  return (
    <div className="mt-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <Trophy size={21} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500">Built for academy teams</p>
          <p className="mt-1 text-xl font-black text-slate-950">Operations, billing and coaching in sync.</p>
        </div>
      </div>
    </div>
  );
}
