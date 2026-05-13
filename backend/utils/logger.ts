/**
 * Centralized Logger Utility for OUT-PLAY.
 * Enforces structured logging and trace correlation.
 * PHASE 4: LOGGING + OBSERVABILITY GOVERNANCE
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  tenantId?: string;
  traceId?: string;
  [key: string]: unknown; // Allow additional context
}

export class Logger {
  private static formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const formattedContext = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${formattedContext}`.trim();
  }

  public static info(message: string, context?: LogContext): void {
    // In a real system, this would send to a structured logging service (e.g., Pino, Winston, or directly to a log aggregator)
    console.info(Logger.formatMessage('info', message, context));
  }

  public static warn(message: string, context?: LogContext): void {
    console.warn(Logger.formatMessage('warn', message, context));
  }

  public static error(message: string, error?: Error, context?: LogContext): void {
    // Include error stack for error logs
    const errorContext = { ...context, error: error?.message, stack: error?.stack };
    console.error(Logger.formatMessage('error', message, errorContext));
  }
}