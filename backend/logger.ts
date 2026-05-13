type LogPayload = Record<string, unknown>;

const serialize = (payload?: unknown) => {
  if (!payload) return '';
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
};

const logger = {
  info(event: string, payload?: LogPayload) {
    console.info(`[${new Date().toISOString()}] [INFO] ${event} ${serialize(payload)}`.trim());
  },
  warn(event: string, payload?: LogPayload) {
    console.warn(`[${new Date().toISOString()}] [WARN] ${event} ${serialize(payload)}`.trim());
  },
  error(event: string, payload?: LogPayload) {
    console.error(`[${new Date().toISOString()}] [ERROR] ${event} ${serialize(payload)}`.trim());
  },
};

export default logger;
