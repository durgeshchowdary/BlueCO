"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Building2,
  UserCog,
  GraduationCap,
} from "lucide-react";

type PortalType = "super-admin" | "academy" | "employee" | "student";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const portals = [
  {
    id: "super-admin" as PortalType,
    title: "Super Admin",
    subtitle: "Platform control",
    icon: Shield,
  },
  {
    id: "academy" as PortalType,
    title: "Academy Admin",
    subtitle: "Academy management",
    icon: Building2,
  },
  {
    id: "employee" as PortalType,
    title: "Employee",
    subtitle: "Staff operations",
    icon: UserCog,
  },
  {
    id: "student" as PortalType,
    title: "Student",
    subtitle: "Training portal",
    icon: GraduationCap,
  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [selectedPortal, setSelectedPortal] =
    useState<PortalType>("student");

  const [loading, setLoading] = useState(false);

  const clearOldSession = () => {
    localStorage.clear();

    document.cookie =
      "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    document.cookie =
      "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    document.cookie =
      "portalType=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    clearOldSession();

    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      email: String(formData.get("email") || "")
        .trim()
        .toLowerCase(),

      password: String(formData.get("password") || ""),

      portalType: selectedPortal,
    };

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      const frontendRoleMap: Record<PortalType, string> = {
        "super-admin": "super-admin",
        academy: "academy",
        employee: "employee",
        student: "student",
      };

      const frontendRole = frontendRoleMap[selectedPortal];

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      localStorage.setItem("role", frontendRole);

      localStorage.setItem(
        "portalType",
        selectedPortal
      );

      document.cookie = `token=${data.token}; path=/`;

      document.cookie = `role=${frontendRole}; path=/`;

      document.cookie = `portalType=${selectedPortal}; path=/`;

      window.location.replace(data.redirectTo);
    } catch {
      alert(
        "Backend not connected. Check backend server and NEXT_PUBLIC_API_URL."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedPortalLabel =
    portals.find(
      (portal) => portal.id === selectedPortal
    )?.title || "Student";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-[#f8f7ec] to-slate-100 px-6 py-10">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-slate-600 transition hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>

        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <span className="text-[10px] font-black text-red-500">
              OUT
            </span>
          </div>

          <h1 className="text-5xl font-black text-[#17223b]">
            Out-Play
          </h1>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl md:p-10">
          <div className="text-center">
            <h2 className="text-4xl font-black text-[#17223b]">
              Welcome back
            </h2>

            <p className="mt-3 text-lg text-slate-500">
              Choose your portal and sign in
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {portals.map((portal) => {
              const Icon = portal.icon;

              const active =
                selectedPortal === portal.id;

              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() =>
                    setSelectedPortal(portal.id)
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-100"
                      : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        active
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon size={21} />
                    </div>

                    <div>
                      <p className="font-black text-[#17223b]">
                        {portal.title}
                      </p>

                      <p className="text-sm font-medium text-slate-500">
                        {portal.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleLogin}
            className="mt-8"
          >
            <div className="mb-5 rounded-2xl bg-slate-100 px-5 py-4 text-sm font-bold text-slate-700">
              Selected Portal:{" "}
              <span className="text-emerald-700">
                {selectedPortalLabel}
              </span>
            </div>

            <div>
              <label className="mb-3 block text-sm font-bold text-slate-700">
                Email
              </label>

              <input
                name="email"
                type="email"
                required
                placeholder="you@academy.com"
                className="h-14 w-full rounded-2xl border border-slate-300 px-5 text-lg outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-emerald-600"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  required
                  placeholder="Enter your password"
                  className="h-14 w-full rounded-2xl border border-slate-300 px-5 pr-14 text-lg outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 h-14 w-full rounded-2xl bg-emerald-600 text-xl font-black text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing In..."
                : `Sign In to ${selectedPortalLabel}`}
            </button>
          </form>

          <p className="mt-8 text-center text-lg text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-emerald-600"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}