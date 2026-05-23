const { addTags, getTags, removeTag, findByTag, listAllTags, clearTags, _reset } = require('./tag');

beforeEach(() => _reset());

describe('addTags', () => {
  it('adds a single tag to an expression', () => {
    const result = addTags('0 9 * * 1-5', 'work');
    expect(result).toEqual(['work']);
  });

  it('adds multiple tags at once', () => {
    const result = addTags('0 0 * * *', ['daily', 'midnight']);
    expect(result).toEqual(['daily', 'midnight']);
  });

  it('normalizes tags to lowercase', () => {
    addTags('0 9 * * *', 'Morning');
    expect(getTags('0 9 * * *')).toContain('morning');
  });

  it('does not add duplicate tags', () => {
    addTags('0 9 * * *', 'daily');
    addTags('0 9 * * *', 'daily');
    expect(getTags('0 9 * * *')).toHaveLength(1);
  });

  it('throws if expression is missing', () => {
    expect(() => addTags('', 'tag')).toThrow();
  });
});

describe('getTags', () => {
  it('returns empty array for unknown expression', () => {
    expect(getTags('* * * * *')).toEqual([]);
  });

  it('returns tags for known expression', () => {
    addTags('0 12 * * *', ['noon', 'daily']);
    expect(getTags('0 12 * * *')).toEqual(['noon', 'daily']);
  });
});

describe('removeTag', () => {
  it('removes a specific tag', () => {
    addTags('0 6 * * *', ['morning', 'daily']);
    removeTag('0 6 * * *', 'morning');
    expect(getTags('0 6 * * *')).toEqual(['daily']);
  });

  it('returns empty array for unknown expression', () => {
    expect(removeTag('* * * * *', 'x')).toEqual([]);
  });
});

describe('findByTag', () => {
  it('finds all expressions with a given tag', () => {
    addTags('0 9 * * 1-5', 'work');
    addTags('0 17 * * 1-5', 'work');
    addTags('0 0 * * *', 'daily');
    expect(findByTag('work')).toHaveLength(2);
    expect(findByTag('daily')).toHaveLength(1);
  });

  it('returns empty array if no expressions match', () => {
    expect(findByTag('nonexistent')).toEqual([]);
  });
});

describe('listAllTags', () => {
  it('returns sorted unique tags across all expressions', () => {
    addTags('0 9 * * *', ['work', 'morning']);
    addTags('0 0 * * *', ['daily', 'morning']);
    expect(listAllTags()).toEqual(['daily', 'morning', 'work']);
  });

  it('returns empty array when no tags exist', () => {
    expect(listAllTags()).toEqual([]);
  });
});

describe('clearTags', () => {
  it('removes all tags for an expression', () => {
    addTags('0 9 * * *', ['a', 'b']);
    clearTags('0 9 * * *');
    expect(getTags('0 9 * * *')).toEqual([]);
  });
});
