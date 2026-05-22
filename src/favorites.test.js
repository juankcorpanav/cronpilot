const {
  saveFavorite,
  getFavorite,
  listFavorites,
  removeFavorite,
  findByExpression,
  clearFavorites,
} = require('./favorites');

beforeEach(() => {
  clearFavorites();
});

test('saveFavorite stores an entry', () => {
  const fav = saveFavorite('Daily noon', '0 12 * * *');
  expect(fav.label).toBe('Daily noon');
  expect(fav.expression).toBe('0 12 * * *');
  expect(fav.createdAt).toBeDefined();
  expect(fav.updatedAt).toBeDefined();
});

test('saveFavorite stores optional metadata', () => {
  const fav = saveFavorite('Morning', '0 8 * * *', { timezone: 'America/New_York' });
  expect(fav.timezone).toBe('America/New_York');
});

test('saveFavorite throws when label is missing', () => {
  expect(() => saveFavorite('', '0 0 * * *')).toThrow();
});

test('saveFavorite throws when expression is missing', () => {
  expect(() => saveFavorite('My job', '')).toThrow();
});

test('saveFavorite updates existing label preserving createdAt', () => {
  const first = saveFavorite('Nightly', '0 0 * * *');
  const second = saveFavorite('Nightly', '0 1 * * *');
  expect(second.expression).toBe('0 1 * * *');
  expect(second.createdAt).toBe(first.createdAt);
  expect(listFavorites()).toHaveLength(1);
});

test('getFavorite retrieves by label', () => {
  saveFavorite('Weekly', '0 0 * * 0');
  const fav = getFavorite('Weekly');
  expect(fav).not.toBeNull();
  expect(fav.expression).toBe('0 0 * * 0');
});

test('getFavorite returns null for unknown label', () => {
  expect(getFavorite('Unknown')).toBeNull();
});

test('listFavorites returns all entries', () => {
  saveFavorite('A', '0 1 * * *');
  saveFavorite('B', '0 2 * * *');
  expect(listFavorites()).toHaveLength(2);
});

test('removeFavorite removes entry and returns true', () => {
  saveFavorite('Temp', '0 3 * * *');
  expect(removeFavorite('Temp')).toBe(true);
  expect(getFavorite('Temp')).toBeNull();
});

test('removeFavorite returns false for unknown label', () => {
  expect(removeFavorite('Ghost')).toBe(false);
});

test('findByExpression returns matching favourites', () => {
  saveFavorite('Job A', '0 9 * * 1-5');
  saveFavorite('Job B', '0 9 * * 1-5');
  saveFavorite('Job C', '0 10 * * *');
  const results = findByExpression('0 9 * * 1-5');
  expect(results).toHaveLength(2);
});

test('findByExpression returns empty array when none match', () => {
  expect(findByExpression('0 0 1 1 *')).toHaveLength(0);
});
