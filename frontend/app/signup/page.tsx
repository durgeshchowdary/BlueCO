'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [academy, setAcademy] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem(
      'academySettings',
      JSON.stringify({
        academyName: academy || 'PlayGrid Sports Academy',
        ownerName: name || 'Admin User',
        phone: '',
        email,
        address: '',
        logoUrl: '',
      }),
    );
    window.location.href = '/dashboard';
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Start free
        </p>

        <h1 className="mt-4 text-center text-3xl font-bold">
          Create PlayGrid Account
        </h1>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <div>
            <label className="text-sm text-slate-300">Owner Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
              placeholder="Durgesh Chowdary"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Academy Name</label>
            <input
              required
              value={academy}
              onChange={(e) => setAcademy(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-300"
              placeholder="Vijayawada Blues Cricket Academy"
            />
          </div>

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
              placeholder="Create password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-300 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
