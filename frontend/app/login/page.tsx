'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import axios from 'axios';
import api, { API_BASE_URL } from '../../lib/api';
import { roleHome, type Role } from '../../lib/auth';

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
        console.log('[PlayGrid Login] POST', `${API_BASE_URL}/auth/login`, requestBody);
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
        console.log('[PlayGrid Login] response', response.status, data);
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

      localStorage.setItem('playgrid_token', token);
      localStorage.setItem('playgrid_user', JSON.stringify(normalizedUser));
      localStorage.setItem('playgrid_role', role);
      localStorage.setItem('playgrid_permissions', JSON.stringify(permissions));
      localStorage.setItem('isAuthenticated', 'true');
      document.cookie = `pg_role=${role}; path=/; max-age=36000; samesite=lax`;
      document.cookie = `pg_token=${token}; path=/; max-age=36000; samesite=lax`;
      document.cookie = `pg_permissions=${encodeURIComponent(permissions.join(','))}; path=/; max-age=36000; samesite=lax`;
      window.location.href = redirectTo;
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const backendMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      const detail = backendMessage || (err instanceof Error ? err.message : 'Unknown login error');

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('[PlayGrid Login] failed', {
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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Welcome back
        </p>

        <h1 className="mt-4 text-center text-3xl font-bold">
          Login to PlayGrid AI
        </h1>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
              placeholder="admin@vijayawadablues.in"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
          <p className="font-bold text-white">Seed logins</p>
          <p className="mt-2">super@playgrid.ai / PlayGrid@123</p>
          <p>admin@vijayawadablues.in / PlayGrid@123</p>
          <p>coach@vijayawadablues.in / PlayGrid@123</p>
          <p>accountant@vijayawadablues.in / PlayGrid@123</p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          New here?{' '}
          <Link href="/signup" className="text-cyan-300 hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
