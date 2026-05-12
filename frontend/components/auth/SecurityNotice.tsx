'use client';

import { ShieldCheck } from 'lucide-react';

export default function SecurityNotice() {
  return (
    <div className='mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'>
      <div className='flex items-center gap-2 font-bold'>
        <ShieldCheck size={16} />
        Secure OUT-PLAY account protection enabled
      </div>
    </div>
  );
}
