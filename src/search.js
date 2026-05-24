/**
 * search.js — Search cron expressions by description, tags, or pattern
 */

const { humanize } = require('./humanizer');
const { parseCron } = require('./parser');
const { listFavorites } = require('./favorites');
const { getHistory } = require('./history');

/**
 * Check if a cron expression matches a text query against its human description.
 * @param {string} expression
 * @param {string} query
 * @returns {boolean}
 */
function matchesDescription(expression, query) {
  try {
    const desc = humanize(expression).toLowerCase();
    return desc.includes(query.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Check if a cron expression structurally matches a pattern (supports * wildcards in pattern).
 * @param {string} expression
 * @param {string} pattern  e.g. "0 * * * *"
 * @returns {boolean}
 */
function matchesPattern(expression, pattern) {
  try {
    parseCron(expression);
  } catch {
    return false;
  }
  const exprParts = expression.trim().split(/\s+/);
  const patParts = pattern.trim().split(/\s+/);
  if (exprParts.length !== patParts.length) return false;
  return patParts.every((p, i) => p === '*' || p === exprParts[i]);
}

/**
 * Search favorites and history for expressions matching a query.
 * @param {string} query  - text to match against description or label
 * @param {object} [options]
 * @param {boolean} [options.includeFavorites=true]
 * @param {boolean} [options.includeHistory=true]
 * @param {string}  [options.pattern]  - optional structural pattern filter
 * @returns {Array<{expression: string, source: string, label?: string, description: string}>}
 */
function search(query, options = {}) {
  const {
    includeFavorites = true,
    includeHistory = true,
    pattern = null,
  } = options;

  const results = [];
  const seen = new Set();

  const addResult = (expression, source, label) => {
    if (seen.has(expression)) return;
    if (!matchesDescription(expression, query) && !label?.toLowerCase().includes(query.toLowerCase())) return;
    if (pattern && !matchesPattern(expression, pattern)) return;
    seen.add(expression);
    let description = '';
    try { description = humanize(expression); } catch { description = '(invalid)'; }
    results.push({ expression, source, label: label || null, description });
  };

  if (includeFavorites) {
    for (const fav of listFavorites()) {
      addResult(fav.expression, 'favorite', fav.label);
    }
  }

  if (includeHistory) {
    for (const entry of getHistory()) {
      addResult(entry.expression, 'history', entry.label);
    }
  }

  return results;
}

/**
 * Return the top N search results.
 * @param {string} query
 * @param {number} [limit=5]
 * @param {object} [options]
 * @returns {Array}
 */
function topResults(query, limit = 5, options = {}) {
  return search(query, options).slice(0, limit);
}

module.exports = { matchesDescription, matchesPattern, search, topResults };
