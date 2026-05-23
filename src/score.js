/**
 * score.js — Rates a cron expression on readability, specificity, and safety.
 */

const { parseCron } = require('./parser');
const { lint } = require('./lint');

const WEIGHTS = {
  readability: 0.4,
  specificity: 0.35,
  safety: 0.25,
};

/**
 * Score readability: penalize wildcards and complex ranges/steps.
 */
function scoreReadability(fields) {
  let score = 100;
  for (const field of fields) {
    if (field === '*') score -= 5;
    else if (field.includes('/')) score -= 8;
    else if (field.includes(',') && field.split(',').length > 4) score -= 10;
    else if (field.includes('-')) score -= 3;
  }
  return Math.max(0, score);
}

/**
 * Score specificity: more constrained expressions score higher.
 */
function scoreSpecificity(fields) {
  const wildcards = fields.filter(f => f === '*').length;
  const base = 100 - wildcards * 18;
  return Math.max(0, base);
}

/**
 * Score safety: penalize expressions that fire very frequently.
 */
function scoreSafety(fields) {
  const [minute, hour] = fields;
  let score = 100;
  if (minute === '*') score -= 40;
  if (minute.includes('/') && parseInt(minute.split('/')[1], 10) < 5) score -= 20;
  if (hour === '*' && minute === '*') score -= 20;
  return Math.max(0, score);
}

/**
 * Score a cron expression and return a breakdown.
 * @param {string} expression
 * @returns {{ total: number, readability: number, specificity: number, safety: number, grade: string, warnings: string[] }}
 */
function scoreCron(expression) {
  const parsed = parseCron(expression);
  if (!parsed.valid) {
    return { total: 0, readability: 0, specificity: 0, safety: 0, grade: 'F', warnings: parsed.errors || ['Invalid expression'] };
  }

  const fields = [parsed.minute, parsed.hour, parsed.dayOfMonth, parsed.month, parsed.dayOfWeek];
  const readability = scoreReadability(fields);
  const specificity = scoreSpecificity(fields);
  const safety = scoreSafety(fields);

  const total = Math.round(
    readability * WEIGHTS.readability +
    specificity * WEIGHTS.specificity +
    safety * WEIGHTS.safety
  );

  const lintResult = lint(expression);
  const warnings = lintResult.issues ? lintResult.issues.map(i => i.message) : [];

  const grade =
    total >= 90 ? 'A' :
    total >= 75 ? 'B' :
    total >= 60 ? 'C' :
    total >= 45 ? 'D' : 'F';

  return { total, readability, specificity, safety, grade, warnings };
}

/**
 * Returns just the numeric total score (0–100).
 * @param {string} expression
 * @returns {number}
 */
function quickScore(expression) {
  return scoreCron(expression).total;
}

module.exports = { scoreCron, quickScore, scoreReadability, scoreSpecificity, scoreSafety };
