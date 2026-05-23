/**
 * index.js — Public API for cronpilot
 */

const { parseCron } = require('./parser');
const { humanize } = require('./humanizer');
const { getNextFireTimes } = require('./timezone');
const { buildScheduleInfo, validateSchedule } = require('./scheduler');
const { diffExpressions, describeDiff } = require('./diff');
const { annotate, getAnnotation, removeAnnotation, listAnnotations, searchAnnotations, clearAnnotations } = require('./annotate');

/**
 * Describe a cron expression in plain English.
 * @param {string} expression
 * @returns {string}
 */
function describe(expression) {
  return humanize(parseCron(expression));
}

/**
 * Validate a cron expression, returning structured result.
 * @param {string} expression
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validate(expression) {
  return validateSchedule(expression);
}

/**
 * Get the next N fire times for a cron expression in a given timezone.
 * @param {string} expression
 * @param {string} timezone
 * @param {number} [count=5]
 * @returns {string[]}
 */
function nextFireTimes(expression, timezone, count = 5) {
  return getNextFireTimes(expression, timezone, count);
}

/**
 * Compute the structural diff between two cron expressions.
 * @param {string} a
 * @param {string} b
 * @returns {object}
 */
function diff(a, b) {
  return diffExpressions(a, b);
}

/**
 * Human-readable description of the diff between two expressions.
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function diffDescription(a, b) {
  return describeDiff(diffExpressions(a, b));
}

/**
 * Build a full schedule info object for an expression.
 * @param {string} expression
 * @param {string} [timezone='UTC']
 * @returns {object}
 */
function scheduleInfo(expression, timezone = 'UTC') {
  return buildScheduleInfo(expression, timezone);
}

module.exports = {
  describe,
  validate,
  nextFireTimes,
  diff,
  diffDescription,
  scheduleInfo,
  // Annotation API
  annotate,
  getAnnotation,
  removeAnnotation,
  listAnnotations,
  searchAnnotations,
  clearAnnotations
};
