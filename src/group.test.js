const { addToGroup, getGroup, listGroups, removeFromGroup, deleteGroup, findGroupsByExpression, mergeGroups, clearGroups } = require('./group');

beforeEach(() => clearGroups());

describe('addToGroup', () => {
  test('creates a new group with expressions', () => {
    const g = addToGroup('daily', ['0 9 * * *', '0 18 * * *']);
    expect(g.name).toBe('daily');
    expect(g.expressions).toEqual(['0 9 * * *', '0 18 * * *']);
    expect(g.createdAt).toBeDefined();
  });

  test('appends to existing group without duplicates', () => {
    addToGroup('daily', ['0 9 * * *']);
    const g = addToGroup('daily', ['0 9 * * *', '0 18 * * *']);
    expect(g.expressions).toHaveLength(2);
  });

  test('throws on invalid name', () => {
    expect(() => addToGroup('')).toThrow();
    expect(() => addToGroup(null)).toThrow();
  });
});

describe('getGroup', () => {
  test('returns null for unknown group', () => {
    expect(getGroup('nope')).toBeNull();
  });

  test('returns group data', () => {
    addToGroup('weekly', ['0 9 * * 1']);
    const g = getGroup('weekly');
    expect(g.name).toBe('weekly');
    expect(g.expressions).toContain('0 9 * * 1');
  });
});

describe('listGroups', () => {
  test('returns empty array when no groups', () => {
    expect(listGroups()).toEqual([]);
  });

  test('lists all group names', () => {
    addToGroup('a', []);
    addToGroup('b', []);
    expect(listGroups()).toEqual(expect.arrayContaining(['a', 'b']));
  });
});

describe('removeFromGroup', () => {
  test('removes expression from group', () => {
    addToGroup('g', ['0 9 * * *', '0 18 * * *']);
    const removed = removeFromGroup('g', '0 9 * * *');
    expect(removed).toBe(true);
    expect(getGroup('g').expressions).toEqual(['0 18 * * *']);
  });

  test('returns false if expression not in group', () => {
    addToGroup('g', ['0 9 * * *']);
    expect(removeFromGroup('g', '* * * * *')).toBe(false);
  });

  test('returns false for unknown group', () => {
    expect(removeFromGroup('nope', '* * * * *')).toBe(false);
  });
});

describe('deleteGroup', () => {
  test('deletes an existing group', () => {
    addToGroup('temp', []);
    expect(deleteGroup('temp')).toBe(true);
    expect(getGroup('temp')).toBeNull();
  });

  test('returns false for unknown group', () => {
    expect(deleteGroup('ghost')).toBe(false);
  });
});

describe('findGroupsByExpression', () => {
  test('finds groups containing expression', () => {
    addToGroup('a', ['0 9 * * *']);
    addToGroup('b', ['0 9 * * *', '0 18 * * *']);
    addToGroup('c', ['0 18 * * *']);
    expect(findGroupsByExpression('0 9 * * *')).toEqual(expect.arrayContaining(['a', 'b']));
    expect(findGroupsByExpression('0 9 * * *')).not.toContain('c');
  });
});

describe('mergeGroups', () => {
  test('merges two groups into a new one', () => {
    addToGroup('x', ['0 9 * * *']);
    addToGroup('y', ['0 18 * * *']);
    const merged = mergeGroups('x', 'y', 'xy');
    expect(merged.expressions).toEqual(expect.arrayContaining(['0 9 * * *', '0 18 * * *']));
    expect(merged.expressions).toHaveLength(2);
  });

  test('deduplicates on merge', () => {
    addToGroup('x', ['0 9 * * *']);
    addToGroup('y', ['0 9 * * *', '0 18 * * *']);
    const merged = mergeGroups('x', 'y', 'xy2');
    expect(merged.expressions).toHaveLength(2);
  });
});
