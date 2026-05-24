/**
 * replay.js — Replay cron fire times over a historical window
 * Given a cron expression and a past time range, returns all times it would have fired.
 */

const { parseCron } = require('./parser');
const { isValidTimezone } = require('./timezone');
const cronParser = require('cron-parser');

/**
 * Replay all fire times for a cron expression within [start, end].
 * @param {string} expression - Cron expression (5-field standard)
 * @param {Date|string} start - Start of the window
 * @param {Date|string} end - End of the window
 * @param {object} [options]
 * @param {string} [options.timezone='UTC'] - IANA timezone
 * @param {number} [options.limit=500] - Max results to prevent runaway loops
 * @returns {{ times: Date[], count: number, expression: string, start: Date, end: Date, timezone: string }}
 */
function replay(expression, start, end, options = {}) {
  const { timezone = 'UTC', limit = 500 } = options;

  const parsed = parseCron(expression);
  if (!parsed.valid) {
    throw new Error(`Invalid cron expression: ${parsed.errors.join(', ')}`);
  }

  if (!isValidTimezone(timezone)) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid start or end date');
  }

  if (startDate >= endDate) {
    throw new Error('start must be before end');
  }

  const interval = cronParser.parseExpression(expression, {
    currentDate: startDate,
    endDate: endDate,
    tz: timezone,
    iterator: true,
  });

  const times = [];
  while (interval.hasNext() && times.length < limit) {
    const { value, done } = interval.next();
    if (done) break;
    const t = value.toDate();
    if (t > endDate) break;
    times.push(t);
  }

  return {
    expression,
    start: startDate,
    end: endDate,
    timezone,
    count: times.length,
    truncated: times.length === limit,
    times,
  };
}

/**
 * Summarise a replay result into a human-readable string.
 * @param {object} result - Return value of replay()
 * @returns {string}
 */
function replaySummary(result) {
  const { expression, start, end, timezone, count, truncated } = result;
  const from = start.toISOString();
  const to = end.toISOString();
  const trunc = truncated ? ' (truncated at limit)' : '';
  return `"${expression}" fired ${count} time(s) between ${from} and ${to} [${timezone}]${trunc}.`;
}

module.exports = { replay, replaySummary };
