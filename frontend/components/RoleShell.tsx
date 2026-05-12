'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Building2,
  Calendar,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Gauge,
  FileText,
  Flag,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  Menu,
  Search,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  UserCog,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { getStoredRole, getStoredUser, isAuthenticated, logout, roleHome, roleLabels, type Role } from '../lib/auth';
import { can, permissions } from '../lib/permissions';
import NotificationCenter from './NotificationCenter';
import { BrandMark } from './outplay/DesignSystem';

type NavItem = { href: string; label: string; icon: ElementType; permission?: string };

const navByRole: Record<Role, NavItem[]> = {
  super_admin: [
    { href: '/super-admin/dashboard', label: 'Command Center', icon: LayoutDashboard },
    { href: '/super-admin/academies', label: 'Academies', icon: Flag },
    { href: '/super-admin/users', label: 'Users', icon: Users },
    { href: '/super-admin/revenue', label: 'Revenue', icon: Wallet },
    { href: '/super-admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { href: '/super-admin/compliance', label: 'Compliance', icon: ClipboardCheck },
    { href: '/super-admin/observability', label: 'Observability', icon: Gauge },
    { href: '/super-admin/platform-health', label: 'Health Center', icon: HeartPulse },
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
    { href: '/academy/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/academy/billing', label: 'Billing Ops', icon: FileText },
    { href: '/academy/ai-ops', label: 'AI Ops', icon: Sparkles },
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
  student: [
    { href: '/dashboard', label: 'Out-Play Hub', icon: LayoutDashboard },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/payments', label: 'Payments', icon: Wallet },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/tickets', label: 'Support', icon: Ticket },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    const storedUser = getStoredUser();
    const storedRole = (storedUser?.role as Role | undefined) || getStoredRole();

    const isRoleScopedRoute = pathname.startsWith('/super-admin')
      || pathname.startsWith('/academy')
      || pathname.startsWith('/coach')
      || pathname.startsWith('/employee');

    if (isRoleScopedRoute && storedRole && storedRole !== role) {
      window.location.href = roleHome[storedRole] || '/login';
      return;
    }

    setUser(storedUser);
    setMounted(true);
  }, [pathname, role]);

  const userPermissions = user?.permissions || [];
  const visibleNav = mounted
    ? navByRole[role].filter((item) => can(userPermissions, item.permission))
    : [];

  const renderNav = (onNavigate?: () => void) => (
    <nav className="mt-6 space-y-6" aria-label={`${roleLabels[role]} navigation`}>
      <div>
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Workspace</p>
        <div className="mt-3 space-y-1.5">
          {!mounted ? (
            <div className="space-y-2" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-11 animate-pulse rounded-2xl bg-white/[0.07]" />
              ))}
            </div>
          ) : visibleNav.map((item) => {
            const active = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              >
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? 'border border-cyan-300/25 bg-cyan-300/15 text-white shadow-[0_0_34px_rgba(34,211,238,0.16)]'
                      : 'border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  {active ? <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" /> : null}
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${active ? 'bg-cyan-300 text-slate-950' : 'bg-white/[0.06] text-cyan-100 group-hover:bg-cyan-300/10'}`}>
                    <item.icon size={17} />
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">
            <Building2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">Academy Switcher</p>
            <p className="text-xs font-semibold text-slate-500">Current tenant scope</p>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#020713] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-28 top-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-0 top-20 h-[32rem] w-[32rem] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-400/5 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
      </div>

      <aside className="fixed left-4 top-4 z-30 hidden h-[calc(100vh-2rem)] w-[288px] overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.065] px-4 py-5 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:block">
        <div className="px-2">
          <BrandMark />
          <div className="mt-5 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.06] px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-200/80">
              {roleLabels[role]}
            </p>
            <p className="mt-1 truncate text-sm font-bold text-slate-200">
              {mounted && user?.name ? user.name : 'Secure workspace'}
            </p>
          </div>
        </div>

        {renderNav()}
      </aside>

      <section className="relative z-10 lg:pl-[320px]">
        <header className="sticky top-0 z-20 px-4 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.065] text-slate-200 shadow-[0_18px_60px_rgba(0,0,0,0.2)] lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={19} />
              </button>
              <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200/80">{roleLabels[role]}</p>
              <h2 className="mt-1 truncate text-2xl font-black tracking-tight text-white">{title}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.065] p-1.5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
              <div className="hidden min-w-[240px] items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm font-semibold text-slate-400 md:flex">
                <Search size={16} className="text-cyan-200" />
                Search academy ops...
              </div>
              <NotificationCenter />
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-slate-200 hover:border-cyan-200/30"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-300 text-[10px] font-black text-slate-950">
                    {(user?.name || 'OP').slice(0, 2).toUpperCase()}
                  </span>
                  {mounted && user?.employeeType ? `${user.name} / ${user.employeeType}` : mounted && user?.name ? user.name : 'Secure session'}
                  <ChevronDown size={15} className="text-slate-400" />
                </button>
                <AnimatePresence>
                  {profileOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute right-0 top-12 w-72 rounded-2xl border border-white/10 bg-[#06111f]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl"
                    >
                      <div className="rounded-xl bg-white/[0.06] p-3">
                        <p className="font-black text-white">{user?.name || 'Secure session'}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">{user?.email || roleLabels[role]}</p>
                      </div>
                      <button
                        type="button"
                        onClick={logout}
                        className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-100 hover:bg-red-500/15"
                      >
                        <LogOut size={16} />
                        Log out
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 shadow-sm hover:border-red-300/30 hover:bg-red-500/15 hover:text-red-100 md:hidden"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="p-4 pb-10 lg:p-8"
        >
          {children}
        </motion.section>
      </section>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -340, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -340, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="fixed left-3 top-3 z-50 h-[calc(100vh-1.5rem)] w-[min(330px,calc(100vw-1.5rem))] overflow-y-auto rounded-[30px] border border-white/10 bg-[#06111f]/95 px-4 py-5 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:hidden"
            >
              <div className="flex items-center justify-between">
                <BrandMark />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-slate-200"
                  aria-label="Close navigation"
                >
                  <X size={18} />
                </button>
              </div>
              {renderNav(() => setMobileOpen(false))}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
