"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";

export default function EmployeeDashboardPage() {
  const [tab, setTab] = useState<"upcoming" | "all">("upcoming");

  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/`;
      window.history.replaceState({}, "", "/employee/dashboard");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#fffdf0] px-8 py-8 text-[#061739]">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">
            Training Sessions
          </h1>

          <p className="mt-1 text-[15px] text-[#536987]">
            0 sessions
          </p>
        </div>

        <button className="flex h-[42px] items-center gap-2 rounded-xl bg-[#00796b] px-5 text-[14px] font-bold text-white shadow-sm hover:bg-[#00695f]">
          <Plus size={16} />
          New Session
        </button>
      </div>

      <div className="mb-6 flex w-fit rounded-2xl bg-[#eef1f6] p-1">
        <button
          onClick={() => setTab("upcoming")}
          className={`h-[38px] rounded-xl px-5 text-[14px] font-semibold transition ${
            tab === "upcoming"
              ? "bg-[#fffdf0] text-[#061739] shadow-sm"
              : "text-[#536987]"
          }`}
        >
          Upcoming
        </button>

        <button
          onClick={() => setTab("all")}
          className={`h-[38px] rounded-xl px-5 text-[14px] font-semibold transition ${
            tab === "all"
              ? "bg-[#fffdf0] text-[#061739] shadow-sm"
              : "text-[#536987]"
          }`}
        >
          All
        </button>
      </div>

      <section className="flex h-[180px] items-center justify-center rounded-2xl border border-[#d8e0ec] bg-[#f8fbff] shadow-sm">
        <div className="text-center">
          <Sparkles
            size={42}
            className="mx-auto text-[#bcc6d4]"
          />

          <p className="mt-5 text-[16px] text-[#536987]">
            No sessions yet. Create your first training
            session above.
          </p>
        </div>
      </section>
    </div>
  );
}