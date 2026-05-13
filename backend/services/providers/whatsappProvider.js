import logger from '../logger.js';
import observability from '../observabilityService.js';

const sendWhatsApp = async ({ to, message, template }) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_FROM) {
    observability.increment('relayFallbacks', { channel: 'whatsapp', reason: 'twilio_not_configured', template });
    logger.warn('relay.fallback', { category: 'relay', channel: 'whatsapp', reason: 'twilio_not_configured', template });
    return { provider: 'mock', messageId: `mock_whatsapp_${Date.now()}`, template };
  }

  const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: process.env.TWILIO_WHATSAPP_FROM,
        To: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
        Body: message,
      }),
    },
  );

  if (!response.ok) {
    let detail = {};
    try {
      detail = await response.json();
    } catch {
      detail = {};
    }
    const error = new Error(`Twilio WhatsApp failed with ${detail.code || response.status}`);
    error.status = response.status;
    error.code = detail.code || response.status;
    error.moreInfo = detail.more_info;
    observability.increment('twilioFailures', { channel: 'whatsapp', template, providerCode: error.code, status: response.status });
    logger.error('twilio.failure', { category: 'provider', channel: 'whatsapp', template, status: response.status, providerCode: error.code, error });
    throw error;
  }

  const data = await response.json();
  return { provider: 'twilio', messageId: data.sid, template };
};

export { sendWhatsApp };
