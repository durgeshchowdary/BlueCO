'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function SecurityNotice() {
  return (
    <div className="rounded-2xl border border-blue-300/20 bg-blue-500/10 p-4 text-blue-100 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-300" />
        <h4 className="text-sm font-bold">Enhanced Account Security</h4>
      </div>
      <p className="mt-2 text-xs text-blue-200 leading-relaxed">
        Your account is protected by production-grade security features, including strong password policies,
        rate limiting, and audit logging. We prioritize your data safety.
      </p>
    </div>
  );
}