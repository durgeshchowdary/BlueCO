const events = [];

export class IntelligencePipeline {
  static async handleEvent(tenantId, eventType, metadata = {}) {
    events.push({
      tenantId,
      eventType,
      metadata,
      severity: metadata.severity || 'info',
      timestamp: new Date(),
      sourceSystem: metadata.sourceSystem || 'intelligence-pipeline',
      schemaVersion: metadata.schemaVersion || '1.0.0',
      traceId: metadata.traceId || `TLM_${Date.now()}`,
    });

    if (events.length > 10000) events.shift();
  }

  static getEvents() {
    return [...events];
  }
}
