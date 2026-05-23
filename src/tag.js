/**
 * tag.js — Tag/label management for cron expressions
 * Allows users to attach tags to expressions for organization and filtering.
 */

let store = {};

/**
 * Add one or more tags to an expression.
 * @param {string} expression
 * @param {string|string[]} tags
 * @returns {string[]} updated tag list
 */
function addTags(expression, tags) {
  if (!expression) throw new Error('Expression is required');
  const tagList = Array.isArray(tags) ? tags : [tags];
  if (!store[expression]) store[expression] = [];
  for (const tag of tagList) {
    const t = tag.trim().toLowerCase();
    if (t && !store[expression].includes(t)) {
      store[expression].push(t);
    }
  }
  return [...store[expression]];
}

/**
 * Get all tags for an expression.
 * @param {string} expression
 * @returns {string[]}
 */
function getTags(expression) {
  return [...(store[expression] || [])];
}

/**
 * Remove a specific tag from an expression.
 * @param {string} expression
 * @param {string} tag
 * @returns {string[]} updated tag list
 */
function removeTag(expression, tag) {
  if (!store[expression]) return [];
  const t = tag.trim().toLowerCase();
  store[expression] = store[expression].filter(x => x !== t);
  return [...store[expression]];
}

/**
 * Find all expressions that have a given tag.
 * @param {string} tag
 * @returns {string[]}
 */
function findByTag(tag) {
  const t = tag.trim().toLowerCase();
  return Object.entries(store)
    .filter(([, tags]) => tags.includes(t))
    .map(([expr]) => expr);
}

/**
 * List all unique tags across all expressions.
 * @returns {string[]}
 */
function listAllTags() {
  const all = new Set();
  for (const tags of Object.values(store)) {
    for (const tag of tags) all.add(tag);
  }
  return [...all].sort();
}

/**
 * Clear all tags for an expression.
 * @param {string} expression
 */
function clearTags(expression) {
  delete store[expression];
}

/**
 * Reset entire tag store (useful for testing).
 */
function _reset() {
  store = {};
}

module.exports = { addTags, getTags, removeTag, findByTag, listAllTags, clearTags, _reset };
