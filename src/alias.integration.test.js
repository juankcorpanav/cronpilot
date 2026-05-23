/**
 * Integration tests for alias module — verifies realistic workflows
 */
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

test('full lifecycle: save, resolve, list, remove', () => {
  saveAlias('nightly', '0 2 * * *', 'Nightly backup');
  saveAlias('weekly-report', '0 9 * * 1', 'Monday morning report');

  expect(resolveAlias('nightly')).toBe('0 2 * * *');
  expect(resolveAlias('weekly-report')).toBe('0 9 * * 1');

  const all = listAliases();
  expect(all).toHaveLength(2);

  removeAlias('nightly');
  expect(listAliases()).toHaveLength(1);
  expect(resolveAlias('nightly')).toBeNull();
});

test('overwriting an alias updates its expression', () => {
  saveAlias('check', '*/5 * * * *', 'Every 5 min');
  saveAlias('check', '*/10 * * * *', 'Every 10 min');
  expect(resolveAlias('check')).toBe('*/10 * * * *');
  expect(getAlias('check').description).toBe('Every 10 min');
});

test('findByExpression works across multiple aliases', () => {
  saveAlias('midnight-a', '0 0 * * *');
  saveAlias('midnight-b', '0 0 * * *', 'Also midnight');
  saveAlias('noon', '0 12 * * *');

  const midnight = findByExpression('0 0 * * *');
  expect(midnight).toHaveLength(2);

  const noon = findByExpression('0 12 * * *');
  expect(noon).toHaveLength(1);
  expect(noon[0].name).toBe('noon');
});

test('clearAliases resets state between tests', () => {
  saveAlias('temp', '* * * * *');
  clearAliases();
  expect(listAliases()).toHaveLength(0);
  expect(resolveAlias('temp')).toBeNull();
});

test('alias with no description defaults to empty string', () => {
  const alias = saveAlias('simple', '0 * * * *');
  expect(alias.description).toBe('');
});
