"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setMessage("Verification token missing.");
      return;
    }

    fetch(`${API_URL}/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Email verification failed");
        }

        setMessage(data.message || "Email verified successfully.");
      })
      .catch((err) => {
        setMessage(err.message || "Email verification failed.");
      });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-3xl font-black text-slate-900">
          Email Verification
        </h1>

        <p className="mt-4 text-slate-600">{message}</p>

        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-6 font-bold text-white"
        >
          Go to Login
        </Link>
      </div>
    </main>
  );
}