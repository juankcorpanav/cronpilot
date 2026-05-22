/**
 * lint.js — Lints a cron expression for common mistakes and anti-patterns.
 */

const { parseCron } = require('./parser');

const RULES = [
  {
    id: 'no-both-dom-dow',
    message:
      'Specifying both day-of-month and day-of-week is ambiguous; most cron implementations use OR logic.',
    check: (parsed) =>
      parsed.dayOfMonth !== '*' && parsed.dayOfWeek !== '*',
  },
  {
    id: 'high-frequency',
    message:
      'Expression fires more than once per minute — verify this is intentional.',
    check: (parsed) => parsed.minute.startsWith('*/') && parseInt(parsed.minute.split('/')[1]) < 1,
  },
  {
    id: 'every-minute',
    message: 'Expression fires every minute. Ensure this is not a performance concern.',
    check: (parsed) => parsed.minute === '*' && parsed.hour === '*',
  },
  {
    id: 'zero-step',
    message: 'A step value of 0 is invalid and will cause errors in most cron implementations.',
    check: (parsed) =>
      Object.values(parsed).some((v) => /\/0$/.test(v)),
  },
  {
    id: 'redundant-wildcard-range',
    message: 'A range that spans the full field is equivalent to a wildcard (*).',
    check: (parsed) => {
      const fullRanges = { minute: '0-59', hour: '0-23', dayOfMonth: '1-31', month: '1-12', dayOfWeek: '0-6' };
      return Object.entries(fullRanges).some(([k, v]) => parsed[k] === v);
    },
  },
];

/**
 * Lints a cron expression and returns an array of warnings.
 * @param {string} expression
 * @returns {{ id: string, message: string }[]}
 */
function lint(expression) {
  const parsed = parseCron(expression);
  return RULES.filter((rule) => rule.check(parsed)).map(({ id, message }) => ({ id, message }));
}

/**
 * Returns true if the expression passes all lint rules.
 * @param {string} expression
 * @returns {boolean}
 */
function isClean(expression) {
  return lint(expression).length === 0;
}

module.exports = { lint, isClean, RULES };
