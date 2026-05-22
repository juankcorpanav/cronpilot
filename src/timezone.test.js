const { isValidTimezone, getUtcOffset, nextCronTime } = require('./timezone');
const { DateTime } = require('luxon');

describe('isValidTimezone', () => {
  test('accepts valid IANA timezones', () => {
    expect(isValidTimezone('America/New_York')).toBe(true);
    expect(isValidTimezone('Europe/London')).toBe(true);
    expect(isValidTimezone('Asia/Kolkata')).toBe(true);
    expect(isValidTimezone('UTC')).toBe(true);
  });

  test('rejects invalid timezones', () => {
    expect(isValidTimezone('Mars/Olympus')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
    expect(isValidTimezone(null)).toBe(false);
    expect(isValidTimezone(undefined)).toBe(false);
  });
});

describe('getUtcOffset', () => {
  test('returns offset string for UTC', () => {
    expect(getUtcOffset('UTC')).toBe('UTC+00:00');
  });

  test('returns offset string for a fixed-offset zone', () => {
    // UTC+5:30 for Asia/Kolkata (no DST)
    const offset = getUtcOffset('Asia/Kolkata');
    expect(offset).toBe('UTC+05:30');
  });

  test('throws for invalid timezone', () => {
    expect(() => getUtcOffset('Fake/Zone')).toThrow('Invalid timezone');
  });
});

describe('nextCronTime', () => {
  test('finds next minute match for "* * * * *"', () => {
    const from = DateTime.fromISO('2024-06-01T12:00:00', { zone: 'UTC' });
    const result = nextCronTime('* * * * *', 'UTC', from);
    expect(result).not.toBeNull();
    expect(result.toISO()).toBe(
      DateTime.fromISO('2024-06-01T12:00:00', { zone: 'UTC' }).toISO()
    );
  });

  test('finds next hourly match for "0 * * * *"', () => {
    const from = DateTime.fromISO('2024-06-01T12:05:00', { zone: 'UTC' });
    const result = nextCronTime('0 * * * *', 'UTC', from);
    expect(result).not.toBeNull();
    expect(result.minute).toBe(0);
    expect(result.hour).toBe(13);
  });

  test('finds next daily match for "30 9 * * *"', () => {
    const from = DateTime.fromISO('2024-06-01T10:00:00', { zone: 'UTC' });
    const result = nextCronTime('30 9 * * *', 'UTC', from);
    expect(result).not.toBeNull();
    expect(result.hour).toBe(9);
    expect(result.minute).toBe(30);
    expect(result.day).toBe(2);
  });

  test('returns null when no match within a year', () => {
    // 30th of February never exists
    const from = DateTime.fromISO('2024-01-01T00:00:00', { zone: 'UTC' });
    const result = nextCronTime('0 0 30 2 *', 'UTC', from);
    expect(result).toBeNull();
  });
});
