import { IntelligenceAnomaly, IntelligenceCategory, IntelligenceEventType, IntelligenceEvent } from './intelligence';

export class AnomalyDetector {
  /**
   * Detects operational instability based on incoming event spikes.
   */
  public static detect(event: IntelligenceEvent): IntelligenceAnomaly | null {
    const { eventType, metadata, tenantId } = event;
    // Cast metadata to access numeric markers safely
    const markers = metadata as unknown as Record<string, number | undefined>;
    const count = markers.count || 0;
    const threshold = markers.threshold || 0;

    if (count > threshold || this.isInherentlyAnomalous(eventType)) {
      return {
        id: `ANOM_${Date.now()}_${tenantId}`,
        severity: this.mapSeverity(eventType, count, threshold),
        category: this.mapCategory(eventType),
        message: `Unusual spike in ${eventType.toLowerCase().replace(/_/g, ' ')} detected.`,
        evidence: { current: count, threshold, ...metadata },
        detectedAt: new Date(),
        isResolved: false
      };
    }
    return null;
  }

  private static isInherentlyAnomalous(type: IntelligenceEventType): boolean {
    const inherentAnomalies: IntelligenceEventType[] = [
      'REPEATED_DELIVERY_FAILURE',
      'CHURN_RISK_SIGNAL',
      'DLT_REJECTION',
      'DEAD_LETTER_GROWTH',
      'AUTOMATION_FAILURE'
    ];
    return inherentAnomalies.includes(type);
  }

  private static mapCategory(type: IntelligenceEventType): IntelligenceCategory {
    // Delivery
    if (['DELIVERY_FAILURE', 'RELAY_FAILOVER', 'REPEATED_DELIVERY_FAILURE', 'PROVIDER_INSTABILITY', 'DELIVERY_RECOVERY'].includes(type)) return 'delivery';
    // Finance
    if (['INVOICE_PAID', 'INVOICE_OVERDUE', 'REPEATED_PAYMENT_FAILURE', 'BILLING_RECOVERY', 'CHURN_RISK_SIGNAL'].includes(type)) return 'finance';
    // Engagement
    if (['ATTENDANCE_UPDATE', 'ATTENDANCE_DROP', 'ATTENDANCE_SPIKE', 'REPEATED_ABSENCE', 'BATCH_ATTENDANCE_DECLINE', 'ENGAGEMENT_DECLINE'].includes(type)) return 'engagement';
    // Compliance
    if (['COMPLIANCE_UPLOAD', 'COMPLIANCE_COMPLETED', 'COMPLIANCE_MISSING', 'REPEATED_UPLOAD_FAILURE', 'DLT_REJECTION'].includes(type)) return 'compliance';
    // Platform / Operations
    if (['AUTOMATION_ERROR', 'AUTOMATION_FAILURE', 'RETRY_SPIKE', 'DEAD_LETTER_GROWTH', 'REPAIR_SUCCESS'].includes(type)) return 'platform';
    return 'operations';
  }

  private static mapSeverity(
    type: IntelligenceEventType, 
    val: number, 
    limit: number
  ): 'critical' | 'warning' | 'info' {
    const ratio = val / limit;
    const criticalTypes: IntelligenceEventType[] = [
      'CHURN_RISK_SIGNAL',
      'DLT_REJECTION',
      'REPEATED_DELIVERY_FAILURE'
    ];
    if (ratio > 2 || type === 'DELIVERY_FAILURE' || criticalTypes.includes(type)) return 'critical';
    if (ratio > 1.5 || type === 'INVOICE_OVERDUE') return 'warning';
    return 'info';
  }
}