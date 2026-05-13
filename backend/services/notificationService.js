import Notification from '../models/Notification.js';
import EmailLog from '../models/EmailLog.js';
import WhatsAppLog from '../models/WhatsAppLog.js';
import { sendMail } from './providers/emailProvider.js';
import { sendWhatsApp } from './providers/whatsappProvider.js';
import { renderEmailTemplate } from './templates/emailTemplates.js';
import logger from './logger.js';
import { enqueueFailedDelivery } from './deliveryReliabilityService.js';

const createNotification = async ({
  academyId,
  userId = null,
  role = '',
  category,
  title,
  message,
  actionUrl = '',
  priority = 'normal',
  dedupeKey = '',
  metadata = {},
}) => {
  if (dedupeKey) {
    const existing = await Notification.findOne({ dedupeKey }).lean();
    if (existing) return existing;
  }

  return Notification.create({
    academyId,
    userId,
    role,
    category,
    title,
    message,
    actionUrl,
    priority,
    dedupeKey,
    metadata,
  });
};

const sendTemplatedEmail = async ({
  academyId = null,
  to,
  template,
  data = {},
  attachments = [],
  dedupeKey = '',
}) => {
  if (!to) return null;
  if (dedupeKey) {
    const existing = await EmailLog.findOne({ dedupeKey, status: { $in: ['sent', 'queued'] } }).lean();
    if (existing) return existing;
  }

  const rendered = renderEmailTemplate(template, data);
  const log = await EmailLog.create({
    academyId,
    to,
    subject: rendered.subject,
    template,
    dedupeKey,
    metadata: data,
  });

  try {
    const result = await sendMail({ to, subject: rendered.subject, html: rendered.html, attachments });
    log.status = 'sent';
    log.provider = result.provider;
    log.sentAt = new Date();
    log.attempts += 1;
    log.metadata = { ...log.metadata, messageId: result.messageId };
  } catch (error) {
    log.status = 'failed';
    log.errorMessage = error.message;
    log.attempts += 1;
    log.metadata = { ...log.metadata, errorCode: error.code || error.status || '', requestId: logger.context().requestId };
    logger.error('email.delivery_failed', { category: 'delivery', academyId, template, error });
  }

  await log.save();
  if (log.status === 'failed') await enqueueFailedDelivery({ channel: 'email', log });
  return log;
};

const sendWhatsAppTemplate = async ({
  academyId = null,
  to,
  template,
  message,
  dedupeKey = '',
  metadata = {},
}) => {
  if (!to || !message) return null;
  if (dedupeKey) {
    const existing = await WhatsAppLog.findOne({ dedupeKey, status: { $in: ['sent', 'queued'] } }).lean();
    if (existing) return existing;
  }

  const log = await WhatsAppLog.create({ academyId, to, template, message, dedupeKey, metadata });
  try {
    const result = await sendWhatsApp({ to, message, template });
    log.status = 'sent';
    log.provider = result.provider;
    log.sentAt = new Date();
    log.attempts += 1;
    log.metadata = { ...log.metadata, messageId: result.messageId };
  } catch (error) {
    log.status = 'failed';
    log.errorMessage = error.message;
    log.attempts += 1;
    log.metadata = { ...log.metadata, errorCode: error.code || error.status || '', requestId: logger.context().requestId };
    logger.error('whatsapp.delivery_failed', { category: 'delivery', academyId, template, errorCode: error.code || error.status, error });
  }

  await log.save();
  if (log.status === 'failed') await enqueueFailedDelivery({ channel: 'whatsapp', log });
  return log;
};

export {
  createNotification,
  sendTemplatedEmail,
  sendWhatsAppTemplate,
};
