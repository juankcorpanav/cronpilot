const {
  detectFormat,
  fromQuartz,
  toQuartz,
  toAwsEventBridge,
  fromAwsEventBridge,
} = require('./convert');

describe('detectFormat', () => {
  it('detects standard 5-field expression', () => {
    expect(detectFormat('0 9 * * 1')).toBe('standard');
  });

  it('detects quartz 6-field expression', () => {
    expect(detectFormat('0 0 9 * * 1')).toBe('quartz');
  });

  it('detects quartz 7-field expression', () => {
    expect(detectFormat('0 0 9 * * 1 2025')).toBe('quartz');
  });

  it('returns unknown for invalid input', () => {
    expect(detectFormat('* *')).toBe('unknown');
    expect(detectFormat(null)).toBe('unknown');
  });
});

describe('fromQuartz', () => {
  it('converts 6-field quartz to standard 5-field', () => {
    const { expression, warnings } = fromQuartz('0 30 9 * * MON-FRI');
    expect(expression).toBe('30 9 * * MON-FRI');
    expect(warnings).toHaveLength(0);
  });

  it('warns when seconds field is not zero', () => {
    const { expression, warnings } = fromQuartz('30 0 12 * * ?');
    expect(expression).toBe('0 12 * * *');
    expect(warnings[0]).toMatch(/Seconds field/);
  });

  it('warns when year field is present and non-wildcard', () => {
    const { expression, warnings } = fromQuartz('0 0 8 1 1 ? 2030');
    expect(expression).toBe('0 8 1 1 *');
    expect(warnings.some(w => w.includes('Year field'))).toBe(true);
  });

  it('replaces ? with * in fields', () => {
    const { expression } = fromQuartz('0 0 12 ? * MON');
    expect(expression).toBe('0 12 * * MON');
  });

  it('throws for fewer than 6 fields', () => {
    expect(() => fromQuartz('0 9 * * 1')).toThrow();
  });
});

describe('toQuartz', () => {
  it('prepends seconds field to standard expression', () => {
    expect(toQuartz('30 9 * * MON-FRI')).toBe('0 30 9 * * MON-FRI');
  });

  it('appends year field when includeYear is true', () => {
    expect(toQuartz('0 12 * * *', { includeYear: true })).toBe('0 0 12 * * * *');
  });

  it('throws for non-5-field expression', () => {
    expect(() => toQuartz('0 0 9 * * 1')).toThrow();
  });
});

describe('toAwsEventBridge', () => {
  it('wraps expression in cron() with wildcard year', () => {
    expect(toAwsEventBridge('0 12 * * ?')).toBe('cron(0 12 * * ? *)');
  });

  it('throws for non-5-field expression', () => {
    expect(() => toAwsEventBridge('0 0 9 * * 1')).toThrow();
  });
});

describe('fromAwsEventBridge', () => {
  it('parses AWS cron() expression to standard 5-field', () => {
    expect(fromAwsEventBridge('cron(0 12 * * ? *)')).toBe('0 12 * * ?');
  });

  it('throws for invalid format', () => {
    expect(() => fromAwsEventBridge('rate(5 minutes)')).toThrow();
    expect(() => fromAwsEventBridge('0 12 * * ?')).toThrow();
  });
});
