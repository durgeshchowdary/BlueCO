"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  HelpCircle,
  IndianRupee,
  LayoutDashboard,
  MessageSquare,
  PackageCheck,
  Target,
  Ticket,
  Users,
} from "lucide-react";

const groups = [
  {
    title: "ACTIVE PITCH",
    items: [
      { label: "Dashboard", href: "/academy/dashboard", icon: LayoutDashboard },
      { label: "Students", href: "/academy/students", icon: Users },
      { label: "HRMS", href: "/academy/hrms", icon: BriefcaseBusiness },
      { label: "Events", href: "/academy/events", icon: CalendarDays },
      {
        label: "Training Sessions",
        href: "/academy/training-sessions",
        icon: CheckSquare,
      },
    ],
  },
  {
    title: "BACK-OFFICE",
    items: [
      { label: "Finance", href: "/academy/finance", icon: IndianRupee },
      { label: "KPI Dashboard", href: "/academy/kpi-dashboard", icon: BarChart3 },
      { label: "CRM", href: "/academy/crm", icon: Target },
      { label: "Chat", href: "/academy/chat", icon: MessageSquare },
      { label: "Delivery Logs", href: "/academy/delivery-logs", icon: PackageCheck },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      { label: "Tickets", href: "/academy/tickets", icon: Ticket },
      { label: "Announcements", href: "/academy/announcements", icon: Bell },
      { label: "Help Center", href: "/academy/help-center", icon: HelpCircle },
    ],
  },
];

export default function AcademySidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-[260px] border-r border-slate-200 bg-[#f8fafc]">
      <div className="flex h-[80px] items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-[7px] font-black text-red-500">OUT</span>
        </div>

        <h1 className="text-[22px] font-black">
          <span className="text-slate-900">Out-</span>
          <span className="text-red-500">Play</span>
        </h1>
      </div>

      <nav className="h-[calc(100vh-80px)] overflow-y-auto pb-16">
        {groups.map((group) => (
          <div key={group.title} className="border-b border-slate-200 px-2 py-4">
            <p className="mb-2 px-2 text-[11px] font-bold tracking-[0.18em] text-slate-400">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-11 items-center gap-3 rounded-xl px-4 text-[16px] font-medium transition ${
                      active
                        ? "bg-[#d8ece9] text-[#047c73]"
                        : "text-[#52657d] hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 flex h-11 w-full items-center justify-center border-t border-slate-200 bg-[#f8fafc] text-slate-500">
        ‹
      </div>
    </aside>
  );
}