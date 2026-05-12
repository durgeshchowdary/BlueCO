'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import {
  AuthCard,
  AuthFooterNote,
  AuthHeader,
  AuthInput,
  AuthShell,
  PrimaryAuthButton,
  TrustStrip,
} from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Recover your OUT-PLAY access"
      subtitle="A calm recovery experience for academy teams when password reset delivery is connected."
    >
      <AuthCard>
        <AuthHeader
          eyebrow="Password help"
          title="Forgot password?"
          subtitle="Enter your email and the recovery flow will be ready to send reset instructions."
        />

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <AuthInput
            id="recovery-email"
            required
            type="email"
            label="Email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@vijayawadablues.in"
            autoComplete="email"
          />

          <PrimaryAuthButton>
            Send reset instructions <ArrowRight size={18} />
          </PrimaryAuthButton>
        </form>

        {submitted ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            Recovery UI is ready. Connect this form to the password reset API when the backend endpoint is available.
          </p>
        ) : null}

        <TrustStrip />

        <AuthFooterNote>
          <Link href="/login" className="inline-flex items-center gap-2 font-black text-emerald-700 hover:text-emerald-800">
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </AuthFooterNote>
      </AuthCard>
    </AuthShell>
  );
}
