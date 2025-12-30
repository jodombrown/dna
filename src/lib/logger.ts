/**
 * DNA Platform Development Logger
 *
 * Centralized logging utility for development-time debugging.
 * Only outputs in development environment and can be globally disabled.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.debug('MyComponent', 'Processing data', { count: 5 });
 *   logger.error('MyService', 'Failed to fetch', error);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Check if logging is enabled via environment
const isDevEnvironment = (): boolean => {
  try {
    return import.meta.env.DEV === true;
  } catch {
    return false;
  }
};

// Check if logging is globally disabled
const isLoggingDisabled = (): boolean => {
  try {
    return import.meta.env.VITE_DISABLE_LOGGING === 'true';
  } catch {
    return false;
  }
};

const config: LoggerConfig = {
  enabled: isDevEnvironment() && !isLoggingDisabled(),
  minLevel: 'debug',
};

const formatTimestamp = (): string => {
  const now = new Date();
  return now.toISOString().slice(11, 23); // HH:mm:ss.SSS
};

const formatMessage = (level: LogLevel, context: string, message: string): string => {
  const timestamp = formatTimestamp();
  const levelStr = level.toUpperCase().padEnd(5);
  return `[${timestamp}] ${levelStr} [${context}] ${message}`;
};

const shouldLog = (level: LogLevel): boolean => {
  if (!config.enabled) return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
};

/**
 * Development logger with context and timestamp support
 */
export const logger = {
  /**
   * Log debug information (lowest priority)
   * @param context - Module or component name
   * @param message - Log message
   * @param data - Optional additional data to log
   */
  debug(context: string, message: string, data?: unknown): void {
    if (!shouldLog('debug')) return;
    const formatted = formatMessage('debug', context, message);
    if (data !== undefined) {
      console.debug(formatted, data);
    } else {
      console.debug(formatted);
    }
  },

  /**
   * Log general information
   * @param context - Module or component name
   * @param message - Log message
   * @param data - Optional additional data to log
   */
  info(context: string, message: string, data?: unknown): void {
    if (!shouldLog('info')) return;
    const formatted = formatMessage('info', context, message);
    if (data !== undefined) {
      console.info(formatted, data);
    } else {
      console.info(formatted);
    }
  },

  /**
   * Log warnings
   * @param context - Module or component name
   * @param message - Log message
   * @param data - Optional additional data to log
   */
  warn(context: string, message: string, data?: unknown): void {
    if (!shouldLog('warn')) return;
    const formatted = formatMessage('warn', context, message);
    if (data !== undefined) {
      console.warn(formatted, data);
    } else {
      console.warn(formatted);
    }
  },

  /**
   * Log errors (highest priority)
   * @param context - Module or component name
   * @param message - Log message
   * @param error - Optional error object or additional data
   */
  error(context: string, message: string, error?: unknown): void {
    if (!shouldLog('error')) return;
    const formatted = formatMessage('error', context, message);
    if (error !== undefined) {
      console.error(formatted, error);
    } else {
      console.error(formatted);
    }
  },

  /**
   * Set minimum log level
   * @param level - Minimum level to log
   */
  setMinLevel(level: LogLevel): void {
    config.minLevel = level;
  },

  /**
   * Enable or disable logging
   * @param enabled - Whether logging should be enabled
   */
  setEnabled(enabled: boolean): void {
    config.enabled = enabled;
  },

  /**
   * Check if logging is currently enabled
   */
  isEnabled(): boolean {
    return config.enabled;
  },
};

// Create context-specific loggers for common modules
export const createLogger = (context: string) => ({
  debug: (message: string, data?: unknown) => logger.debug(context, message, data),
  info: (message: string, data?: unknown) => logger.info(context, message, data),
  warn: (message: string, data?: unknown) => logger.warn(context, message, data),
  error: (message: string, error?: unknown) => logger.error(context, message, error),
});

export default logger;
