'use client';

import { useState } from 'react';
import { CheckCircle2, CreditCard, Loader2, XCircle } from 'lucide-react';
import api from '../lib/api';
import { getStoredUser } from '../lib/auth';

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const loadRazorpayScript = () => new Promise<boolean>((resolve) => {
  if (typeof window === 'undefined') return resolve(false);
  if (window.Razorpay) return resolve(true);

  const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(true), { once: true });
    existingScript.addEventListener('error', () => resolve(false), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const getAcademyId = () => {
  const user = getStoredUser();
  return user?.academyId || user?.academy?._id || '';
};

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const startPayment = async () => {
    setLoading(true);
    setMessage('');
    setStatus('idle');

    try {
      const academyId = getAcademyId();
      if (!academyId) {
        setStatus('error');
        setMessage('Academy session is missing. Please sign in as an academy admin.');
        return;
      }

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        setStatus('error');
        setMessage('Razorpay Checkout could not be loaded. Please try again.');
        return;
      }

      const { data } = await api.post('/payments/create-order', {
        academyId,
        plan: 'pro',
      });

      const checkout = new window.Razorpay({
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'OUT-PLAY',
        description: 'OUT-PLAY Pro Subscription',
        order_id: data.order.id,
        prefill: {
          name: getStoredUser()?.name,
          email: getStoredUser()?.email,
        },
        theme: {
          color: '#0891b2',
        },
        handler: async (response) => {
          try {
            await api.post('/payments/verify-payment', {
              academyId,
              plan: 'pro',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setStatus('success');
            setMessage('Payment verified. Your Pro subscription is active.');
          } catch (error: any) {
            setStatus('error');
            setMessage(error?.response?.data?.message || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage('Checkout closed before payment was completed.');
          },
        },
      });

      checkout.open();
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.response?.data?.message || 'Could not start the payment.');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-xl shadow-slate-950/10">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">OUT-PLAY Pro</p>
          <h3 className="mt-2 text-2xl font-black">OUT-PLAY Pro Subscription</h3>
          <p className="mt-2 text-sm font-semibold text-slate-600">Rs 999 per month, billed through Razorpay Standard Checkout.</p>
        </div>

        <button
          type="button"
          onClick={startPayment}
          disabled={loading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
          Pay Rs 999 / Month
        </button>
      </div>

      {message ? (
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
            status === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : status === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-slate-50 text-slate-600'
          }`}
        >
          {status === 'success' ? <CheckCircle2 size={18} /> : status === 'error' ? <XCircle size={18} /> : null}
          {message}
        </div>
      ) : null}
    </div>
  );
}
