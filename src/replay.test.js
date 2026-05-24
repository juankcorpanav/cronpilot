const { replay, replaySummary } = require('./replay');

describe('replay', () => {
  const start = new Date('2024-01-01T00:00:00Z');
  const end   = new Date('2024-01-01T01:00:00Z');

  test('returns correct fire times for every-minute expression', () => {
    const result = replay('* * * * *', start, end, { timezone: 'UTC' });
    expect(result.count).toBe(60);
    expect(result.times[0]).toBeInstanceOf(Date);
    expect(result.times[0].getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(result.times[result.count - 1].getTime()).toBeLessThanOrEqual(end.getTime());
  });

  test('returns correct fire times for hourly expression', () => {
    const result = replay('0 * * * *', start, end, { timezone: 'UTC' });
    // fires at :00 of each hour — only the start boundary hour qualifies
    expect(result.count).toBeGreaterThanOrEqual(1);
    expect(result.count).toBeLessThanOrEqual(2);
  });

  test('respects limit option', () => {
    const result = replay('* * * * *', start, end, { timezone: 'UTC', limit: 10 });
    expect(result.count).toBe(10);
    expect(result.truncated).toBe(true);
  });

  test('truncated is false when under limit', () => {
    const result = replay('0 * * * *', start, end, { timezone: 'UTC' });
    expect(result.truncated).toBe(false);
  });

  test('throws on invalid expression', () => {
    expect(() => replay('invalid', start, end)).toThrow(/Invalid cron expression/);
  });

  test('throws on invalid timezone', () => {
    expect(() => replay('* * * * *', start, end, { timezone: 'Mars/Olympus' })).toThrow(/Invalid timezone/);
  });

  test('throws when start >= end', () => {
    expect(() => replay('* * * * *', end, start)).toThrow(/start must be before end/);
  });

  test('throws on invalid date strings', () => {
    expect(() => replay('* * * * *', 'not-a-date', end)).toThrow(/Invalid start or end date/);
  });

  test('accepts string dates', () => {
    const result = replay('0 0 * * *', '2024-01-01T00:00:00Z', '2024-01-03T00:00:00Z', { timezone: 'UTC' });
    expect(result.count).toBeGreaterThanOrEqual(2);
  });

  test('result contains expected metadata', () => {
    const result = replay('*/15 * * * *', start, end, { timezone: 'UTC' });
    expect(result.expression).toBe('*/15 * * * *');
    expect(result.timezone).toBe('UTC');
    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);
  });
});

describe('replaySummary', () => {
  test('returns a readable summary string', () => {
    const result = replay('*/30 * * * *', new Date('2024-06-01T00:00:00Z'), new Date('2024-06-01T02:00:00Z'), { timezone: 'UTC' });
    const summary = replaySummary(result);
    expect(typeof summary).toBe('string');
    expect(summary).toContain('*/30 * * * *');
    expect(summary).toContain('UTC');
    expect(summary).toMatch(/\d+ time/);
  });

  test('mentions truncation when applicable', () => {
    const result = replay('* * * * *',
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-01T01:00:00Z'),
      { timezone: 'UTC', limit: 5 }
    );
    const summary = replaySummary(result);
    expect(summary).toContain('truncated');
  });
});
