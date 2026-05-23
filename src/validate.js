const { parseCron } = require('./parser');
const { lint } = require('./lint');
const { isValidTimezone } = require('./timezone');

/**
 * Validates a cron expression and returns a detailed result object.
 * @param {string} expression - The cron expression to validate.
 * @param {object} [options={}] - Options including optional timezone.
 * @returns {object} Validation result with valid flag, errors, and warnings.
 */
function validateExpression(expression, options = {}) {
  const result = {
    valid: false,
    expression,
    errors: [],
    warnings: [],
    fields: null,
  };

  if (!expression || typeof expression !== 'string') {
    result.errors.push('Expression must be a non-empty string.');
    return result;
  }

  const trimmed = expression.trim();

  let parsed;
  try {
    parsed = parseCron(trimmed);
  } catch (err) {
    result.errors.push(err.message || 'Failed to parse expression.');
    return result;
  }

  result.fields = parsed;

  const lintResult = lint(trimmed);
  if (lintResult.errors && lintResult.errors.length > 0) {
    result.errors.push(...lintResult.errors);
  }
  if (lintResult.warnings && lintResult.warnings.length > 0) {
    result.warnings.push(...lintResult.warnings);
  }

  if (options.timezone) {
    if (!isValidTimezone(options.timezone)) {
      result.errors.push(`Invalid timezone: "${options.timezone}".`);
    }
  }

  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Returns true if the expression is valid, false otherwise.
 * @param {string} expression
 * @param {object} [options={}]
 * @returns {boolean}
 */
function isValid(expression, options = {}) {
  return validateExpression(expression, options).valid;
}

module.exports = { validateExpression, isValid };
