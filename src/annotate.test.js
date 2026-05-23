const {
  annotate,
  getAnnotation,
  removeAnnotation,
  listAnnotations,
  searchAnnotations,
  clearAnnotations
} = require('./annotate');

beforeEach(() => clearAnnotations());

describe('annotate()', () => {
  test('stores an annotation and returns entry', () => {
    const result = annotate('0 9 * * 1-5', 'Weekday morning job');
    expect(result.expression).toBe('0 9 * * 1-5');
    expect(result.note).toBe('Weekday morning job');
    expect(result.updatedAt).toBeDefined();
  });

  test('overwrites an existing annotation', () => {
    annotate('0 9 * * 1-5', 'Old note');
    const result = annotate('0 9 * * 1-5', 'New note');
    expect(result.note).toBe('New note');
    expect(listAnnotations()).toHaveLength(1);
  });

  test('throws on empty expression', () => {
    expect(() => annotate('', 'note')).toThrow();
  });

  test('throws on non-string note', () => {
    expect(() => annotate('* * * * *', 42)).toThrow();
  });
});

describe('getAnnotation()', () => {
  test('returns annotation for known expression', () => {
    annotate('0 0 * * *', 'Midnight daily');
    const result = getAnnotation('0 0 * * *');
    expect(result?.note).toBe('Midnight daily');
  });

  test('returns null for unknown expression', () => {
    expect(getAnnotation('1 2 3 4 5')).toBeNull();
  });

  test('trims whitespace from expression key', () => {
    annotate('0 0 * * *', 'Midnight daily');
    expect(getAnnotation('  0 0 * * *  ')?.note).toBe('Midnight daily');
  });
});

describe('removeAnnotation()', () => {
  test('removes existing annotation and returns true', () => {
    annotate('0 0 * * *', 'note');
    expect(removeAnnotation('0 0 * * *')).toBe(true);
    expect(getAnnotation('0 0 * * *')).toBeNull();
  });

  test('returns false when not found', () => {
    expect(removeAnnotation('0 0 * * *')).toBe(false);
  });
});

describe('listAnnotations()', () => {
  test('returns all stored annotations', () => {
    annotate('0 9 * * *', 'Morning');
    annotate('0 17 * * *', 'Evening');
    expect(listAnnotations()).toHaveLength(2);
  });

  test('returns empty array when store is empty', () => {
    expect(listAnnotations()).toEqual([]);
  });
});

describe('searchAnnotations()', () => {
  test('finds annotations matching query (case-insensitive)', () => {
    annotate('0 9 * * 1-5', 'Weekday morning standup');
    annotate('0 0 1 * *', 'Monthly billing job');
    const results = searchAnnotations('morning');
    expect(results).toHaveLength(1);
    expect(results[0].expression).toBe('0 9 * * 1-5');
  });

  test('returns empty array when no match', () => {
    annotate('0 9 * * *', 'Daily');
    expect(searchAnnotations('nightly')).toEqual([]);
  });

  test('returns empty array for non-string query', () => {
    expect(searchAnnotations(null)).toEqual([]);
  });
});
