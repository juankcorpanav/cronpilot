/**
 * matrix.js — Build a comparison matrix for multiple cron expressions
 */

import { compareExpressions } from './compare.js';
import { humanize } from './humanizer.js';

/**
 * Build a pairwise comparison matrix for an array of cron expressions.
 * @param {string[]} expressions
 * @returns {{ labels: string[], matrix: boolean[][] }}
 */
export function buildMatrix(expressions) {
  if (!Array.isArray(expressions) || expressions.length < 2) {
    throw new Error('At least two expressions are required for a matrix.');
  }

  const labels = expressions.map((expr) => {
    try {
      return humanize(expr);
    } catch {
      return expr;
    }
  });

  const size = expressions.length;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i === j) {
        matrix[i][j] = true;
        continue;
      }
      try {
        const { equal } = compareExpressions(expressions[i], expressions[j]);
        matrix[i][j] = equal;
      } catch {
        matrix[i][j] = false;
      }
    }
  }

  return { labels, matrix };
}

/**
 * Find groups of equivalent expressions from a list.
 * @param {string[]} expressions
 * @returns {string[][]}
 */
export function findEquivalentGroups(expressions) {
  const { matrix } = buildMatrix(expressions);
  const visited = new Set();
  const groups = [];

  for (let i = 0; i < expressions.length; i++) {
    if (visited.has(i)) continue;
    const group = [expressions[i]];
    visited.add(i);
    for (let j = i + 1; j < expressions.length; j++) {
      if (!visited.has(j) && matrix[i][j]) {
        group.push(expressions[j]);
        visited.add(j);
      }
    }
    groups.push(group);
  }

  return groups;
}
