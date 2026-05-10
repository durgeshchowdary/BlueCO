'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, CircleDollarSign, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import RoleShell from './RoleShell';
import { roleLabels, type Role } from '../lib/auth';
import { can } from '../lib/permissions';

const endpoints: Record<Role, string> = {
  super_admin: '/super-admin/dashboard',
  academy_admin: '/academy/dashboard/summary',
  coach: '/coach/dashboard',
  employee: '/employee/dashboard',
  student: '/dashboard/summary',
};

export default function RoleDashboard({
  role,
  title,
  section,
  requiredPermission,
}: {
  role: Role;
  title: string;
  section: string;
  requiredPermission?: string;
}) {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem('playgrid_user') || '{}');
      setUserPermissions(storedUser?.effectivePermissions || storedUser?.permissions || []);
    } catch {
      setUserPermissions([]);
    }

    const controller = new AbortController();
    api.get(endpoints[role], { signal: controller.signal })
      .then((response) => setData(response.data || {}))
      .catch(() => setData({}))
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [role]);

  const cards = useMemo(() => {
    if (role === 'super_admin') {
      return [
        ['Total academies', data.totalAcademies || 0, ShieldCheck],
        ['Active subscriptions', data.activeSubscriptions || 0, Activity],
        ['Total revenue', `₹${Number(data.totalRevenue || 0).toLocaleString('en-IN')}`, CircleDollarSign],
        ['Total users', data.totalUsers || 0, BarChart3],
      ];
    }
    if (role === 'coach') {
      return [
        ['Assigned players', data.assignedPlayers || 0, ShieldCheck],
        ['Assigned batches', data.assignedBatches || 0, Activity],
        ['Upcoming events', data.todaySessions || 0, BarChart3],
        ['Access scope', 'Assigned only', ShieldCheck],
      ];
    }
    if (role === 'employee') {
      return [
        ['Open tasks', data.openTasks || 0, Activity],
        ['Employee type', data.employeeType || 'staff', ShieldCheck],
        ['Permissions', data.permissions?.length || 0, BarChart3],
        ['Data scope', 'Own work', ShieldCheck],
      ];
    }
    return [
      ['Students', data.totalStudents || 0, ShieldCheck],
      ['Active coaches', data.activeCoaches || 0, Activity],
      ['Monthly revenue', `₹${Number(data.monthlyRevenue || 0).toLocaleString('en-IN')}`, CircleDollarSign],
      ['Attendance today', `${data.todayAttendancePercentage || 0}%`, BarChart3],
    ];
  }, [data, role]);

  const blocked = mounted && requiredPermission && !can(userPermissions, requiredPermission);

  return (
    <RoleShell role={role} title={title}>
      {blocked ? (
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-red-100">
          <h1 className="text-2xl font-black">Access Denied</h1>
          <p className="mt-2 text-sm font-semibold">Your account does not include {requiredPermission}.</p>
        </div>
      ) : (
        <>
      <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">{section}</p>
        <h1 className="mt-3 text-3xl font-black md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
          This workspace is backed by protected APIs, strict role checks, active account validation, and tenant-scoped database queries.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-3xl bg-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <div key={String(label)} className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-300">{String(label)}</p>
                <div className="rounded-2xl bg-cyan-300/15 p-3 text-cyan-200">
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-5 text-3xl font-black">{String(value)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
          <h3 className="text-lg font-black">Permission Boundary</h3>
          <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-300">
            <p className="rounded-2xl bg-emerald-400/10 px-4 py-3 text-emerald-100">Allowed API namespace: /api/{role === 'super_admin' ? 'super-admin' : role === 'academy_admin' ? 'academy' : role}</p>
            <p className="rounded-2xl bg-red-400/10 px-4 py-3 text-red-100">Unauthorized role routes return 403 Access Denied.</p>
            <p className="rounded-2xl bg-cyan-400/10 px-4 py-3 text-cyan-100">Academy data is filtered by academyId on every tenant collection.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
          <h3 className="text-lg font-black">Secure Session</h3>
          <div className="mt-5 space-y-3 text-sm font-semibold text-slate-300">
            <p className="rounded-2xl bg-white/[0.06] px-4 py-3">
              API data loaded through the protected {roleLabels[role]} workspace.
            </p>
            <p className="rounded-2xl bg-white/[0.06] px-4 py-3">
              Navigation and actions are filtered by role and permissions.
            </p>
            <p className="rounded-2xl bg-white/[0.06] px-4 py-3">
              Unauthorized enterprise routes are blocked before rendering.
            </p>
          </div>
        </div>
      </div>
        </>
      )}
    </RoleShell>
  );
}
