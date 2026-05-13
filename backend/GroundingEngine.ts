import { 
  IntelligenceReport, 
  IntelligenceTimelineEntry, 
  IntelligenceAnomaly, 
  PredictiveForecast,
  CopilotContext
} from './intelligence';
import { ScoringEngine } from './ScoringEngine';
import { IntelligenceAggregator } from './IntelligenceAggregator';
import { PredictiveEngine } from './PredictiveEngine';
import logger from './logger';

export class GroundingEngine {
  /**
   * Retrieves the current intelligence report for a tenant, enforcing RBAC.
   */
  public static async getTenantReport(tenantId: string, userRole: CopilotContext['userRole']): Promise<IntelligenceReport | null> {
    // In a real scenario, metrics would be fetched from a live telemetry system
    const metrics = { unpaidInvoices: 0, attendanceRate: 85, relayFailures: 2, lastLoginDays: 1 };
    const history: any[] = []; // Placeholder for actual history retrieval
    const activeAnomalies: IntelligenceAnomaly[] = []; // Placeholder for actual anomaly retrieval

    const report = ScoringEngine.calculateHealth(tenantId, metrics, history, activeAnomalies);
    
    // Basic RBAC filtering for the report itself (more granular filtering happens in CopilotService)
    if (userRole === 'parent' && report.categories.finance) {
      report.categories.finance.score = 0; // Redact sensitive scores
      report.categories.finance.reason = 'Access Restricted';
    }

    return report;
  }

  /**
   * Retrieves a replay-safe timeline for a tenant, enforcing RBAC.
   */
  public static async getTenantTimeline(tenantId: string, userRole: CopilotContext['userRole'], limit: number = 10): Promise<IntelligenceTimelineEntry[]> {
    if (userRole === 'parent') {
      logger.warn('grounding.rbac_denial', { tenantId, userRole, action: 'getTenantTimeline' });
      return []; // Parents should not see raw operational timelines
    }
    return IntelligenceAggregator.getTimeline(tenantId, limit);
  }

  /**
   * Retrieves predictive forecasts for a tenant, enforcing RBAC.
   */
  public static async getTenantForecasts(tenantId: string, userRole: CopilotContext['userRole']): Promise<PredictiveForecast[]> {
    if (userRole === 'parent' || userRole === 'coach') {
      logger.warn('grounding.rbac_denial', { tenantId, userRole, action: 'getTenantForecasts' });
      return []; // Parents/Coaches should not see raw predictive forecasts
    }
    // In a real scenario, this would fetch all active forecasts for the tenant
    const currentReport = await this.getTenantReport(tenantId, userRole);
    if (!currentReport) return [];
    const history: any[] = []; // Placeholder for actual history retrieval
    const churnForecast = await PredictiveEngine.forecastChurn(tenantId, currentReport, history);
    const relayForecast = await PredictiveEngine.predictRelayInstability(tenantId);
    return [churnForecast, relayForecast];
  }

  /**
   * Retrieves specific relay health metrics, enforcing RBAC.
   */
  public static async getRelayHealth(tenantId: string, userRole: CopilotContext['userRole']): Promise<any> { // Return type should be RelayMetrics
    if (userRole === 'parent' || userRole === 'coach') {
      logger.warn('grounding.rbac_denial', { tenantId, userRole, action: 'getRelayHealth' });
      return {}; // Parents/Coaches should not see detailed relay health
    }
    return IntelligenceAggregator.getRelayHealth(tenantId);
  }
}
