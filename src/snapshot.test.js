const {
  saveSnapshot,
  getSnapshot,
  listSnapshots,
  removeSnapshot,
  clearSnapshots,
  hasSnapshot,
  findByExpression
} = require('./snapshot');

beforeEach(() => clearSnapshots());

describe('saveSnapshot', () => {
  test('saves a snapshot and returns it', () => {
    const snap = saveSnapshot('daily', '0 9 * * *');
    expect(snap.name).toBe('daily');
    expect(snap.expression).toBe('0 9 * * *');
    expect(snap.savedAt).toBeDefined();
  });

  test('saves metadata with snapshot', () => {
    const snap = saveSnapshot('weekly', '0 9 * * 1', { tz: 'UTC' });
    expect(snap.meta.tz).toBe('UTC');
  });

  test('throws on missing name', () => {
    expect(() => saveSnapshot('', '0 9 * * *')).toThrow();
  });

  test('throws on missing expression', () => {
    expect(() => saveSnapshot('test', '')).toThrow();
  });
});

describe('getSnapshot', () => {
  test('returns saved snapshot', () => {
    saveSnapshot('nightly', '0 2 * * *');
    const snap = getSnapshot('nightly');
    expect(snap.expression).toBe('0 2 * * *');
  });

  test('returns null for unknown name', () => {
    expect(getSnapshot('nonexistent')).toBeNull();
  });
});

describe('listSnapshots', () => {
  test('returns all snapshots', () => {
    saveSnapshot('a', '0 1 * * *');
    saveSnapshot('b', '0 2 * * *');
    expect(listSnapshots()).toHaveLength(2);
  });

  test('returns empty array when none saved', () => {
    expect(listSnapshots()).toEqual([]);
  });
});

describe('removeSnapshot', () => {
  test('removes existing snapshot', () => {
    saveSnapshot('temp', '*/5 * * * *');
    expect(removeSnapshot('temp')).toBe(true);
    expect(getSnapshot('temp')).toBeNull();
  });

  test('returns false for unknown snapshot', () => {
    expect(removeSnapshot('ghost')).toBe(false);
  });
});

describe('hasSnapshot', () => {
  test('returns true when snapshot exists', () => {
    saveSnapshot('check', '0 0 * * *');
    expect(hasSnapshot('check')).toBe(true);
  });

  test('returns false when snapshot does not exist', () => {
    expect(hasSnapshot('missing')).toBe(false);
  });
});

describe('findByExpression', () => {
  test('finds snapshots matching expression', () => {
    saveSnapshot('s1', '0 9 * * *');
    saveSnapshot('s2', '0 9 * * *');
    saveSnapshot('s3', '0 10 * * *');
    const results = findByExpression('0 9 * * *');
    expect(results).toHaveLength(2);
  });

  test('returns empty array when no match', () => {
    expect(findByExpression('1 2 3 4 5')).toEqual([]);
  });
});
