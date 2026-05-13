import { IntelligenceReport, IntelligenceCategory, ScoreDetail, IntelligenceSnapshot, IntelligenceAnomaly, INTELLIGENCE_CONFIG } from './intelligence';
import { TrendEngine } from './TrendEngine';
import { RecommendationEngine } from './RecommendationEngine';

export class ScoringEngine {
  /**
   * Calculate the deterministic health score for an academy.
   * Integrates with existing observability metrics.
   */
  public static calculateHealth(
    tenantId: string,
    metrics: { 
      unpaidInvoices: number; 
      attendanceRate: number; 
      relayFailures: number; 
      lastLoginDays: number 
    },
    history: IntelligenceSnapshot[] = [],
    activeAnomalies: IntelligenceAnomaly[] = []
  ): IntelligenceReport {
    const { WEIGHTS } = INTELLIGENCE_CONFIG;
    const categories: Record<IntelligenceCategory, ScoreDetail> = {
      finance: this.scoreFinance(metrics.unpaidInvoices),
      operations: this.scoreOperations(metrics.lastLoginDays),
      engagement: this.scoreEngagement(metrics.attendanceRate),
      delivery: this.scoreDelivery(metrics.relayFailures),
      compliance: { score: 100, weight: WEIGHTS.COMPLIANCE, label: 'Compliance', reason: 'No pending DLT issues', trend: 'stable' },
      platform: { score: 100, weight: WEIGHTS.PLATFORM, label: 'Platform Stability', reason: 'System overhead within limits', trend: 'stable' }
    };

    // Runtime Hardening: Ensure we use the absolute latest snapshot for delta calculation
    const sortedHistory = [...history].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const lastSnapshot = sortedHistory.length > 0 ? sortedHistory[0] : null;

    // Inject Trend Deltas into categories
    Object.keys(categories).forEach((cat) => {
      const category = cat as IntelligenceCategory;
      categories[category].delta = lastSnapshot ? TrendEngine.getCategoryDelta(category, categories[category].score, lastSnapshot as IntelligenceSnapshot | undefined) : 0;
    });

    const totalWeight = Object.values(categories).reduce((acc, c) => acc + c.weight, 0);
    const weightedSum = Object.values(categories).reduce((acc, c) => acc + (c.score * c.weight), 0);
    const finalScore = Math.round(weightedSum / totalWeight);

    return {
      tenantId,
      sourceSystem: 'scoring-engine', // Mandatory for BaseIntelligenceTelemetry
      schemaVersion: '1.0.0', // Mandatory for BaseIntelligenceTelemetry
      timestamp: new Date(),
      overallHealthScore: finalScore,
      categories,
      recommendations: RecommendationEngine.getRecommendations(categories),
      predictedChurnRisk: this.calculateChurnRisk(categories),
      generatedAt: new Date(),
      trends: TrendEngine.calculateTrend(finalScore, history),
      anomalies: activeAnomalies
    };
  }

  /**
   * Placeholder for AI Ranking retrieval
   */
  public static async getReportsForAllAcademies(): Promise<IntelligenceReport[]> {
    return []; // Production implementation would query the warehouse/DB for all active tenants
  }

  /**
   * Phase 2: Snapshot Automation
   * Generates a persistable snapshot of the current intelligence state.
   */
  public static generateSnapshot(report: IntelligenceReport): IntelligenceSnapshot {
    const categoryScores = {} as Record<IntelligenceCategory, number>;
    Object.entries(report.categories).forEach(([key, detail]: [string, ScoreDetail]) => {
      categoryScores[key as IntelligenceCategory] = detail.score;
    });

    return {
      timestamp: new Date(),
      overallHealthScore: report.overallHealthScore,
      categoryScores
    };
  }

  private static scoreFinance(unpaid: number): ScoreDetail {
    const { WEIGHTS } = INTELLIGENCE_CONFIG;
    const score = Math.max(0, 100 - (unpaid * 20));
    return {
      score,
      weight: WEIGHTS.FINANCE,
      label: 'Financial Health',
      reason: unpaid > 0 ? `${unpaid} overdue invoices detected` : 'All invoices paid',
      trend: unpaid > 2 ? 'declining' : 'stable'
    };
  }

  private static scoreOperations(lastLoginDays: number): ScoreDetail {
    const { WEIGHTS } = INTELLIGENCE_CONFIG;
    const score = Math.max(0, 100 - (lastLoginDays * 10));
    return {
      score,
      weight: WEIGHTS.OPERATIONS,
      label: 'Operational Health',
      reason: lastLoginDays > 3 ? `Inactive for ${lastLoginDays} days` : 'Active participation',
      trend: lastLoginDays > 7 ? 'declining' : 'stable'
    };
  }

  private static scoreEngagement(attendanceRate: number): ScoreDetail {
    const { WEIGHTS } = INTELLIGENCE_CONFIG;
    return {
      score: attendanceRate,
      weight: WEIGHTS.ENGAGEMENT,
      label: 'Engagement Health',
      reason: attendanceRate < 70 ? 'Low student attendance detected' : 'Strong batch engagement',
      trend: attendanceRate < 60 ? 'declining' : 'stable'
    };
  }

  private static scoreDelivery(relayFailures: number): ScoreDetail {
    const { WEIGHTS } = INTELLIGENCE_CONFIG;
    const score = Math.max(0, 100 - (relayFailures * 5));
    return {
      score,
      weight: WEIGHTS.DELIVERY,
      label: 'Delivery Health',
      reason: relayFailures > 5 ? `${relayFailures} message failures in 24h` : 'High delivery reliability',
      trend: relayFailures > 10 ? 'declining' : 'stable'
    };
  }

  private static calculateChurnRisk(categories: Record<IntelligenceCategory, ScoreDetail>): number {
    // High risk if Engagement and Operations are both low
    const engagementFactor = (100 - categories.engagement.score) * 0.7;
    const operationalFactor = (100 - categories.operations.score) * 0.3;
    return parseFloat(((engagementFactor + operationalFactor) / 100).toFixed(2));
  }
}
