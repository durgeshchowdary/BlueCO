'use client';

import { useEffect, useMemo, useState } from 'react';
import RoleShell from '../../../components/RoleShell';
import AIInsightStream, { type AIInsight } from '../../../components/ai/AIInsightStream';
import AIWeeklySummaryCard from '../../../components/ai/AIWeeklySummaryCard';
import CopilotPanel from '../../../components/copilot/CopilotPanel';
import ExecutiveKpiCards, { type ExecutiveKpi } from '../../../components/dashboard/ExecutiveKpiCards';
import InsightHighlights, { type InsightHighlight } from '../../../components/dashboard/InsightHighlights';
import OperationalHealthStrip, { type HealthStripItem } from '../../../components/dashboard/OperationalHealthStrip';
import DemoModeToggle from '../../../components/demo/DemoModeToggle';
import DemoScenarioBanner from '../../../components/demo/DemoScenarioBanner';
import MobileExecutiveCards, { type MobileExecutiveMetric } from '../../../components/mobile/MobileExecutiveCards';
import MobileInsightCarousel, { type MobileInsightItem } from '../../../components/mobile/MobileInsightCarousel';
import MobileOperationalFeed, { type MobileFeedItem } from '../../../components/mobile/MobileOperationalFeed';
import AISetupAssistant from '../../../components/onboarding/AISetupAssistant';
import GlobalOperationalSearch, { type OperationalSearchItem } from '../../../components/search/GlobalOperationalSearch';
import OperationalTimeline from '../../../components/timeline/OperationalTimeline';
import { useDemoMode } from '../../../providers/DemoModeProvider';

export default function AIOpsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const { enabled: demoEnabled, scenario, generatedAt } = useDemoMode();

  useEffect(() => {
    window.localStorage.setItem('outplay_ai_ops_viewed', 'true');
  }, []);

  const demoInsights = useMemo<AIInsight[]>(() => {
    if (!demoEnabled || !scenario) return [];
    return [{
      _id: `demo-${scenario.id}`,
      category: scenario.category,
      severity: scenario.severity,
      title: scenario.title,
      recommendation: scenario.recommendation,
      impact: scenario.summary,
      confidence: scenario.severity === 'critical' || scenario.severity === 'high' ? 0.86 : 0.78,
      status: 'open',
      generatedAt,
    }];
  }, [demoEnabled, generatedAt, scenario]);

  const visibleInsights = useMemo(() => [...demoInsights, ...insights], [demoInsights, insights]);

  const searchItems = useMemo<OperationalSearchItem[]>(() => {
    const insightItems = visibleInsights.map((insight) => ({
      id: `insight-${insight._id}`,
      type: 'Insights' as const,
      title: insight.title,
      description: insight.impact || insight.recommendation,
      category: insight.category.replace('_', ' '),
      timestamp: insight.generatedAt || insight.updatedAt,
    }));

    const recommendationItems = visibleInsights.map((insight) => ({
      id: `recommendation-${insight._id}`,
      type: 'Recommendations' as const,
      title: insight.recommendation,
      description: insight.title,
      category: insight.severity,
      timestamp: insight.generatedAt || insight.updatedAt,
    }));

    const timelineItems = visibleInsights.map((insight) => ({
      id: `timeline-${insight._id}`,
      type: 'Timeline Events' as const,
      title: insight.title,
      description: insight.recommendation,
      category: insight.status,
      timestamp: insight.generatedAt || insight.updatedAt,
    }));

    const summaryItems = visibleInsights.length
      ? [{
          id: 'academy-weekly-ai-summary',
          type: 'Operational Alerts' as const,
          title: 'Weekly AI operational briefing',
          description: `${visibleInsights.filter((item) => item.status === 'open').length} open insights and ${visibleInsights.filter((item) => item.severity === 'high' || item.severity === 'critical').length} high-priority signals.`,
          category: 'AI summary',
          timestamp: visibleInsights[0]?.generatedAt || visibleInsights[0]?.updatedAt,
        }]
      : [];

    return [...summaryItems, ...insightItems, ...recommendationItems, ...timelineItems];
  }, [visibleInsights]);

  const mobileMetrics = useMemo<MobileExecutiveMetric[]>(() => {
    const open = visibleInsights.filter((item) => item.status === 'open').length;
    const highPriority = visibleInsights.filter((item) => item.severity === 'high' || item.severity === 'critical').length;
    const attendanceWatch = visibleInsights.some((item) => item.category.toLowerCase().includes('attendance') && item.status !== 'resolved');
    const health = Math.max(0, 100 - highPriority * 12 - open * 3);

    return [
      { id: 'health', label: 'Health', value: `${health}%`, helper: health >= 85 ? 'Stable ops' : 'Needs review', tone: health >= 85 ? 'emerald' : health >= 70 ? 'amber' : 'red' },
      { id: 'attendance', label: 'Attendance', value: attendanceWatch ? 'Watch' : 'Stable', helper: 'Movement signal', tone: attendanceWatch ? 'amber' : 'emerald' },
      { id: 'anomalies', label: 'Anomalies', value: highPriority, helper: 'High priority', tone: highPriority ? 'red' : 'emerald' },
      { id: 'relay', label: 'Relay', value: 'Ready', helper: 'No local signal', tone: 'cyan' },
      { id: 'recommendations', label: 'AI recs', value: open, helper: 'Open actions', tone: open ? 'cyan' : 'slate' },
      { id: 'summary', label: 'Weekly', value: visibleInsights.length ? 'Live' : 'Empty', helper: demoEnabled ? 'Demo rotating' : visibleInsights.length ? 'Briefing ready' : 'Generate insights', tone: visibleInsights.length ? 'emerald' : 'slate' },
    ];
  }, [demoEnabled, visibleInsights]);

  const mobileInsights = useMemo<MobileInsightItem[]>(() => visibleInsights.map((insight) => ({
    id: insight._id,
    title: insight.title,
    description: insight.impact || insight.recommendation,
    category: insight.category.replace('_', ' '),
    severity: insight.severity,
    timestamp: insight.generatedAt || insight.updatedAt,
  })), [visibleInsights]);

  const mobileFeed = useMemo<MobileFeedItem[]>(() => visibleInsights.map((insight) => ({
    id: `feed-${insight._id}`,
    title: insight.title,
    description: insight.recommendation,
    category: insight.status,
    severity: insight.severity,
    timestamp: insight.generatedAt || insight.updatedAt,
  })), [visibleInsights]);

  const executiveKpis = useMemo<ExecutiveKpi[]>(() => {
    const open = visibleInsights.filter((item) => item.status === 'open').length;
    const highPriority = visibleInsights.filter((item) => item.severity === 'high' || item.severity === 'critical').length;
    const attendanceWatch = visibleInsights.some((item) => item.category.toLowerCase().includes('attendance') && item.status !== 'resolved');
    const relayWatch = visibleInsights.some((item) => item.category.toLowerCase().includes('relay') && item.status !== 'resolved');
    const health = Math.max(0, 100 - highPriority * 12 - open * 3);
    return [
      { id: 'health', label: 'Operational health', value: `${health}%`, helper: demoEnabled ? 'Demo overlay active' : 'AI signal health', tone: health >= 85 ? 'emerald' : health >= 70 ? 'amber' : 'red' },
      { id: 'attendance', label: 'Attendance movement', value: attendanceWatch ? 'Watch' : 'Stable', helper: 'From insight categories', tone: attendanceWatch ? 'amber' : 'emerald' },
      { id: 'relay', label: 'Relay reliability', value: relayWatch ? 'Watch' : 'Ready', helper: 'Messaging signal', tone: relayWatch ? 'amber' : 'cyan' },
      { id: 'anomalies', label: 'Anomaly count', value: highPriority, helper: 'High priority', tone: highPriority ? 'red' : 'emerald' },
      { id: 'ai-recs', label: 'AI recommendations', value: open, helper: 'Open actions', tone: open ? 'cyan' : 'slate' },
      { id: 'alerts', label: 'Active alerts', value: highPriority, helper: 'Operational alerts', tone: highPriority ? 'red' : 'emerald' },
    ];
  }, [demoEnabled, visibleInsights]);

  const healthStripItems = useMemo<HealthStripItem[]>(() => {
    const open = visibleInsights.filter((item) => item.status === 'open').length;
    const highPriority = visibleInsights.filter((item) => item.severity === 'high' || item.severity === 'critical').length;
    const attendanceWatch = visibleInsights.some((item) => item.category.toLowerCase().includes('attendance'));
    const relayWatch = visibleInsights.some((item) => item.category.toLowerCase().includes('relay'));
    const health = Math.max(0, 100 - highPriority * 12 - open * 3);
    const avgConfidence = visibleInsights.length
      ? Math.round((visibleInsights.reduce((sum, item) => sum + Number(item.confidence || 0.72), 0) / visibleInsights.length) * 100)
      : 0;
    return [
      { id: 'overall', label: 'Overall health', value: `${health}%`, status: health >= 85 ? 'healthy' : health >= 70 ? 'watch' : 'risk' },
      { id: 'attendance', label: 'Attendance trend', value: attendanceWatch ? 'Watch' : 'Stable', status: attendanceWatch ? 'watch' : 'healthy' },
      { id: 'relay', label: 'Relay status', value: relayWatch ? 'Watch' : 'Ready', status: relayWatch ? 'watch' : 'healthy' },
      { id: 'anomaly', label: 'Anomaly severity', value: highPriority ? 'High' : 'Clear', status: highPriority ? 'risk' : 'healthy' },
      { id: 'ai-ops', label: 'AI ops activity', value: visibleInsights.length ? 'Active' : 'Empty', status: visibleInsights.length ? 'healthy' : 'neutral' },
      { id: 'confidence', label: 'Confidence', value: avgConfidence ? `${avgConfidence}%` : 'No signal', status: avgConfidence >= 75 ? 'healthy' : avgConfidence ? 'watch' : 'neutral' },
    ];
  }, [visibleInsights]);

  const insightHighlights = useMemo<InsightHighlight[]>(() => {
    const topInsight = visibleInsights[0];
    const topRecommendation = visibleInsights.find((item) => item.status === 'open') || topInsight;
    const latestAnomaly = visibleInsights.find((item) => item.severity === 'critical' || item.severity === 'high');
    const predictiveWarning = visibleInsights.find((item) => item.category.toLowerCase().includes('attendance') || item.category.toLowerCase().includes('engagement'));
    return [
      {
        id: 'top-insight',
        label: 'Top insight',
        title: topInsight?.title || 'No top insight yet',
        description: topInsight?.impact || topInsight?.recommendation || 'Generate AI insights to populate executive highlights.',
        tone: topInsight ? 'cyan' : 'slate',
        timestamp: topInsight?.generatedAt || topInsight?.updatedAt,
      },
      {
        id: 'top-recommendation',
        label: 'Recommendation',
        title: topRecommendation?.recommendation || 'No recommendation yet',
        description: topRecommendation?.title || 'Open recommendations appear after AI insights are generated.',
        tone: topRecommendation ? 'emerald' : 'slate',
        timestamp: topRecommendation?.generatedAt || topRecommendation?.updatedAt,
      },
      {
        id: 'latest-anomaly',
        label: 'Latest anomaly',
        title: latestAnomaly?.title || 'No high-priority anomaly',
        description: latestAnomaly?.recommendation || 'No critical or high insight is currently visible.',
        tone: latestAnomaly ? 'red' : 'emerald',
        timestamp: latestAnomaly?.generatedAt || latestAnomaly?.updatedAt,
      },
      {
        id: 'summary',
        label: 'Summary',
        title: visibleInsights.length ? `${visibleInsights.length} visible intelligence signals` : 'No operational summary',
        description: demoEnabled ? 'Demo mode is adding frontend-only operational movement.' : 'Summary is derived from current AI insight state.',
        tone: visibleInsights.length ? 'cyan' : 'slate',
        timestamp: visibleInsights[0]?.generatedAt || visibleInsights[0]?.updatedAt,
      },
      {
        id: 'predictive',
        label: 'Predictive warning',
        title: predictiveWarning?.title || 'No predictive warning',
        description: predictiveWarning?.recommendation || 'No attendance or engagement warning is currently visible.',
        tone: predictiveWarning ? 'amber' : 'emerald',
        timestamp: predictiveWarning?.generatedAt || predictiveWarning?.updatedAt,
      },
    ];
  }, [demoEnabled, visibleInsights]);

  return (
    <RoleShell role="academy_admin" title="AI Operations">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-700">Operational intelligence</p>
          <h1 className="mt-3 text-3xl font-black md:text-5xl">AI Ops Command Center</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Recommendations generated from attendance, payments, utilization, payroll, and cost signals.
          </p>
        </div>
        <DemoModeToggle className="w-full justify-center md:w-fit" />
      </div>

      <DemoScenarioBanner className="mb-6" />

      <GlobalOperationalSearch items={searchItems} loading={insightsLoading && !demoEnabled} className="mb-6" />

      <ExecutiveKpiCards items={executiveKpis} loading={insightsLoading && !demoEnabled} className="mb-4" />
      <OperationalHealthStrip items={healthStripItems} loading={insightsLoading && !demoEnabled} className="mb-4" />
      <InsightHighlights items={insightHighlights} loading={insightsLoading && !demoEnabled} className="mb-6" />

      <div className="mb-6 space-y-5 md:hidden">
        <MobileExecutiveCards metrics={mobileMetrics} loading={insightsLoading && !demoEnabled} />
        <MobileInsightCarousel items={mobileInsights} loading={insightsLoading && !demoEnabled} />
        <MobileOperationalFeed items={mobileFeed} loading={insightsLoading && !demoEnabled} />
      </div>

      {!insightsLoading && !visibleInsights.length ? (
        <AISetupAssistant
          className="mb-6"
          nextAction="Generate AI insights after core attendance, student, coach, and payment data has been captured."
        />
      ) : null}

      <AIWeeklySummaryCard insights={visibleInsights} loading={insightsLoading && !demoEnabled} className="mb-6 hidden md:block" />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <AIInsightStream onInsightsChange={setInsights} onLoadingChange={setInsightsLoading} overlayInsights={demoInsights} />
        <OperationalTimeline insights={visibleInsights} />
      </div>

      <CopilotPanel className="mt-6" />
    </RoleShell>
  );
}
