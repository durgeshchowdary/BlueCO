import nodemailer from 'nodemailer';
import logger from '../logger.js';
import observability from '../observabilityService.js';

const createTransport = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  });
};

const sendMail = async ({ to, subject, html, attachments = [] }) => {
  const transport = createTransport();
  if (!transport) {
    observability.increment('relayFallbacks', { channel: 'email', reason: 'smtp_or_resend_not_configured' });
    logger.warn('relay.fallback', { category: 'relay', channel: 'email', reason: 'smtp_or_resend_not_configured' });
    return { provider: 'mock', messageId: `mock_${Date.now()}` };
  }

  let result;
  try {
    result = await transport.sendMail({
      from: process.env.EMAIL_FROM || 'Outplay <no-reply@outplay.local>',
      to,
      subject,
      html,
      attachments,
    });
  } catch (error) {
    observability.increment('resendFailures', { channel: 'email', provider: process.env.RESEND_API_KEY ? 'resend' : 'smtp' });
    logger.error('email_provider.failure', {
      category: 'provider',
      channel: 'email',
      provider: process.env.RESEND_API_KEY ? 'resend' : 'smtp',
      error,
    });
    throw error;
  }

  return { provider: process.env.RESEND_API_KEY ? 'resend' : 'smtp', messageId: result.messageId };
};

export { sendMail };
