/**
 * retry.js — Cron expression retry policy builder
 * Generates retry schedules (backoff intervals) as cron expressions
 * and validates retry configurations.
 */

const { parseCron } = require('./parser');
const { humanize } = require('./humanizer');

const BACKOFF_STRATEGIES = ['fixed', 'linear', 'exponential'];

/**
 * Build a list of retry cron expressions using a backoff strategy.
 * @param {string} baseCron - The original cron expression
 * @param {object} options
 * @param {number} options.maxRetries - Number of retries (1–10)
 * @param {string} options.strategy - 'fixed' | 'linear' | 'exponential'
 * @param {number} options.intervalMinutes - Base interval in minutes
 * @returns {Array<{attempt: number, expression: string, description: string}>}
 */
function buildRetrySchedule(baseCron, options = {}) {
  const { maxRetries = 3, strategy = 'fixed', intervalMinutes = 5 } = options;

  if (!BACKOFF_STRATEGIES.includes(strategy)) {
    throw new Error(`Unknown strategy "${strategy}". Use: ${BACKOFF_STRATEGIES.join(', ')}`);
  }
  if (maxRetries < 1 || maxRetries > 10) {
    throw new Error('maxRetries must be between 1 and 10');
  }
  if (intervalMinutes < 1 || intervalMinutes > 60) {
    throw new Error('intervalMinutes must be between 1 and 60');
  }

  parseCron(baseCron); // validate base expression

  const retries = [];
  for (let i = 1; i <= maxRetries; i++) {
    let delay;
    if (strategy === 'fixed') delay = intervalMinutes;
    else if (strategy === 'linear') delay = intervalMinutes * i;
    else delay = intervalMinutes * Math.pow(2, i - 1); // exponential

    delay = Math.min(Math.round(delay), 60);
    const expression = `*/${delay} * * * *`;
    retries.push({
      attempt: i,
      expression,
      description: humanize(expression),
      delayMinutes: delay,
    });
  }

  return retries;
}

/**
 * Validate a retry policy object.
 * @param {object} policy
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateRetryPolicy(policy = {}) {
  const errors = [];

  if (!policy.baseCron) {
    errors.push('baseCron is required');
  } else {
    try {
      parseCron(policy.baseCron);
    } catch (e) {
      errors.push(`Invalid baseCron: ${e.message}`);
    }
  }

  if (policy.maxRetries !== undefined && (policy.maxRetries < 1 || policy.maxRetries > 10)) {
    errors.push('maxRetries must be between 1 and 10');
  }

  if (policy.strategy !== undefined && !BACKOFF_STRATEGIES.includes(policy.strategy)) {
    errors.push(`strategy must be one of: ${BACKOFF_STRATEGIES.join(', ')}`);
  }

  if (policy.intervalMinutes !== undefined && (policy.intervalMinutes < 1 || policy.intervalMinutes > 60)) {
    errors.push('intervalMinutes must be between 1 and 60');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Summarize a retry policy in human-readable form.
 * @param {object} policy
 * @returns {string}
 */
function describeRetryPolicy(policy = {}) {
  const { baseCron, maxRetries = 3, strategy = 'fixed', intervalMinutes = 5 } = policy;
  const base = baseCron ? humanize(baseCron) : 'unknown schedule';
  return `Retry policy: up to ${maxRetries} retries using ${strategy} backoff ` +
    `(base interval ${intervalMinutes}m) on top of "${base}"`;
}

module.exports = { buildRetrySchedule, validateRetryPolicy, describeRetryPolicy, BACKOFF_STRATEGIES };
