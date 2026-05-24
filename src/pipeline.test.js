const { runPipeline, fullReport, listSteps } = require('./pipeline');

describe('listSteps', () => {
  it('returns an array of step names', () => {
    const steps = listSteps();
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps).toContain('parse');
    expect(steps).toContain('humanize');
    expect(steps).toContain('normalize');
  });
});

describe('runPipeline', () => {
  const expr = '0 9 * * 1-5';

  it('runs all default steps without errors', () => {
    const { results, errors } = runPipeline(expr);
    expect(Object.keys(errors).length).toBe(0);
    expect(results).toBeDefined();
  });

  it('runs only specified steps', () => {
    const { results, errors } = runPipeline(expr, ['humanize', 'score']);
    expect(results.human).toBeDefined();
    expect(results.score).toBeDefined();
    expect(results.parsed).toBeUndefined();
    expect(Object.keys(errors).length).toBe(0);
  });

  it('records error for unknown step', () => {
    const { errors } = runPipeline(expr, ['nonexistent']);
    expect(errors.nonexistent).toMatch(/Unknown step/);
  });

  it('includes expression in output', () => {
    const out = runPipeline(expr, ['humanize']);
    expect(out.expression).toBe(expr);
  });

  it('handles invalid expression gracefully', () => {
    const { errors } = runPipeline('bad expr', ['parse']);
    expect(errors.parse).toBeDefined();
  });
});

describe('fullReport', () => {
  it('returns a combined report for a valid expression', () => {
    const report = fullReport('*/15 * * * *');
    expect(report.expression).toBe('*/15 * * * *');
    expect(report.results).toBeDefined();
    expect(report.errors).toBeDefined();
  });

  it('includes human-readable description', () => {
    const report = fullReport('0 0 * * *');
    expect(typeof report.results.human).toBe('string');
  });

  it('includes classification', () => {
    const report = fullReport('0 0 * * *');
    expect(report.results.classification).toBeDefined();
  });
});
