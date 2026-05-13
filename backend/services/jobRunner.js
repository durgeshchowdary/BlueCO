import AutomationLog from '../models/AutomationLog.js';
import logger from './logger.js';
import process from 'node:process';

const backoffMs = (attempt, baseMs = 60 * 1000, maxMs = 30 * 60 * 1000) => // Use .js extension for local imports
  Math.min(maxMs, baseMs * (2 ** Math.max(attempt - 1, 0)));

const runJob = async ({
  academyId = null,
  jobName,
  jobKey,
  type = 'recurring',
  maxAttempts = 3,
  metadata = {},
  handler,
}) => logger.runWithContext({
  requestId: logger.newRequestId(),
  traceId: logger.newTraceId('job'),
  method: 'JOB',
  route: `job:${jobName}`,
  academyId: academyId ? String(academyId) : undefined,
}, async () => {
  const startedAt = process.hrtime.bigint();
  let log = await AutomationLog.findOne({ jobKey });

  if (log && ['running', 'completed', 'skipped'].includes(log.status)) {
    logger.info('job.skipped_idempotent', { category: 'background_task', jobName, jobKey, status: log.status });
    return { skipped: true, log };
  }

  log = log || await AutomationLog.create({
    academyId,
    jobName,
    jobKey,
    maxAttempts,
    metadata: { ...metadata, type },
  });

  if (log.attempts >= log.maxAttempts) {
    log.status = 'failed';
    log.errorMessage = log.errorMessage || 'Maximum retry attempts reached';
    log.finishedAt = new Date();
    await log.save();
    logger.warn('job.max_attempts_reached', { category: 'background_task', jobName, jobKey, attempts: log.attempts });
    return { skipped: true, log };
  }

  log.status = 'running';
  log.attempts += 1;
  log.startedAt = new Date();
  log.errorMessage = '';
  await log.save();

  logger.info('job.started', { category: 'background_task', jobName, jobKey, attempt: log.attempts, type });

  try {
    const result = await handler(log);
    log.status = result?.skipped ? 'skipped' : 'completed';
    log.finishedAt = new Date();
    log.nextRunAt = null;
    log.metadata = {
      ...log.metadata,
      result: result || {},
      latencyMs: Math.round(Number(process.hrtime.bigint() - startedAt) / 1e6),
    };
    await log.save();
    logger.info('job.completed', { category: 'background_task', jobName, jobKey, result });
    return { skipped: false, log, result };
  } catch (error) {
    const terminal = log.attempts >= log.maxAttempts;
    log.status = terminal ? 'failed' : 'queued';
    log.errorMessage = error.message || 'Automation job failed';
    log.nextRunAt = terminal ? null : new Date(Date.now() + backoffMs(log.attempts));
    log.finishedAt = new Date();
    await log.save();
    logger.error('job.failed', { category: 'background_task', jobName, jobKey, terminal, error });
    throw error;
  }
});

export { backoffMs, runJob };
