const { findOverlaps, hasOverlap, detectConflicts, overlapReport } = require('./overlap');

// Identical expressions always overlap
const EVERY_HOUR = '0 * * * *';
const EVERY_DAY_NOON = '0 12 * * *';
const EVERY_DAY_MIDNIGHT = '0 0 * * *';
const EVERY_MINUTE = '* * * * *';

describe('findOverlaps', () => {
  test('identical expressions overlap on every fire time', () => {
    const overlaps = findOverlaps(EVERY_HOUR, EVERY_HOUR, 'UTC', 10);
    expect(overlaps.length).toBe(10);
  });

  test('non-overlapping expressions return empty array', () => {
    // noon vs midnight — should not share times
    const overlaps = findOverlaps(EVERY_DAY_NOON, EVERY_DAY_MIDNIGHT, 'UTC', 20);
    expect(overlaps.length).toBe(0);
  });

  test('returns ISO string timestamps', () => {
    const overlaps = findOverlaps(EVERY_HOUR, EVERY_HOUR, 'UTC', 3);
    overlaps.forEach(t => {
      expect(t).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});

describe('hasOverlap', () => {
  test('returns true for identical expressions', () => {
    expect(hasOverlap(EVERY_HOUR, EVERY_HOUR)).toBe(true);
  });

  test('returns false for non-overlapping expressions', () => {
    expect(hasOverlap(EVERY_DAY_NOON, EVERY_DAY_MIDNIGHT)).toBe(false);
  });

  test('every-minute overlaps with every-hour', () => {
    expect(hasOverlap(EVERY_MINUTE, EVERY_HOUR)).toBe(true);
  });
});

describe('detectConflicts', () => {
  test('returns empty array when no conflicts', () => {
    const result = detectConflicts([EVERY_DAY_NOON, EVERY_DAY_MIDNIGHT]);
    expect(result).toEqual([]);
  });

  test('detects conflict between identical expressions', () => {
    const result = detectConflicts([EVERY_HOUR, EVERY_HOUR]);
    expect(result.length).toBe(1);
    expect(result[0].a).toBe(EVERY_HOUR);
    expect(result[0].b).toBe(EVERY_HOUR);
    expect(result[0].overlapCount).toBeGreaterThan(0);
    expect(result[0].firstOverlap).toBeDefined();
  });

  test('includes sample overlaps (max 3)', () => {
    const result = detectConflicts([EVERY_MINUTE, EVERY_HOUR]);
    expect(result[0].sample.length).toBeLessThanOrEqual(3);
  });
});

describe('overlapReport', () => {
  test('reports no conflicts for non-overlapping set', () => {
    const report = overlapReport([EVERY_DAY_NOON, EVERY_DAY_MIDNIGHT]);
    expect(report.hasConflicts).toBe(false);
    expect(report.conflictCount).toBe(0);
    expect(report.summary).toMatch(/No scheduling conflicts/);
  });

  test('reports conflicts when present', () => {
    const report = overlapReport([EVERY_HOUR, EVERY_HOUR, EVERY_DAY_MIDNIGHT]);
    expect(report.hasConflicts).toBe(true);
    expect(report.conflictCount).toBeGreaterThan(0);
    expect(report.summary).toMatch(/conflict/);
  });

  test('includes expression count', () => {
    const report = overlapReport([EVERY_DAY_NOON, EVERY_DAY_MIDNIGHT, EVERY_HOUR]);
    expect(report.expressionCount).toBe(3);
  });
});
