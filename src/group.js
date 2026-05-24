/**
 * group.js — Group and organize cron expressions into named collections
 */

const store = {};

/**
 * Create a new group or add expressions to an existing one.
 * @param {string} name - Group name
 * @param {string[]} expressions - Cron expressions to add
 * @returns {object} Updated group
 */
function addToGroup(name, expressions = []) {
  if (!name || typeof name !== 'string') throw new Error('Group name must be a non-empty string');
  if (!store[name]) store[name] = { name, expressions: [], createdAt: new Date().toISOString() };
  for (const expr of expressions) {
    if (!store[name].expressions.includes(expr)) {
      store[name].expressions.push(expr);
    }
  }
  store[name].updatedAt = new Date().toISOString();
  return { ...store[name], expressions: [...store[name].expressions] };
}

/**
 * Get a group by name.
 * @param {string} name
 * @returns {object|null}
 */
function getGroup(name) {
  if (!store[name]) return null;
  return { ...store[name], expressions: [...store[name].expressions] };
}

/**
 * List all group names.
 * @returns {string[]}
 */
function listGroups() {
  return Object.keys(store);
}

/**
 * Remove an expression from a group.
 * @param {string} name
 * @param {string} expression
 * @returns {boolean} true if removed
 */
function removeFromGroup(name, expression) {
  if (!store[name]) return false;
  const idx = store[name].expressions.indexOf(expression);
  if (idx === -1) return false;
  store[name].expressions.splice(idx, 1);
  store[name].updatedAt = new Date().toISOString();
  return true;
}

/**
 * Delete an entire group.
 * @param {string} name
 * @returns {boolean}
 */
function deleteGroup(name) {
  if (!store[name]) return false;
  delete store[name];
  return true;
}

/**
 * Find all groups that contain a given expression.
 * @param {string} expression
 * @returns {string[]}
 */
function findGroupsByExpression(expression) {
  return Object.keys(store).filter(name => store[name].expressions.includes(expression));
}

/**
 * Merge two groups into a new group.
 * @param {string} nameA
 * @param {string} nameB
 * @param {string} targetName
 * @returns {object} Merged group
 */
function mergeGroups(nameA, nameB, targetName) {
  const a = store[nameA] ? store[nameA].expressions : [];
  const b = store[nameB] ? store[nameB].expressions : [];
  const merged = Array.from(new Set([...a, ...b]));
  return addToGroup(targetName, merged);
}

/**
 * Clear all groups (useful for testing).
 */
function clearGroups() {
  for (const key of Object.keys(store)) delete store[key];
}

module.exports = { addToGroup, getGroup, listGroups, removeFromGroup, deleteGroup, findGroupsByExpression, mergeGroups, clearGroups };
