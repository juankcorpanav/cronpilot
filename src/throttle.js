/**
 * throttle.js — Detect and warn about high-frequency cron expressions
 */

const { parseCron } = require('./parser');
const { estimateDailyFrequency } = require('./classify');

const THRESHOLDS = {
  warning: 96,   // more than every 15 min
  danger: 288,   // more than every 5 min
  critical: 1440 // every minute
};

/**
 * Returns the throttle level for a cron expression.
 * @param {string} expression
 * @returns {'ok'|'warning'|'danger'|'critical'}
 */
function throttleLevel(expression) {
  const freq = estimateDailyFrequency(expression);
  if (freq >= THRESHOLDS.critical) return 'critical';
  if (freq >= THRESHOLDS.danger) return 'danger';
  if (freq >= THRESHOLDS.warning) return 'warning';
  return 'ok';
}

/**
 * Returns a human-readable throttle report for an expression.
 * @param {string} expression
 * @returns {{ expression: string, level: string, dailyFrequency: number, message: string }}
 */
function throttleReport(expression) {
  const freq = estimateDailyFrequency(expression);
  const level = throttleLevel(expression);

  const messages = {
    ok: `Runs approximately ${freq} times/day. No throttle concerns.`,
    warning: `Runs approximately ${freq} times/day. Consider reducing frequency.`,
    danger: `Runs approximately ${freq} times/day. High frequency — may cause resource strain.`,
    critical: `Runs approximately ${freq} times/day. Extremely high frequency — throttle strongly recommended.`
  };

  return {
    expression,
    level,
    dailyFrequency: freq,
    message: messages[level]
  };
}

/**
 * Suggests a throttled (less frequent) alternative expression.
 * @param {string} expression
 * @returns {string|null}
 */
function suggestThrottled(expression) {
  const parsed = parseCron(expression);
  if (!parsed) return null;

  const { minute, hour } = parsed;

  // If running every minute, suggest every 5 minutes
  if (minute === '*') {
    return `*/5 ${hour} * * *`;
  }

  // If running every N minutes where N < 5, suggest every 5
  const everyMatch = minute.match(/^\*\/(\d+)$/);
  if (everyMatch) {
    const interval = parseInt(everyMatch[1], 10);
    if (interval < 5) return `*/5 ${hour} * * *`;
    if (interval < 15) return `*/15 ${hour} * * *`;
    if (interval < 30) return `*/30 ${hour} * * *`;
  }

  return null;
}

module.exports = { throttleLevel, throttleReport, suggestThrottled, THRESHOLDS };
