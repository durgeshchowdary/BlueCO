'use client';

import React, { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';

interface AuthSessionBannerProps {
  isVisible: boolean;
  onClose: () => void;
  message?: string;
  type?: 'warning' | 'expired';
}

export default function AuthSessionBanner({
  isVisible,
  onClose,
  message = 'Your session is about to expire. Please log in again.',
  type = 'warning',
}: AuthSessionBannerProps) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  if (!show) return null;

  const bgColor = type === 'expired' ? 'bg-red-500/10 border-red-300/20 text-red-100' : 'bg-amber-500/10 border-amber-300/20 text-amber-100';
  const iconColor = type === 'expired' ? 'text-red-300' : 'text-amber-300';

  return (
    <div className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between gap-4 p-3 shadow-lg backdrop-blur-xl ${bgColor}`}>
      <div className="flex items-center gap-3">
        <Clock className={`h-5 w-5 ${iconColor}`} />
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button onClick={() => { setShow(false); onClose(); }} className="text-white/70 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
    </div>
  );
}