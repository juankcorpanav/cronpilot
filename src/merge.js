/**
 * merge.js — Merge two cron expressions into a unified schedule
 * Supports union and intersection strategies for combining fields.
 */

const { parseField, parseCron } = require('./parser');
const { normalizeField } = require('./normalize');

const FIELD_NAMES = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

/**
 * Compute the union of two parsed field value sets.
 * Returns '*' if either side is wildcard, otherwise merges unique values.
 */
function unionField(a, b) {
  if (a.type === 'wildcard' || b.type === 'wildcard') {
    return { type: 'wildcard', values: null };
  }
  const combined = Array.from(new Set([...a.values, ...b.values])).sort((x, y) => x - y);
  return { type: 'list', values: combined };
}

/**
 * Compute the intersection of two parsed field value sets.
 * Returns null if the intersection is empty (incompatible fields).
 */
function intersectField(a, b) {
  if (a.type === 'wildcard') return b;
  if (b.type === 'wildcard') return a;
  const shared = a.values.filter(v => b.values.includes(v));
  if (shared.length === 0) return null;
  return { type: 'list', values: shared };
}

/**
 * Render a parsed field back to a cron field string.
 */
function renderField(field) {
  if (!field || field.type === 'wildcard') return '*';
  return field.values.join(',');
}

/**
 * Merge two cron expressions using a given strategy.
 * @param {string} exprA - First cron expression
 * @param {string} exprB - Second cron expression
 * @param {object} options
 * @param {'union'|'intersect'} options.strategy - Merge strategy (default: 'union')
 * @returns {{ expression: string, fields: object, conflicts: string[] }}
 */
function mergeExpressions(exprA, exprB, options = {}) {
  const strategy = options.strategy || 'union';
  const parsedA = parseCron(exprA);
  const parsedB = parseCron(exprB);
  const mergedFields = {};
  const conflicts = [];

  for (const name of FIELD_NAMES) {
    const fieldA = parseField(parsedA[name], name);
    const fieldB = parseField(parsedB[name], name);

    let result;
    if (strategy === 'intersect') {
      result = intersectField(fieldA, fieldB);
      if (result === null) {
        conflicts.push(name);
        result = fieldA; // fallback to first expression's field
      }
    } else {
      result = unionField(fieldA, fieldB);
    }

    mergedFields[name] = renderField(result);
  }

  const expression = [
    mergedFields.minute,
    mergedFields.hour,
    mergedFields.dayOfMonth,
    mergedFields.month,
    mergedFields.dayOfWeek
  ].join(' ');

  return { expression, fields: mergedFields, conflicts, strategy };
}

module.exports = { unionField, intersectField, renderField, mergeExpressions };
