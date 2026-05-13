import { IntelligencePipeline } from './IntelligencePipeline.js';

export class IntelligenceAggregator {
  static async getTimeline(tenantId, limit = 50) {
    return IntelligencePipeline.getEvents()
      .filter((event) => event.tenantId === tenantId)
      .slice(-limit)
      .map((event) => ({
        id: `TL_${event.traceId}_${event.timestamp.getTime()}`,
        tenantId: event.tenantId,
        type: 'operational_event',
        severity: event.severity,
        timestamp: event.timestamp,
        message: `System recorded ${String(event.eventType).toLowerCase().replace(/_/g, ' ')}`,
        metadata: event.metadata,
        traceId: event.traceId,
        sourceSystem: event.sourceSystem,
        schemaVersion: event.schemaVersion,
      }));
  }
}
