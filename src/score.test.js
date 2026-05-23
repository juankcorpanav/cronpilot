const { scoreCron, quickScore, scoreReadability, scoreSpecificity, scoreSafety } = require('./score');

describe('scoreReadability', () => {
  it('gives full score for simple numeric fields', () => {
    expect(scoreReadability(['0', '9', '1', '1', '1'])).toBe(100);
  });

  it('penalizes wildcards', () => {
    const score = scoreReadability(['*', '*', '*', '*', '*']);
    expect(score).toBeLessThan(80);
  });

  it('penalizes step expressions', () => {
    const score = scoreReadability(['*/5', '9', '*', '*', '*']);
    expect(score).toBeLessThan(100);
  });

  it('penalizes long comma lists', () => {
    const score = scoreReadability(['1,2,3,4,5', '9', '*', '*', '*']);
    expect(score).toBeLessThan(100);
  });
});

describe('scoreSpecificity', () => {
  it('scores fully specific expression at 100', () => {
    expect(scoreSpecificity(['0', '9', '1', '1', '1'])).toBe(100);
  });

  it('reduces score for each wildcard', () => {
    const allWild = scoreSpecificity(['*', '*', '*', '*', '*']);
    const oneWild = scoreSpecificity(['0', '*', '1', '1', '1']);
    expect(allWild).toBeLessThan(oneWild);
  });
});

describe('scoreSafety', () => {
  it('penalizes every-minute expressions', () => {
    expect(scoreSafety(['*', '*', '*', '*', '*'])).toBeLessThan(50);
  });

  it('does not penalize hourly expressions heavily', () => {
    expect(scoreSafety(['0', '*', '*', '*', '*'])).toBeGreaterThan(50);
  });

  it('penalizes very frequent step intervals', () => {
    const score = scoreSafety(['*/2', '*', '*', '*', '*']);
    expect(score).toBeLessThan(60);
  });
});

describe('scoreCron', () => {
  it('returns grade A for a clean daily expression', () => {
    const result = scoreCron('0 9 * * 1-5');
    expect(result.grade).toMatch(/[AB]/);
    expect(result.total).toBeGreaterThan(60);
  });

  it('returns grade F for invalid expression', () => {
    const result = scoreCron('not a cron');
    expect(result.grade).toBe('F');
    expect(result.total).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('returns lower grade for every-minute expression', () => {
    const result = scoreCron('* * * * *');
    expect(['C', 'D', 'F']).toContain(result.grade);
  });

  it('includes readability, specificity, safety fields', () => {
    const result = scoreCron('0 12 * * *');
    expect(result).toHaveProperty('readability');
    expect(result).toHaveProperty('specificity');
    expect(result).toHaveProperty('safety');
  });
});

describe('quickScore', () => {
  it('returns a number between 0 and 100', () => {
    const s = quickScore('0 6 * * 1');
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });

  it('returns 0 for invalid expression', () => {
    expect(quickScore('bad')).toBe(0);
  });
});
