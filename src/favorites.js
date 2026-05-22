/**
 * favorites.js — Save, retrieve and manage favourite cron expressions
 */

let _favorites = new Map();

/**
 * Save a cron expression as a favourite with a required label.
 * @param {string} label - unique human-readable name
 * @param {string} expression
 * @param {object} [meta]
 * @returns {object} saved favourite entry
 */
function saveFavorite(label, expression, meta = {}) {
  if (!label || typeof label !== 'string') throw new Error('Label is required');
  if (!expression || typeof expression !== 'string') throw new Error('Expression is required');

  const entry = {
    label: label.trim(),
    expression: expression.trim(),
    createdAt: _favorites.has(label.trim())
      ? _favorites.get(label.trim()).createdAt
      : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...meta,
  };

  _favorites.set(entry.label, entry);
  return entry;
}

/**
 * Retrieve a favourite by label.
 * @param {string} label
 * @returns {object|null}
 */
function getFavorite(label) {
  return _favorites.get(label) || null;
}

/**
 * List all saved favourites.
 * @returns {Array}
 */
function listFavorites() {
  return Array.from(_favorites.values());
}

/**
 * Remove a favourite by label.
 * @param {string} label
 * @returns {boolean}
 */
function removeFavorite(label) {
  return _favorites.delete(label);
}

/**
 * Find favourites whose expression matches exactly.
 * @param {string} expression
 * @returns {Array}
 */
function findByExpression(expression) {
  return listFavorites().filter((f) => f.expression === expression.trim());
}

/**
 * Clear all favourites.
 */
function clearFavorites() {
  _favorites = new Map();
}

module.exports = {
  saveFavorite,
  getFavorite,
  listFavorites,
  removeFavorite,
  findByExpression,
  clearFavorites,
};
