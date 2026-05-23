const { validateExpression, isValid } = require('./validate');

describe('validateExpression', () => {
  test('returns valid for a standard cron expression', () => {
    const result = validateExpression('0 9 * * 1-5');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.fields).not.toBeNull();
  });

  test('returns invalid for an empty string', () => {
    const result = validateExpression('');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('returns invalid for a non-string input', () => {
    const result = validateExpression(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Expression must be a non-empty string.');
  });

  test('returns invalid for a malformed expression', () => {
    const result = validateExpression('99 99 99 99 99');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('returns invalid for an expression with wrong field count', () => {
    const result = validateExpression('* * *');
    expect(result.valid).toBe(false);
  });

  test('accepts a valid timezone option', () => {
    const result = validateExpression('0 9 * * *', { timezone: 'America/New_York' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('returns error for an invalid timezone option', () => {
    const result = validateExpression('0 9 * * *', { timezone: 'Mars/Olympus' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid timezone'))).toBe(true);
  });

  test('includes expression in the result', () => {
    const expr = '30 6 * * *';
    const result = validateExpression(expr);
    expect(result.expression).toBe(expr);
  });
});

describe('isValid', () => {
  test('returns true for a valid expression', () => {
    expect(isValid('0 0 * * *')).toBe(true);
  });

  test('returns false for an invalid expression', () => {
    expect(isValid('not a cron')).toBe(false);
  });

  test('returns false when timezone is invalid', () => {
    expect(isValid('0 0 * * *', { timezone: 'Fake/Zone' })).toBe(false);
  });

  test('returns true with a valid timezone', () => {
    expect(isValid('*/15 * * * *', { timezone: 'Europe/London' })).toBe(true);
  });
});
