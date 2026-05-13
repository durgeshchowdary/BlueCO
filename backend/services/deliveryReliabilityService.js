import DeliveryRetry from '../models/DeliveryRetry.js';
import EmailLog from '../models/EmailLog.js';
import WhatsAppLog from '../models/WhatsAppLog.js';
import logger from './logger.js';
import { sendMail } from './providers/emailProvider.js';
import { sendWhatsApp } from './providers/whatsappProvider.js';

const backoffMs = (attempt) => Math.min(60 * 60 * 1000, (2 ** Math.max(attempt - 1, 0)) * 60 * 1000);

const providerCodeFrom = (errorMessage = '') => String(errorMessage).match(/\b(\d{3,6})\b/)?.[1] || 'unknown';

const enqueueFailedDelivery = async ({ channel, log }) => {
  if (!log || !['email', 'whatsapp'].includes(channel)) return null;
  const dedupeKey = `delivery-retry:${channel}:${log._id}`;
  const payload = channel === 'email'
    ? { to: log.to, subject: log.subject, html: log.metadata?.html || '', template: log.template }
    : { to: log.to, message: log.message, template: log.template };

  return DeliveryRetry.findOneAndUpdate(
    { dedupeKey },
    {
      $setOnInsert: {
        academyId: log.academyId || null,
        channel,
        logId: log._id,
        dedupeKey,
        payload,
        providerCode: log.metadata?.errorCode || providerCodeFrom(log.errorMessage),
        lastError: log.errorMessage || '',
      },
    },
    { upsert: true, new: true },
  );
};

const processRetry = async (retry) => {
  if (!retry || retry.status === 'dead_letter') return { skipped: true };
  retry.status = 'running';
  retry.attempts += 1;
  await retry.save();

  try {
    if (retry.channel === 'email') {
      await sendMail({
        to: retry.payload.to,
        subject: retry.payload.subject || 'OUT-PLAY notification',
        html: retry.payload.html || 'OUT-PLAY notification retry',
      });
      await EmailLog.findByIdAndUpdate(retry.logId, { $set: { status: 'sent', sentAt: new Date(), errorMessage: '' }, $inc: { attempts: 1 } });
    } else {
      await sendWhatsApp({
        to: retry.payload.to,
        message: retry.payload.message,
        template: retry.payload.template,
      });
      await WhatsAppLog.findByIdAndUpdate(retry.logId, { $set: { status: 'sent', sentAt: new Date(), errorMessage: '' }, $inc: { attempts: 1 } });
    }

    retry.status = 'completed';
    retry.lastError = '';
    retry.nextRunAt = null;
    await retry.save();
    logger.info('delivery_retry.completed', { category: 'delivery_retry', retryId: String(retry._id), channel: retry.channel });
    return { completed: true };
  } catch (error) {
    retry.lastError = error.message;
    retry.providerCode = error.code || providerCodeFrom(error.message);
    retry.status = retry.attempts >= retry.maxAttempts ? 'dead_letter' : 'queued';
    retry.nextRunAt = retry.status === 'dead_letter' ? null : new Date(Date.now() + backoffMs(retry.attempts));
    await retry.save();
    logger.error('delivery_retry.failed', {
      category: 'delivery_retry',
      retryId: String(retry._id),
      channel: retry.channel,
      status: retry.status,
      providerCode: retry.providerCode,
      error,
    });
    return { failed: true, deadLetter: retry.status === 'dead_letter' };
  }
};

const processDueRetries = async ({ limit = 50 } = {}) => {
  const due = await DeliveryRetry.find({
    status: 'queued',
    nextRunAt: { $lte: new Date() },
  }).sort({ nextRunAt: 1 }).limit(limit);

  const results = [];
  for (const retry of due) {
    results.push(await processRetry(retry));
  }
  return { processed: results.length, deadLettered: results.filter((item) => item.deadLetter).length };
};

const getRetryDiagnostics = async () => {
  const [queued, running, deadLetter, recent] = await Promise.all([
    DeliveryRetry.countDocuments({ status: 'queued' }),
    DeliveryRetry.countDocuments({ status: 'running' }),
    DeliveryRetry.countDocuments({ status: 'dead_letter' }),
    DeliveryRetry.find().sort({ updatedAt: -1 }).limit(20).lean(),
  ]);
  return { queued, running, deadLetter, recent };
};

export {
  backoffMs,
  enqueueFailedDelivery,
  getRetryDiagnostics,
  processDueRetries,
  processRetry,
};
