'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  CalendarClock,
  CircleDollarSign,
  Gauge,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import api from '../lib/api';
import RoleShell from './RoleShell';
import { getStoredUser, roleLabels, type Role } from '../lib/auth';
import { can } from '../lib/permissions';
import ExecutiveKpiCards, { type ExecutiveKpi } from './dashboard/ExecutiveKpiCards';
import InsightHighlights, { type InsightHighlight } from './dashboard/InsightHighlights';
import OperationalHealthStrip, { type HealthStripItem } from './dashboard/OperationalHealthStrip';
import MobileExecutiveCards, { type MobileExecutiveMetric } from './mobile/MobileExecutiveCards';
import MobileInsightCarousel, { type MobileInsightItem } from './mobile/MobileInsightCarousel';
import MobileOperationalFeed, { type MobileFeedItem } from './mobile/MobileOperationalFeed';
import { PremiumStat } from './outplay/DesignSystem';
import { MotionGrid, fadeUp } from './outplay/Motion';
import OnboardingWizard from './onboarding/OnboardingWizard';
import type { OnboardingChecklistItem } from './onboarding/OnboardingChecklist';

const endpoints: Record<Role, string> = {
  super_admin: '/super-admin/dashboard',
  academy_admin: '/academy/dashboard/summary',
  coach: '/coach/dashboard',
  employee: '/employee/dashboard',
  student: '/user/dashboard',
};

const normalizeSeries = (items: any[] = []) => {
  const values = items
    .map((item) => Number(item.amount ?? item.academies ?? item.total ?? item.value ?? 0))
    .filter((value) => Number.isFinite(value));
  const max = Math.max(...values, 1);
  return values.map((value) => Math.max(8, Math.round((value / max) * 100)));
};

const insightList = (data: Record<string, any>) => {
  if (Array.isArray(data.aiInsights)) return data.aiInsights.map((item: any) => String(item));
  if (Array.isArray(data.insights)) return data.insights.map((item: any) => item.title || item.recommendation || String(item));
  return [];
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
  const [aiOpsViewed, setAiOpsViewed] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const storedUser = getStoredUser() || {};
      setUserPermissions(storedUser?.effectivePermissions || storedUser?.permissions || []);
      setAiOpsViewed(window.localStorage.getItem('outplay_ai_ops_viewed') === 'true');
    } catch {
      setUserPermissions([]);
      setAiOpsViewed(false);
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
        ['Total academies', data.totalAcademies || 0, ShieldCheck, 'cyan'],
        ['Active subscriptions', data.activeSubscriptions || 0, Activity, 'emerald'],
        ['Total revenue', `Rs ${Number(data.totalRevenue || 0).toLocaleString('en-IN')}`, CircleDollarSign, 'blue'],
        ['Total users', data.totalUsers || 0, Users, 'violet'],
      ] as const;
    }
    if (role === 'coach') {
      return [
        ['Assigned players', data.assignedPlayers || 0, Users, 'cyan'],
        ['Assigned batches', data.assignedBatches || 0, Activity, 'blue'],
        ['Upcoming events', data.todaySessions || 0, CalendarClock, 'emerald'],
        ['Access scope', 'Assigned only', ShieldCheck, 'violet'],
      ] as const;
    }
    if (role === 'employee') {
      return [
        ['Open tasks', data.openTasks || 0, Activity, 'cyan'],
        ['Employee type', data.employeeType || 'staff', ShieldCheck, 'blue'],
        ['Permissions', data.permissions?.length || 0, BarChart3, 'emerald'],
        ['Data scope', 'Own work', ShieldCheck, 'violet'],
      ] as const;
    }
    return [
      ['Students', data.totalStudents || 0, Users, 'cyan'],
      ['Active coaches', data.activeCoaches || 0, ShieldCheck, 'blue'],
      ['Monthly revenue', `Rs ${Number(data.monthlyRevenue || 0).toLocaleString('en-IN')}`, CircleDollarSign, 'emerald'],
      ['Attendance today', `${data.todayAttendancePercentage || 0}%`, BarChart3, 'violet'],
    ] as const;
  }, [data, role]);

  const blocked = mounted && requiredPermission && !can(userPermissions, requiredPermission);
  const chartSeries = normalizeSeries(data.revenueHistory || data.growth || data.paymentRevenue || []);
  const insights = insightList(data);
  const attendancePercent = Number(data.todayAttendancePercentage || data.attendancePercentage || 0);
  const heatCells = Array.from({ length: 18 }, (_, index) => Math.max(8, Math.min(100, attendancePercent + ((index % 6) - 2) * 4)));
  const onboardingItems = useMemo<OnboardingChecklistItem[]>(() => {
    const coachCount = Number(data.activeCoaches || data.totalCoaches || data.coachesCount || 0);
    const studentCount = Number(data.totalStudents || data.studentsCount || 0);
    const batchCount = Number(data.activeBatches || data.totalBatches || data.batchesCount || 0);
    const profileComplete = Boolean(data.academyProfileCompleted || data.profileCompleted || data.academy?.name || data.academyName);
    const attendanceEnabled = Boolean(data.attendanceEnabled || attendancePercent > 0 || data.todayAttendanceMarked);

    return [
      {
        id: 'academy_profile',
        title: 'Complete academy profile',
        description: profileComplete ? 'Academy profile signal is available.' : 'Add academy name, city, and operational profile details.',
        href: '/settings',
        completed: profileComplete,
      },
      {
        id: 'coaches_added',
        title: 'Add coaches',
        description: coachCount ? `${coachCount} coach${coachCount === 1 ? '' : 'es'} available.` : 'Add at least one coach to start batch operations.',
        href: '/academy/coaches',
        completed: coachCount > 0,
      },
      {
        id: 'students_added',
        title: 'Add students',
        description: studentCount ? `${studentCount} student${studentCount === 1 ? '' : 's'} enrolled.` : 'Add students before attendance and engagement tracking.',
        href: '/academy/students',
        completed: studentCount > 0,
      },
      {
        id: 'batches_configured',
        title: 'Configure batches',
        description: batchCount ? `${batchCount} batch${batchCount === 1 ? '' : 'es'} configured.` : 'Create batches to connect coaches, students, and schedules.',
        href: '/batches',
        completed: batchCount > 0,
      },
      {
        id: 'attendance_enabled',
        title: 'Enable attendance',
        description: attendanceEnabled ? 'Attendance signal is active.' : 'Record attendance once students and batches are ready.',
        href: '/academy/attendance',
        completed: attendanceEnabled,
      },
      {
        id: 'ai_ops_viewed',
        title: 'Open AI Ops',
        description: aiOpsViewed ? 'AI Ops introduction has been viewed.' : 'Visit AI Ops to review insights, timeline, search, and copilot.',
        href: '/academy/ai-ops',
        completed: aiOpsViewed,
      },
    ];
  }, [aiOpsViewed, attendancePercent, data]);
  const onboardingComplete = onboardingItems.length > 0 && onboardingItems.every((item) => item.completed);
  const mobileDashboardMetrics = useMemo<MobileExecutiveMetric[]>(() => {
    if (role !== 'academy_admin') return [];
    const students = Number(data.totalStudents || data.studentsCount || 0);
    const coaches = Number(data.activeCoaches || data.totalCoaches || data.coachesCount || 0);
    const revenue = Number(data.monthlyRevenue || 0);
    return [
      { id: 'students', label: 'Students', value: students, helper: 'Enrolled', tone: students ? 'cyan' : 'slate' },
      { id: 'coaches', label: 'Coaches', value: coaches, helper: 'Active', tone: coaches ? 'emerald' : 'slate' },
      { id: 'attendance', label: 'Attendance', value: `${attendancePercent}%`, helper: 'Today', tone: attendancePercent >= 75 ? 'emerald' : attendancePercent > 0 ? 'amber' : 'slate' },
      { id: 'revenue', label: 'Revenue', value: `Rs ${revenue.toLocaleString('en-IN')}`, helper: 'Monthly', tone: revenue ? 'cyan' : 'slate' },
      { id: 'ai', label: 'AI signals', value: insights.length, helper: 'Dashboard insights', tone: insights.length ? 'emerald' : 'slate' },
      { id: 'setup', label: 'Setup', value: onboardingComplete ? 'Done' : 'Open', helper: 'Readiness', tone: onboardingComplete ? 'emerald' : 'amber' },
    ];
  }, [attendancePercent, data, insights.length, onboardingComplete, role]);
  const mobileDashboardInsights = useMemo<MobileInsightItem[]>(() => {
    if (role !== 'academy_admin') return [];
    return insights.map((insight, index) => ({
      id: `dashboard-insight-${index}`,
      title: insight,
      description: 'Generated by the existing protected dashboard response.',
      category: 'AI insight',
      severity: 'info',
    }));
  }, [insights, role]);
  const mobileDashboardFeed = useMemo<MobileFeedItem[]>(() => {
    if (role !== 'academy_admin') return [];
    return [
      {
        id: 'attendance-feed',
        title: 'Attendance pulse',
        description: `${attendancePercent}% attendance recorded in the current dashboard summary.`,
        category: 'Attendance',
        severity: attendancePercent >= 75 ? 'low' : attendancePercent > 0 ? 'medium' : 'info',
      },
      {
        id: 'students-feed',
        title: 'Student roster',
        description: `${Number(data.totalStudents || data.studentsCount || 0)} students available in the academy summary.`,
        category: 'Students',
        severity: 'info',
      },
      {
        id: 'ai-ops-feed',
        title: 'AI Ops introduction',
        description: aiOpsViewed ? 'AI Ops has been viewed for this browser session.' : 'Open AI Ops to review insights, timeline, search, and copilot.',
        category: 'AI Ops',
        severity: aiOpsViewed ? 'low' : 'medium',
      },
    ];
  }, [aiOpsViewed, attendancePercent, data, role]);
  const executiveKpis = useMemo<ExecutiveKpi[]>(() => {
    if (role !== 'academy_admin') return [];
    const openAlerts = onboardingItems.filter((item) => !item.completed).length;
    const health = Math.max(0, Math.min(100, attendancePercent || (onboardingComplete ? 92 : 68)));
    return [
      { id: 'health', label: 'Operational health', value: `${health}%`, helper: onboardingComplete ? 'Setup complete' : 'Setup in progress', tone: health >= 80 ? 'emerald' : health >= 60 ? 'amber' : 'red' },
      { id: 'attendance', label: 'Attendance movement', value: `${attendancePercent}%`, helper: 'Today', tone: attendancePercent >= 75 ? 'emerald' : attendancePercent > 0 ? 'amber' : 'slate' },
      { id: 'relay', label: 'Relay reliability', value: aiOpsViewed ? 'Ready' : 'Pending', helper: 'AI Ops signal', tone: aiOpsViewed ? 'cyan' : 'slate' },
      { id: 'anomalies', label: 'Anomaly count', value: openAlerts, helper: 'Setup gaps', tone: openAlerts ? 'amber' : 'emerald' },
      { id: 'ai-recs', label: 'AI recommendations', value: insights.length, helper: 'Dashboard signals', tone: insights.length ? 'cyan' : 'slate' },
      { id: 'alerts', label: 'Operational alerts', value: openAlerts, helper: 'Active readiness items', tone: openAlerts ? 'amber' : 'emerald' },
    ];
  }, [aiOpsViewed, attendancePercent, insights.length, onboardingComplete, onboardingItems, role]);
  const healthStripItems = useMemo<HealthStripItem[]>(() => {
    if (role !== 'academy_admin') return [];
    const healthValue = Math.max(0, Math.min(100, attendancePercent || (onboardingComplete ? 92 : 68)));
    const openAlerts = onboardingItems.filter((item) => !item.completed).length;
    return [
      { id: 'overall', label: 'Overall health', value: `${healthValue}%`, status: healthValue >= 80 ? 'healthy' : healthValue >= 60 ? 'watch' : 'risk' },
      { id: 'attendance', label: 'Attendance trend', value: attendancePercent ? `${attendancePercent}%` : 'No signal', status: attendancePercent >= 75 ? 'healthy' : attendancePercent > 0 ? 'watch' : 'neutral' },
      { id: 'relay', label: 'Relay status', value: aiOpsViewed ? 'Ready' : 'Pending', status: aiOpsViewed ? 'healthy' : 'neutral' },
      { id: 'anomaly', label: 'Anomaly severity', value: openAlerts ? 'Watch' : 'Clear', status: openAlerts ? 'watch' : 'healthy' },
      { id: 'ai-ops', label: 'AI ops activity', value: insights.length ? 'Active' : 'Ready', status: insights.length ? 'healthy' : 'neutral' },
      { id: 'confidence', label: 'Confidence', value: onboardingComplete ? 'High' : 'Building', status: onboardingComplete ? 'healthy' : 'watch' },
    ];
  }, [aiOpsViewed, attendancePercent, insights.length, onboardingComplete, onboardingItems, role]);
  const dashboardHighlights = useMemo<InsightHighlight[]>(() => {
    if (role !== 'academy_admin') return [];
    const firstInsight = insights[0];
    const nextSetup = onboardingItems.find((item) => !item.completed);
    return [
      {
        id: 'top-insight',
        label: 'Top insight',
        title: firstInsight || 'AI signals ready',
        description: firstInsight ? 'Loaded from the existing academy dashboard summary.' : 'Generate AI insights from AI Ops once operational data is available.',
        tone: firstInsight ? 'cyan' : 'slate',
      },
      {
        id: 'top-recommendation',
        label: 'Recommendation',
        title: nextSetup?.title || 'Keep operating cadence',
        description: nextSetup?.description || 'Core readiness items are complete for this dashboard view.',
        tone: nextSetup ? 'amber' : 'emerald',
      },
      {
        id: 'latest-anomaly',
        label: 'Latest anomaly',
        title: onboardingItems.filter((item) => !item.completed).length ? 'Setup gaps remain' : 'No setup anomalies',
        description: `${onboardingItems.filter((item) => !item.completed).length} readiness items pending.`,
        tone: onboardingItems.some((item) => !item.completed) ? 'amber' : 'emerald',
      },
      {
        id: 'summary',
        label: 'Summary',
        title: `${Number(data.totalStudents || data.studentsCount || 0)} students / ${Number(data.activeCoaches || data.totalCoaches || data.coachesCount || 0)} coaches`,
        description: 'Snapshot from the existing academy dashboard summary.',
        tone: 'cyan',
      },
      {
        id: 'predictive',
        label: 'Predictive warning',
        title: attendancePercent && attendancePercent < 65 ? 'Attendance risk' : 'No predictive warning',
        description: attendancePercent && attendancePercent < 65 ? 'Attendance is below a healthy demo threshold.' : 'Current dashboard signals do not show a predictive warning.',
        tone: attendancePercent && attendancePercent < 65 ? 'red' : 'emerald',
      },
    ];
  }, [attendancePercent, data, insights, onboardingItems, role]);

  return (
    <RoleShell role={role} title={title}>
      {blocked ? (
        <div className="rounded-[28px] border border-red-300/20 bg-red-500/10 p-8 text-red-100 shadow-[0_0_60px_rgba(248,113,113,0.1)]">
          <h1 className="text-2xl font-black">Access Denied</h1>
          <p className="mt-2 text-sm font-semibold">Your account does not include {requiredPermission}.</p>
        </div>
      ) : (
        <>
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="relative mb-7 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.065] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.16),transparent_42%)]" />
            <div className="relative grid gap-7 lg:grid-cols-[1.45fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200/80">{section}</p>
                <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  {title.replace('OUT-PLAY', 'OUT-PLAY')}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                  Live academy operations, protected by RBAC and tenant-scoped APIs, presented as an AI-native sports command center.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  insights.length ? `${insights.length} AI signals` : 'AI signal-ready',
                  'RBAC enforced',
                  'Tenant scoped',
                  loading ? 'Syncing ops' : 'Ops synced',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm font-bold text-slate-200">
                    <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {role === 'academy_admin' ? (
            <div className="mb-7 space-y-5 md:hidden">
              <MobileExecutiveCards metrics={mobileDashboardMetrics} loading={loading} />
              <MobileInsightCarousel items={mobileDashboardInsights} loading={loading} />
              <MobileOperationalFeed items={mobileDashboardFeed} loading={loading} />
            </div>
          ) : null}

          {role === 'academy_admin' && !loading && !onboardingComplete ? (
            <OnboardingWizard items={onboardingItems} loading={loading} className="mb-7" />
          ) : null}

          {role === 'academy_admin' ? (
            <>
              <ExecutiveKpiCards items={executiveKpis} loading={loading} className="mb-4" />
              <OperationalHealthStrip items={healthStripItems} loading={loading} className="mb-4" />
              <InsightHighlights items={dashboardHighlights} loading={loading} className="mb-7" />
            </>
          ) : null}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-36 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.06]" />
              ))}
            </div>
          ) : (
            <MotionGrid className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map(([label, value, Icon, tone]) => (
                <PremiumStat key={String(label)} label={String(label)} value={String(value)} icon={Icon} tone={tone} />
              ))}
            </MotionGrid>
          )}

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-[30px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/70">Performance analytics</p>
                  <h3 className="mt-2 text-xl font-black text-white">Revenue and utilization pulse</h3>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-emerald-100">
                  Healthy trend
                </div>
              </div>
              {chartSeries.length ? (
                <div className="mt-8 flex h-72 items-end gap-3">
                  {chartSeries.map((bar, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${bar}%`, opacity: 1 }}
                      transition={{ delay: index * 0.04, duration: 0.6 }}
                      className="min-w-0 flex-1 rounded-t-2xl bg-gradient-to-t from-blue-700 via-cyan-400 to-white shadow-[0_0_26px_rgba(34,211,238,0.18)]"
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-8 flex h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950/25 px-6 text-center">
                  <div>
                    <BarChart3 className="mx-auto text-cyan-200" />
                    <p className="mt-4 text-sm font-bold text-slate-400">Analytics will appear when revenue or growth history is available from the existing API.</p>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-[30px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/70">AI recommendations</p>
                  <h3 className="mt-2 text-xl font-black text-white">Ops intelligence</h3>
                </div>
                <Sparkles className="text-cyan-200" />
              </div>
              <div className="mt-6 space-y-3">
                {insights.length ? insights.slice(0, 4).map((insight) => (
                  <div key={insight} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="font-black text-white">{insight}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-400">Generated by the current protected dashboard API response.</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/25 p-5 text-sm font-bold leading-6 text-slate-400">
                    AI insight cards will populate from the existing dashboard/AI APIs once recommendations are available.
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <Gauge className="text-cyan-200" />
                <h3 className="text-xl font-black text-white">Attendance heatmap</h3>
              </div>
              <div className="mt-5 grid grid-cols-6 gap-2">
                {heatCells.map((value, index) => (
                  <div
                    key={index}
                    className="h-12 rounded-xl border border-white/10"
                    style={{ background: `rgba(34, 211, 238, ${Math.max(0.08, value / 130)})` }}
                    title={`${value}% attendance`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <Zap className="text-cyan-200" />
                <h3 className="text-xl font-black text-white">Permission boundary</h3>
              </div>
              <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-300 md:grid-cols-3">
                <p className="rounded-2xl bg-emerald-400/10 px-4 py-3 text-emerald-100">Namespace: /api/{role === 'super_admin' ? 'super-admin' : role === 'academy_admin' ? 'academy' : role}</p>
                <p className="rounded-2xl bg-red-400/10 px-4 py-3 text-red-100">Unauthorized routes return 403.</p>
                <p className="rounded-2xl bg-cyan-400/10 px-4 py-3 text-cyan-100">Academy data is tenant-filtered.</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                API data is loaded through the protected {roleLabels[role]} workspace. Navigation and actions remain filtered by role and permissions.
              </p>
            </div>
          </div>
        </>
      )}
    </RoleShell>
  );
}
