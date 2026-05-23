/**
 * convert.js — Convert cron expressions between formats and standards
 * Supports: standard 5-field, quartz 6/7-field, unix, AWS, GCP
 */

const QUARTZ_TO_STANDARD = { '?': '*' };

/**
 * Detect the format of a cron expression.
 * @param {string} expression
 * @returns {'standard'|'quartz'|'unknown'}
 */
function detectFormat(expression) {
  if (typeof expression !== 'string') return 'unknown';
  const parts = expression.trim().split(/\s+/);
  if (parts.length === 5) return 'standard';
  if (parts.length === 6 || parts.length === 7) return 'quartz';
  return 'unknown';
}

/**
 * Convert a Quartz cron expression (6 or 7 fields) to a standard 5-field expression.
 * Quartz format: seconds minutes hours day-of-month month day-of-week [year]
 * Standard format: minutes hours day-of-month month day-of-week
 * @param {string} expression
 * @returns {{ expression: string, warnings: string[] }}
 */
function fromQuartz(expression) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 6) {
    throw new Error('Quartz expression must have at least 6 fields');
  }
  const warnings = [];
  // Drop seconds (index 0) and optional year (index 6)
  const [, minutes, hours, dom, month, dow] = parts;
  if (parts[0] !== '0') {
    warnings.push(`Seconds field "${parts[0]}" dropped; standard cron does not support seconds`);
  }
  if (parts.length === 7 && parts[6] !== '*') {
    warnings.push(`Year field "${parts[6]}" dropped; standard cron does not support year`);
  }
  const normalize = (v) => QUARTZ_TO_STANDARD[v] || v;
  const result = [minutes, hours, dom, month, dow].map(normalize).join(' ');
  return { expression: result, warnings };
}

/**
 * Convert a standard 5-field cron expression to Quartz format.
 * Prepends a '0' seconds field and appends an optional year field.
 * @param {string} expression
 * @param {{ includeYear?: boolean }} options
 * @returns {string}
 */
function toQuartz(expression, { includeYear = false } = {}) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error('Standard expression must have exactly 5 fields');
  }
  const quartz = ['0', ...parts];
  if (includeYear) quartz.push('*');
  return quartz.join(' ');
}

/**
 * Convert a cron expression to an AWS EventBridge rate/cron expression string.
 * AWS cron format wraps the expression: cron(min hr dom mon dow year)
 * @param {string} expression
 * @returns {string}
 */
function toAwsEventBridge(expression) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error('Standard expression must have exactly 5 fields');
  }
  const [min, hr, dom, mon, dow] = parts;
  return `cron(${min} ${hr} ${dom} ${mon} ${dow} *)`;
}

/**
 * Parse an AWS EventBridge cron(...) expression back to standard 5-field.
 * @param {string} awsExpression
 * @returns {string}
 */
function fromAwsEventBridge(awsExpression) {
  const match = awsExpression.trim().match(/^cron\((.+)\)$/);
  if (!match) throw new Error('Invalid AWS EventBridge expression format');
  const parts = match[1].trim().split(/\s+/);
  if (parts.length < 5) throw new Error('AWS cron expression must have at least 5 fields inside cron()');
  // Drop year field (last)
  return parts.slice(0, 5).join(' ');
}

module.exports = { detectFormat, fromQuartz, toQuartz, toAwsEventBridge, fromAwsEventBridge };
