/**
 * audit.js — Track changes and usage events for cron expressions
 */

const _log = [];

const EVENT_TYPES = ['created', 'updated', 'deleted', 'validated', 'fired', 'exported'];

/**
 * Add an audit event
 * @param {string} expression
 * @param {string} eventType
 * @param {object} [meta]
 * @returns {object} audit entry
 */
function addAuditEvent(expression, eventType, meta = {}) {
  if (!expression || typeof expression !== 'string') throw new Error('expression is required');
  if (!EVENT_TYPES.includes(eventType)) throw new Error(`Unknown event type: ${eventType}`);

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    expression,
    eventType,
    timestamp: new Date().toISOString(),
    meta,
  };

  _log.push(entry);
  return entry;
}

/**
 * Get all audit events, optionally filtered
 * @param {object} [filters]
 * @returns {object[]}
 */
function getAuditLog(filters = {}) {
  let results = [..._log];
  if (filters.expression) results = results.filter(e => e.expression === filters.expression);
  if (filters.eventType) results = results.filter(e => e.eventType === filters.eventType);
  if (filters.since) results = results.filter(e => e.timestamp >= filters.since);
  if (filters.until) results = results.filter(e => e.timestamp <= filters.until);
  return results;
}

/**
 * Get audit summary for an expression
 * @param {string} expression
 * @returns {object}
 */
function auditSummary(expression) {
  const events = getAuditLog({ expression });
  const counts = {};
  for (const type of EVENT_TYPES) counts[type] = 0;
  for (const e of events) counts[e.eventType] = (counts[e.eventType] || 0) + 1;
  return {
    expression,
    total: events.length,
    counts,
    first: events[0]?.timestamp ?? null,
    last: events[events.length - 1]?.timestamp ?? null,
  };
}

/**
 * Clear all audit events
 */
function clearAuditLog() {
  _log.length = 0;
}

/**
 * List all unique expressions that appear in the audit log
 * @returns {string[]}
 */
function auditedExpressions() {
  return [...new Set(_log.map(e => e.expression))];
}

module.exports = {
  EVENT_TYPES,
  addAuditEvent,
  getAuditLog,
  auditSummary,
  clearAuditLog,
  auditedExpressions,
};
