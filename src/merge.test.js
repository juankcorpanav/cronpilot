const { unionField, intersectField, renderField, mergeExpressions } = require('./merge');

describe('unionField', () => {
  it('returns wildcard if either side is wildcard', () => {
    const a = { type: 'wildcard', values: null };
    const b = { type: 'list', values: [1, 2] };
    expect(unionField(a, b).type).toBe('wildcard');
    expect(unionField(b, a).type).toBe('wildcard');
  });

  it('merges and deduplicates values from two lists', () => {
    const a = { type: 'list', values: [1, 3, 5] };
    const b = { type: 'list', values: [3, 5, 7] };
    const result = unionField(a, b);
    expect(result.values).toEqual([1, 3, 5, 7]);
  });
});

describe('intersectField', () => {
  it('returns the other field if one is wildcard', () => {
    const a = { type: 'wildcard', values: null };
    const b = { type: 'list', values: [2, 4] };
    expect(intersectField(a, b)).toBe(b);
    expect(intersectField(b, a)).toBe(b);
  });

  it('returns shared values between two lists', () => {
    const a = { type: 'list', values: [1, 2, 3] };
    const b = { type: 'list', values: [2, 3, 4] };
    const result = intersectField(a, b);
    expect(result.values).toEqual([2, 3]);
  });

  it('returns null when no shared values exist', () => {
    const a = { type: 'list', values: [1, 3] };
    const b = { type: 'list', values: [2, 4] };
    expect(intersectField(a, b)).toBeNull();
  });
});

describe('renderField', () => {
  it('renders wildcard as *', () => {
    expect(renderField({ type: 'wildcard', values: null })).toBe('*');
  });

  it('renders list values as comma-separated string', () => {
    expect(renderField({ type: 'list', values: [0, 15, 30] })).toBe('0,15,30');
  });

  it('renders null/undefined as *', () => {
    expect(renderField(null)).toBe('*');
  });
});

describe('mergeExpressions', () => {
  it('merges two expressions using union strategy by default', () => {
    const result = mergeExpressions('0 9 * * 1', '0 17 * * 5');
    expect(result.strategy).toBe('union');
    expect(result.expression).toContain('0');
    expect(result.conflicts).toHaveLength(0);
  });

  it('merges two expressions using intersect strategy', () => {
    const result = mergeExpressions('0 9 * * 1-5', '0 9 * * 1,3', { strategy: 'intersect' });
    expect(result.strategy).toBe('intersect');
    expect(result.expression).toBeDefined();
  });

  it('reports conflicts when intersection is empty', () => {
    const result = mergeExpressions('0 9 * * 1', '0 17 * * 5', { strategy: 'intersect' });
    expect(result.conflicts).toContain('dayOfWeek');
  });

  it('returns a 5-field expression string', () => {
    const result = mergeExpressions('*/15 * * * *', '0 12 * * *');
    expect(result.expression.split(' ')).toHaveLength(5);
  });

  it('includes fields map in result', () => {
    const result = mergeExpressions('0 8 * * *', '0 20 * * *');
    expect(result.fields).toHaveProperty('minute');
    expect(result.fields).toHaveProperty('hour');
  });
});
