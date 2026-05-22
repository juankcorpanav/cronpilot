const { parseCron } = require('./parser');
const { humanize } = require('./humanizer');
const { isValidTimezone, getUtcOffset, getNextFireTimes } = require('./timezone');
const { buildScheduleInfo, validateSchedule } = require('./scheduler');
const { getPresets, getPresetsByCategory, findPresetByExpression } = require('./presets');

/**
 * Parse and describe a cron expression with optional timezone.
 * @param {string} expression - Cron expression
 * @param {string} [timezone='UTC'] - IANA timezone string
 * @returns {Object}
 */
function describe(expression, timezone = 'UTC') {
  const parsed = parseCron(expression);
  const readable = humanize(expression);
  const schedule = buildScheduleInfo(expression, timezone);
  const preset = findPresetByExpression(expression);
  return {
    expression,
    parsed,
    readable,
    timezone,
    utcOffset: getUtcOffset(timezone),
    schedule,
    preset: preset || null,
  };
}

/**
 * Validate a cron expression and optional timezone.
 * @param {string} expression
 * @param {string} [timezone='UTC']
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validate(expression, timezone = 'UTC') {
  const scheduleErrors = validateSchedule(expression, timezone);
  const timezoneValid = isValidTimezone(timezone);
  const errors = [...scheduleErrors];
  if (!timezoneValid) errors.push(`Invalid timezone: ${timezone}`);
  return { valid: errors.length === 0, errors };
}

/**
 * Get the next N fire times for a cron expression in a given timezone.
 * @param {string} expression
 * @param {string} [timezone='UTC']
 * @param {number} [count=5]
 * @returns {Date[]}
 */
function nextFireTimes(expression, timezone = 'UTC', count = 5) {
  return getNextFireTimes(expression, timezone, count);
}

module.exports = {
  describe,
  validate,
  nextFireTimes,
  getPresets,
  getPresetsByCategory,
  findPresetByExpression,
  parseCron,
  humanize,
  isValidTimezone,
  getUtcOffset,
};
