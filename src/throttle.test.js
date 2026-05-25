const { throttleLevel, throttleReport, suggestThrottled, THRESHOLDS } = require('./throttle');

describe('THRESHOLDS', () => {
  test('defines warning, danger, and critical levels', () => {
    expect(THRESHOLDS.warning).toBe(96);
    expect(THRESHOLDS.danger).toBe(288);
    expect(THRESHOLDS.critical).toBe(1440);
  });
});

describe('throttleLevel', () => {
  test('returns ok for low-frequency expression', () => {
    expect(throttleLevel('0 9 * * 1')).toBe('ok');    // weekly
    expect(throttleLevel('0 0 1 * *')).toBe('ok');    // monthly
  });

  test('returns ok for daily expression', () => {
    expect(throttleLevel('0 9 * * *')).toBe('ok');
  });

  test('returns warning for every 15 min', () => {
    expect(throttleLevel('*/15 * * * *')).toBe('warning');
  });

  test('returns danger for every 5 min', () => {
    expect(throttleLevel('*/5 * * * *')).toBe('danger');
  });

  test('returns critical for every minute', () => {
    expect(throttleLevel('* * * * *')).toBe('critical');
  });
});

describe('throttleReport', () => {
  test('returns full report object', () => {
    const report = throttleReport('0 9 * * *');
    expect(report).toHaveProperty('expression', '0 9 * * *');
    expect(report).toHaveProperty('level');
    expect(report).toHaveProperty('dailyFrequency');
    expect(report).toHaveProperty('message');
    expect(typeof report.message).toBe('string');
  });

  test('critical report has strong message', () => {
    const report = throttleReport('* * * * *');
    expect(report.level).toBe('critical');
    expect(report.message).toMatch(/throttle strongly recommended/i);
  });

  test('ok report has no concern message', () => {
    const report = throttleReport('0 0 1 * *');
    expect(report.level).toBe('ok');
    expect(report.message).toMatch(/no throttle concerns/i);
  });
});

describe('suggestThrottled', () => {
  test('suggests every 5 min for every-minute expression', () => {
    expect(suggestThrottled('* * * * *')).toBe('*/5 * * * *');
  });

  test('suggests every 5 min for */2', () => {
    expect(suggestThrottled('*/2 * * * *')).toBe('*/5 * * * *');
  });

  test('suggests every 15 min for */10', () => {
    expect(suggestThrottled('*/10 * * * *')).toBe('*/15 * * * *');
  });

  test('suggests every 30 min for */20', () => {
    expect(suggestThrottled('*/20 * * * *')).toBe('*/30 * * * *');
  });

  test('returns null for already-reasonable expression', () => {
    expect(suggestThrottled('0 9 * * *')).toBeNull();
  });
});
