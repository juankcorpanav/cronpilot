/**
 * compare.js — Compare two cron expressions and summarize their differences
 */

import { parseCron } from './parser.js';
import { humanize } from './humanizer.js';

const FIELD_NAMES = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

/**
 * Returns true if two field strings are semantically equivalent.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function fieldsEqual(a, b) {
  if (a === b) return true;
  const normalize = (s) => s.split(',').map((v) => v.trim()).sort().join(',');
  return normalize(a) === normalize(b);
}

/**
 * Compare two cron expressions field by field.
 * @param {string} exprA
 * @param {string} exprB
 * @returns {{ equal: boolean, differences: Array<{ field: string, a: string, b: string }> }}
 */
export function compareExpressions(exprA, exprB) {
  const parsedA = parseCron(exprA);
  const parsedB = parseCron(exprB);

  if (!parsedA.valid) throw new Error(`Invalid expression A: ${parsedA.error}`);
  if (!parsedB.valid) throw new Error(`Invalid expression B: ${parsedB.error}`);

  const differences = [];

  FIELD_NAMES.forEach((field, i) => {
    const a = parsedA.fields[i];
    const b = parsedB.fields[i];
    if (!fieldsEqual(a, b)) {
      differences.push({ field, a, b });
    }
  });

  return {
    equal: differences.length === 0,
    differences,
  };
}

/**
 * Produce a human-readable summary of the comparison.
 * @param {string} exprA
 * @param {string} exprB
 * @returns {string}
 */
export function compareSummary(exprA, exprB) {
  const { equal, differences } = compareExpressions(exprA, exprB);

  if (equal) {
    return `Both expressions are equivalent: "${humanize(exprA)}".`;
  }

  const lines = [`Expressions differ in ${differences.length} field(s):`];
  differences.forEach(({ field, a, b }) => {
    lines.push(`  ${field}: "${a}" → "${b}"`);
  });
  lines.push(`A: ${humanize(exprA)}`);
  lines.push(`B: ${humanize(exprB)}`);

  return lines.join('\n');
}
