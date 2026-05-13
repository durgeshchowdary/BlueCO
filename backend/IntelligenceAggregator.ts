import { IntelligenceSnapshot, IntelligenceReport, CohortDefinition, LongitudinalInsight, IntelligenceTimelineEntry, IntelligenceEvent, INTELLIGENCE_CONFIG, RelayMetrics, ConsistencyReport, OperationalCorrectnessScore } from './intelligence';
import { AnalyticsWarehouse } from './AnalyticsWarehouse';
import { TrendEngine } from './TrendEngine';
import { IntelligencePipeline } from './IntelligencePipeline.js';

export class IntelligenceAggregator {
  /**
   * Phase 1, #1: Longitudinal Analytics.
   * Compares historical snapshots to generate trend trajectories.
   */
  public static getLongitudinalInsight(
    currentReport: IntelligenceReport,
    history: IntelligenceSnapshot[]
  ): LongitudinalInsight {
    // Defensive Check: Handle sparse data for new academies
    if (history.length === 0) {
      return { period: 'weekly', start: new Date(), end: new Date(), scoreMovement: 0, volatility: 0 };
    }

    const trends = TrendEngine.calculateTrend(currentReport.overallHealthScore, history);
    
    return {
      period: 'weekly',
      start: history[0]?.timestamp || new Date(),
      end: new Date(),
      scoreMovement: trends.weeklyChange,
      volatility: trends.volatilityIndex
    };
  }

  /**
   * Phase 1, #2: Cohort Analytics.
   * Groups academies into behavioral cohorts for platform-scale analysis.
   */
  public static getCohorts(reports: IntelligenceReport[]): Record<string, number> {
    const cohorts: CohortDefinition[] = [
      {
        id: 'churn_risk',
        name: 'High Churn Risk',
        category: 'operations',
        criteria: (r) => r.predictedChurnRisk > 0.7,
        memberCount: 0
      },
      {
        id: 'high_performers',
        name: 'Elite Engagement',
        category: 'engagement',
        criteria: (r) => r.overallHealthScore > 85,
        memberCount: 0
      }
    ];

    const distribution: Record<string, number> = {};
    cohorts.forEach(cohort => {
      const members = reports.filter(cohort.criteria);
      distribution[cohort.id] = members.length;
    });

    return distribution;
  }

  /**
   * Phase 1, #3: Materialized Intelligence Views.
   * Generates rollups for high-performance dashboard rendering.
   */
  public static async getMaterializedSummary(tenantId: string, days: number = 30) {
    const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await AnalyticsWarehouse.query(tenantId, startTime, new Date());

    let criticalAnomalyCount = 0;
    let nonInfoEventCount = 0;
    let successCount = 0;
    let failureCount = 0;

    for (const event of events) {
      if (event.severity === 'critical') criticalAnomalyCount++;
      if (event.severity !== 'info') nonInfoEventCount++;
      if (event.eventType === 'DELIVERY_RECOVERY') successCount++;
      else if (event.eventType === 'DELIVERY_FAILURE') failureCount++;
    }

    const totalEfficiencyEvents = successCount + failureCount;

    return {
      tenantId,
      periodDays: days,
      totalEvents: events.length,
      anomalyCount: criticalAnomalyCount,
      deliverySuccessRate: totalEfficiencyEvents === 0 ? 100 : Math.round((successCount / totalEfficiencyEvents) * 100),
      stabilityScore: 100 - (nonInfoEventCount * 2)
    };
  }

  /**
   * Phase 1, #8: Intelligence Timeline Infrastructure.
   * Reconstructs a chronological narrative from raw warehouse events.
   */
  public static async getTimeline(tenantId: string, limit: number = 50): Promise<IntelligenceTimelineEntry[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const events = await AnalyticsWarehouse.query(tenantId, thirtyDaysAgo, new Date());
    // Ensure events are sorted chronologically before slicing for the timeline
    const sortedEvents = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return sortedEvents.slice(-limit).map(event => ({
      id: `TL_${event.traceId ?? 'NO_TRACE'}_${event.timestamp.getTime()}`, // Ensure traceId is always a string for the ID
      tenantId: event.tenantId,
      type: 'operational_event',
      severity: event.severity,
      timestamp: event.timestamp,
      message: `System recorded ${event.eventType.toLowerCase().replace(/_/g, ' ')}`,
      metadata: event.metadata,
      traceId: event.traceId,
      sourceSystem: event.sourceSystem, // Inherit from the original event
      schemaVersion: event.schemaVersion // Inherit from the original event
    }));
  }

  private static calculateEventEfficiency(events: IntelligenceEvent[], successType: string, failureType: string): number {
    let successCount = 0;
    let failureCount = 0;

    for (const e of events) {
      if (e.eventType === successType) successCount++;
      else if (e.eventType === failureType) failureCount++;
    }

    const total = successCount + failureCount;
    return total === 0 ? 100 : Math.round((successCount / total) * 100);
  }

  /**
   * SECTION 6 — RELAY HEALTH INTELLIGENCE
   * Generates operational relay analytics and checks for threshold breaches.
   */
  public static async getRelayHealth(tenantId: string): Promise<RelayMetrics> {
    const thirtyDaysAgo = new Date(Date.now() - INTELLIGENCE_CONFIG.LOOKBACK.MONTHLY_MS);
    const events = await AnalyticsWarehouse.query(tenantId, thirtyDaysAgo, new Date());

    const totalRelayed = events.filter(e => e.eventType === 'DELIVERY_FAILURE' || e.eventType === 'DELIVERY_RECOVERY').length;
    const failovers = events.filter(e => e.eventType === 'RELAY_FAILOVER').length;
    
    // Deterministic dependency calculation
    const relayDependencyPct = totalRelayed > 100 ? Math.min(100, (totalRelayed / 500) * 100) : 10;

    // SECTION 7 — RELAY THRESHOLD ALERTS
    if (relayDependencyPct > 75) {
      await IntelligencePipeline.handleEvent(tenantId, 'RELAY_THRESHOLD_ALERT', {
        currentValue: relayDependencyPct,
        threshold: 75,
        context: 'High platform relay dependency detected'
      });
    }

    return {
      totalRelayedMessages: totalRelayed,
      relayDependencyPct,
      ownKeyAdoptionPct: relayDependencyPct > 50 ? 20 : 80, // Inverse heuristic
      failoverFrequency: failovers,
      recoveryRate: this.calculateEventEfficiency(events, 'DELIVERY_RECOVERY', 'DELIVERY_FAILURE')
    };
  }

  /**
   * Phase 70: AI Aggregation Helper
   * Retrieves high-risk academies for Super Admin AI Command Center.
   */
  public static async getGlobalRiskRanking(reports: IntelligenceReport[]): Promise<IntelligenceReport[]> {
    // Deterministic ranking by Churn Risk and Operational Volatility
    return [...reports]
      .sort((a, b) => b.predictedChurnRisk - a.predictedChurnRisk)
      .slice(0, 10);
  }

  /**
   * SECTION 7 — CONSISTENCY SCORING ENGINE
   */
  public static async getResilienceScore(tenantId: string): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - INTELLIGENCE_CONFIG.LOOKBACK.MONTHLY_MS);
    const events = await AnalyticsWarehouse.query(tenantId, thirtyDaysAgo, new Date());
    
    const recoveryFailures = events.filter(e => e.eventType === 'RECOVERY_FAILED').length;
    const checksumMismatches = events.filter(e => e.eventType === 'REPLAY_CHECKSUM_MISMATCH').length;

    const baseline = 100;
    const deduction = (recoveryFailures * 20) + (checksumMismatches * 15);
    
    return Math.max(0, baseline - deduction);
  }

  /**
   * SECTION 6 — OPERATIONAL CORRECTNESS SCORE
   * Mathematically derives resilience confidence from chaos history and consistency audits.
   */
  public static async getOperationalCorrectness(tenantId: string): Promise<OperationalCorrectnessScore> {
    const thirtyDaysAgo = new Date(Date.now() - INTELLIGENCE_CONFIG.LOOKBACK.MONTHLY_MS);
    const events = await AnalyticsWarehouse.query(tenantId, thirtyDaysAgo, new Date());
    
    const failedSimulations = events.filter(e => e.eventType === 'CHAOS_SIMULATION_FAILED').length;
    const checksumMismatches = events.filter(e => e.eventType === 'REPLAY_CHECKSUM_MISMATCH').length;
    const resilienceScore = await this.getResilienceScore(tenantId);

    const correctnessScore = Math.max(0, resilienceScore - (failedSimulations * 10));

    return {
      replayCorrectness: checksumMismatches > 0 ? 70 : 100,
      failoverCorrectness: events.some(e => e.eventType === 'FAILOVER_PROPAGATED') ? 100 : 95,
      telemetryCorrectness: 100,
      warehouseCorrectness: 100,
      resilienceConfidence: correctnessScore,
      auditTimestamp: new Date()
    };
  }
}
