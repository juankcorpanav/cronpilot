/**
 * explain.js — Provides step-by-step field-level explanations for cron expressions.
 */

const { parseCron } = require('./parser');
const { labelValue } = require('./humanizer');

const FIELD_NAMES = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
const FIELD_LABELS = {
  minute: 'Minute',
  hour: 'Hour',
  dayOfMonth: 'Day of Month',
  month: 'Month',
  dayOfWeek: 'Day of Week',
};

/**
 * Returns a plain-English explanation for a single cron field token.
 * @param {string} field - field name
 * @param {string} token - raw token value
 * @returns {string}
 */
function explainToken(field, token) {
  if (token === '*') return `every ${FIELD_LABELS[field].toLowerCase()}`;
  if (token.includes('/')) {
    const [base, step] = token.split('/');
    const baseStr = base === '*' ? 'any' : base;
    return `every ${step} ${FIELD_LABELS[field].toLowerCase()}(s) starting at ${baseStr}`;
  }
  if (token.includes('-')) {
    const [start, end] = token.split('-');
    return `from ${labelValue(field, start)} to ${labelValue(field, end)}`;
  }
  if (token.includes(',')) {
    const parts = token.split(',').map((v) => labelValue(field, v));
    return `at ${parts.join(', ')}`;
  }
  return `at ${labelValue(field, token)}`;
}

/**
 * Explains each field of a cron expression individually.
 * @param {string} expression - cron expression string
 * @returns {{ field: string, raw: string, explanation: string }[]}
 */
function explainFields(expression) {
  const parsed = parseCron(expression);
  return FIELD_NAMES.map((field) => ({
    field: FIELD_LABELS[field],
    raw: parsed[field],
    explanation: explainToken(field, parsed[field]),
  }));
}

/**
 * Returns a structured explanation object for a full cron expression.
 * @param {string} expression
 * @returns {{ expression: string, fields: object[], summary: string }}
 */
function explain(expression) {
  const fields = explainFields(expression);
  const summary = fields.map((f) => `${f.field}: ${f.explanation}`).join('; ');
  return { expression, fields, summary };
}

module.exports = { explainToken, explainFields, explain };
