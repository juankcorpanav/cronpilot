/**
 * index.js — Public API for cronpilot
 */

const { parseCron } = require('./parser');
const { humanize } = require('./humanizer');
const { getNextFireTimes, isValidTimezone } = require('./timezone');
const { buildScheduleInfo, validateSchedule } = require('./scheduler');
const { getPresets, findPresetByExpression } = require('./presets');
const { diffExpressions, describeDiff } = require('./diff');

/**
 * Describe a cron expression in plain English.
 * @param {string} expression
 * @returns {string}
 */
function describe(expression) {
  return humanize(expression);
}

/**
 * Validate a cron expression and optional timezone.
 * @param {string} expression
 * @param {string} [timezone]
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validate(expression, timezone) {
  const result = validateSchedule(expression, timezone);
  return { valid: result.valid, errors: result.errors };
}

/**
 * Get the next N fire times for a cron expression.
 * @param {string} expression
 * @param {object} [options]
 * @param {string} [options.timezone]
 * @param {number} [options.count]
 * @param {Date}   [options.from]
 * @returns {Date[]}
 */
function nextFireTimes(expression, options = {}) {
  const { timezone = 'UTC', count = 5, from = new Date() } = options;
  return getNextFireTimes(expression, timezone, count, from);
}

/**
 * Diff two cron expressions.
 * @param {string} exprA
 * @param {string} exprB
 * @returns {{ identical: boolean, changes: Array, fromHuman: string, toHuman: string }}
 */
function diff(exprA, exprB) {
  return diffExpressions(exprA, exprB);
}

/**
 * Describe the diff between two cron expressions in plain English.
 * @param {string} exprA
 * @param {string} exprB
 * @returns {string}
 */
function diffDescription(exprA, exprB) {
  return describeDiff(exprA, exprB);
}

module.exports = {
  describe,
  validate,
  nextFireTimes,
  diff,
  diffDescription,
  getPresets,
  findPresetByExpression,
  buildScheduleInfo,
  isValidTimezone,
};
