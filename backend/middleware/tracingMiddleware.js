import logger from '../services/logger.js';
import observability from '../services/observabilityService.js';
import process from 'node:process';

/**
 * @typedef {object} CustomUser
 * @property {string} _id
 * @property {string} academyId
 * @property {string} role
 */

/**
 * @param {import('express').Request & { user?: CustomUser }} req
 */
export const tracingMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || logger.newRequestId();
  const traceId = req.headers['x-trace-id'] || logger.newTraceId();
  const startedAt = process.hrtime.bigint();

  logger.runWithContext({
    requestId,
    traceId,
    method: req.method,
    route: req.originalUrl,
    ip: req.ip,
  }, () => {
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-trace-id', traceId);

    res.on('finish', () => {
      const latencyMs = Math.round(Number(process.hrtime.bigint() - startedAt) / 1e6);
      observability.recordRequest({
        method: req.method,
        route: req.route?.path || req.originalUrl,
        statusCode: res.statusCode,
        latencyMs,
        academyId: req.user?.academyId,
        userId: req.user?._id,
      });

      const payload = {
        category: 'request',
        statusCode: res.statusCode,
        latencyMs,
        academyId: req.user?.academyId ? String(req.user.academyId) : undefined,
        userId: req.user?._id ? String(req.user._id) : undefined,
        userRole: req.user?.role,
        route: req.originalUrl,
        method: req.method,
      };

      if (res.statusCode >= 500) logger.error('request.failed', payload);
      else if (res.statusCode >= 400 || latencyMs > Number(process.env.SLOW_REQUEST_MS || 1500)) logger.warn('request.warning', payload);
      else if (process.env.LOG_SUCCESSFUL_REQUESTS === 'true') logger.info('request.completed', payload);
    });

    next();
  });
};
