'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  Flag,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  Settings,
  Shield,
  Ticket,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import { getStoredUser, logout, roleLabels, type Role } from '../lib/auth';
import { can, permissions } from '../lib/permissions';

type NavItem = { href: string; label: string; icon: ElementType; permission?: string };

const navByRole: Record<Role, NavItem[]> = {
  super_admin: [
    { href: '/super-admin/dashboard', label: 'Command Center', icon: LayoutDashboard },
    { href: '/super-admin/academies', label: 'Academies', icon: Flag },
    { href: '/super-admin/users', label: 'Users', icon: Users },
    { href: '/super-admin/revenue', label: 'Revenue', icon: Wallet },
    { href: '/super-admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { href: '/super-admin/logs', label: 'System Logs', icon: Activity },
    { href: '/super-admin/features', label: 'Features', icon: Shield },
    { href: '/super-admin/settings', label: 'Settings', icon: Settings },
  ],
  academy_admin: [
    { href: '/academy/dashboard', label: 'Academy OS', icon: LayoutDashboard },
    { href: '/academy/students', label: 'Students', icon: Users },
    { href: '/academy/coaches', label: 'Coaches', icon: UserCog },
    { href: '/academy/employees', label: 'Employees', icon: Shield },
    { href: '/academy/payments', label: 'Payments', icon: Wallet },
    { href: '/academy/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/academy/events', label: 'Events', icon: Calendar },
    { href: '/academy/reports', label: 'Reports', icon: BarChart3 },
  ],
  coach: [
    { href: '/coach/dashboard', label: 'Coach Deck', icon: LayoutDashboard },
    { href: '/coach/students', label: 'Assigned Players', icon: Users, permission: permissions.studentsRead },
    { href: '/coach/batches', label: 'Batches', icon: ListChecks, permission: permissions.batchesRead },
    { href: '/coach/attendance', label: 'Attendance', icon: ClipboardCheck, permission: permissions.attendanceRead },
    { href: '/coach/performance', label: 'Performance', icon: Activity, permission: permissions.performanceWrite },
    { href: '/coach/reports', label: 'Reports', icon: FileText, permission: permissions.reportsRead },
  ],
  employee: [
    { href: '/employee/dashboard', label: 'Workspace', icon: LayoutDashboard },
    { href: '/employee/tasks', label: 'Tasks', icon: ListChecks, permission: permissions.tasksRead },
    { href: '/employee/payments', label: 'Payments', icon: Wallet, permission: permissions.paymentsRead },
    { href: '/employee/admissions', label: 'Admissions', icon: Users, permission: permissions.admissionsRead },
    { href: '/employee/tickets', label: 'Tickets', icon: Ticket, permission: permissions.ticketsRead },
    { href: '/employee/reports', label: 'Reports', icon: BarChart3, permission: permissions.reportsRead },
    { href: '/employee/profile', label: 'Profile', icon: UserCog, permission: permissions.profileRead },
    { href: '/employee/schedule', label: 'Schedule', icon: Calendar, permission: permissions.scheduleRead },
  ],
};

export default function RoleShell({
  role,
  title,
  children,
}: {
  role: Role;
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);

  useEffect(() => {
    setUser(getStoredUser());
    setMounted(true);
  }, []);

  const userPermissions = user?.permissions || [];
  const visibleNav = mounted
    ? navByRole[role].filter((item) => can(userPermissions, item.permission))
    : [];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <aside className="fixed left-0 top-0 hidden h-screen w-[286px] border-r border-white/10 bg-white/[0.04] px-4 py-6 backdrop-blur-xl lg:block">
        <div className="px-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 font-black text-slate-950">
            PG
          </div>
          <h1 className="mt-4 text-xl font-black">PlayGrid AI</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
            {roleLabels[role]}
          </p>
        </div>

        <nav className="mt-8 space-y-1" aria-label={`${roleLabels[role]} navigation`}>
          {!mounted ? (
            <div className="space-y-2" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-11 rounded-2xl bg-white/[0.06]" />
              ))}
            </div>
          ) : visibleNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  active ? 'bg-cyan-300 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <section className="lg:pl-[286px]">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 px-5 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">{roleLabels[role]}</p>
              <h2 className="mt-1 text-2xl font-black">{title}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 md:inline-flex">
                {mounted && user?.employeeType ? `${user.name} / ${user.employeeType}` : mounted && user?.name ? user.name : 'Secure session'}
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-red-500/20 hover:text-red-100"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <section className="p-5 lg:p-8">{children}</section>
      </section>
    </main>
  );
}
