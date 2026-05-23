/**
 * snapshot.js — Save and restore named cron expression snapshots
 */

const store = {};

/**
 * Save a named snapshot of a cron expression with optional metadata.
 * @param {string} name
 * @param {string} expression
 * @param {object} [meta]
 * @returns {object}
 */
function saveSnapshot(name, expression, meta = {}) {
  if (!name || typeof name !== 'string') throw new Error('Snapshot name must be a non-empty string');
  if (!expression || typeof expression !== 'string') throw new Error('Expression must be a non-empty string');
  const snapshot = {
    name,
    expression,
    meta,
    savedAt: new Date().toISOString()
  };
  store[name] = snapshot;
  return snapshot;
}

/**
 * Retrieve a snapshot by name.
 * @param {string} name
 * @returns {object|null}
 */
function getSnapshot(name) {
  return store[name] || null;
}

/**
 * List all saved snapshots.
 * @returns {object[]}
 */
function listSnapshots() {
  return Object.values(store);
}

/**
 * Remove a snapshot by name.
 * @param {string} name
 * @returns {boolean}
 */
function removeSnapshot(name) {
  if (!store[name]) return false;
  delete store[name];
  return true;
}

/**
 * Clear all snapshots.
 */
function clearSnapshots() {
  Object.keys(store).forEach(k => delete store[k]);
}

/**
 * Check if a snapshot exists.
 * @param {string} name
 * @returns {boolean}
 */
function hasSnapshot(name) {
  return Object.prototype.hasOwnProperty.call(store, name);
}

/**
 * Find snapshots matching a given expression.
 * @param {string} expression
 * @returns {object[]}
 */
function findByExpression(expression) {
  return Object.values(store).filter(s => s.expression === expression);
}

module.exports = {
  saveSnapshot,
  getSnapshot,
  listSnapshots,
  removeSnapshot,
  clearSnapshots,
  hasSnapshot,
  findByExpression
};
