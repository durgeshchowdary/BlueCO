'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';
import SecurityNotice from '@/components/auth/SecurityNotice';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import { validatePassword } from '@/lib/passwordValidation';
import {
  AuthCard,
  AuthFooterNote,
  AuthHeader,
  AuthInput,
  AuthShell,
  PrimaryAuthButton,
  TrustStrip,
} from '@/components/auth/AuthShell';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validatePassword(password);
    setValidationErrors(errors);

    if (errors.length > 0) {
      setMessage('Password does not meet security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setMessage(
      'Reset UI is ready. Connect this form to the password reset API when the backend endpoint is available.',
    );
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setValidationErrors(validatePassword(val));
  };

  return (
    <AuthShell
      eyebrow="Secure reset"
      title="Create a new OUT-PLAY password"
      subtitle="A polished reset experience that can connect to the recovery token flow when the backend endpoint is available."
    >
      <AuthCard>
        <AuthHeader
          eyebrow="New credentials"
          title="Reset password"
          subtitle="Choose a new password for your OUT-PLAY workspace."
        />

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <AuthInput
            id="new-password"
            required
            type="password"
            label="New password"
            icon={KeyRound}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Create a secure password"
            autoComplete="new-password"
          />

          <PasswordStrengthMeter password={password} />

          {validationErrors.length > 0 && password.length > 0 ? (
            <ul className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}

          <AuthInput
            id="confirm-password"
            required
            type="password"
            label="Confirm password"
            icon={KeyRound}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />

          <PrimaryAuthButton>
            Update password <ArrowRight size={18} />
          </PrimaryAuthButton>
        </form>

        <SecurityNotice />

        {message ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {message}
          </p>
        ) : null}

        <TrustStrip />

        <AuthFooterNote>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-black text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </AuthFooterNote>
      </AuthCard>
    </AuthShell>
  );
}