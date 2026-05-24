const { estimateDailyFrequency, classifyFrequency, classifyPattern, classify } = require('./classify');
const { parseCron } = require('./parser');

describe('estimateDailyFrequency', () => {
  it('returns 1440 for * * * * * (every minute)', () => {
    const fields = parseCron('* * * * *');
    expect(estimateDailyFrequency(fields)).toBe(1440);
  });

  it('returns 24 for 0 * * * * (every hour)', () => {
    const fields = parseCron('0 * * * *');
    expect(estimateDailyFrequency(fields)).toBe(24);
  });

  it('returns 1 for 0 9 * * * (once daily)', () => {
    const fields = parseCron('0 9 * * *');
    expect(estimateDailyFrequency(fields)).toBe(1);
  });

  it('returns 2 for 0 9,18 * * * (twice daily)', () => {
    const fields = parseCron('0 9,18 * * *');
    expect(estimateDailyFrequency(fields)).toBe(2);
  });
});

describe('classifyFrequency', () => {
  it('classifies * * * * * as high frequency', () => {
    const result = classifyFrequency('* * * * *');
    expect(result.tier).toBe('high');
    expect(result.firesPerDay).toBe(1440);
  });

  it('classifies 0 * * * * as medium frequency', () => {
    const result = classifyFrequency('0 * * * *');
    expect(result.tier).toBe('medium');
  });

  it('classifies 0 9 * * * as low frequency', () => {
    const result = classifyFrequency('0 9 * * *');
    expect(result.tier).toBe('low');
    expect(result.label).toBe('Low frequency');
  });

  it('classifies 0 9 1 * * as rare', () => {
    const result = classifyFrequency('0 9 1 * *');
    expect(result.tier).toBe('rare');
  });
});

describe('classifyPattern', () => {
  it('identifies minutely pattern', () => {
    expect(classifyPattern('* * * * *')).toBe('minutely');
  });

  it('identifies hourly pattern', () => {
    expect(classifyPattern('30 * * * *')).toBe('hourly');
  });

  it('identifies daily pattern', () => {
    expect(classifyPattern('0 9 * * *')).toBe('daily');
  });

  it('identifies weekly pattern', () => {
    expect(classifyPattern('0 9 * * 1')).toBe('weekly');
  });

  it('identifies monthly pattern', () => {
    expect(classifyPattern('0 9 1 * *')).toBe('monthly');
  });

  it('identifies yearly pattern', () => {
    expect(classifyPattern('0 9 1 1 *')).toBe('yearly');
  });

  it('identifies custom pattern for step expressions', () => {
    expect(classifyPattern('*/15 * * * *')).toBe('custom');
  });
});

describe('classify', () => {
  it('returns full classification object', () => {
    const result = classify('0 9 * * 1');
    expect(result).toMatchObject({
      expression: '0 9 * * 1',
      pattern: 'weekly',
      tier: 'low',
      firesPerDay: 1
    });
    expect(result.label).toBeDefined();
  });

  it('classifies a high-frequency expression', () => {
    const result = classify('*/5 * * * *');
    expect(result.pattern).toBe('custom');
    expect(result.tier).toBe('high');
  });
});
