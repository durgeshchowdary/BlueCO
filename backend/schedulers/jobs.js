import Academy from '../models/Academy.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import { runIdempotentJob } from '../services/automation/idempotencyService.js';
import { handleTrialReminders, suspendExpiredTrials, generateRenewalInvoices } from '../services/billingService.js';
import { calculatePayrollForAcademy, monthKey } from '../services/payrollService.js';
import { generateInsightsForAllAcademies } from '../services/aiInsightService.js';
import { createNotification, sendWhatsAppTemplate } from '../services/notificationService.js';
import logger from '../services/logger.js';
import process from 'node:process';
import {
  runConflictScan,
  runDeliveryRetryWorker,
  runFeeDedupeScan,
  runRelayHealthAlerts,
  runSelfHealingDiagnostics,
} from '../services/platformAutomationService.js';

const todayKey = () => new Date().toISOString().slice(0, 10);

const tracedJob = (jobName, handler) => () => logger.runWithContext({
  requestId: logger.newRequestId(),
  traceId: logger.newTraceId('job'),
  route: `scheduler:${jobName}`,
  method: 'CRON',
}, async () => {
  const startedAt = process.hrtime.bigint();
  logger.info('job.started', { category: 'background_task', jobName });
  try {
    const result = await handler();
    logger.info('job.completed', {
      category: 'background_task',
      jobName,
      latencyMs: Math.round(Number(process.hrtime.bigint() - startedAt) / 1e6),
      result,
    });
    return result;
  } catch (error) {
    logger.error('job.failed', {
      category: 'background_task',
      jobName,
      latencyMs: Math.round(Number(process.hrtime.bigint() - startedAt) / 1e6),
      error,
    });
    throw error;
  }
});

const trialReminderJob = tracedJob('trialReminderJob', () => runIdempotentJob({
  jobName: 'trialReminderJob',
  jobKey: `trial-reminders:${todayKey()}`,
  handler: async () => ({ reminders: await handleTrialReminders() }),
}));

const suspensionJob = tracedJob('suspensionJob', () => runIdempotentJob({
  jobName: 'suspensionJob',
  jobKey: `trial-suspensions:${todayKey()}`,
  handler: async () => ({ suspended: await suspendExpiredTrials() }),
}));

const invoiceGenerationJob = tracedJob('invoiceGenerationJob', () => runIdempotentJob({
  jobName: 'invoiceGenerationJob',
  jobKey: `subscription-invoices:${todayKey()}`,
  handler: async () => ({ invoices: (await generateRenewalInvoices()).length }),
}));

const payrollJob = tracedJob('payrollJob', async () => runIdempotentJob({
  jobName: 'payrollJob',
  jobKey: `payroll:${monthKey()}`,
  handler: async () => {
    const academies = await Academy.find({ status: { $in: ['active', 'trial'] } }).select('_id').lean();
    let records = 0;
    for (const academy of academies) {
      records += (await calculatePayrollForAcademy({ academyId: academy._id })).length;
    }
    return { records };
  },
}));

const aiInsightJob = tracedJob('AIInsightJob', () => runIdempotentJob({
  jobName: 'AIInsightJob',
  jobKey: `ai-insights:${todayKey()}`,
  handler: async () => ({ insights: (await generateInsightsForAllAcademies()).length }),
}));

const feeReminderJob = tracedJob('feeReminderJob', async () => runIdempotentJob({
  jobName: 'feeReminderJob',
  jobKey: `fee-reminders:${todayKey()}`,
  handler: async () => {
    const students = await Student.find({ feeStatus: 'Pending' }).limit(500).lean();
    for (const student of students) {
      await sendWhatsAppTemplate({
        academyId: student.academyId,
        to: student.phone,
        template: 'fee_reminder',
        message: `Outplay reminder: ${student.name}'s monthly fee is pending. Please contact the academy desk for payment support.`,
        dedupeKey: `fee-reminder:${student._id}:${todayKey()}`,
      });
    }
    return { reminders: students.length };
  },
}));

const attendanceAlertJob = tracedJob('attendanceAlertJob', async () => runIdempotentJob({
  jobName: 'attendanceAlertJob',
  jobKey: `attendance-alerts:${todayKey()}`,
  handler: async () => {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const absences = await Attendance.aggregate([
      { $match: { date: { $gte: since }, status: { $in: ['Absent', 'absent'] } } },
      { $group: { _id: { academyId: '$academyId', studentName: '$studentName' }, count: { $sum: 1 } } },
      { $match: { count: { $gte: 3 } } },
    ]);
    for (const item of absences) {
      await createNotification({
        academyId: item._id.academyId,
        category: 'attendance',
        title: 'Repeated absence detected',
        message: `${item._id.studentName} has ${item.count} absences in the last 7 days.`,
        actionUrl: '/academy/attendance',
        priority: 'high',
        dedupeKey: `attendance-risk:${item._id.academyId}:${item._id.studentName}:${todayKey()}`,
      });
    }
    return { alerts: absences.length };
  },
}));

const cleanupJob = tracedJob('cleanupJob', () => runIdempotentJob({
  jobName: 'cleanupJob',
  jobKey: `cleanup:${todayKey()}`,
  handler: async () => ({ retained: true }),
}));

const nightlyFeeDedupeJob = () => runFeeDedupeScan({ dryRun: true });
const scheduleConflictScanJob = () => runConflictScan();
const relayHealthAlertJob = () => runRelayHealthAlerts();
const deliveryRetryJob = () => runDeliveryRetryWorker();
const selfHealingDiagnosticsJob = () => runSelfHealingDiagnostics();

export {
  trialReminderJob,
  suspensionJob,
  invoiceGenerationJob,
  payrollJob,
  aiInsightJob,
  feeReminderJob,
  attendanceAlertJob,
  cleanupJob,
  deliveryRetryJob,
  nightlyFeeDedupeJob,
  relayHealthAlertJob,
  scheduleConflictScanJob,
  selfHealingDiagnosticsJob,
};
