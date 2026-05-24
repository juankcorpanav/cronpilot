/**
 * watch.js — Monitor cron expressions for changes and emit events
 */

const watchers = new Map();

/**
 * Start watching a named cron expression for changes.
 * @param {string} name - Unique identifier for this watcher
 * @param {string} expression - Initial cron expression
 * @param {function} callback - Called with (newExpr, oldExpr, name) on change
 * @returns {{ id: string, expression: string, createdAt: Date }}
 */
function watch(name, expression, callback) {
  if (typeof name !== 'string' || !name.trim()) throw new Error('name must be a non-empty string');
  if (typeof callback !== 'function') throw new Error('callback must be a function');

  const entry = {
    id: name,
    expression,
    callback,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  watchers.set(name, entry);
  return { id: name, expression, createdAt: entry.createdAt };
}

/**
 * Update the expression for a watcher, triggering its callback if changed.
 * @param {string} name
 * @param {string} newExpression
 * @returns {boolean} true if expression changed
 */
function update(name, newExpression) {
  const entry = watchers.get(name);
  if (!entry) throw new Error(`No watcher found with name: ${name}`);

  const oldExpression = entry.expression;
  if (oldExpression === newExpression) return false;

  entry.expression = newExpression;
  entry.updatedAt = new Date();
  entry.callback(newExpression, oldExpression, name);
  return true;
}

/**
 * Stop watching a named expression.
 * @param {string} name
 * @returns {boolean}
 */
function unwatch(name) {
  return watchers.delete(name);
}

/**
 * Get current state of a watcher.
 * @param {string} name
 * @returns {{ id, expression, createdAt, updatedAt } | null}
 */
function getWatcher(name) {
  const entry = watchers.get(name);
  if (!entry) return null;
  return { id: entry.id, expression: entry.expression, createdAt: entry.createdAt, updatedAt: entry.updatedAt };
}

/**
 * List all active watchers.
 * @returns {Array}
 */
function listWatchers() {
  return Array.from(watchers.values()).map(e => ({
    id: e.id,
    expression: e.expression,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt
  }));
}

/**
 * Remove all watchers.
 */
function clearWatchers() {
  watchers.clear();
}

module.exports = { watch, update, unwatch, getWatcher, listWatchers, clearWatchers };
