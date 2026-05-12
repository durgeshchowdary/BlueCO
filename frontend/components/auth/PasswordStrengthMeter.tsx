'use client';

import { useMemo } from 'react';
import { validatePassword } from '@/lib/passwordValidation';

export default function PasswordStrengthMeter({
  password,
}: {
  password: string;
}) {
  const errors = useMemo(() => validatePassword(password), [password]);
  const score = password ? Math.max(0, 5 - errors.length) : 0;
  const width = `${(score / 5) * 100}%`;

  return (
    <div className="mt-2">
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width }}
        />
      </div>

      {password ? (
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Password strength:{' '}
          {score >= 4 ? 'Strong' : score >= 3 ? 'Medium' : 'Weak'}
        </p>
      ) : null}
    </div>
  );
}
