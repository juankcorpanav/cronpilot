const { listTemplates, buildFromTemplate } = require('./template');

describe('listTemplates', () => {
  test('returns an array of templates', () => {
    const templates = listTemplates();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
  });

  test('each template has id, label, and params', () => {
    for (const t of listTemplates()) {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('label');
      expect(t).toHaveProperty('params');
    }
  });
});

describe('buildFromTemplate', () => {
  test('builds every-n-minutes with default params', () => {
    const { expression, errors } = buildFromTemplate('every-n-minutes');
    expect(errors).toHaveLength(0);
    expect(expression).toBe('*/5 * * * *');
  });

  test('builds every-n-minutes with custom n=10', () => {
    const { expression, errors } = buildFromTemplate('every-n-minutes', { n: 10 });
    expect(errors).toHaveLength(0);
    expect(expression).toBe('*/10 * * * *');
  });

  test('builds every-n-hours with n=6', () => {
    const { expression, errors } = buildFromTemplate('every-n-hours', { n: 6 });
    expect(errors).toHaveLength(0);
    expect(expression).toBe('0 */6 * * *');
  });

  test('builds daily-at-time with hh=8 mm=30', () => {
    const { expression, errors } = buildFromTemplate('daily-at-time', { hh: 8, mm: 30 });
    expect(errors).toHaveLength(0);
    expect(expression).toBe('30 8 * * *');
  });

  test('builds weekly-on-day with day=5 (Friday)', () => {
    const { expression, errors } = buildFromTemplate('weekly-on-day', { day: 5 });
    expect(errors).toHaveLength(0);
    expect(expression).toBe('0 9 * * 5');
  });

  test('builds monthly-on-date with d=15 hh=2 mm=0', () => {
    const { expression, errors } = buildFromTemplate('monthly-on-date', { d: 15, hh: 2, mm: 0 });
    expect(errors).toHaveLength(0);
    expect(expression).toBe('0 2 15 * *');
  });

  test('returns error for unknown template', () => {
    const { expression, errors } = buildFromTemplate('nonexistent');
    expect(expression).toBeNull();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('returns error when param out of range', () => {
    const { expression, errors } = buildFromTemplate('every-n-minutes', { n: 100 });
    expect(expression).toBeNull();
    expect(errors[0]).toMatch(/between/);
  });

  test('returns error when param is not a number', () => {
    const { expression, errors } = buildFromTemplate('every-n-hours', { n: 'abc' });
    expect(expression).toBeNull();
    expect(errors[0]).toMatch(/integer/);
  });

  test('uses defaults when no values provided', () => {
    const { expression } = buildFromTemplate('weekly-on-day');
    expect(expression).toBe('0 9 * * 1');
  });
});
