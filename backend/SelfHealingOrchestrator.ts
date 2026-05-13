import { 
  RecoveryAction, 
  ResilienceStatus, 
  IntelligenceEvent, 
  INTELLIGENCE_CONFIG 
} from './intelligence';
import { IntelligencePipeline } from './IntelligencePipeline';

export class SelfHealingOrchestrator {
  private static recoveryCooldowns: Map<string, number> = new Map();
  private static RECOVERY_COOLDOWN_MS = 1000 * 60 * 60; // 1 hour safety window
  private static degradedModeRegistry: Set<string> = new Set();

  /**
   * SECTION 1: Self-Healing Orchestration.
   * Evaluates operational events to trigger deterministic recovery.
   */
  public static async evaluateOperationalIntegrity(
    tenantId: string,
    event: IntelligenceEvent
  ): Promise<void> {
    // Section 9: Resilience Governance - Prevent Replay Loops
    if (event.operationalContext?.includes('replay')) return;

    // Section 2: Recovery Logic for Relay Degradation
    if (event.eventType === 'RELAY_THRESHOLD_ALERT' && event.severity === 'critical') {
      await this.triggerRecoveryPipeline(tenantId, 'RELAY_FAILOVER', event.traceId ? [event.traceId] : []);
    }

    // Section 2: Recovery Logic for Retry Saturation
    if (event.eventType === 'RETRY_SPIKE' && (event.metadata.count as number) > 50) {
      await this.triggerRecoveryPipeline(tenantId, 'RETRY_REBALANCE', event.traceId ? [event.traceId] : []);
    }
  }

  private static async triggerRecoveryPipeline(
    tenantId: string,
    type: RecoveryAction['type'],
    incidents: string[]
  ): Promise<void> {
    const cooldownKey = `${tenantId}:${type}`;
    if (this.isInCooldown(cooldownKey)) return;

    const recoveryId = `REC_${type}_${Date.now()}`;
    const traceId = `TRACE_${recoveryId}`;

    // Section 3: Recovery Explainability
    const action: RecoveryAction = {
      tenantId,
      recoveryId,
      timestamp: new Date(),
      sourceSystem: 'self-healing-orchestrator',
      schemaVersion: '1.0.0',
      type,
      status: 'active',
      incidentReferences: incidents,
      explainability: {
        triggeringIncidents: incidents,
        anomaliesUsed: [],
        telemetryUsed: [type],
        replayReferences: [],
        warehouseReferences: [],
        recoveryRationale: `Automatic recovery triggered due to ${type} threshold breach.`,
        degradationImpact: 'Partial operational latency',
        expectedRecoveryOutcome: 'System stabilization and telemetry alignment',
        operationalRisk: 'medium'
      }
    };

    // Section 11: Audit Persistence
    await IntelligencePipeline.handleEvent(tenantId, 'RECOVERY_STARTED', {
      recoveryId,
      recoveryType: type,
      traceId,
      sourceSystem: action.sourceSystem
    });

    // Deterministic Execution (Example logic)
    try {
      if (type === 'RELAY_FAILOVER') {
        // Logic for provider failover orchestration
      }
      this.setCooldown(cooldownKey);
    } catch (error) {
      await IntelligencePipeline.handleEvent(tenantId, 'RECOVERY_FAILED', { recoveryId, error });
    }
  }

  /**
   * SECTION 4: Degraded Mode System.
   */
  public static toggleDegradedMode(tenantId: string, active: boolean): void {
    if (active) {
      this.degradedModeRegistry.add(tenantId);
      IntelligencePipeline.handleEvent(tenantId, 'DEGRADED_MODE_ACTIVATED', { timestamp: new Date() });
    } else {
      this.degradedModeRegistry.delete(tenantId);
      IntelligencePipeline.handleEvent(tenantId, 'DEGRADED_MODE_DEACTIVATED', { timestamp: new Date() });
    }
  }

  public static isTenantDegraded(tenantId: string): boolean {
    return this.degradedModeRegistry.has(tenantId);
  }

  private static isInCooldown(key: string): boolean {
    const last = this.recoveryCooldowns.get(key);
    return !!last && (Date.now() - last < this.RECOVERY_COOLDOWN_MS);
  }

  private static setCooldown(key: string): void {
    this.recoveryCooldowns.set(key, Date.now());
  }
}
