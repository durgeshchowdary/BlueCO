'use client';

import type { ElementType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from './Motion';

export function BrandMark({ compact = false, variant = 'dark' }: { compact?: boolean; variant?: 'dark' | 'light' }) {
  const isLight = variant === 'light';

  return (
    <div className="flex items-center gap-3">
      <div className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border shadow-sm ${isLight ? 'border-emerald-200 bg-white' : 'border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_34px_rgba(34,211,238,0.22)]'}`}>
        <div className={isLight ? 'absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.92),rgba(37,99,235,0.88),rgba(249,115,22,0.84))]' : 'absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.2),rgba(37,99,235,0.42),rgba(15,23,42,0.2))]'} />
        <span className="relative text-sm font-black text-white">OP</span>
      </div>
      {!compact ? (
        <div>
          <p className={`text-lg font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>OUT-PLAY</p>
          <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${isLight ? 'text-slate-500' : 'text-cyan-200/80'}`}>Academy OS</p>
        </div>
      ) : null}
    </div>
  );
}

export function GlassPanel({
  children,
  className = '',
  variant = 'dark',
}: {
  children: ReactNode;
  className?: string;
  variant?: 'dark' | 'light';
}) {
  const base = variant === 'light'
    ? 'rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl'
    : 'rounded-[28px] border border-white/10 bg-white/[0.065] shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl';

  return (
    <motion.div
      variants={fadeUp}
      className={`${base} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function GlowButton({
  children,
  href,
  variant = 'primary',
  theme = 'dark',
}: {
  children: ReactNode;
  href: string;
  variant?: 'primary' | 'secondary';
  theme?: 'dark' | 'light';
}) {
  const className = theme === 'light'
    ? variant === 'primary'
      ? 'border-emerald-500 bg-emerald-600 text-white shadow-[0_16px_36px_rgba(16,185,129,0.22)] hover:bg-emerald-700'
      : 'border-slate-200 bg-white text-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.07)] hover:border-blue-200 hover:text-blue-700'
    : variant === 'primary'
      ? 'border-cyan-300/30 bg-cyan-300 text-slate-950 shadow-[0_18px_60px_rgba(34,211,238,0.24)] hover:bg-white'
      : 'border-white/15 bg-white/8 text-white hover:border-cyan-200/40 hover:bg-white/12';

  return (
    <motion.a
      href={href}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-black transition ${className}`}
    >
      {children}
    </motion.a>
  );
}

export function PremiumStat({
  icon: Icon,
  label,
  value,
  tone = 'cyan',
}: {
  icon: ElementType;
  label: string;
  value: string | number;
  tone?: 'cyan' | 'blue' | 'emerald' | 'violet';
}) {
  const tones = {
    cyan: 'from-cyan-300/20 to-cyan-500/5 text-cyan-200',
    blue: 'from-blue-300/20 to-blue-600/5 text-blue-200',
    emerald: 'from-emerald-300/20 to-emerald-600/5 text-emerald-200',
    violet: 'from-violet-300/20 to-violet-600/5 text-violet-200',
  };

  return (
    <GlassPanel className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-400">{label}</p>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-5 text-3xl font-black tracking-tight text-white">{value}</p>
    </GlassPanel>
  );
}
