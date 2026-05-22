const { humanize, describeField, labelValue } = require('./humanizer');

describe('labelValue', () => {
  test('returns month name for month type', () => {
    expect(labelValue('1', 'month')).toBe('January');
    expect(labelValue('12', 'month')).toBe('December');
  });

  test('returns day name for weekday type', () => {
    expect(labelValue('0', 'weekday')).toBe('Sunday');
    expect(labelValue('5', 'weekday')).toBe('Friday');
  });

  test('returns raw value for other types', () => {
    expect(labelValue('15', 'minute')).toBe('15');
    expect(labelValue('3', 'hour')).toBe('3');
  });
});

describe('describeField', () => {
  test('returns null for wildcard with no step', () => {
    expect(describeField({ value: '*' }, 'minute')).toBeNull();
  });

  test('describes step on wildcard', () => {
    expect(describeField({ value: '*', step: 5 }, 'minute')).toBe('every 5 minute(s)');
  });

  test('describes a list', () => {
    expect(describeField({ list: ['1', '3', '5'] }, 'month')).toBe('January, March, May');
  });

  test('describes a range', () => {
    expect(describeField({ range: ['1', '5'] }, 'day')).toBe('1 through 5');
  });

  test('describes a range with step', () => {
    expect(describeField({ range: ['0', '6'], step: 2 }, 'weekday'))
      .toBe('every 2 from Sunday through Saturday');
  });
});

describe('humanize', () => {
  test('every minute expression', () => {
    const parsed = {
      minute: { value: '*' },
      hour: { value: '*' },
      dayOfMonth: { value: '*' },
      month: { value: '*' },
      dayOfWeek: { value: '*' },
    };
    expect(humanize(parsed)).toBe('every minute');
  });

  test('specific hour and minute', () => {
    const parsed = {
      minute: { value: '30' },
      hour: { value: '9' },
      dayOfMonth: { value: '*' },
      month: { value: '*' },
      dayOfWeek: { value: '*' },
    };
    expect(humanize(parsed)).toContain('9');
    expect(humanize(parsed)).toContain('30');
  });

  test('includes timezone when provided', () => {
    const parsed = {
      minute: { value: '*' },
      hour: { value: '*' },
      dayOfMonth: { value: '*' },
      month: { value: '*' },
      dayOfWeek: { value: '*' },
    };
    expect(humanize(parsed, 'America/New_York')).toContain('America/New_York');
  });

  test('includes month description', () => {
    const parsed = {
      minute: { value: '*' },
      hour: { value: '*' },
      dayOfMonth: { value: '*' },
      month: { value: '6' },
      dayOfWeek: { value: '*' },
    };
    expect(humanize(parsed)).toContain('June');
  });
});
