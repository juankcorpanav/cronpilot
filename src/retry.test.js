const { buildRetrySchedule, validateRetryPolicy, describeRetryPolicy, BACKOFF_STRATEGIES } = require('./retry');

describe('BACKOFF_STRATEGIES', () => {
  test('contains fixed, linear, exponential', () => {
    expect(BACKOFF_STRATEGIES).toEqual(expect.arrayContaining(['fixed', 'linear', 'exponential']));
  });
});

describe('buildRetrySchedule', () => {
  test('returns correct number of retries', () => {
    const result = buildRetrySchedule('0 9 * * *', { maxRetries: 3, strategy: 'fixed', intervalMinutes: 5 });
    expect(result).toHaveLength(3);
  });

  test('fixed strategy uses same delay each time', () => {
    const result = buildRetrySchedule('0 9 * * *', { maxRetries: 3, strategy: 'fixed', intervalMinutes: 10 });
    expect(result.every(r => r.delayMinutes === 10)).toBe(true);
  });

  test('linear strategy increases delay linearly', () => {
    const result = buildRetrySchedule('0 9 * * *', { maxRetries: 3, strategy: 'linear', intervalMinutes: 5 });
    expect(result[0].delayMinutes).toBe(5);
    expect(result[1].delayMinutes).toBe(10);
    expect(result[2].delayMinutes).toBe(15);
  });

  test('exponential strategy doubles delay', () => {
    const result = buildRetrySchedule('0 9 * * *', { maxRetries: 3, strategy: 'exponential', intervalMinutes: 5 });
    expect(result[0].delayMinutes).toBe(5);
    expect(result[1].delayMinutes).toBe(10);
    expect(result[2].delayMinutes).toBe(20);
  });

  test('delay is capped at 60 minutes', () => {
    const result = buildRetrySchedule('0 9 * * *', { maxRetries: 5, strategy: 'exponential', intervalMinutes: 30 });
    result.forEach(r => expect(r.delayMinutes).toBeLessThanOrEqual(60));
  });

  test('each result has attempt, expression, description, delayMinutes', () => {
    const result = buildRetrySchedule('0 9 * * *', { maxRetries: 2, strategy: 'fixed', intervalMinutes: 5 });
    result.forEach(r => {
      expect(r).toHaveProperty('attempt');
      expect(r).toHaveProperty('expression');
      expect(r).toHaveProperty('description');
      expect(r).toHaveProperty('delayMinutes');
    });
  });

  test('throws on invalid strategy', () => {
    expect(() => buildRetrySchedule('0 9 * * *', { strategy: 'random' })).toThrow();
  });

  test('throws on invalid maxRetries', () => {
    expect(() => buildRetrySchedule('0 9 * * *', { maxRetries: 0 })).toThrow();
    expect(() => buildRetrySchedule('0 9 * * *', { maxRetries: 11 })).toThrow();
  });

  test('throws on invalid intervalMinutes', () => {
    expect(() => buildRetrySchedule('0 9 * * *', { intervalMinutes: 0 })).toThrow();
    expect(() => buildRetrySchedule('0 9 * * *', { intervalMinutes: 61 })).toThrow();
  });

  test('throws on invalid baseCron', () => {
    expect(() => buildRetrySchedule('not-a-cron', {})).toThrow();
  });
});

describe('validateRetryPolicy', () => {
  test('valid policy returns valid: true', () => {
    const result = validateRetryPolicy({ baseCron: '0 9 * * *', maxRetries: 3, strategy: 'fixed', intervalMinutes: 5 });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('missing baseCron returns error', () => {
    const result = validateRetryPolicy({ maxRetries: 3 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('baseCron'))).toBe(true);
  });

  test('invalid strategy returns error', () => {
    const result = validateRetryPolicy({ baseCron: '0 9 * * *', strategy: 'chaos' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('strategy'))).toBe(true);
  });

  test('out-of-range maxRetries returns error', () => {
    const result = validateRetryPolicy({ baseCron: '0 9 * * *', maxRetries: 99 });
    expect(result.valid).toBe(false);
  });
});

describe('describeRetryPolicy', () => {
  test('returns a non-empty string', () => {
    const desc = describeRetryPolicy({ baseCron: '0 9 * * *', maxRetries: 3, strategy: 'exponential', intervalMinutes: 5 });
    expect(typeof desc).toBe('string');
    expect(desc.length).toBeGreaterThan(10);
  });

  test('includes strategy name', () => {
    const desc = describeRetryPolicy({ baseCron: '0 9 * * *', strategy: 'linear', intervalMinutes: 10 });
    expect(desc).toContain('linear');
  });

  test('handles missing baseCron gracefully', () => {
    const desc = describeRetryPolicy({ maxRetries: 2 });
    expect(desc).toContain('unknown schedule');
  });
});
