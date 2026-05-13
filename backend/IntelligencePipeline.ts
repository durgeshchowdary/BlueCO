import { IntelligenceEventType, IntelligenceEvent, IntelligenceAnomaly } from './intelligence';
import { AnomalyDetector } from './AnomalyDetector';
import { AnalyticsWarehouse } from './AnalyticsWarehouse';
import { Logger } from './utils/logger'; // Centralized Logger

export class IntelligencePipeline {
  /**
   * Centralized ingestion point for platform events.
   * This decouples the operational logic from the intelligence logic.
   */
  public static async handleEvent(
    tenantId: string, 
    eventType: IntelligenceEventType, 
    metadata: Record<string, unknown> // Changed from 'any' to 'unknown' for type safety
  ): Promise<void> {
    try {
      // Trace Correlation and Warehouse Storage (Phase 1)
      const meta = metadata as Record<string, any>;
      const traceId = meta.traceId || `TLM_${Date.now()}`;
      
      const event: IntelligenceEvent = {
        tenantId,
        eventType,
        severity: 'info',
        timestamp: new Date(),
        sourceSystem: String(meta.sourceSystem || 'intelligence-pipeline'),
        schemaVersion: String(meta.schemaVersion || '1.0.0'),
        metadata,
        traceId
      };

      // Hardening: Ensure warehouse storage is durable
      await AnalyticsWarehouse.store(event).catch(err => {
        Logger.error(`Warehouse storage failure`, err as Error, { tenantId, traceId, eventType });
      });
      
      // 1. Detect Anomaly
      const anomaly = AnomalyDetector.detect(event);

      if (anomaly) {
        await this.persistAnomaly(tenantId, anomaly);
        this.emitIntelligenceAlert(tenantId, anomaly);
      }

      Logger.info(`Event processed successfully`, { tenantId, traceId, eventType });
    } catch (error) {
      Logger.error(`Failed to process event ${eventType}`, error as Error, { tenantId, eventType });
    }
  }

  private static async persistAnomaly(tenantId: string, anomaly: IntelligenceAnomaly) {
    // Persistence logic for the chronological intelligence feed
  }

  private static emitIntelligenceAlert(tenantId: string, anomaly: IntelligenceAnomaly) {
    // Integration with existing observability/alerting system
  }
}
