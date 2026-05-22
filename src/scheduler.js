const { parseCron } = require('./parser');
const { humanize } = require('./humanizer');
const { isValidTimezone, getUtcOffset, getNextFireTimes } = require('./timezone');

/**
 * @typedef {Object} ScheduleInfo
 * @property {string} expression      - Original cron expression
 * @property {string} timezone        - IANA timezone string
 * @property {string} utcOffset       - e.g. "UTC+05:30"
 * @property {string} description     - Human-readable description
 * @property {string[]} nextFireTimes  - ISO strings of next N fire times
 * @property {object} parsed          - Raw parsed fields
 */

/**
 * Builds a full schedule info object for a cron expression + timezone.
 * @param {string} expression - 5-part cron string
 * @param {string} [tz='UTC'] - IANA timezone
 * @param {number} [previewCount=5] - How many next fire times to include
 * @returns {ScheduleInfo}
 */
function buildScheduleInfo(expression, tz = 'UTC', previewCount = 5) {
  if (!isValidTimezone(tz)) {
    throw new Error(`Invalid timezone: "${tz}"`);
  }

  const parsed = parseCron(expression);
  const description = humanize(parsed);
  const utcOffset = getUtcOffset(tz);
  const nextFireTimes = getNextFireTimes(parsed, tz, previewCount);

  return {
    expression,
    timezone: tz,
    utcOffset,
    description,
    nextFireTimes,
    parsed,
  };
}

/**
 * Validates a cron expression and timezone without computing fire times.
 * Returns an object with `valid` and optional `error`.
 * @param {string} expression
 * @param {string} [tz='UTC']
 * @returns {{ valid: boolean, error?: string }}
 */
function validateSchedule(expression, tz = 'UTC') {
  if (!isValidTimezone(tz)) {
    return { valid: false, error: `Invalid timezone: "${tz}"` };
  }
  try {
    parseCron(expression);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

module.exports = { buildScheduleInfo, validateSchedule };
