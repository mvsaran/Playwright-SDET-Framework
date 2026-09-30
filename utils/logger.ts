/**
 * Structured, CI-friendly logger.
 *
 * Rules enforced by this module:
 *  - Passwords, tokens, and secrets MUST NEVER be passed to any log method.
 *  - Use structured key-value pairs to make log output grep-able in CI.
 *  - Log levels map to console methods so output is captured by the terminal
 *    and Playwright's stdio capture.
 *
 * Usage:
 *   import { logger } from '@utils/logger';
 *   logger.info('API request', { method: 'POST', endpoint: '/users' });
 *   logger.error('Login failed', { statusCode: 401 });
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: string | number | boolean | undefined;
}

class Logger {
  private readonly prefix: string;

  constructor(prefix = 'FW') {
    this.prefix = prefix;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${this.serializeContext(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.prefix}] ${message}${contextStr}`;
  }

  private serializeContext(context: LogContext): string {
    return Object.entries(context)
      .map(([k, v]) => `${k}=${String(v)}`)
      .join(' ');
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  debug(message: string, context?: LogContext): void {
    if (process.env['DEBUG'] === 'true') {
      // eslint-disable-next-line no-console
      console.debug(this.format('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    // eslint-disable-next-line no-console
    console.info(this.format('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    // eslint-disable-next-line no-console
    console.warn(this.format('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
    // eslint-disable-next-line no-console
    console.error(this.format('error', message, context));
  }

  // ── API-specific helpers ───────────────────────────────────────────────────

  /**
   * Log an outgoing API request.
   * NEVER pass auth headers or body with credentials here.
   */
  apiRequest(method: string, endpoint: string, context?: LogContext): void {
    this.info('API Request', { method, endpoint, ...context });
  }

  /**
   * Log an API response.
   * NEVER pass response bodies that may contain tokens or PII.
   */
  apiResponse(method: string, endpoint: string, statusCode: number, context?: LogContext): void {
    const level: LogLevel = statusCode >= 400 ? 'error' : 'info';
    this[level]('API Response', { method, endpoint, statusCode, ...context });
  }

  /**
   * Log the start of a test. Called from fixtures.
   */
  testStart(testTitle: string): void {
    this.info('TEST START', { test: testTitle });
  }

  /**
   * Log the end of a test. Called from fixtures.
   */
  testEnd(testTitle: string, status: string): void {
    this.info('TEST END', { test: testTitle, status });
  }

  /**
   * Create a child logger with a different prefix (e.g. per API client).
   */
  child(prefix: string): Logger {
    return new Logger(prefix);
  }
}

export const logger = new Logger();
