import crypto from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import process from 'node:process';

const requestContext = new AsyncLocalStorage();
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'authorization',
  'cookie',
  'jwt',
  'secret',
  'keySecret',
  'razorpaySignature',
  'encryptedValue',
]);
const now = () => new Date().toISOString();
const newRequestId = () => `req_${crypto.randomBytes(8).toString('hex')}`;
const newTraceId = (prefix = 'trace') => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

const sanitize = (value, depth = 0) => {
  if (value === null || value === undefined) return value;
  if (depth > 5) return '[depth-limit]';
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      code: value.code,
      status: value.status,
      stack: process.env.NODE_ENV === 'production' ? undefined : value.stack,
    };
  }
  if (Array.isArray(value)) return value.slice(0, 25).map((item) => sanitize(item, depth + 1));
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(key.toLowerCase()) ? '[redacted]' : sanitize(item, depth + 1),
      ]),
    );
  }
  return value;
};

const context = () => requestContext.getStore() || {};

const write = (level, event, payload = {}) => {
  const entry = {
    timestamp: now(),
    level,
    event,
    requestId: payload.requestId || context().requestId,
    traceId: payload.traceId || context().traceId,
    academyId: payload.academyId ?? context().academyId,
    userId: payload.userId ?? context().userId,
    userRole: payload.userRole ?? context().userRole,
    route: payload.route ?? context().route,
    method: payload.method ?? context().method,
    category: payload.category,
    latencyMs: payload.latencyMs,
    ...sanitize(payload),
  };

  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
};

const logger = {
  context,
  runWithContext: (seed, handler) => requestContext.run(seed, handler),
  setContext: (patch = {}) => {
    const store = requestContext.getStore();
    if (store) Object.assign(store, patch);
  },
  newRequestId,
  newTraceId,
  info: (event, payload) => write('info', event, payload),
  warn: (event, payload) => write('warn', event, payload),
  error: (event, payload) => write('error', event, payload),
};

export default logger;
