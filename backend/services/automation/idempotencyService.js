import AutomationLog from '../../models/AutomationLog.js';

const runIdempotentJob = async ({
  academyId = null,
  jobName,
  jobKey,
  maxAttempts = 3,
  metadata = {},
  handler,
}) => {
  const existing = await AutomationLog.findOne({ jobKey });
  if (existing && ['running', 'completed', 'skipped'].includes(existing.status)) {
    return { skipped: true, log: existing };
  }

  const log = existing || await AutomationLog.create({
    academyId,
    jobName,
    jobKey,
    maxAttempts,
    metadata,
  });

  if (log.attempts >= log.maxAttempts) {
    log.status = 'failed';
    log.errorMessage = log.errorMessage || 'Maximum retry attempts reached';
    await log.save();
    return { skipped: true, log };
  }

  log.status = 'running';
  log.attempts += 1;
  log.startedAt = new Date();
  log.errorMessage = '';
  await log.save();

  try {
    const result = await handler(log);
    log.status = result?.skipped ? 'skipped' : 'completed';
    log.finishedAt = new Date();
    log.metadata = { ...log.metadata, result: result || {} };
    await log.save();
    return { skipped: false, log, result };
  } catch (error) {
    log.status = log.attempts >= log.maxAttempts ? 'failed' : 'queued';
    log.errorMessage = error.message || 'Automation job failed';
    log.nextRunAt = new Date(Date.now() + Math.min(log.attempts * 5, 30) * 60 * 1000);
    await log.save();
    throw error;
  }
};

export { runIdempotentJob };
