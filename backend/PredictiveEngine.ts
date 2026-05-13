import { 
  IntelligenceSnapshot, 
  PredictiveForecast, 
  IntelligenceEventType,
  INTELLIGENCE_CONFIG,
  IntelligenceReport,
  IntelligenceEvent
} from './intelligence';
import { AnalyticsWarehouse } from './AnalyticsWarehouse';
import { TrendEngine } from './TrendEngine';
import { IntelligencePipeline } from './IntelligencePipeline';

export class PredictiveEngine {
  /**
   * Section 2: Churn Evolution Forecasting.
   * Project churn risk movement based on health score velocity and anomaly trends.
   */
  public static async forecastChurn(
    tenantId: string,
    currentReport: IntelligenceReport,
    history: IntelligenceSnapshot[]
  ): Promise<PredictiveForecast> {
    const predictionId = `PRD_CHURN_${Date.now()}`;
    
    // Grounding: Calculate velocity (delta of deltas)
    const weeklyChange = currentReport.trends.weeklyChange;
    const monthlyChange = currentReport.trends.monthlyChange;
    
    // Deterministic Projection
    const velocity = (weeklyChange + (monthlyChange / 4)) / 2;
    const predictedRisk30d = Math.min(1, Math.max(0, currentReport.predictedChurnRisk - (velocity / 100)));

    const forecast: PredictiveForecast = {
      tenantId,
      predictionId,
      sourceSystem: 'predictive-engine',
      schemaVersion: '1.0.0',
      timestamp: new Date(),
      forecastWindow: '30d',
      currentRisk: currentReport.predictedChurnRisk,
      predictedRisk: parseFloat(predictedRisk30d.toFixed(2)),
      contributingSignals: [
        `Health velocity: ${velocity.toFixed(1)} pts/week`,
        `Active anomalies: ${currentReport.anomalies.length}`
      ],
      confidenceScore: history.length > 5 ? 0.85 : 0.4,
      forecastDirection: velocity < -2 ? 'declining' : velocity > 2 ? 'improving' : 'stable',
      operationalRecommendations: [],
      category: 'operations',
      explainability: {
        historicalPatterns: `Based on ${history.length} snapshots over ${INTELLIGENCE_CONFIG.LOOKBACK.MONTHLY_MS / (86400000)} days.`,
        anomaliesUsed: currentReport.anomalies.map(a => a.id),
        replayReferences: history.map(h => `SNAP_${h.timestamp.getTime()}`),
        telemetryReferences: ['ATTENDANCE_UPDATE', 'LOGIN_ACTIVITY'],
        confidenceReasoning: history.length > 5 ? "High data density supports stable projection." : "Low snapshot count; forecast is speculative.",
        trendBasis: velocity < 0 ? "Downward trajectory in academy participation" : "Stable or rising engagement metrics"
      }
    };

    await this.auditPrediction(forecast);
    return forecast;
  }

  /**
   * Section 3: Relay Failure Prediction.
   * Predict provider instability based on failover frequency and retry queue growth.
   */
  public static async predictRelayInstability(
    tenantId: string
  ): Promise<PredictiveForecast> {
    const sevenDaysAgo = new Date(Date.now() - INTELLIGENCE_CONFIG.LOOKBACK.WEEKLY_MS);
    const events = await AnalyticsWarehouse.query(tenantId, sevenDaysAgo, new Date(), ['RELAY_FAILOVER', 'DELIVERY_FAILURE']);
    
    const failoverCount = events.filter(e => e.eventType === 'RELAY_FAILOVER').length;
    const predictedRisk = failoverCount > 5 ? 0.8 : failoverCount > 2 ? 0.4 : 0.1;

    const forecast: PredictiveForecast = {
      tenantId,
      predictionId: `PRD_RELAY_${Date.now()}`,
      sourceSystem: 'predictive-engine',
      schemaVersion: '1.0.0',
      timestamp: new Date(),
      forecastWindow: '7d',
      currentRisk: failoverCount / 10,
      predictedRisk,
      contributingSignals: [`${failoverCount} failovers in the last 7 days`],
      confidenceScore: 0.9,
      forecastDirection: failoverCount > 3 ? 'declining' : 'stable',
      operationalRecommendations: predictedRisk > 0.5 ? [{
        id: 'REC_RELAY_PROACTIVE',
        priority: 'high',
        title: 'Projected Provider Instability',
        description: 'Relay patterns suggest an upcoming provider outage. Recommend switching to own Twilio keys.',
        impactArea: 'delivery',
        rationale: 'Failover frequency reached critical threshold for proactive migration.'
      }] : [],
      category: 'delivery',
      explainability: {
        historicalPatterns: "Analyzed rolling 7-day window of delivery failover events.",
        anomaliesUsed: [],
        replayReferences: events
          .map(e => e.traceId)
          .filter((traceId): traceId is string => Boolean(traceId)),
        telemetryReferences: ['RELAY_FAILOVER', 'DELIVERY_FAILURE'],
        confidenceReasoning: "Strong correlation between failover clusters and provider degradation.",
        trendBasis: "Frequency analysis of provider-switching events."
      }
    };

    await this.auditPrediction(forecast);
    return forecast;
  }

  /**
   * Section 4: Attendance Decline Prediction.
   * WoW volatility analysis.
   */
  public static async forecastAttendance(
    tenantId: string,
    events: IntelligenceEvent[]
  ): Promise<number> {
    // Simplified WoW trend calculation
    const recent = events.slice(-10);
    const attendanceEvents = recent.filter(e => e.eventType === 'ATTENDANCE_UPDATE');
    if (attendanceEvents.length < 2) return 0;

    const values = attendanceEvents.map(e => (e.metadata as any).count || 0);
    const first = values[0] || 0;
    const last = values[values.length - 1] || 0;

    return last < first ? (first - last) / first : 0;
  }

  private static async auditPrediction(forecast: PredictiveForecast) {
    await IntelligencePipeline.handleEvent(forecast.tenantId, 'PREDICTION_GENERATED', {
      predictionId: forecast.predictionId,
      category: forecast.category,
      predictedRisk: forecast.predictedRisk,
      sourceSystem: forecast.sourceSystem,
      schemaVersion: forecast.schemaVersion, // Ensure schemaVersion is passed
      context: `Predictive window: ${forecast.forecastWindow}`
    });
  }
}
