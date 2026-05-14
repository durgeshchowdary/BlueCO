"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function EmployeeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[250px] min-h-screen border-r border-[#d9dee8] bg-[#f8fafc] p-5">
      <h1 className="mb-10 text-3xl font-black">
        Out-<span className="text-red-500">Play</span>
      </h1>

      <div className="space-y-2">
        <Link
          href="/employee/dashboard"
          className={`block rounded-xl p-3 font-semibold ${
            pathname === "/employee/dashboard"
              ? "bg-[#d8eeee] text-[#087f73]"
              : "text-slate-600 hover:bg-[#d8eeee]"
          }`}
        >
          Dashboard
        </Link>

        <Link
          href="/employee/training-sessions"
          className={`block rounded-xl p-3 font-semibold ${
            pathname === "/employee/training-sessions"
              ? "bg-[#d8eeee] text-[#087f73]"
              : "text-slate-600 hover:bg-[#d8eeee]"
          }`}
        >
          Training Sessions
        </Link>
      </div>
    </aside>
  );
}
