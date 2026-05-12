'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import axios from 'axios';
import { ArrowRight, Building2, KeyRound, Mail, UserRound } from 'lucide-react';
import api from '../../lib/api';
import { roleHome, setAuthSession, type Role } from '../../lib/auth';
import {
  AuthCard,
  AuthFooterNote,
  AuthHeader,
  AuthInput,
  AuthShell,
  PrimaryAuthButton,
  TrustStrip,
} from '@/components/auth/AuthShell';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [academy, setAcademy] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/signup', { name, email, password });
      const data = response.data || {};
      const token = data.token;
      const user = data.user || {};
      const role = user.role || data.role || 'student';
      const permissions = user.effectivePermissions || user.permissions || data.effectivePermissions || data.permissions || [];
      const redirectTo = data.redirectTo || roleHome[role as Role] || '/dashboard';

      if (!token || !role) throw new Error('Signup response missing token or role');

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
      localStorage.setItem(
        'academySettings',
        JSON.stringify({
          academyName: academy || 'OUT-PLAY Sports Academy',
          ownerName: name || 'Normal User',
          phone: '',
          email,
          address: '',
          logoUrl: '',
        }),
      );
      window.location.href = redirectTo;
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const backendMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(`Signup failed${status ? ` (${status})` : ''}: ${backendMessage || 'Unable to create account'}`);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Start with clarity"
      title="Create your OUT-PLAY workspace"
      subtitle="Launch a polished academy operating system for students, coaches, billing and performance."
    >
      <AuthCard>
        <AuthHeader
          eyebrow="Start free"
          title="Create OUT-PLAY Account"
          subtitle="Set up your academy profile and enter the dashboard"
        />

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <AuthInput
            id="owner-name"
            required
            label="Owner Name"
            icon={UserRound}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Durgesh Chowdary"
            autoComplete="name"
          />

          <AuthInput
            id="academy-name"
            required
            label="Academy Name"
            icon={Building2}
            value={academy}
            onChange={(e) => setAcademy(e.target.value)}
            placeholder="Vijayawada Blues Cricket Academy"
            autoComplete="organization"
          />

          <AuthInput
            id="signup-email"
            required
            type="email"
            label="Email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@vijayawadablues.in"
            autoComplete="email"
          />

          <AuthInput
            id="signup-password"
            required
            type="password"
            label="Password"
            icon={KeyRound}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create password"
            autoComplete="new-password"
          />

          <PrimaryAuthButton loading={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading ? <ArrowRight size={18} /> : null}
          </PrimaryAuthButton>
        </form>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <TrustStrip />

        <AuthFooterNote>
          Already have an account?{' '}
          <Link href="/login" className="font-black text-emerald-700 hover:text-emerald-800">
            Login
          </Link>
        </AuthFooterNote>
      </AuthCard>
    </AuthShell>
  );
}
