const sensitiveKeys = ['password', 'token', 'authorization', 'cookie', 'secret', 'jwt'];

export function createClientRequestId() {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  return `web_${Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('') || Date.now().toString(16)}`;
}

function sanitize(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.slice(0, 25).map(sanitize);
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [
    key,
    sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive)) ? '[redacted]' : sanitize(item),
  ]));
}

function sentryEnvelopeEndpoint(dsn: string) {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace('/', '');
    return `${url.protocol}//${url.host}/api/${projectId}/envelope/`;
  } catch {
    return '';
  }
}

export function captureFrontendException(error: unknown, context: Record<string, unknown> = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context: sanitize(context),
  };

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[OUT-PLAY frontend telemetry]', payload);
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const endpoint = dsn ? sentryEnvelopeEndpoint(dsn) : '';
  if (!dsn || !endpoint || typeof navigator === 'undefined') return;

  const header = JSON.stringify({ dsn, sent_at: new Date().toISOString() });
  const itemHeader = JSON.stringify({ type: 'event' });
  const event = JSON.stringify({
    event_id: createClientRequestId().replace('web_', '').slice(0, 32),
    platform: 'javascript',
    level: 'error',
    exception: { values: [{ type: error instanceof Error ? error.name : 'Error', value: payload.message, stacktrace: payload.stack }] },
    extra: payload.context,
  });

  navigator.sendBeacon(endpoint, `${header}\n${itemHeader}\n${event}`);
}
