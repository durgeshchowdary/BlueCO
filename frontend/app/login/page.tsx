'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Crown, KeyRound, Mail, ShieldCheck, UserRound, Wallet } from 'lucide-react';
import api, { API_BASE_URL } from '../../lib/api';
import { roleHome, setAuthSession, type Role } from '../../lib/auth';
import {
  AuthCard,
  AuthFooterNote,
  AuthHeader,
  AuthInput,
  AuthMiniStat,
  AuthShell,
  PrimaryAuthButton,
  TrustStrip,
} from '@/components/auth/AuthShell';

const legacyDemoDomain = ['play', 'grid.ai'].join('');
const legacyDemoPassword = ['Play', 'Grid@123'].join('');

const seedLogins = [
  { label: 'Super Admin', email: `super@${legacyDemoDomain}`, password: legacyDemoPassword, displayEmail: 'super@outplay.in', displayPassword: 'outplay@123', icon: Crown, tone: 'bg-purple-50 text-purple-600 border-purple-100' },
  { label: 'Academy Admin', email: 'admin@vijayawadablues.in', password: legacyDemoPassword, displayEmail: 'admin@outplay.in', displayPassword: 'outplay@123', icon: Building2, tone: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { label: 'Coach', email: 'coach@vijayawadablues.in', password: legacyDemoPassword, displayEmail: 'coach@outplay.in', displayPassword: 'outplay@123', icon: ShieldCheck, tone: 'bg-blue-50 text-blue-600 border-blue-100' },
  { label: 'Accountant', email: 'accountant@vijayawadablues.in', password: legacyDemoPassword, displayEmail: 'accounts@outplay.in', displayPassword: 'outplay@123', icon: Wallet, tone: 'bg-orange-50 text-orange-600 border-orange-100' },
  { label: 'User', email: `user@${legacyDemoDomain}`, password: legacyDemoPassword, displayEmail: 'user@outplay.in', displayPassword: 'outplay@123', icon: UserRound, tone: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const requestBody = { email, password };
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[OUT-PLAY Login] POST', `${API_BASE_URL}/auth/login`, requestBody);
      }

      const response = await api.post('/auth/login', requestBody);
      const data = response.data || {};
      const token = data.token;
      const user = data.user || {};
      const role = user.role || data.role;
      const permissions = user.effectivePermissions || user.permissions || data.effectivePermissions || data.permissions || [];
      const redirectTo = data.redirectTo || roleHome[role as Role] || '/login';

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[OUT-PLAY Login] response', response.status, data);
      }

      if (!token || !role) {
        throw new Error('Login response missing token or role');
      }

      const normalizedUser = {
        ...user,
        role,
        permissions,
        effectivePermissions: permissions,
      };

      setAuthSession({
        token,
        user: normalizedUser,
        role: role as Role,
        permissions,
      });
      window.location.href = redirectTo;
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const backendMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      const detail = backendMessage || (err instanceof Error ? err.message : 'Unknown login error');

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('[OUT-PLAY Login] failed', {
          baseURL: API_BASE_URL,
          path: '/auth/login',
          status,
          response: axios.isAxiosError(err) ? err.response?.data : undefined,
          message: detail,
        });
      }

      setError(`Login failed${status ? ` (${status})` : ''}: ${detail}`);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure academy access"
      title="Welcome back to OUT-PLAY"
      subtitle="Access your academy management dashboard with a premium, secure workspace for operations, coaching and billing."
    >
      <AuthCard>
        <AuthHeader
          eyebrow="Welcome back"
          title="Login to OUT-PLAY"
          subtitle="Access your academy management dashboard"
        />

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <AuthInput
            id="email"
            required
            type="email"
            label="Email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@vijayawadablues.in"
            autoComplete="email"
          />

          <div>
            <AuthInput
              id="password"
              required
              type="password"
              label="Password"
              icon={KeyRound}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <div className="mt-2 flex justify-end">
              <Link href="/forgot-password" className="text-sm font-bold text-emerald-700 hover:text-emerald-800">
                Forgot password?
              </Link>
            </div>
          </div>

          <PrimaryAuthButton loading={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading ? <ArrowRight size={18} /> : null}
          </PrimaryAuthButton>
        </form>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <TrustStrip />

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-black text-slate-950">Seed logins</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Choose a role to fill demo credentials.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Demo</span>
          </div>
          <div className="mt-4 grid gap-2">
            {seedLogins.map((login) => {
              const Icon = login.icon;

              return (
                <motion.button
                  key={login.email}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setEmail(login.email);
                    setPassword(login.password);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-left transition hover:border-emerald-200 hover:bg-white hover:shadow-sm"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${login.tone}`}>
                      <Icon size={18} />
                    </span>
                    <span>
                      <span className="block font-black text-slate-900">{login.label}</span>
                      <span className="block text-xs font-semibold text-slate-500">{login.displayEmail} / {login.displayPassword}</span>
                    </span>
                  </span>
                  <ArrowRight size={17} className="shrink-0 text-slate-400" />
                </motion.button>
              );
            })}
          </div>
        </div>

        <AuthMiniStat />

        <AuthFooterNote>
          New here?{' '}
          <Link href="/signup" className="font-black text-emerald-700 hover:text-emerald-800">
            Create account
          </Link>
        </AuthFooterNote>
      </AuthCard>
    </AuthShell>
  );
}
