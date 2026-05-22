const { lint, isClean, RULES } = require('./lint');

describe('lint', () => {
  test('returns empty array for clean expression', () => {
    expect(lint('0 9 * * 1-5')).toEqual([]);
  });

  test('flags every-minute expression', () => {
    const warnings = lint('* * * * *');
    expect(warnings.some((w) => w.id === 'every-minute')).toBe(true);
  });

  test('flags both day-of-month and day-of-week set', () => {
    const warnings = lint('0 12 15 * 5');
    expect(warnings.some((w) => w.id === 'no-both-dom-dow')).toBe(true);
  });

  test('flags zero step value', () => {
    const warnings = lint('*/0 * * * *');
    expect(warnings.some((w) => w.id === 'zero-step')).toBe(true);
  });

  test('flags redundant full range on minute', () => {
    const warnings = lint('0-59 * * * *');
    expect(warnings.some((w) => w.id === 'redundant-wildcard-range')).toBe(true);
  });

  test('flags redundant full range on hour', () => {
    const warnings = lint('0 0-23 * * *');
    expect(warnings.some((w) => w.id === 'redundant-wildcard-range')).toBe(true);
  });

  test('each warning has id and message', () => {
    const warnings = lint('* * * * *');
    warnings.forEach((w) => {
      expect(w).toHaveProperty('id');
      expect(w).toHaveProperty('message');
      expect(typeof w.message).toBe('string');
    });
  });

  test('throws on invalid expression', () => {
    expect(() => lint('not valid')).toThrow();
  });
});

describe('isClean', () => {
  test('returns true for clean expression', () => {
    expect(isClean('30 8 * * 1-5')).toBe(true);
  });

  test('returns false for flagged expression', () => {
    expect(isClean('* * * * *')).toBe(false);
  });
});

describe('RULES', () => {
  test('exports an array of rule objects', () => {
    expect(Array.isArray(RULES)).toBe(true);
    RULES.forEach((r) => {
      expect(r).toHaveProperty('id');
      expect(r).toHaveProperty('message');
      expect(typeof r.check).toBe('function');
    });
  });
});
