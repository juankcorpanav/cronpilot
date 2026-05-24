const { matchesDescription, matchesPattern, search, topResults } = require('./search');
const { saveFavorite, listFavorites, removeFavorite } = require('./favorites');
const { addToHistory, clearHistory } = require('./history');

beforeEach(() => {
  clearHistory();
  // Clean up any favorites added in tests
  for (const fav of listFavorites()) {
    removeFavorite(fav.id || fav.expression);
  }
});

describe('matchesDescription', () => {
  test('returns true when description contains query', () => {
    expect(matchesDescription('0 * * * *', 'every hour')).toBe(true);
  });

  test('is case-insensitive', () => {
    expect(matchesDescription('0 * * * *', 'EVERY HOUR')).toBe(true);
  });

  test('returns false for non-matching query', () => {
    expect(matchesDescription('0 * * * *', 'midnight')).toBe(false);
  });

  test('returns false for invalid expression', () => {
    expect(matchesDescription('not-valid', 'anything')).toBe(false);
  });
});

describe('matchesPattern', () => {
  test('matches exact pattern', () => {
    expect(matchesPattern('0 9 * * 1', '0 9 * * 1')).toBe(true);
  });

  test('wildcard in pattern matches any field', () => {
    expect(matchesPattern('0 9 * * 1', '* 9 * * *')).toBe(true);
  });

  test('returns false when non-wildcard field differs', () => {
    expect(matchesPattern('0 9 * * 1', '0 8 * * 1')).toBe(false);
  });

  test('returns false for different field counts', () => {
    expect(matchesPattern('0 9 * * 1', '0 9 *')).toBe(false);
  });

  test('returns false for invalid expression', () => {
    expect(matchesPattern('bad expr', '* * * * *')).toBe(false);
  });
});

describe('search', () => {
  test('finds matching expression from history', () => {
    addToHistory({ expression: '0 0 * * *', label: 'midnight daily' });
    const results = search('midnight');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].expression).toBe('0 0 * * *');
    expect(results[0].source).toBe('history');
  });

  test('finds matching expression from favorites by label', () => {
    saveFavorite({ expression: '0 9 * * 1-5', label: 'weekday morning' });
    const results = search('weekday morning');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].source).toBe('favorite');
  });

  test('deduplicates results from both sources', () => {
    addToHistory({ expression: '0 12 * * *', label: 'noon' });
    saveFavorite({ expression: '0 12 * * *', label: 'noon' });
    const results = search('noon');
    const exprs = results.map(r => r.expression);
    expect(new Set(exprs).size).toBe(exprs.length);
  });

  test('filters by pattern when provided', () => {
    addToHistory({ expression: '0 9 * * 1', label: 'monday morning' });
    addToHistory({ expression: '0 9 * * 2', label: 'tuesday morning' });
    const results = search('morning', { pattern: '0 9 * * 1' });
    expect(results.every(r => r.expression.endsWith('1'))).toBe(true);
  });

  test('returns empty array when nothing matches', () => {
    const results = search('zzznomatch');
    expect(results).toEqual([]);
  });
});

describe('topResults', () => {
  test('limits number of results', () => {
    for (let i = 0; i < 10; i++) {
      addToHistory({ expression: `0 ${i} * * *`, label: `hour ${i} job` });
    }
    const results = topResults('hour', 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});
