const {
  addToHistory,
  getHistory,
  removeFromHistory,
  clearHistory,
  inHistory,
  MAX_HISTORY,
} = require('./history');

beforeEach(() => {
  clearHistory();
});

test('addToHistory stores an entry', () => {
  const entry = addToHistory('0 9 * * 1-5');
  expect(entry.expression).toBe('0 9 * * 1-5');
  expect(entry.timestamp).toBeDefined();
  expect(getHistory()).toHaveLength(1);
});

test('addToHistory trims whitespace', () => {
  addToHistory('  0 0 * * *  ');
  expect(getHistory()[0].expression).toBe('0 0 * * *');
});

test('addToHistory deduplicates and moves to top', () => {
  addToHistory('0 9 * * 1-5');
  addToHistory('0 0 * * *');
  addToHistory('0 9 * * 1-5');
  const history = getHistory();
  expect(history).toHaveLength(2);
  expect(history[0].expression).toBe('0 9 * * 1-5');
});

test('addToHistory stores optional metadata', () => {
  const entry = addToHistory('0 12 * * *', { label: 'Noon', timezone: 'UTC' });
  expect(entry.label).toBe('Noon');
  expect(entry.timezone).toBe('UTC');
});

test('addToHistory throws on invalid input', () => {
  expect(() => addToHistory('')).toThrow();
  expect(() => addToHistory(null)).toThrow();
});

test('getHistory respects limit', () => {
  addToHistory('0 1 * * *');
  addToHistory('0 2 * * *');
  addToHistory('0 3 * * *');
  expect(getHistory(2)).toHaveLength(2);
});

test('getHistory returns all when no limit given', () => {
  addToHistory('0 1 * * *');
  addToHistory('0 2 * * *');
  expect(getHistory()).toHaveLength(2);
});

test('removeFromHistory removes correct entry', () => {
  addToHistory('0 1 * * *');
  addToHistory('0 2 * * *');
  const removed = removeFromHistory('0 1 * * *');
  expect(removed).toBe(true);
  expect(getHistory()).toHaveLength(1);
  expect(getHistory()[0].expression).toBe('0 2 * * *');
});

test('removeFromHistory returns false when not found', () => {
  expect(removeFromHistory('0 5 * * *')).toBe(false);
});

test('inHistory returns true for existing expression', () => {
  addToHistory('0 0 1 * *');
  expect(inHistory('0 0 1 * *')).toBe(true);
});

test('inHistory returns false for missing expression', () => {
  expect(inHistory('0 0 1 * *')).toBe(false);
});

test(`history is capped at MAX_HISTORY (${MAX_HISTORY})`, () => {
  for (let i = 0; i < MAX_HISTORY + 5; i++) {
    addToHistory(`${i} * * * *`);
  }
  expect(getHistory()).toHaveLength(MAX_HISTORY);
});
