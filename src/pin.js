/**
 * pin.js — Pin/bookmark specific cron fire times for reference or comparison
 */

const store = new Map();

/**
 * Pin a specific timestamp associated with a cron expression.
 * @param {string} label - Unique label for this pin
 * @param {string} expression - Cron expression
 * @param {string|Date} timestamp - The fire time to pin
 * @param {string} [note] - Optional note
 * @returns {object} The saved pin
 */
function savePin(label, expression, timestamp, note = '') {
  if (!label || typeof label !== 'string') throw new Error('label must be a non-empty string');
  if (!expression || typeof expression !== 'string') throw new Error('expression must be a non-empty string');
  const ts = timestamp instanceof Date ? timestamp.toISOString() : String(timestamp);
  const pin = { label, expression, timestamp: ts, note, createdAt: new Date().toISOString() };
  store.set(label, pin);
  return pin;
}

/**
 * Retrieve a pin by label.
 * @param {string} label
 * @returns {object|null}
 */
function getPin(label) {
  return store.get(label) || null;
}

/**
 * List all saved pins, optionally filtered by expression.
 * @param {string} [expression]
 * @returns {object[]}
 */
function listPins(expression) {
  const all = Array.from(store.values());
  if (expression) return all.filter(p => p.expression === expression);
  return all;
}

/**
 * Remove a pin by label.
 * @param {string} label
 * @returns {boolean}
 */
function removePin(label) {
  return store.delete(label);
}

/**
 * Clear all pins.
 */
function clearPins() {
  store.clear();
}

/**
 * Check whether a label is already pinned.
 * @param {string} label
 * @returns {boolean}
 */
function isPinned(label) {
  return store.has(label);
}

/**
 * Summarize all pins grouped by expression.
 * @returns {object}
 */
function pinSummary() {
  const summary = {};
  for (const pin of store.values()) {
    if (!summary[pin.expression]) summary[pin.expression] = [];
    summary[pin.expression].push({ label: pin.label, timestamp: pin.timestamp, note: pin.note });
  }
  return summary;
}

module.exports = { savePin, getPin, listPins, removePin, clearPins, isPinned, pinSummary };
