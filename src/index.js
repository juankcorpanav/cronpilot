/**
 * index.js — Public API for cronpilot
 */

import { parseCron } from './parser.js';
import { humanize } from './humanizer.js';
import { getNextFireTimes, isValidTimezone } from './timezone.js';
import { buildScheduleInfo, validateSchedule } from './scheduler.js';
import { diffExpressions, describeDiff } from './diff.js';
import { exportExpression, toJson, toYaml, toCrontab, toMarkdown } from './export.js';

/**
 * Describe a cron expression in plain English
 * @param {string} expression
 * @returns {string}
 */
export function describe(expression) {
  return humanize(expression);
}

/**
 * Validate a cron expression and return any issues
 * @param {string} expression
 * @param {object} options
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validate(expression, options = {}) {
  return validateSchedule(expression, options);
}

/**
 * Get the next N fire times for a cron expression
 * @param {string} expression
 * @param {object} options - { timezone, count, from }
 * @returns {Date[]}
 */
export function nextFireTimes(expression, options = {}) {
  const { timezone = 'UTC', count = 5, from = new Date() } = options;
  if (!isValidTimezone(timezone)) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
  return getNextFireTimes(expression, { timezone, count, from });
}

/**
 * Diff two cron expressions and return changed fields
 * @param {string} a
 * @param {string} b
 * @returns {object}
 */
export function diff(a, b) {
  return diffExpressions(a, b);
}

/**
 * Describe the diff between two cron expressions in plain English
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
export function diffDescription(a, b) {
  return describeDiff(a, b);
}

/**
 * Export a cron expression to a given format
 * @param {string} expression
 * @param {string} format - 'json' | 'yaml' | 'crontab' | 'markdown'
 * @param {object} options
 * @returns {string|object}
 */
export function exportTo(expression, format = 'json', options = {}) {
  return exportExpression(expression, format, options);
}

export { toJson, toYaml, toCrontab, toMarkdown };
export { buildScheduleInfo };
export { parseCron };
