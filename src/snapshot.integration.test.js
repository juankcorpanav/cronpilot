/**
 * Integration tests: snapshot module interacting with parser and humanizer
 */

const { saveSnapshot, getSnapshot, findByExpression, listSnapshots, clearSnapshots } = require('./snapshot');
const { parseCron } = require('./parser');
const { humanize } = require('./humanizer');

beforeEach(() => clearSnapshots());

describe('snapshot + parser integration', () => {
  test('saves a parsed expression and retrieves it intact', () => {
    const expr = '0 9 * * 1-5';
    const parsed = parseCron(expr);
    saveSnapshot('workdays', expr, { parsed });
    const snap = getSnapshot('workdays');
    expect(snap.meta.parsed.minute).toBeDefined();
    expect(snap.expression).toBe(expr);
  });

  test('stores multiple parsed snapshots and lists them', () => {
    ['0 6 * * *', '30 12 * * *', '0 18 * * *'].forEach((e, i) => {
      const parsed = parseCron(e);
      saveSnapshot(`slot-${i}`, e, { parsed });
    });
    const all = listSnapshots();
    expect(all).toHaveLength(3);
    all.forEach(s => expect(s.meta.parsed).toBeDefined());
  });
});

describe('snapshot + humanizer integration', () => {
  test('saves a snapshot with human-readable description in meta', () => {
    const expr = '0 9 * * 1';
    const description = humanize(expr);
    saveSnapshot('monday-morning', expr, { description });
    const snap = getSnapshot('monday-morning');
    expect(snap.meta.description).toContain('Monday');
  });

  test('finds snapshots by expression and checks their descriptions', () => {
    const expr = '*/15 * * * *';
    const description = humanize(expr);
    saveSnapshot('every-15-a', expr, { description });
    saveSnapshot('every-15-b', expr, { description });
    const results = findByExpression(expr);
    expect(results).toHaveLength(2);
    results.forEach(r => expect(r.meta.description).toBeDefined());
  });
});

describe('snapshot overwrite behavior', () => {
  test('overwriting a snapshot updates the expression', () => {
    saveSnapshot('job', '0 9 * * *');
    saveSnapshot('job', '0 10 * * *');
    const snap = getSnapshot('job');
    expect(snap.expression).toBe('0 10 * * *');
  });

  test('list still shows one entry after overwrite', () => {
    saveSnapshot('job', '0 9 * * *');
    saveSnapshot('job', '0 10 * * *');
    expect(listSnapshots()).toHaveLength(1);
  });
});
