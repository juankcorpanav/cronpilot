/**
 * index.js — Public API for cronpilot
 */

const { parseCron } = require('./parser');
const { humanize } = require('./humanizer');
const { getNextFireTimes, isValidTimezone } = require('./timezone');
const { buildScheduleInfo, validateSchedule } = require('./scheduler');
const { diffExpressions, describeDiff } = require('./diff');
const { suggest, topSuggestion } = require('./suggest');
const { explain } = require('./explain');
const { lint, isClean } = require('./lint');
const { normalize, areEquivalent } = require('./normalize');
const { exportExpression } = require('./export');
const { compareExpressions, compareSummary } = require('./compare');
const { buildMatrix } = require('./matrix');
const { addTags, getTags, removeTag, findByTag, listAllTags, clearTags } = require('./tag');

/**
 * Describe a cron expression in human-readable form.
 * @param {string} expression
 * @returns {string}
 */
function describe(expression) {
  return humanize(parseCron(expression));
}

/**
 * Validate a cron expression.
 * @param {string} expression
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validate(expression) {
  return validateSchedule(expression);
}

/**
 * Get the next N fire times for a cron expression.
 * @param {string} expression
 * @param {number} [count=5]
 * @param {string} [timezone='UTC']
 * @returns {Date[]}
 */
function nextFireTimes(expression, count = 5, timezone = 'UTC') {
  return getNextFireTimes(expression, count, timezone);
}

/**
 * Diff two cron expressions.
 * @param {string} a
 * @param {string} b
 * @returns {object}
 */
function diff(a, b) {
  return diffExpressions(a, b);
}

/**
 * Human-readable diff between two expressions.
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function diffDescription(a, b) {
  return describeDiff(a, b);
}

module.exports = {
  describe,
  validate,
  nextFireTimes,
  diff,
  diffDescription,
  suggest,
  topSuggestion,
  explain,
  lint,
  isClean,
  normalize,
  areEquivalent,
  exportExpression,
  compareExpressions,
  compareSummary,
  buildMatrix,
  isValidTimezone,
  buildScheduleInfo,
  // Tag management
  addTags,
  getTags,
  removeTag,
  findByTag,
  listAllTags,
  clearTags,
};
