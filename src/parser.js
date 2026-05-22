/**
 * CronPilot - Cron Expression Parser
 * Parses and validates cron expressions into structured objects.
 */

const FIELD_NAMES = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
const FIELD_RANGES = {
  minute:     { min: 0, max: 59 },
  hour:       { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month:      { min: 1, max: 12 },
  dayOfWeek:  { min: 0, max: 7  },
};

const MONTH_ALIASES = {
  jan:1, feb:2, mar:3, apr:4, may:5, jun:6,
  jul:7, aug:8, sep:9, oct:10, nov:11, dec:12,
};

const DOW_ALIASES = {
  sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6,
};

function resolveAlias(value, aliases) {
  const lower = value.toLowerCase();
  return aliases[lower] !== undefined ? String(aliases[lower]) : value;
}

function validateValue(value, field) {
  const num = Number(value);
  if (!Number.isInteger(num)) throw new Error(`Invalid value "${value}" for field "${field}"`);
  const { min, max } = FIELD_RANGES[field];
  if (num < min || num > max) {
    throw new Error(`Value ${num} out of range [${min}-${max}] for field "${field}"`);
  }
  return num;
}

function parseField(raw, field) {
  const aliases = field === 'month' ? MONTH_ALIASES : field === 'dayOfWeek' ? DOW_ALIASES : {};
  const token = resolveAlias(raw.trim(), aliases);

  if (token === '*') return { type: 'any' };

  if (token.includes('/')) {
    const [base, step] = token.split('/');
    const stepNum = Number(step);
    if (!Number.isInteger(stepNum) || stepNum < 1) throw new Error(`Invalid step "${step}" in field "${field}"`);
    const baseVal = base === '*' ? FIELD_RANGES[field].min : validateValue(base, field);
    return { type: 'step', base: baseVal, step: stepNum };
  }

  if (token.includes('-')) {
    const [start, end] = token.split('-').map(v => validateValue(resolveAlias(v, aliases), field));
    if (start > end) throw new Error(`Invalid range ${start}-${end} in field "${field}"`);
    return { type: 'range', start, end };
  }

  if (token.includes(',')) {
    const values = token.split(',').map(v => validateValue(resolveAlias(v.trim(), aliases), field));
    return { type: 'list', values };
  }

  return { type: 'exact', value: validateValue(token, field) };
}

function parseCron(expression) {
  if (typeof expression !== 'string') throw new Error('Expression must be a string');
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error(`Expected 5 fields, got ${parts.length}`);

  const result = {};
  FIELD_NAMES.forEach((field, i) => {
    result[field] = parseField(parts[i], field);
  });
  result.raw = expression.trim();
  return result;
}

module.exports = { parseCron, FIELD_NAMES, FIELD_RANGES };
