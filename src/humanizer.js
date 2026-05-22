/**
 * humanizer.js
 * Converts parsed cron expressions into human-readable descriptions.
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

function describeField(field, type) {
  const { value, step, range, list } = field;

  if (value === '*' && !step) return null;

  if (list) {
    const labels = list.map(v => labelValue(v, type));
    return labels.join(', ');
  }

  if (range) {
    const from = labelValue(range[0], type);
    const to = labelValue(range[1], type);
    const base = `${from} through ${to}`;
    return step ? `every ${step} from ${base}` : base;
  }

  if (value === '*' && step) {
    return `every ${step} ${type}(s)`;
  }

  if (step) {
    return `every ${step} ${type}(s) starting at ${labelValue(value, type)}`;
  }

  return `at ${labelValue(value, type)}`;
}

function labelValue(value, type) {
  if (type === 'month') {
    const idx = parseInt(value, 10);
    return isNaN(idx) ? value : MONTH_NAMES[idx - 1] || value;
  }
  if (type === 'weekday') {
    const idx = parseInt(value, 10);
    return isNaN(idx) ? value : DAY_NAMES[idx] || value;
  }
  return String(value);
}

/**
 * @param {object} parsed - Result of parseCron()
 * @param {string} [timezone] - Optional IANA timezone string
 * @returns {string} Human-readable description
 */
function humanize(parsed, timezone) {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = parsed;

  const parts = [];

  const minuteDesc = describeField(minute, 'minute');
  const hourDesc = describeField(hour, 'hour');

  if (!minuteDesc && !hourDesc) {
    parts.push('every minute');
  } else if (!minuteDesc) {
    parts.push(`every minute of ${hourDesc || 'every hour'}`);
  } else if (!hourDesc) {
    parts.push(`at minute ${minuteDesc} of every hour`);
  } else {
    parts.push(`at ${hourDesc}:${minuteDesc}`);
  }

  const domDesc = describeField(dayOfMonth, 'day');
  const monthDesc = describeField(month, 'month');
  const dowDesc = describeField(dayOfWeek, 'weekday');

  if (domDesc) parts.push(`on day ${domDesc} of the month`);
  if (monthDesc) parts.push(`in ${monthDesc}`);
  if (dowDesc) parts.push(`on ${dowDesc}`);

  if (timezone) parts.push(`(${timezone})`);

  return parts.join(', ');
}

module.exports = { humanize, describeField, labelValue };
