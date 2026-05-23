const {
  saveAlias,
  getAlias,
  resolveAlias,
  listAliases,
  removeAlias,
  clearAliases,
  findByExpression
} = require('./alias');

beforeEach(() => clearAliases());

test('saveAlias stores and returns alias object', () => {
  const alias = saveAlias('daily', '0 0 * * *', 'Every day at midnight');
  expect(alias.name).toBe('daily');
  expect(alias.expression).toBe('0 0 * * *');
  expect(alias.description).toBe('Every day at midnight');
  expect(alias.createdAt).toBeDefined();
});

test('saveAlias throws on invalid name', () => {
  expect(() => saveAlias('', '0 0 * * *')).toThrow();
});

test('saveAlias throws on invalid expression', () => {
  expect(() => saveAlias('daily', '')).toThrow();
});

test('getAlias returns saved alias', () => {
  saveAlias('weekly', '0 0 * * 0');
  const alias = getAlias('weekly');
  expect(alias).not.toBeNull();
  expect(alias.name).toBe('weekly');
});

test('getAlias returns null for unknown name', () => {
  expect(getAlias('unknown')).toBeNull();
});

test('resolveAlias returns expression string', () => {
  saveAlias('hourly', '0 * * * *');
  expect(resolveAlias('hourly')).toBe('0 * * * *');
});

test('resolveAlias returns null for unknown alias', () => {
  expect(resolveAlias('nope')).toBeNull();
});

test('listAliases returns all saved aliases', () => {
  saveAlias('a', '* * * * *');
  saveAlias('b', '0 0 * * *');
  const list = listAliases();
  expect(list).toHaveLength(2);
  expect(list.map(a => a.name)).toContain('a');
  expect(list.map(a => a.name)).toContain('b');
});

test('removeAlias deletes an alias', () => {
  saveAlias('temp', '*/5 * * * *');
  expect(removeAlias('temp')).toBe(true);
  expect(getAlias('temp')).toBeNull();
});

test('removeAlias returns false for unknown alias', () => {
  expect(removeAlias('ghost')).toBe(false);
});

test('clearAliases empties the store', () => {
  saveAlias('x', '* * * * *');
  clearAliases();
  expect(listAliases()).toHaveLength(0);
});

test('findByExpression returns matching aliases', () => {
  saveAlias('midnight', '0 0 * * *');
  saveAlias('midnight2', '0 0 * * *', 'Duplicate');
  saveAlias('hourly', '0 * * * *');
  const matches = findByExpression('0 0 * * *');
  expect(matches).toHaveLength(2);
  expect(matches.every(a => a.expression === '0 0 * * *')).toBe(true);
});

test('findByExpression returns empty array for no match', () => {
  expect(findByExpression('1 2 3 4 5')).toHaveLength(0);
});
