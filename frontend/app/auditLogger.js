// backend/middleware/auditLogger.js

const auditLogger = (eventType, userId, ip, role, details = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ip,
    userId,
    role,
    eventType,
    details,
  };
  // In a real production environment, this would write to a dedicated logging service (e.g., ELK stack, Splunk, CloudWatch Logs)
  // For this roadmap, we'll log to the console as per "DO NOT create external logging infrastructure"
  console.log(`AUDIT LOG: ${JSON.stringify(logEntry)}`);
};

module.exports = auditLogger;