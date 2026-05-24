/**
 * classify.js — Categorize cron expressions by behavior and frequency
 */

const { parseCron } = require('./parser');

const FREQUENCY_THRESHOLDS = {
  high: 60,      // fires more than 60 times/day
  medium: 10,    // fires more than 10 times/day
  low: 1,        // fires at least once/day
  rare: 0        // fires less than once/day
};

/**
 * Estimate how many times per day a cron fires.
 * @param {object} fields - parsed cron fields
 * @returns {number}
 */
function estimateDailyFrequency(fields) {
  const countValues = (field, max) => {
    if (field.type === 'wildcard') return max;
    if (field.type === 'value') return 1;
    if (field.type === 'list') return field.values.length;
    if (field.type === 'range') return Math.floor((field.to - field.from) / (field.step || 1)) + 1;
    if (field.type === 'step') return Math.floor(max / field.step);
    return 1;
  };

  const minutes = countValues(fields.minute, 60);
  const hours = countValues(fields.hour, 24);
  return minutes * hours;
}

/**
 * Classify a cron expression into a frequency tier.
 * @param {string} expression
 * @returns {{ tier: string, firesPerDay: number, label: string }}
 */
function classifyFrequency(expression) {
  const fields = parseCron(expression);
  const firesPerDay = estimateDailyFrequency(fields);

  let tier, label;
  if (firesPerDay >= FREQUENCY_THRESHOLDS.high) {
    tier = 'high';
    label = 'High frequency';
  } else if (firesPerDay >= FREQUENCY_THRESHOLDS.medium) {
    tier = 'medium';
    label = 'Medium frequency';
  } else if (firesPerDay >= FREQUENCY_THRESHOLDS.low) {
    tier = 'low';
    label = 'Low frequency';
  } else {
    tier = 'rare';
    label = 'Rare / infrequent';
  }

  return { tier, firesPerDay, label };
}

/**
 * Determine the schedule pattern type of a cron expression.
 * @param {string} expression
 * @returns {string} - 'minutely', 'hourly', 'daily', 'weekly', 'monthly', 'custom'
 */
function classifyPattern(expression) {
  const fields = parseCron(expression);
  const isWild = (f) => f.type === 'wildcard';
  const isFixed = (f) => f.type === 'value';

  if (isWild(fields.minute)) return 'minutely';
  if (isFixed(fields.minute) && isWild(fields.hour)) return 'hourly';
  if (isFixed(fields.minute) && isFixed(fields.hour) && isWild(fields.dayOfMonth) && isWild(fields.month) && isWild(fields.dayOfWeek)) return 'daily';
  if (isFixed(fields.minute) && isFixed(fields.hour) && isWild(fields.dayOfMonth) && isWild(fields.month) && isFixed(fields.dayOfWeek)) return 'weekly';
  if (isFixed(fields.minute) && isFixed(fields.hour) && isFixed(fields.dayOfMonth) && isWild(fields.month)) return 'monthly';
  if (isFixed(fields.minute) && isFixed(fields.hour) && isFixed(fields.dayOfMonth) && isFixed(fields.month)) return 'yearly';
  return 'custom';
}

/**
 * Full classification of a cron expression.
 * @param {string} expression
 * @returns {object}
 */
function classify(expression) {
  const frequency = classifyFrequency(expression);
  const pattern = classifyPattern(expression);
  return { expression, pattern, ...frequency };
}

module.exports = { estimateDailyFrequency, classifyFrequency, classifyPattern, classify };
