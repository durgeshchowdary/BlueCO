import cron from 'node-cron';
import * as jobs from './jobs.js'; // Assuming jobs are in jobs.js
import logger from '../services/logger.js';
import process from 'node:process';

export const startSchedulers = () => {
  if (process.env.ENABLE_CRON !== 'true') {
    logger.info('scheduler.disabled', { category: 'background_task' });
    return [];
  }

  const tasks = [
    cron.schedule('15 9 * * *', jobs.trialReminderJob),
    cron.schedule('30 9 * * *', jobs.suspensionJob),
    cron.schedule('0 10 * * *', jobs.invoiceGenerationJob),
    cron.schedule('15 2 1 * *', jobs.payrollJob),
    cron.schedule('45 6 * * *', jobs.aiInsightJob),
    cron.schedule('0 11 * * *', jobs.feeReminderJob),
    cron.schedule('*/5 * * * *', jobs.deliveryRetryJob),
    cron.schedule('0 1 * * *', jobs.nightlyFeeDedupeJob),
    cron.schedule('20 1 * * *', jobs.scheduleConflictScanJob),
    cron.schedule('*/15 * * * *', jobs.relayHealthAlertJob),
    cron.schedule('45 1 * * *', jobs.selfHealingDiagnosticsJob),
    cron.schedule('30 19 * * *', jobs.attendanceAlertJob),
    cron.schedule('0 3 * * 0', jobs.cleanupJob),
  ];

  logger.info('scheduler.enabled', { category: 'background_task', jobs: tasks.length });
  return tasks;
};
