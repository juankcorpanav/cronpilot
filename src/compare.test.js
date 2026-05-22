import { describe, it, expect } from 'vitest';
import { fieldsEqual, compareExpressions, compareSummary } from './compare.js';

describe('fieldsEqual', () => {
  it('returns true for identical strings', () => {
    expect(fieldsEqual('*', '*')).toBe(true);
  });

  it('returns true for equivalent comma-separated values in different order', () => {
    expect(fieldsEqual('1,2,3', '3,1,2')).toBe(true);
  });

  it('returns false for different values', () => {
    expect(fieldsEqual('0', '5')).toBe(false);
  });
});

describe('compareExpressions', () => {
  it('returns equal=true for identical expressions', () => {
    const result = compareExpressions('0 9 * * 1', '0 9 * * 1');
    expect(result.equal).toBe(true);
    expect(result.differences).toHaveLength(0);
  });

  it('detects differences in hour field', () => {
    const result = compareExpressions('0 9 * * 1', '0 10 * * 1');
    expect(result.equal).toBe(false);
    expect(result.differences).toHaveLength(1);
    expect(result.differences[0].field).toBe('hour');
    expect(result.differences[0].a).toBe('9');
    expect(result.differences[0].b).toBe('10');
  });

  it('detects multiple field differences', () => {
    const result = compareExpressions('0 9 * * 1', '30 17 * * 5');
    expect(result.differences.length).toBeGreaterThanOrEqual(2);
  });

  it('throws on invalid expression A', () => {
    expect(() => compareExpressions('invalid', '0 9 * * 1')).toThrow();
  });

  it('throws on invalid expression B', () => {
    expect(() => compareExpressions('0 9 * * 1', 'bad expr')).toThrow();
  });
});

describe('compareSummary', () => {
  it('returns equivalence message for equal expressions', () => {
    const summary = compareSummary('0 9 * * 1', '0 9 * * 1');
    expect(summary).toMatch(/equivalent/i);
  });

  it('includes field names in diff summary', () => {
    const summary = compareSummary('0 9 * * 1', '0 10 * * 1');
    expect(summary).toMatch(/hour/);
  });

  it('includes human-readable descriptions for both expressions', () => {
    const summary = compareSummary('0 9 * * 1', '0 10 * * 1');
    expect(summary).toMatch(/A:/);
    expect(summary).toMatch(/B:/);
  });
});
