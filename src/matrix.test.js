import { describe, it, expect } from 'vitest';
import { buildMatrix, findEquivalentGroups } from './matrix.js';

describe('buildMatrix', () => {
  it('throws if fewer than two expressions provided', () => {
    expect(() => buildMatrix(['0 9 * * 1'])).toThrow();
    expect(() => buildMatrix([])).toThrow();
  });

  it('produces a square matrix of correct size', () => {
    const { matrix } = buildMatrix(['0 9 * * 1', '0 10 * * 1', '30 8 * * *']);
    expect(matrix).toHaveLength(3);
    matrix.forEach((row) => expect(row).toHaveLength(3));
  });

  it('diagonal is always true (expression equals itself)', () => {
    const exprs = ['0 9 * * 1', '0 10 * * 1'];
    const { matrix } = buildMatrix(exprs);
    expect(matrix[0][0]).toBe(true);
    expect(matrix[1][1]).toBe(true);
  });

  it('marks equivalent expressions as true', () => {
    const exprs = ['0 9 * * 1', '0 9 * * 1'];
    const { matrix } = buildMatrix(exprs);
    expect(matrix[0][1]).toBe(true);
    expect(matrix[1][0]).toBe(true);
  });

  it('marks different expressions as false', () => {
    const exprs = ['0 9 * * 1', '0 10 * * 1'];
    const { matrix } = buildMatrix(exprs);
    expect(matrix[0][1]).toBe(false);
  });

  it('returns human-readable labels', () => {
    const { labels } = buildMatrix(['0 9 * * 1', '0 10 * * 1']);
    expect(labels).toHaveLength(2);
    labels.forEach((l) => expect(typeof l).toBe('string'));
  });
});

describe('findEquivalentGroups', () => {
  it('groups identical expressions together', () => {
    const exprs = ['0 9 * * 1', '0 9 * * 1', '0 10 * * 1'];
    const groups = findEquivalentGroups(exprs);
    expect(groups).toHaveLength(2);
    const bigGroup = groups.find((g) => g.length === 2);
    expect(bigGroup).toBeDefined();
  });

  it('puts all unique expressions in separate groups', () => {
    const exprs = ['0 9 * * 1', '0 10 * * 2', '30 8 * * 3'];
    const groups = findEquivalentGroups(exprs);
    expect(groups).toHaveLength(3);
    groups.forEach((g) => expect(g).toHaveLength(1));
  });

  it('returns one group when all expressions are equivalent', () => {
    const exprs = ['0 9 * * 1', '0 9 * * 1'];
    const groups = findEquivalentGroups(exprs);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(2);
  });
});
