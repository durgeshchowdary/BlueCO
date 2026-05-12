import auditLogger from '../middleware/auditLogger.js';

export const logBillingEvent = (academyId, eventType, details = {}) => {
  // Utilizing existing auditLogger structure for billing consistency
  const logEntry = {
    academyId,
    eventType: `BILLING_${eventType.toUpperCase()}`,
    timestamp: new Date().toISOString(),
    ...details
  };

  console.log(`[BILLING AUDIT]: ${JSON.stringify(logEntry)}`);
  
  // In production, this would persist to a BillingAudit collection
  return logEntry;
};