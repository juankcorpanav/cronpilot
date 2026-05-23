/**
 * normalize.js
 * Normalizes cron expressions into a canonical form:
 * - Expands aliases (e.g. @weekly -> 0 0 * * 0)
 * - Sorts comma-separated lists
 * - Replaces equivalent shorthand (e.g. */1 -> *)
 * - Uppercases month/weekday names
 */

const { parseCron, resolveAlias } = require('./parser');

/**
 * Normalize a single cron field value.
 * - Sorts comma-separated values numerically/alphabetically
 * - Replaces redundant step (e.g. *\/1 -> *)
 * - Uppercases named values
 *
 * @param {string} field - Raw field string
 * @returns {string} Normalized field string
 */
function normalizeField(field) {
  if (!field || field === '*') return '*';

  // Uppercase named aliases (MON, JAN, etc.)
  field = field.toUpperCase();

  // Replace redundant step */1 with *
  if (field === '*/1') return '*';

  // Handle comma-separated lists: sort and deduplicate
  if (field.includes(',')) {
    const parts = field.split(',').map(p => p.trim()).filter(Boolean);
    const seen = new Set();
    const unique = parts.filter(p => {
      if (seen.has(p)) return false;
      seen.add(p);
      return true;
    });
    // Sort numerically if all parts are integers, otherwise lexically
    const allNumeric = unique.every(p => /^\d+$/.test(p));
    unique.sort(allNumeric ? (a, b) => Number(a) - Number(b) : undefined);
    return unique.join(',');
  }

  return field;
}

/**
 * Normalize a full cron expression into canonical form.
 * Expands @-aliases, normalizes each field.
 *
 * @param {string} expression - Cron expression (standard 5-field or @alias)
 * @returns {{ normalized: string, changed: boolean, original: string }}
 */
function normalize(expression) {
  if (typeof expression !== 'string') {
    throw new TypeError('Expression must be a string');
  }

  const trimmed = expression.trim();

  // Expand @-style aliases first
  const expanded = resolveAlias(trimmed);

  // Validate and parse
  const parsed = parseCron(expanded);
  if (!parsed.valid) {
    return {
      normalized: trimmed,
      changed: false,
      original: trimmed,
      error: parsed.error || 'Invalid expression'
    };
  }

  const fields = expanded.split(/\s+/);
  const normalizedFields = fields.map(normalizeField);
  const normalized = normalizedFields.join(' ');

  return {
    normalized,
    changed: normalized !== expanded || expanded !== trimmed,
    original: trimmed
  };
}

/**
 * Return just the normalized expression string, or the original on failure.
 *
 * @param {string} expression
 * @returns {string}
 */
function normalizeToString(expression) {
  try {
    const result = normalize(expression);
    return result.normalized;
  } catch {
    return expression;
  }
}

/**
 * Check whether two expressions are equivalent after normalization.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function areEquivalent(a, b) {
  return normalizeToString(a) === normalizeToString(b);
}

module.exports = { normalizeField, normalize, normalizeToString, areEquivalent };
