"use client";

import Link from "next/link";
import { useState } from "react";
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
    subtitle: "Platform owner",
    icon: Shield,
  },
  {
    id: "academy" as PortalType,
    title: "Academy Admin",
    subtitle: "Create academy",
    icon: Building2,
  },
  {
    id: "employee" as PortalType,
    title: "Employee",
    subtitle: "Staff account",
    icon: UserCog,
  },
  {
    id: "student" as PortalType,
    title: "Student",
    subtitle: "Player account",
    icon: GraduationCap,
  },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPortal, setSelectedPortal] =
    useState<PortalType>("academy");

  const [loading, setLoading] = useState(false);
  const [verificationLink, setVerificationLink] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedPortalLabel =
    portals.find((portal) => portal.id === selectedPortal)?.title ||
    "Academy Admin";

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setVerificationLink("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      password: String(formData.get("password") || ""),
      portalType: selectedPortal,
      academyName: String(formData.get("academyName") || "").trim(),
      primarySport: String(formData.get("primarySport") || "").trim(),
      city: String(formData.get("city") || "").trim(),
    };

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      setSuccessMessage(
        data.message ||
          "Signup successful. Please verify your email before login."
      );

      if (data.verificationLink) {
        setVerificationLink(data.verificationLink);
      }
    } catch (error) {
      alert("Backend not connected. Check backend server and NEXT_PUBLIC_API_URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fffdf0] via-white to-[#f7fafc] px-4 py-10 text-[#061739]">
      <div className="w-full max-w-[620px]">
        <Link
          href="/"
          className="mb-7 flex items-center justify-center gap-2 text-[15px] font-medium text-[#536987]"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="mb-7 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
            <span className="text-[10px] font-extrabold text-red-500">
              OUT
            </span>
          </div>

          <h1 className="text-[28px] font-extrabold tracking-tight">
            Out-Play
          </h1>
        </div>

        <div className="rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] p-7 shadow-2xl shadow-slate-200">
          <div className="mb-5 text-center">
            <h2 className="text-[22px] font-extrabold">
              Create Your Account
            </h2>
            <p className="mt-2 text-[14px] text-[#536987]">
              Choose your portal and start using Out-Play
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            {portals.map((portal) => {
              const Icon = portal.icon;
              const active = selectedPortal === portal.id;

              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => setSelectedPortal(portal.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-[#00897b] bg-[#e6f4f1] shadow-sm"
                      : "border-[#d8e0ec] bg-white hover:border-[#00897b]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        active
                          ? "bg-[#00897b] text-white"
                          : "bg-slate-100 text-[#536987]"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className="text-[13px] font-extrabold">
                        {portal.title}
                      </p>
                      <p className="text-[11px] text-[#536987]">
                        {portal.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mb-5 rounded-xl bg-white px-4 py-3 text-[13px] font-bold text-[#536987]">
            Selected Portal:{" "}
            <span className="text-[#00796b]">{selectedPortalLabel}</span>
          </div>

          {successMessage && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">
              <p className="font-bold">{successMessage}</p>

              {verificationLink && (
                <div className="mt-3">
                  <p className="font-semibold">
                    Temporary verification link:
                  </p>

                  <Link
                    href={verificationLink}
                    className="mt-2 block break-all rounded-lg bg-white p-3 font-bold text-[#00796b] underline"
                  >
                    {verificationLink}
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="mt-4 inline-flex h-10 items-center rounded-xl bg-[#00796b] px-4 font-bold text-white"
              >
                Go to Login
              </Link>
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div className="mb-5 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-[13px] font-bold">
                  Your Name *
                </span>
                <input
                  name="name"
                  required
                  placeholder="Full name"
                  className="h-[42px] w-full rounded-xl border border-[#00897b] bg-white px-4 text-[14px] outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-bold">
                  Phone *
                </span>
                <input
                  name="phone"
                  required
                  placeholder="+91 98765..."
                  className="h-[42px] w-full rounded-xl border border-[#d8e0ec] bg-white px-4 text-[14px] outline-none focus:border-[#00897b]"
                />
              </label>
            </div>

            <label className="mb-5 block">
              <span className="mb-2 block text-[13px] font-bold">
                Email *
              </span>
              <input
                name="email"
                required
                type="email"
                placeholder="you@example.com"
                className="h-[42px] w-full rounded-xl border border-[#d8e0ec] bg-white px-4 text-[14px] outline-none focus:border-[#00897b]"
              />
            </label>

            <label className="mb-5 block">
              <span className="mb-2 block text-[13px] font-bold">
                Password *
              </span>

              <div className="relative">
                <input
                  name="password"
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  className="h-[42px] w-full rounded-xl border border-[#d8e0ec] bg-white px-4 pr-11 text-[14px] outline-none focus:border-[#00897b]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#536987]"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {selectedPortal === "academy" && (
              <>
                <label className="mb-5 block">
                  <span className="mb-2 block text-[13px] font-bold">
                    Academy Name *
                  </span>
                  <input
                    name="academyName"
                    required
                    placeholder="e.g., Champions Football Academy"
                    className="h-[42px] w-full rounded-xl border border-[#d8e0ec] bg-white px-4 text-[14px] outline-none focus:border-[#00897b]"
                  />
                </label>

                <div className="mb-5 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-bold">
                      Primary Sport
                    </span>
                    <select
                      name="primarySport"
                      className="h-[42px] w-full rounded-xl border border-[#d8e0ec] bg-white px-4 text-[14px] outline-none focus:border-[#00897b]"
                    >
                      <option value="">Select sport</option>
                      <option value="Football">Football</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Badminton">Badminton</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-bold">
                      City
                    </span>
                    <input
                      name="city"
                      placeholder="e.g., Bangalore"
                      className="h-[42px] w-full rounded-xl border border-[#d8e0ec] bg-white px-4 text-[14px] outline-none focus:border-[#00897b]"
                    />
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-[42px] w-full rounded-xl bg-[#00796b] text-[14px] font-extrabold text-white shadow-sm hover:bg-[#006b5f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : `Create ${selectedPortalLabel} Account`}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-[#536987]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#00796b]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}