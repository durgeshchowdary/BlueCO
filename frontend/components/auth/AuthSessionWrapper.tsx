'use client';

import { useState } from 'react';
import AuthSessionBanner from '@/components/auth/AuthSessionBanner';

export default function AuthSessionWrapper({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {children}
      <AuthSessionBanner
        isVisible={visible}
        onClose={() => setVisible(false)}
        message='Your session has expired. Please login again.'
        type='expired'
      />
    </>
  );
}
