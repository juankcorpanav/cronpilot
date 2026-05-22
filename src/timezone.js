const { DateTime } = require('luxon');

/**
 * Returns true if the given timezone string is valid (IANA).
 * @param {string} tz
 * @returns {boolean}
 */
function isValidTimezone(tz) {
  if (!tz || typeof tz !== 'string') return false;
  try {
    const dt = DateTime.now().setZone(tz);
    return dt.isValid && dt.zoneName !== null;
  } catch {
    return false;
  }
}

/**
 * Returns the UTC offset string for a timezone at the current moment.
 * e.g. "UTC+05:30"
 * @param {string} tz
 * @returns {string}
 */
function getUtcOffset(tz) {
  if (!isValidTimezone(tz)) {
    throw new Error(`Invalid timezone: "${tz}"`);
  }
  const dt = DateTime.now().setZone(tz);
  const offsetMinutes = dt.offset;
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, '0');
  const mins = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${mins}`;
}

/**
 * Given a cron schedule and a timezone, returns the next N firing times
 * as ISO strings in that timezone.
 * @param {import('./parser').ParsedCron} parsed
 * @param {string} tz
 * @param {number} count
 * @returns {string[]}
 */
function getNextFireTimes(parsed, tz, count = 5) {
  if (!isValidTimezone(tz)) {
    throw new Error(`Invalid timezone: "${tz}"`);
  }
  const { CronJob } = require('cron');
  const results = [];
  const expression = [
    parsed.minute.raw,
    parsed.hour.raw,
    parsed.dom.raw,
    parsed.month.raw,
    parsed.dow.raw,
  ].join(' ');

  let next = DateTime.now().setZone(tz);
  for (let i = 0; i < count; i++) {
    next = nextCronTime(expression, tz, next.plus({ minutes: 1 }));
    if (!next) break;
    results.push(next.toISO());
  }
  return results;
}

/**
 * Lightweight next-cron-time calculator (minute-level granularity).
 * Walks forward minute by minute up to 1 year.
 * @param {string} expression  - 5-part cron string
 * @param {string} tz
 * @param {DateTime} from
 * @returns {DateTime|null}
 */
function nextCronTime(expression, tz, from) {
  const [minE, hourE, domE, monE, dowE] = expression.split(' ');
  const match = (val, expr) => {
    if (expr === '*') return true;
    return expr.split(',').some((part) => {
      if (part.includes('/')) {
        const [range, step] = part.split('/');
        const start = range === '*' ? 0 : parseInt(range, 10);
        return val >= start && (val - start) % parseInt(step, 10) === 0;
      }
      if (part.includes('-')) {
        const [lo, hi] = part.split('-').map(Number);
        return val >= lo && val <= hi;
      }
      return parseInt(part, 10) === val;
    });
  };

  let cursor = from.startOf('minute');
  const limit = from.plus({ years: 1 });
  while (cursor < limit) {
    if (
      match(cursor.month, monE) &&
      match(cursor.day, domE) &&
      match(cursor.weekday % 7, dowE) &&
      match(cursor.hour, hourE) &&
      match(cursor.minute, minE)
    ) {
      return cursor;
    }
    cursor = cursor.plus({ minutes: 1 });
  }
  return null;
}

module.exports = { isValidTimezone, getUtcOffset, getNextFireTimes, nextCronTime };
