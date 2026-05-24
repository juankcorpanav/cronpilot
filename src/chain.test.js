const { chain, CronChain } = require('./chain');

describe('chain', () => {
  test('returns a CronChain instance', () => {
    expect(chain('0 9 * * 1')).toBeInstanceOf(CronChain);
  });

  test('result includes expression and empty steps initially', () => {
    const r = chain('0 9 * * 1').result();
    expect(r.expression).toBe('0 9 * * 1');
    expect(r.timezone).toBe('UTC');
    expect(r.steps).toEqual([]);
  });

  test('timezone step is recorded', () => {
    const r = chain('0 9 * * 1').timezone('America/New_York').result();
    expect(r.timezone).toBe('America/New_York');
    expect(r.steps[0]).toEqual({ op: 'timezone', value: 'America/New_York' });
  });

  test('validate step records valid result for valid expression', () => {
    const r = chain('0 9 * * 1').validate().result();
    expect(r.steps[0].op).toBe('validate');
    expect(r.steps[0].value.valid).toBe(true);
  });

  test('validate step records error for invalid expression', () => {
    const r = chain('99 9 * * 1').validate().result();
    expect(r.steps[0].value.valid).toBe(false);
    expect(r.steps[0].value.error).toBeDefined();
  });

  test('normalize step updates expression', () => {
    const c = chain('0 9 * * 1').normalize();
    const r = c.result();
    expect(r.steps[0].op).toBe('normalize');
    expect(typeof r.expression).toBe('string');
  });

  test('describe step records human-readable string', () => {
    const r = chain('0 9 * * 1').describe().result();
    const step = r.steps.find(s => s.op === 'describe');
    expect(typeof step.value).toBe('string');
    expect(step.value.length).toBeGreaterThan(0);
  });

  test('lint step records issues array', () => {
    const r = chain('0 9 * * 1').lint().result();
    const step = r.steps.find(s => s.op === 'lint');
    expect(Array.isArray(step.value)).toBe(true);
  });

  test('score step records score object', () => {
    const r = chain('0 9 * * 1').score().result();
    const step = r.steps.find(s => s.op === 'score');
    expect(step.value).toHaveProperty('total');
  });

  test('next step records array of fire times', () => {
    const r = chain('0 9 * * 1').next(2).result();
    const step = r.steps.find(s => s.op === 'next');
    expect(Array.isArray(step.value)).toBe(true);
    expect(step.value.length).toBe(2);
  });

  test('getStep returns value for existing op', () => {
    const c = chain('0 9 * * 1').validate();
    expect(c.getStep('validate')).toHaveProperty('valid');
  });

  test('getStep returns null for missing op', () => {
    const c = chain('0 9 * * 1');
    expect(c.getStep('score')).toBeNull();
  });

  test('chaining multiple steps records all in order', () => {
    const r = chain('0 9 * * 1')
      .validate()
      .describe()
      .score()
      .result();
    expect(r.steps.map(s => s.op)).toEqual(['validate', 'describe', 'score']);
  });
});
