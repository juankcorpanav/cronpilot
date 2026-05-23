/**
 * alias.js — Named alias management for cron expressions
 * Allows saving, retrieving, and resolving named aliases for cron expressions.
 */

const store = new Map();

/**
 * Save a named alias for a cron expression.
 * @param {string} name
 * @param {string} expression
 * @param {string} [description]
 * @returns {{ name: string, expression: string, description: string, createdAt: string }}
 */
function saveAlias(name, expression, description = '') {
  if (!name || typeof name !== 'string') throw new Error('Alias name must be a non-empty string');
  if (!expression || typeof expression !== 'string') throw new Error('Expression must be a non-empty string');
  const alias = { name, expression, description, createdAt: new Date().toISOString() };
  store.set(name, alias);
  return alias;
}

/**
 * Retrieve an alias by name.
 * @param {string} name
 * @returns {{ name: string, expression: string, description: string, createdAt: string } | null}
 */
function getAlias(name) {
  return store.get(name) || null;
}

/**
 * Resolve an alias name to its cron expression string.
 * @param {string} name
 * @returns {string | null}
 */
function resolveAlias(name) {
  const alias = store.get(name);
  return alias ? alias.expression : null;
}

/**
 * List all saved aliases.
 * @returns {Array}
 */
function listAliases() {
  return Array.from(store.values());
}

/**
 * Remove an alias by name.
 * @param {string} name
 * @returns {boolean}
 */
function removeAlias(name) {
  return store.delete(name);
}

/**
 * Clear all aliases.
 */
function clearAliases() {
  store.clear();
}

/**
 * Find aliases whose expression matches a given cron string.
 * @param {string} expression
 * @returns {Array}
 */
function findByExpression(expression) {
  return listAliases().filter(a => a.expression === expression);
}

module.exports = { saveAlias, getAlias, resolveAlias, listAliases, removeAlias, clearAliases, findByExpression };
