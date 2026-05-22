const { explainToken, explainFields, explain } = require('./explain');

describe('explainToken', () => {
  test('wildcard returns every <field>', () => {
    expect(explainToken('minute', '*')).toBe('every minute');
    expect(explainToken('hour', '*')).toBe('every hour');
  });

  test('step expression is described correctly', () => {
    expect(explainToken('minute', '*/15')).toBe('every 15 minute(s) starting at any');
    expect(explainToken('hour', '2/3')).toBe('every 3 hour(s) starting at 2');
  });

  test('range expression is described correctly', () => {
    const result = explainToken('hour', '9-17');
    expect(result).toMatch(/from/);
    expect(result).toMatch(/to/);
  });

  test('list expression is described correctly', () => {
    const result = explainToken('minute', '0,15,30,45');
    expect(result).toMatch(/at/);
  });

  test('single value is described correctly', () => {
    expect(explainToken('minute', '0')).toContain('at');
  });
});

describe('explainFields', () => {
  test('returns one entry per field', () => {
    const fields = explainFields('*/15 * * * *');
    expect(fields).toHaveLength(5);
  });

  test('each entry has field, raw, and explanation', () => {
    const fields = explainFields('0 9 * * 1');
    fields.forEach((f) => {
      expect(f).toHaveProperty('field');
      expect(f).toHaveProperty('raw');
      expect(f).toHaveProperty('explanation');
    });
  });

  test('raw values match expression tokens', () => {
    const fields = explainFields('0 9 * * 1');
    expect(fields[0].raw).toBe('0');
    expect(fields[1].raw).toBe('9');
    expect(fields[4].raw).toBe('1');
  });
});

describe('explain', () => {
  test('returns expression, fields, and summary', () => {
    const result = explain('0 0 * * *');
    expect(result).toHaveProperty('expression', '0 0 * * *');
    expect(result).toHaveProperty('fields');
    expect(result).toHaveProperty('summary');
  });

  test('summary contains all field labels', () => {
    const { summary } = explain('0 0 * * *');
    expect(summary).toMatch(/Minute/);
    expect(summary).toMatch(/Hour/);
    expect(summary).toMatch(/Day of Month/);
    expect(summary).toMatch(/Month/);
    expect(summary).toMatch(/Day of Week/);
  });

  test('throws on invalid expression', () => {
    expect(() => explain('invalid')).toThrow();
  });
});
