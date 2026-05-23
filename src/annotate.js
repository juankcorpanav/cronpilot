/**
 * annotate.js — Attach human-readable annotations to cron expressions
 */

const store = new Map();

/**
 * Add or update an annotation for a cron expression.
 * @param {string} expression
 * @param {string} note
 * @returns {{ expression: string, note: string, updatedAt: string }}
 */
function annotate(expression, note) {
  if (typeof expression !== 'string' || !expression.trim()) {
    throw new Error('expression must be a non-empty string');
  }
  if (typeof note !== 'string') {
    throw new Error('note must be a string');
  }
  const entry = {
    expression: expression.trim(),
    note: note.trim(),
    updatedAt: new Date().toISOString()
  };
  store.set(entry.expression, entry);
  return entry;
}

/**
 * Retrieve the annotation for a cron expression.
 * @param {string} expression
 * @returns {{ expression: string, note: string, updatedAt: string } | null}
 */
function getAnnotation(expression) {
  return store.get(expression?.trim()) ?? null;
}

/**
 * Remove the annotation for a cron expression.
 * @param {string} expression
 * @returns {boolean} true if removed, false if not found
 */
function removeAnnotation(expression) {
  return store.delete(expression?.trim());
}

/**
 * List all annotated expressions.
 * @returns {Array<{ expression: string, note: string, updatedAt: string }>}
 */
function listAnnotations() {
  return Array.from(store.values());
}

/**
 * Search annotations whose note contains the given query (case-insensitive).
 * @param {string} query
 * @returns {Array<{ expression: string, note: string, updatedAt: string }>}
 */
function searchAnnotations(query) {
  if (typeof query !== 'string') return [];
  const lower = query.toLowerCase();
  return listAnnotations().filter(a => a.note.toLowerCase().includes(lower));
}

/**
 * Clear all annotations.
 */
function clearAnnotations() {
  store.clear();
}

module.exports = {
  annotate,
  getAnnotation,
  removeAnnotation,
  listAnnotations,
  searchAnnotations,
  clearAnnotations
};
