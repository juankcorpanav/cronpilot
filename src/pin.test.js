const { savePin, getPin, listPins, removePin, clearPins, isPinned, pinSummary } = require('./pin');

beforeEach(() => clearPins());

describe('savePin', () => {
  test('saves and returns a pin with all fields', () => {
    const pin = savePin('next-run', '0 9 * * 1', '2024-06-03T09:00:00.000Z', 'Monday morning');
    expect(pin.label).toBe('next-run');
    expect(pin.expression).toBe('0 9 * * 1');
    expect(pin.timestamp).toBe('2024-06-03T09:00:00.000Z');
    expect(pin.note).toBe('Monday morning');
    expect(pin.createdAt).toBeDefined();
  });

  test('accepts a Date object for timestamp', () => {
    const d = new Date('2024-07-01T00:00:00.000Z');
    const pin = savePin('date-pin', '0 0 1 7 *', d);
    expect(pin.timestamp).toBe('2024-07-01T00:00:00.000Z');
  });

  test('overwrites existing pin with same label', () => {
    savePin('dup', '* * * * *', '2024-01-01T00:00:00.000Z');
    savePin('dup', '0 6 * * *', '2024-01-02T06:00:00.000Z', 'updated');
    const pin = getPin('dup');
    expect(pin.expression).toBe('0 6 * * *');
    expect(pin.note).toBe('updated');
  });

  test('throws on missing label', () => {
    expect(() => savePin('', '* * * * *', '2024-01-01')).toThrow('label');
  });

  test('throws on missing expression', () => {
    expect(() => savePin('x', '', '2024-01-01')).toThrow('expression');
  });
});

describe('getPin', () => {
  test('returns null for unknown label', () => {
    expect(getPin('ghost')).toBeNull();
  });

  test('returns saved pin', () => {
    savePin('p1', '0 0 * * *', '2024-05-01T00:00:00.000Z');
    expect(getPin('p1').label).toBe('p1');
  });
});

describe('listPins', () => {
  test('returns all pins when no filter', () => {
    savePin('a', '* * * * *', '2024-01-01T00:00:00.000Z');
    savePin('b', '0 6 * * *', '2024-01-02T06:00:00.000Z');
    expect(listPins()).toHaveLength(2);
  });

  test('filters by expression', () => {
    savePin('a', '* * * * *', '2024-01-01T00:00:00.000Z');
    savePin('b', '0 6 * * *', '2024-01-02T06:00:00.000Z');
    savePin('c', '* * * * *', '2024-01-01T00:01:00.000Z');
    const filtered = listPins('* * * * *');
    expect(filtered).toHaveLength(2);
    expect(filtered.every(p => p.expression === '* * * * *')).toBe(true);
  });
});

describe('removePin', () => {
  test('removes an existing pin', () => {
    savePin('r1', '* * * * *', '2024-01-01T00:00:00.000Z');
    expect(removePin('r1')).toBe(true);
    expect(getPin('r1')).toBeNull();
  });

  test('returns false for unknown label', () => {
    expect(removePin('nope')).toBe(false);
  });
});

describe('isPinned', () => {
  test('returns true when pinned', () => {
    savePin('check', '0 0 * * *', '2024-01-01T00:00:00.000Z');
    expect(isPinned('check')).toBe(true);
  });

  test('returns false when not pinned', () => {
    expect(isPinned('missing')).toBe(false);
  });
});

describe('pinSummary', () => {
  test('groups pins by expression', () => {
    savePin('s1', '0 9 * * 1', '2024-06-03T09:00:00.000Z', 'first');
    savePin('s2', '0 9 * * 1', '2024-06-10T09:00:00.000Z', 'second');
    savePin('s3', '0 0 * * *', '2024-06-01T00:00:00.000Z');
    const summary = pinSummary();
    expect(summary['0 9 * * 1']).toHaveLength(2);
    expect(summary['0 0 * * *']).toHaveLength(1);
  });

  test('returns empty object when no pins', () => {
    expect(pinSummary()).toEqual({});
  });
});
