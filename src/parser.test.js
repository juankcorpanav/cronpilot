const { parseCron } = require('./parser');

describe('parseCron', () => {
  test('parses a simple every-minute expression', () => {
    const result = parseCron('* * * * *');
    expect(result.minute).toEqual({ type: 'any' });
    expect(result.hour).toEqual({ type: 'any' });
    expect(result.raw).toBe('* * * * *');
  });

  test('parses exact values', () => {
    const result = parseCron('30 9 15 6 1');
    expect(result.minute).toEqual({ type: 'exact', value: 30 });
    expect(result.hour).toEqual({ type: 'exact', value: 9 });
    expect(result.dayOfMonth).toEqual({ type: 'exact', value: 15 });
    expect(result.month).toEqual({ type: 'exact', value: 6 });
    expect(result.dayOfWeek).toEqual({ type: 'exact', value: 1 });
  });

  test('parses step expressions', () => {
    const result = parseCron('*/15 */2 * * *');
    expect(result.minute).toEqual({ type: 'step', base: 0, step: 15 });
    expect(result.hour).toEqual({ type: 'step', base: 0, step: 2 });
  });

  test('parses range expressions', () => {
    const result = parseCron('0 9-17 * * 1-5');
    expect(result.hour).toEqual({ type: 'range', start: 9, end: 17 });
    expect(result.dayOfWeek).toEqual({ type: 'range', start: 1, end: 5 });
  });

  test('parses list expressions', () => {
    const result = parseCron('0 8,12,18 * * *');
    expect(result.hour).toEqual({ type: 'list', values: [8, 12, 18] });
  });

  test('parses month aliases', () => {
    const result = parseCron('0 0 1 jan *');
    expect(result.month).toEqual({ type: 'exact', value: 1 });
  });

  test('parses day-of-week aliases', () => {
    const result = parseCron('0 0 * * mon');
    expect(result.dayOfWeek).toEqual({ type: 'exact', value: 1 });
  });

  test('throws on wrong number of fields', () => {
    expect(() => parseCron('* * * *')).toThrow('Expected 5 fields');
    expect(() => parseCron('* * * * * *')).toThrow('Expected 5 fields');
  });

  test('throws on out-of-range values', () => {
    expect(() => parseCron('60 * * * *')).toThrow('out of range');
    expect(() => parseCron('* 25 * * *')).toThrow('out of range');
    expect(() => parseCron('* * 32 * *')).toThrow('out of range');
  });

  test('throws on invalid step', () => {
    expect(() => parseCron('*/0 * * * *')).toThrow('Invalid step');
  });

  test('throws on inverted range', () => {
    expect(() => parseCron('0 17-9 * * *')).toThrow('Invalid range');
  });

  test('throws if expression is not a string', () => {
    expect(() => parseCron(null)).toThrow('Expression must be a string');
  });
});
