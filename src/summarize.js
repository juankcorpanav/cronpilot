const { humanize } = require('./humanizer');
const { getUtcOffset } = require('./timezone');
const { isValid } = require('./validate');
const { getPresets, findPresetByExpression } = require('./presets');
const { lint } = require('./lint');

/**
 * Returns a concise one-line summary of a cron expression.
 * @param {string} expression
 * @param {string} [timezone]
 * @returns {string}
 */
function summarize(expression, timezone) {
  if (!isValid(expression)) {
    return `Invalid expression: "${expression}"`;
  }

  const human = humanize(expression);
  if (!timezone) return human;

  const offset = getUtcOffset(timezone);
  if (offset === null) {
    return `${human} (unknown timezone: ${timezone})`;
  }

  return `${human} (${timezone}, UTC${offset})`;
}

/**
 * Returns a structured summary object with metadata about the expression.
 * @param {string} expression
 * @param {string} [timezone]
 * @returns {object}
 */
function summaryReport(expression, timezone) {
  const valid = isValid(expression);
  if (!valid) {
    return { expression, valid: false, error: 'Invalid cron expression' };
  }

  const fields = expression.trim().split(/\s+/);
  const [minute, hour, dom, month, dow] = fields;

  const preset = findPresetByExpression(expression);
  const warnings = lint(expression);
  const human = humanize(expression);

  const report = {
    expression,
    valid: true,
    human,
    fields: { minute, hour, dom, month, dow },
    preset: preset ? preset.name : null,
    warnings: warnings.length > 0 ? warnings : null,
  };

  if (timezone) {
    const offset = getUtcOffset(timezone);
    report.timezone = timezone;
    report.utcOffset = offset !== null ? offset : 'unknown';
  }

  return report;
}

module.exports = { summarize, summaryReport };
