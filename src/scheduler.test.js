const { buildScheduleInfo, validateSchedule } = require('./scheduler');

describe('validateSchedule', () => {
  test('returns valid for a correct expression + timezone', () => {
    const result = validateSchedule('0 9 * * 1-5', 'America/New_York');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('returns invalid for a bad cron expression', () => {
    const result = validateSchedule('99 9 * * *', 'UTC');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('returns invalid for a bad timezone', () => {
    const result = validateSchedule('0 9 * * *', 'Fake/Zone');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Invalid timezone/);
  });

  test('defaults timezone to UTC', () => {
    const result = validateSchedule('*/5 * * * *');
    expect(result.valid).toBe(true);
  });
});

describe('buildScheduleInfo', () => {
  test('returns a complete schedule info object', () => {
    const info = buildScheduleInfo('0 0 * * *', 'UTC', 3);
    expect(info.expression).toBe('0 0 * * *');
    expect(info.timezone).toBe('UTC');
    expect(info.utcOffset).toBe('UTC+00:00');
    expect(typeof info.description).toBe('string');
    expect(info.description.length).toBeGreaterThan(0);
    expect(Array.isArray(info.nextFireTimes)).toBe(true);
    expect(info.nextFireTimes.length).toBe(3);
    expect(info.parsed).toBeDefined();
  });

  test('next fire times are valid ISO strings', () => {
    const info = buildScheduleInfo('*/10 * * * *', 'UTC', 2);
    info.nextFireTimes.forEach((t) => {
      expect(typeof t).toBe('string');
      expect(new Date(t).toString()).not.toBe('Invalid Date');
    });
  });

  test('throws for invalid timezone', () => {
    expect(() => buildScheduleInfo('0 0 * * *', 'Not/Real')).toThrow(
      'Invalid timezone'
    );
  });

  test('fire times respect timezone offset', () => {
    const utcInfo = buildScheduleInfo('0 12 * * *', 'UTC', 1);
    const nyInfo = buildScheduleInfo('0 12 * * *', 'America/New_York', 1);
    // Same cron, different TZ => different absolute UTC instants
    expect(utcInfo.nextFireTimes[0]).not.toBe(nyInfo.nextFireTimes[0]);
  });
});
