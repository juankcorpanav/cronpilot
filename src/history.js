/**
 * history.js — Track and manage recently used cron expressions
 */

const MAX_HISTORY = 20;

let _store = [];

/**
 * Add a cron expression to history.
 * Moves to top if already present.
 * @param {string} expression
 * @param {object} [meta] - optional metadata (label, timezone, etc.)
 */
function addToHistory(expression, meta = {}) {
  if (typeof expression !== 'string' || !expression.trim()) {
    throw new Error('Expression must be a non-empty string');
  }

  const entry = {
    expression: expression.trim(),
    timestamp: new Date().toISOString(),
    ...meta,
  };

  _store = _store.filter((e) => e.expression !== entry.expression);
  _store.unshift(entry);

  if (_store.length > MAX_HISTORY) {
    _store = _store.slice(0, MAX_HISTORY);
  }

  return entry;
}

/**
 * Retrieve history entries.
 * @param {number} [limit] - max entries to return
 * @returns {Array}
 */
function getHistory(limit) {
  const entries = [..._store];
  return typeof limit === 'number' ? entries.slice(0, limit) : entries;
}

/**
 * Remove a specific expression from history.
 * @param {string} expression
 * @returns {boolean} true if removed
 */
function removeFromHistory(expression) {
  const before = _store.length;
  _store = _store.filter((e) => e.expression !== expression);
  return _store.length < before;
}

/**
 * Clear all history entries.
 */
function clearHistory() {
  _store = [];
}

/**
 * Check whether an expression exists in history.
 * @param {string} expression
 * @returns {boolean}
 */
function inHistory(expression) {
  return _store.some((e) => e.expression === expression);
}

module.exports = {
  addToHistory,
  getHistory,
  removeFromHistory,
  clearHistory,
  inHistory,
  MAX_HISTORY,
};
