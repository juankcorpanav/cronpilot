/**
 * diff.js — Compare two cron expressions and describe their differences
 */

const { parseCron } = require('./parser');
const { humanize } = require('./humanizer');

const FIELD_NAMES = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

/**
 * Compare two parsed cron fields and return a diff entry if they differ.
 * @param {string} fieldName
 * @param {string} a
 * @param {string} b
 * @returns {object|null}
 */
function diffField(fieldName, a, b) {
  if (a === b) return null;
  return { field: fieldName, from: a, to: b };
}

/**
 * Compare two cron expressions and return a structured diff.
 * @param {string} exprA
 * @param {string} exprB
 * @returns {{ changes: Array, fromHuman: string, toHuman: string, identical: boolean }}
 */
function diffExpressions(exprA, exprB) {
  const parsedA = parseCron(exprA);
  const parsedB = parseCron(exprB);

  if (!parsedA.valid) throw new Error(`Invalid expression A: ${parsedA.errors.join(', ')}`);
  if (!parsedB.valid) throw new Error(`Invalid expression B: ${parsedB.errors.join(', ')}`);

  const fieldsA = parsedA.fields;
  const fieldsB = parsedB.fields;

  const changes = FIELD_NAMES
    .map(name => diffField(name, fieldsA[name], fieldsB[name]))
    .filter(Boolean);

  return {
    identical: changes.length === 0,
    changes,
    fromHuman: humanize(exprA),
    toHuman: humanize(exprB),
  };
}

/**
 * Produce a human-readable summary of the diff.
 * @param {string} exprA
 * @param {string} exprB
 * @returns {string}
 */
function describeDiff(exprA, exprB) {
  const diff = diffExpressions(exprA, exprB);

  if (diff.identical) {
    return 'The two expressions are identical.';
  }

  const lines = [
    `From: ${diff.fromHuman}`,
    `To:   ${diff.toHuman}`,
    '',
    `Changed fields (${diff.changes.length}):`,
    ...diff.changes.map(c => `  • ${c.field}: "${c.from}" → "${c.to}"`),
  ];

  return lines.join('\n');
}

module.exports = { diffField, diffExpressions, describeDiff };
