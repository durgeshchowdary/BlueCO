import AuditLog from '../models/AuditLog.js';
import AutomationLog from '../models/AutomationLog.js';
import Batch from '../models/Batch.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Academy from '../models/Academy.js';
import EmailLog from '../models/EmailLog.js';
import WhatsAppLog from '../models/WhatsAppLog.js';
import { createNotification } from './notificationService.js';
import { detectBatchConflicts } from './scheduleConflictService.js';
import { getOperationalDashboard } from './observabilityService.js';
import { getRetryDiagnostics, processDueRetries } from './deliveryReliabilityService.js';
import { runJob } from './jobRunner.js';
import logger from './logger.js';
import process from 'node:process';

const todayKey = () => new Date().toISOString().slice(0, 10);

const auditAutomation = (action, metadata = {}) => AuditLog.create({
  actorRole: 'system',
  action,
  targetType: 'Automation',
  metadata,
}).catch(() => {});

const getDuplicateInvoiceGroups = async () => Invoice.aggregate([
  {
    $group: {
      _id: {
        academyId: '$academyId',
        type: '$type',
        total: '$total',
        dueAt: '$dueAt',
        billingEmail: '$billingEmail',
      },
      count: { $sum: 1 },
      invoiceIds: { $push: '$_id' },
      invoiceNumbers: { $push: '$invoiceNumber' },
      statuses: { $push: '$status' },
    },
  },
  { $match: { count: { $gt: 1 } } },
  { $sort: { count: -1 } },
]);

const runFeeDedupeScan = async ({ dryRun = true } = {}) => runJob({
  jobName: 'nightlyFeeDedupeScan',
  jobKey: `fee-dedupe:${todayKey()}:${dryRun ? 'dry-run' : 'repair'}`,
  type: 'repair',
  metadata: { dryRun },
  handler: async () => {
    const duplicates = await getDuplicateInvoiceGroups();
    const indexNames = Object.fromEntries((await Invoice.collection.indexes()).map((index) => [index.name, index.key]));
    const recommendations = duplicates.map((group) => ({
      severity: group.statuses.includes('paid') ? 'high' : 'medium',
      invoiceIds: group.invoiceIds,
      invoiceNumbers: group.invoiceNumbers,
      recommendation: group.statuses.includes('paid')
        ? 'Manual finance review required before voiding paid duplicate invoices.'
        : 'Void or merge duplicate draft/sent invoices after academy confirmation.',
    }));

    await auditAutomation('automation_fee_dedupe_scan', {
      dryRun,
      duplicateGroups: duplicates.length,
      uniqueIndexes: indexNames,
    });

    logger.info('automation.fee_dedupe_scan_completed', {
      category: 'automation',
      dryRun,
      duplicateGroups: duplicates.length,
    });

    return {
      duplicateGroups: duplicates.length,
      recommendations,
      indexChecks: {
        invoiceNumberUnique: Boolean(indexNames.invoiceNumber_1),
      },
      dryRun,
    };
  },
});

const runConflictScan = async () => runJob({
  jobName: 'scheduleConflictScan',
  jobKey: `schedule-conflicts:${todayKey()}`,
  type: 'recurring',
  handler: async () => {
    const batches = await Batch.find().lean();
    const warnings = [];
    for (const batch of batches) {
      warnings.push(...await detectBatchConflicts({
        academyId: batch.academyId,
        batch,
        excludeBatchId: batch._id,
      }));
    }
    await auditAutomation('automation_schedule_conflict_scan', { warnings: warnings.length });
    return { warnings: warnings.length, critical: warnings.filter((item) => item.severity === 'critical').length };
  },
});

/**
 * @typedef {object} OperationalDashboard
 * @property {object} relayHealth
 * @property {number} relayHealth.relayUsagePercent
 * @property {number} relayHealth.failoverFrequency
 * @property {object} delivery
 * @property {Array<object>} delivery.stuckTwilioCodes
 * @property {object} counters
 * @property {number} counters.resendFailures
 */

const runRelayHealthAlerts = async () => runJob({
  jobName: 'relayHealthAlerts',
  jobKey: `relay-health:${todayKey()}`,
  type: 'notification',
  handler: async () => {
    const dashboard = /** @type {OperationalDashboard} */ (await getOperationalDashboard());
    const alerts = [];

    if (dashboard.relayHealth.relayUsagePercent >= 70) {
      alerts.push(['relay_dependency_high', 'High relay dependency', `Relay dependency is ${dashboard.relayHealth.relayUsagePercent}%.`]);
    }
    if (dashboard.relayHealth.failoverFrequency >= 5) {
      alerts.push(['failover_spike', 'Relay failover spike', `${dashboard.relayHealth.failoverFrequency} failovers recorded since process start.`]);
    }
    for (const stuck of dashboard.delivery.stuckTwilioCodes) {
      alerts.push([`twilio_${stuck.code}`, 'Repeated Twilio failure', `Twilio code ${stuck.code} repeated ${stuck.count} times.`]);
    }
    if (dashboard.counters.resendFailures >= 3) {
      alerts.push(['resend_repeated_failures', 'Repeated email provider failures', `${dashboard.counters.resendFailures} email provider failures recorded.`]);
    }

    for (const [key, title, message] of alerts) {
      await createNotification({
        category: 'system',
        title,
        message,
        priority: 'critical',
        dedupeKey: `ops-alert:${key}:${todayKey()}`,
        metadata: { source: 'relayHealthAlerts' },
      });
    }

    await auditAutomation('automation_relay_health_alerts', { alerts: alerts.length });
    return { alerts: alerts.length };
  },
});

const runDeliveryRetryWorker = async () => runJob({
  jobName: 'deliveryRetryWorker',
  jobKey: `delivery-retry:${Math.floor(Date.now() / (5 * 60 * 1000))}`,
  type: 'retry',
  handler: async () => {
    const result = await processDueRetries({ limit: 50 });
    await auditAutomation('automation_delivery_retry_worker', result);
    return result;
  },
});

const runSelfHealingDiagnostics = async () => runJob({
  jobName: 'selfHealingDiagnostics',
  jobKey: `self-healing:${todayKey()}`,
  type: 'repair',
  handler: async () => {
    const [invoiceIndexes, paymentIndexes, academies] = await Promise.all([
      Invoice.collection.indexes(),
      Payment.collection.indexes(),
      Academy.find().select('name compliance subscription').lean(),
    ]);

    const invalidIntegrations = academies.filter((academy) => academy.subscription?.status === 'active'
      && !academy.compliance?.dltDocuments?.registration?.storageKey).map((academy) => ({
      academyId: academy._id,
      name: academy.name,
      issue: 'active_academy_missing_dlt_registration',
    }));

    const diagnostics = {
      invoiceNumberUniqueIndex: invoiceIndexes.some((index) => index.name === 'invoiceNumber_1' && index.unique),
      paymentOrderIndex: paymentIndexes.some((index) => index.name === 'razorpayOrderId_1'),
      invalidIntegrations,
    };

    await auditAutomation('automation_self_healing_diagnostics', diagnostics);
    return diagnostics;
  },
});

const groupIncidents = async () => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [emails, whatsapp, jobs] = await Promise.all([
    EmailLog.find({ status: 'failed', createdAt: { $gte: since } }).lean(),
    WhatsAppLog.find({ status: 'failed', createdAt: { $gte: since } }).lean(),
    AutomationLog.find({ status: 'failed', createdAt: { $gte: since } }).lean(),
  ]);

  const groups = new Map();
  const add = (key, title, item) => {
    const current = groups.get(key) || { key, title, count: 0, examples: [] };
    current.count += 1;
    if (current.examples.length < 3) current.examples.push(item);
    groups.set(key, current);
  };

  emails.forEach((item) => add(`email:${item.errorMessage || 'unknown'}`, 'Email delivery failures', item._id));
  whatsapp.forEach((item) => add(`whatsapp:${item.metadata?.errorCode || item.errorMessage || 'unknown'}`, 'WhatsApp delivery failures', item._id));
  jobs.forEach((item) => add(`job:${item.jobName}`, 'Automation job failures', item._id));

  return [...groups.values()].map((group) => ({
    ...group,
    severity: group.count >= 10 ? 'critical' : group.count >= 3 ? 'high' : 'medium',
    diagnostics: `${group.count} related failures in the last 24 hours.`,
  })).sort((a, b) => b.count - a.count);
};

const getPlatformIntelligence = async () => {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [academies, payments, whatsapp, email] = await Promise.all([
    Academy.find().lean(),
    Payment.find({ createdAt: { $gte: since30 } }).lean(),
    WhatsAppLog.find({ createdAt: { $gte: since30 } }).lean(),
    EmailLog.find({ createdAt: { $gte: since30 } }).lean(),
  ]);

  return academies.map((academy) => {
    const academyId = String(academy._id);
    const academyPayments = payments.filter((payment) => String(payment.academyId) === academyId);
    const failedPayments = academyPayments.filter((payment) => payment.status === 'failed').length;
    const messages = [...whatsapp, ...email].filter((item) => String(item.academyId || '') === academyId);
    const failedMessages = messages.filter((item) => item.status === 'failed').length;
    const relayMessages = messages.filter((item) => item.provider === 'mock' || item.metadata?.relayUsed).length;
    const docs = academy.compliance?.dltDocuments || {};
    const complianceComplete = docs.registration?.storageKey && docs.authorization?.storageKey;
    const deliveryRisk = messages.length ? Math.round((failedMessages / messages.length) * 100) : 0;
    const relayDependency = messages.length ? Math.round((relayMessages / messages.length) * 100) : 0;
    const churnRisk = Math.min(100, failedPayments * 20 + deliveryRisk + (complianceComplete ? 0 : 20));

    return {
      academyId,
      name: academy.name,
      churnRisk,
      deliveryRisk,
      relayDependency,
      failedPayments,
      lowEngagement: messages.length < 3 && academyPayments.length < 2,
      complianceComplete: Boolean(complianceComplete),
      insight: churnRisk >= 60
        ? 'High operational risk: billing failures, compliance gaps, or delivery failures need intervention.'
        : relayDependency >= 70
          ? 'Relay dependency is high. Encourage academy-owned provider keys.'
          : 'Operational posture is stable.',
    };
  }).sort((a, b) => b.churnRisk - a.churnRisk);
};

const getPlatformHealth = async () => {
  const [jobs, retryDiagnostics, dashboard, incidents, intelligence] = await Promise.all([
    AutomationLog.find().sort({ updatedAt: -1 }).limit(40).lean(),
    getRetryDiagnostics(),
    getOperationalDashboard(),
    groupIncidents(),
    getPlatformIntelligence(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    scheduler: {
      recentJobs: jobs,
      failedJobs: jobs.filter((job) => job.status === 'failed').length,
      runningJobs: jobs.filter((job) => job.status === 'running').length,
      lastRunAt: jobs[0]?.updatedAt || null,
    },
    retryQueue: retryDiagnostics,
    storage: dashboard.storage,
    providers: dashboard.delivery,
    incidents,
    relay: dashboard.relayHealth,
    compliance: dashboard.compliance,
    intelligence: intelligence.slice(0, 10),
  };
};

export {
  auditAutomation,
  getDuplicateInvoiceGroups,
  getPlatformHealth,
  getPlatformIntelligence,
  groupIncidents,
  runConflictScan,
  runDeliveryRetryWorker,
  runFeeDedupeScan,
  runRelayHealthAlerts,
  runSelfHealingDiagnostics,
};
