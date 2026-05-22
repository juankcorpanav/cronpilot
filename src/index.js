/**
 * cronpilot — public API
 * Exports all user-facing functions from the library.
 */

const { parseCron } = require('./parser');
const { humanize } = require('./humanizer');
const { isValidTimezone, getUtcOffset, getNextFireTimes } = require('./timezone');
const { buildScheduleInfo, validateSchedule } = require('./scheduler');

module.exports = {
  /**
   * Parse a 5-part cron expression into structured fields.
   * @type {typeof parseCron}
   */
  parseCron,

  /**
   * Convert a parsed cron object into a human-readable sentence.
   * @type {typeof humanize}
   */
  humanize,

  /**
   * Check whether an IANA timezone string is valid.
   * @type {typeof isValidTimezone}
   */
  isValidTimezone,

  /**
   * Get the UTC offset string for a timezone, e.g. "UTC+05:30".
   * @type {typeof getUtcOffset}
   */
  getUtcOffset,

  /**
   * Get the next N fire times for a parsed cron in a given timezone.
   * @type {typeof getNextFireTimes}
   */
  getNextFireTimes,

  /**
   * Build a complete schedule info object (description + next fire times).
   * @type {typeof buildScheduleInfo}
   */
  buildScheduleInfo,

  /**
   * Validate a cron expression + timezone pair.
   * @type {typeof validateSchedule}
   */
  validateSchedule,
};
