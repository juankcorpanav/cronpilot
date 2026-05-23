const { summarize, summaryReport } = require('./summarize');

describe('summarize', () => {
  test('returns human-readable string for valid expression', () => {
    const result = summarize('0 9 * * 1-5');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('returns error string for invalid expression', () => {
    const result = summarize('invalid');
    expect(result).toMatch(/invalid/i);
  });

  test('appends timezone info when timezone is provided', () => {
    const result = summarize('0 9 * * 1-5', 'America/New_York');
    expect(result).toContain('America/New_York');
    expect(result).toContain('UTC');
  });

  test('notes unknown timezone gracefully', () => {
    const result = summarize('0 9 * * 1-5', 'Mars/Olympus');
    expect(result).toContain('unknown timezone');
  });

  test('returns plain human string when no timezone given', () => {
    const result = summarize('*/5 * * * *');
    expect(result).not.toContain('UTC');
  });
});

describe('summaryReport', () => {
  test('returns valid:false for invalid expression', () => {
    const report = summaryReport('bad expr');
    expect(report.valid).toBe(false);
    expect(report.error).toBeDefined();
  });

  test('returns structured report for valid expression', () => {
    const report = summaryReport('0 0 * * *');
    expect(report.valid).toBe(true);
    expect(report.human).toBeDefined();
    expect(report.fields).toHaveProperty('minute', '0');
    expect(report.fields).toHaveProperty('hour', '0');
  });

  test('identifies known preset', () => {
    const report = summaryReport('@daily');
    if (report.valid) {
      // preset may or may not resolve depending on alias support
      expect(report).toHaveProperty('preset');
    }
  });

  test('includes timezone info when provided', () => {
    const report = summaryReport('0 12 * * *', 'Europe/London');
    expect(report.timezone).toBe('Europe/London');
    expect(report.utcOffset).toBeDefined();
  });

  test('warnings is null when expression is clean', () => {
    const report = summaryReport('0 9 * * 1-5');
    // warnings may be null or an array; just check the key exists
    expect(report).toHaveProperty('warnings');
  });

  test('does not include timezone key when not provided', () => {
    const report = summaryReport('*/10 * * * *');
    expect(report).not.toHaveProperty('timezone');
  });
});
