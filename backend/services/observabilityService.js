import Academy from '../models/Academy.js';
import EmailLog from '../models/EmailLog.js';
import WhatsAppLog from '../models/WhatsAppLog.js';
import AuditLog from '../models/AuditLog.js';
import logger from './logger.js';
import process from 'node:process';

const MAX_RECENT_EVENTS = 200;
const requestWindow = [];
const recentEvents = [];
const counters = {
  authFailures: 0,
  rbacDenials: 0,
  uploadFailures: 0,
  storageFailures: 0,
  downloadFailures: 0,
  razorpayFailures: 0,
  relayFallbacks: 0,
  twilioFailures: 0,
  resendFailures: 0,
};

const pushRecentEvent = (event) => {
  recentEvents.unshift({
    timestamp: new Date().toISOString(),
    requestId: logger.context().requestId,
    traceId: logger.context().traceId,
    academyId: logger.context().academyId,
    ...event,
  });
  if (recentEvents.length > MAX_RECENT_EVENTS) recentEvents.pop();
};

/**
 * @typedef {object} CustomUser
 * @property {string} _id
 * @property {string} academyId
 */
const increment = (key, event = {}) => {
  counters[key] = (counters[key] || 0) + 1;
  pushRecentEvent({ category: key, ...event });
};

const recordRequest = ({ method, route, statusCode, latencyMs, academyId, userId }) => {
  requestWindow.push({
    timestamp: Date.now(),
    method,
    route,
    statusCode,
    latencyMs,
    academyId,
    userId,
  });

  const cutoff = Date.now() - 60 * 60 * 1000;
  while (requestWindow.length && requestWindow[0].timestamp < cutoff) requestWindow.shift();
};

const average = (values) => {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const extractTwilioCode = (message = '') => {
  const code = String(message).match(/\b(?:Twilio(?: WhatsApp)? failed with|code[:=]?)\s*(\d{3,6})\b/i)?.[1]
    || String(message).match(/\b(\d{5})\b/)?.[1];
  return code || 'unknown';
};

const getMessageHealth = async (since) => {
  const [whatsapp, email] = await Promise.all([
    WhatsAppLog.find({ createdAt: { $gte: since } }).select('status provider attempts errorMessage academyId metadata createdAt').lean(),
    EmailLog.find({ createdAt: { $gte: since } }).select('status provider attempts errorMessage academyId metadata createdAt').lean(),
  ]);

  const whatsappSent = whatsapp.filter((item) => item.status === 'sent').length;
  const whatsappFailed = whatsapp.filter((item) => item.status === 'failed').length;
  const emailSent = email.filter((item) => item.status === 'sent').length;
  const emailFailed = email.filter((item) => item.status === 'failed').length;
  const relayMessages = [...whatsapp, ...email].filter((item) => item.provider === 'mock' || item.metadata?.relayUsed).length;
  const totalMessages = whatsapp.length + email.length;
  const failureCodes = {};

  whatsapp
    .filter((item) => item.status === 'failed')
    .forEach((item) => {
      const code = extractTwilioCode(item.errorMessage);
      failureCodes[code] = (failureCodes[code] || 0) + 1;
    });

  const stuckTwilioCodes = Object.entries(failureCodes)
    .filter(([, count]) => count >= 3)
    .map(([code, count]) => ({ code, count, severity: 'high' }));

  return {
    whatsapp,
    email,
    metrics: {
      whatsappDeliveryRate: whatsapp.length ? Math.round((whatsappSent / whatsapp.length) * 100) : 100,
      emailDeliveryRate: email.length ? Math.round((emailSent / email.length) * 100) : 100,
      whatsappFailed,
      emailFailed,
      relayUsagePercent: totalMessages ? Math.round((relayMessages / totalMessages) * 100) : 0,
      messageQueueHealth: whatsappFailed + emailFailed > 10 ? 'degraded' : 'healthy',
      stuckTwilioCodes,
    },
  };
};

const getOperationalDashboard = async () => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const requests = [...requestWindow];
  const failedRequests = requests.filter((item) => item.statusCode >= 400);
  const messageHealth = await getMessageHealth(since);

  const [academies, recentAudits] = await Promise.all([
    Academy.find().select('compliance dltDocuments subscription').lean(),
    AuditLog.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(25).lean(),
  ]);

  const completeDlt = academies.filter((academy) => {
    const docs = academy.compliance?.dltDocuments || {};
    return docs.registration?.storageKey && !docs.registration?.deletedAt && docs.authorization?.storageKey && !docs.authorization?.deletedAt;
  }).length;

  const academyKeyAdoption = messageHealth.whatsapp
    .filter((item) => item.metadata?.academyOwnKeyUsed || item.metadata?.deliveryMode === 'academy')
    .length;

  const totalMessages = messageHealth.whatsapp.length + messageHealth.email.length;
  const incidents = [
    ...messageHealth.metrics.stuckTwilioCodes.map((item) => ({
      type: 'stuck_twilio_code',
      severity: 'high',
      title: `Twilio error ${item.code} is recurring`,
      description: `${item.count} WhatsApp failures share the same provider code in the last 24 hours.`,
    })),
    ...(counters.storageFailures ? [{
      type: 'storage',
      severity: 'medium',
      title: 'Storage failures detected',
      description: `${counters.storageFailures} storage failure events recorded since process start.`,
    }] : []),
    ...(failedRequests.length > 10 ? [{
      type: 'api_errors',
      severity: 'medium',
      title: 'Elevated API errors',
      description: `${failedRequests.length} failed requests observed in the rolling process window.`,
    }] : []),
  ];

  return {
    generatedAt: new Date().toISOString(),
    requests: {
      total: requests.length,
      failed: failedRequests.length,
      averageLatencyMs: average(requests.map((item) => item.latencyMs)),
      p95LatencyMs: requests.length
        ? [...requests.map((item) => item.latencyMs)].sort((a, b) => a - b)[Math.floor(requests.length * 0.95)] || 0
        : 0,
      slowestRoutes: [...requests]
        .sort((a, b) => b.latencyMs - a.latencyMs)
        .slice(0, 8)
        .map(({ method, route, statusCode, latencyMs }) => ({ method, route, statusCode, latencyMs })),
    },
    counters: { ...counters },
    delivery: messageHealth.metrics,
    relayHealth: {
      relayUsagePercent: messageHealth.metrics.relayUsagePercent,
      academyKeyAdoptionPercent: totalMessages ? Math.round((academyKeyAdoption / totalMessages) * 100) : 0,
      failoverFrequency: counters.relayFallbacks,
      academyThenRelayFrequency: messageHealth.whatsapp.filter((item) => item.metadata?.deliveryMode === 'academy_then_relay').length,
      messagingReliabilityPercent: totalMessages
        ? Math.round(((totalMessages - messageHealth.metrics.whatsappFailed - messageHealth.metrics.emailFailed) / totalMessages) * 100)
        : 100,
    },
    storage: {
      failures: counters.storageFailures,
      uploadFailures: counters.uploadFailures,
      failedDownloads: counters.downloadFailures,
    },
    compliance: {
      dltCompletionPercent: academies.length ? Math.round((completeDlt / academies.length) * 100) : 0,
      completeAcademies: completeDlt,
      totalAcademies: academies.length,
    },
    incidents,
    recentFailures: recentEvents.slice(0, 25),
    recentAuditTrail: recentAudits,
  };
};

export {
  extractTwilioCode,
  increment,
  recordRequest,
  getOperationalDashboard,
};

export default {
  extractTwilioCode,
  increment,
  recordRequest,
  getOperationalDashboard,
};
