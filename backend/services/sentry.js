import logger from './logger.js';
import process from 'node:process';

let sentry = null;
let initialized = false;

const initSentry = async () => {
  if (initialized) return sentry;
  initialized = true;

  if (!process.env.SENTRY_DSN) return null;

  try {
    // Dynamically import Sentry to make it an optional dependency and compatible with ESM
    sentry = await import('@sentry/node');
    sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.05),
      release: process.env.APP_RELEASE || undefined,
    });
    logger.info('sentry.backend.enabled', { category: 'observability' });
  } catch (error) {
    logger.warn('sentry.backend.unavailable', { category: 'observability', message: error.message });
    sentry = null;
  }

  return sentry;
};

const captureException = (error, context = {}) => {
  void initSentry().then((client) => {
    if (!client) return;

    client.withScope((scope) => {
    const requestContext = logger.context();
    scope.setTag('requestId', context.requestId || requestContext.requestId || 'none');
    scope.setTag('academyId', String(context.academyId || requestContext.academyId || 'none'));
    scope.setUser(context.userId || requestContext.userId ? { id: String(context.userId || requestContext.userId) } : null);
    scope.setExtras({ ...requestContext, ...context });
    client.captureException(error);
    });
  });
};

export { initSentry, captureException };
