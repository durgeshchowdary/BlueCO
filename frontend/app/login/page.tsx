'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem('isAuthenticated', 'true');
    window.location.href = '/dashboard';
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
            className="w-full rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            Sign in
          </button>
        </form>

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
