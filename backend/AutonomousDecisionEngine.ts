import { 
  PredictiveForecast, 
  IntelligenceReport, 
  AutonomousAction, 
  INTELLIGENCE_CONFIG,
  IntelligenceEventType
} from './intelligence';
import { IntelligencePipeline } from './IntelligencePipeline';
import { OperationalPlaybookService } from './OperationalPlaybookService';

export class AutonomousDecisionEngine {
  private static cooldownMap: Map<string, number> = new Map();
  private static COOLDOWN_PERIOD_MS = 1000 * 60 * 60 * 4; // 4 hour cooldown per intervention type

  /**
   * Section 1: Autonomous Decision Logic.
   * Evaluates forecasts and reports to trigger proactive actions.
   */
  public static async evaluate(
    tenantId: string,
    forecasts: PredictiveForecast[],
    currentReport: IntelligenceReport
  ): Promise<AutonomousAction[]> {
    const actions: AutonomousAction[] = [];

    for (const forecast of forecasts) {
      // Check Cooldown Governance (Section 7)
      const cooldownKey = `${tenantId}:${forecast.category}`;
      if (this.isInCooldown(cooldownKey)) continue;

      // Section 2: Autonomous Intervention Logic
      if (forecast.category === 'operations' && forecast.predictedRisk > INTELLIGENCE_CONFIG.THRESHOLDS.CHURN_CRITICAL) {
        actions.push(this.generateAction(tenantId, forecast, currentReport, 'ESCALATE_ALERT', 'critical'));
        this.setCooldown(cooldownKey);
      }

      if (forecast.category === 'delivery' && forecast.predictedRisk > 0.6) {
        actions.push(this.generateAction(tenantId, forecast, currentReport, 'NOTIFY_OWNER', 'high'));
        this.setCooldown(cooldownKey);
      }

      if (forecast.category === 'engagement' && forecast.forecastDirection === 'declining') {
        actions.push(this.generateAction(tenantId, forecast, currentReport, 'TRIGGER_COACH_REMINDER', 'medium'));
        this.setCooldown(cooldownKey);
      }
    }

    // Section 11: Autonomous Audit System
    for (const action of actions) {
      await this.auditAction(action);
    }

    return actions;
  }

  private static generateAction(
    tenantId: string,
    forecast: PredictiveForecast,
    report: IntelligenceReport,
    type: AutonomousAction['actionType'],
    priority: AutonomousAction['priority']
  ): AutonomousAction {
    const interventionId = `INT_${type}_${Date.now()}`;
    const playbook = OperationalPlaybookService.getPlaybookForCategory(forecast.category);

    return {
      tenantId,
      interventionId,
      sourceSystem: 'autonomous-decision-engine',
      schemaVersion: '1.0.0',
      timestamp: new Date(),
      actionType: type,
      priority,
      status: 'pending_approval', // Section 7: Approval-gated by default
      forecastReferences: [forecast.predictionId],
      playbookReference: playbook.id,
      explainability: {
        triggeringForecasts: [forecast.predictionId],
        anomaliesUsed: report.anomalies.map(a => a.id),
        telemetryUsed: forecast.contributingSignals,
        replayReferences: forecast.explainability.replayReferences ?? [],
        warehouseReferences: [`WH_TREND_${tenantId}_${forecast.category}`],
        confidenceReasoning: `Action triggered by ${forecast.category} risk exceeding threshold (${forecast.predictedRisk}).`,
        interventionRationale: `Proactive mitigation based on ${forecast.forecastDirection} trend direction.`,
        operationalImpact: `Reduces ${forecast.category} degradation risk by providing immediate recovery guidance.`
      }
    };
  }

  private static isInCooldown(key: string): boolean {
    const lastExecution = this.cooldownMap.get(key);
    return !!lastExecution && (Date.now() - lastExecution < this.COOLDOWN_PERIOD_MS);
  }

  private static setCooldown(key: string) {
    this.cooldownMap.set(key, Date.now());
  }

  private static async auditAction(action: AutonomousAction) {
    await IntelligencePipeline.handleEvent(action.tenantId, 'AUTONOMOUS_ACTION_GENERATED', {
      interventionId: action.interventionId,
      actionType: action.actionType,
      priority: action.priority,
      forecastReferences: action.forecastReferences,
      sourceSystem: action.sourceSystem,
      schemaVersion: action.schemaVersion,
      traceId: action.traceId || `AUTON_${Date.now()}`
    });
  }
}
