/**
 * Development-only logger utility
 * Wraps console methods to only log in development mode
 * Usage: import { logger } from '@/lib/logger'
 *        logger.log('message')
 *        logger.error('error message')
 *        logger.warn('warning')
 *        logger.debug('debug info')
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },

  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },

  // Group related logs together
  group: (label, fn) => {
    if (isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },

  // Table format for objects/arrays
  table: (data) => {
    if (isDev) {
      console.table(data);
    }
  },
};

export default logger;
