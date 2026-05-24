const {
  addAuditEvent,
  getAuditLog,
  auditSummary,
  clearAuditLog,
  auditedExpressions,
  EVENT_TYPES,
} = require('./audit');

beforeEach(() => clearAuditLog());

describe('addAuditEvent', () => {
  test('adds an entry and returns it', () => {
    const entry = addAuditEvent('0 * * * *', 'created');
    expect(entry).toMatchObject({ expression: '0 * * * *', eventType: 'created' });
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
  });

  test('throws on missing expression', () => {
    expect(() => addAuditEvent('', 'created')).toThrow('expression is required');
  });

  test('throws on unknown event type', () => {
    expect(() => addAuditEvent('0 * * * *', 'unknown')).toThrow('Unknown event type');
  });

  test('stores meta data', () => {
    const entry = addAuditEvent('0 * * * *', 'exported', { format: 'yaml' });
    expect(entry.meta.format).toBe('yaml');
  });
});

describe('getAuditLog', () => {
  test('returns all entries without filters', () => {
    addAuditEvent('0 * * * *', 'created');
    addAuditEvent('*/5 * * * *', 'validated');
    expect(getAuditLog()).toHaveLength(2);
  });

  test('filters by expression', () => {
    addAuditEvent('0 * * * *', 'created');
    addAuditEvent('*/5 * * * *', 'validated');
    const results = getAuditLog({ expression: '0 * * * *' });
    expect(results).toHaveLength(1);
    expect(results[0].expression).toBe('0 * * * *');
  });

  test('filters by eventType', () => {
    addAuditEvent('0 * * * *', 'created');
    addAuditEvent('0 * * * *', 'validated');
    const results = getAuditLog({ eventType: 'validated' });
    expect(results).toHaveLength(1);
  });
});

describe('auditSummary', () => {
  test('returns counts per event type', () => {
    addAuditEvent('0 * * * *', 'created');
    addAuditEvent('0 * * * *', 'validated');
    addAuditEvent('0 * * * *', 'validated');
    const summary = auditSummary('0 * * * *');
    expect(summary.total).toBe(3);
    expect(summary.counts.created).toBe(1);
    expect(summary.counts.validated).toBe(2);
    expect(summary.first).toBeDefined();
    expect(summary.last).toBeDefined();
  });

  test('returns zero counts for unknown expression', () => {
    const summary = auditSummary('9 9 9 9 9');
    expect(summary.total).toBe(0);
    expect(summary.first).toBeNull();
  });
});

describe('auditedExpressions', () => {
  test('returns unique expressions', () => {
    addAuditEvent('0 * * * *', 'created');
    addAuditEvent('0 * * * *', 'validated');
    addAuditEvent('*/5 * * * *', 'created');
    expect(auditedExpressions()).toEqual(['0 * * * *', '*/5 * * * *']);
  });
});

describe('EVENT_TYPES', () => {
  test('contains expected types', () => {
    expect(EVENT_TYPES).toContain('created');
    expect(EVENT_TYPES).toContain('exported');
  });
});
