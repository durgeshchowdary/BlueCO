'use client';

import React, { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

// A simplified client-side password validation logic for UI feedback
// This should ideally mirror the backend logic in backend/utils/passwordPolicy.js
const getPasswordStrength = (password: string) => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long.');
  } else {
    score += 1;
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters.');
  }
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters.');
  }
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers.');
  }
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters.');
  }

  if (password.length > 0 && score === 0) return { strength: 'Very Weak', color: 'bg-red-500', feedback };
  if (score <= 2) return { strength: 'Weak', color: 'bg-orange-500', feedback };
  if (score === 3) return { strength: 'Moderate', color: 'bg-yellow-500', feedback };
  if (score >= 4) return { strength: 'Strong', color: 'bg-emerald-500', feedback: [] };

  return { strength: 'Very Weak', color: 'bg-gray-300', feedback: ['Start typing to see strength.'] };
};

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { strength, color, feedback } = useMemo(() => getPasswordStrength(password), [password]);

  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${(password.length > 0 ? (strength === 'Very Weak' ? 20 : strength === 'Weak' ? 40 : strength === 'Moderate' ? 70 : 100) : 0)}%` }}></div>
      </div>
      {password.length > 0 && (
        <p className={`mt-1 text-xs font-semibold ${color.replace('bg-', 'text-')}`}>
          Strength: {strength}
        </p>
      )}
      {feedback.length > 0 && password.length > 0 && (
        <ul className="mt-1 text-xs text-slate-500 list-disc list-inside">
          {feedback.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      )}
    </div>
  );
}