const { suggest, topSuggestion } = require('./suggest');

describe('suggest', () => {
  test('returns suggestions for "every hour"', () => {
    const results = suggest('every hour');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].expression).toBe('0 * * * *');
  });

  test('returns suggestions for "daily"', () => {
    const results = suggest('daily');
    expect(results.some(r => r.expression === '0 0 * * *')).toBe(true);
  });

  test('returns suggestions for "midnight"', () => {
    const results = suggest('midnight');
    expect(results[0].expression).toBe('0 0 * * *');
  });

  test('returns suggestions for "every 15 minutes"', () => {
    const results = suggest('every 15 minutes');
    expect(results[0].expression).toBe('*/15 * * * *');
  });

  test('returns suggestions for "weekdays"', () => {
    const results = suggest('weekdays');
    expect(results.some(r => r.expression === '0 9 * * 1-5')).toBe(true);
  });

  test('returns empty array for empty string', () => {
    expect(suggest('')).toEqual([]);
  });

  test('returns empty array for null', () => {
    expect(suggest(null)).toEqual([]);
  });

  test('returns at most 5 results', () => {
    const results = suggest('every');
    expect(results.length).toBeLessThanOrEqual(5);
  });

  test('results have expression and score fields', () => {
    const results = suggest('hourly');
    for (const r of results) {
      expect(r).toHaveProperty('expression');
      expect(r).toHaveProperty('score');
    }
  });

  test('results are sorted by score descending', () => {
    const results = suggest('daily');
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});

describe('topSuggestion', () => {
  test('returns top result for known query', () => {
    const result = topSuggestion('every minute');
    expect(result).not.toBeNull();
    expect(result.expression).toBe('* * * * *');
  });

  test('returns null for unrecognized query', () => {
    const result = topSuggestion('xyzzy frobnicator');
    expect(result).toBeNull();
  });

  test('returns object with expression and score', () => {
    const result = topSuggestion('weekly');
    expect(result).toHaveProperty('expression');
    expect(result).toHaveProperty('score');
  });
});
