const { diffField, diffExpressions, describeDiff } = require('./diff');

describe('diffField', () => {
  it('returns null when fields are identical', () => {
    expect(diffField('minute', '0', '0')).toBeNull();
  });

  it('returns a change object when fields differ', () => {
    const result = diffField('hour', '0', '12');
    expect(result).toEqual({ field: 'hour', from: '0', to: '12' });
  });
});

describe('diffExpressions', () => {
  it('reports identical when expressions match', () => {
    const result = diffExpressions('0 9 * * 1', '0 9 * * 1');
    expect(result.identical).toBe(true);
    expect(result.changes).toHaveLength(0);
  });

  it('detects a single field change', () => {
    const result = diffExpressions('0 9 * * 1', '0 10 * * 1');
    expect(result.identical).toBe(false);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0]).toMatchObject({ field: 'hour', from: '9', to: '10' });
  });

  it('detects multiple field changes', () => {
    const result = diffExpressions('0 9 * * 1', '30 18 1 * *');
    expect(result.changes.length).toBeGreaterThanOrEqual(3);
  });

  it('includes human-readable descriptions', () => {
    const result = diffExpressions('0 0 * * *', '0 12 * * *');
    expect(typeof result.fromHuman).toBe('string');
    expect(typeof result.toHuman).toBe('string');
    expect(result.fromHuman.length).toBeGreaterThan(0);
  });

  it('throws on invalid expression A', () => {
    expect(() => diffExpressions('invalid', '0 0 * * *')).toThrow();
  });

  it('throws on invalid expression B', () => {
    expect(() => diffExpressions('0 0 * * *', 'bad expr')).toThrow();
  });
});

describe('describeDiff', () => {
  it('returns identical message for same expressions', () => {
    const msg = describeDiff('0 0 * * *', '0 0 * * *');
    expect(msg).toMatch(/identical/i);
  });

  it('lists changed fields in output', () => {
    const msg = describeDiff('0 9 * * 1', '0 10 * * 1');
    expect(msg).toMatch(/hour/);
    expect(msg).toMatch(/From:/);
    expect(msg).toMatch(/To:/);
  });

  it('shows arrow between old and new values', () => {
    const msg = describeDiff('0 9 * * *', '0 18 * * *');
    expect(msg).toMatch(/→/);
  });
});
