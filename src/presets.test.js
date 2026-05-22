const {
  getPresets,
  getPresetsByCategory,
  findPresetByExpression,
  PRESETS,
} = require('./presets');

describe('getPresets', () => {
  it('returns all presets', () => {
    const presets = getPresets();
    expect(Object.keys(presets).length).toBeGreaterThan(0);
    expect(presets).toHaveProperty('hourly');
    expect(presets).toHaveProperty('daily');
    expect(presets).toHaveProperty('weekly');
    expect(presets).toHaveProperty('monthly');
  });

  it('each preset has required fields', () => {
    const presets = getPresets();
    for (const [key, preset] of Object.entries(presets)) {
      expect(preset).toHaveProperty('expression');
      expect(preset).toHaveProperty('label');
      expect(preset).toHaveProperty('description');
      expect(preset).toHaveProperty('category');
      expect(typeof preset.expression).toBe('string');
    }
  });

  it('returns a copy, not the original', () => {
    const presets = getPresets();
    presets.hourly.label = 'Modified';
    expect(PRESETS.hourly.label).not.toBe('Modified');
  });
});

describe('getPresetsByCategory', () => {
  it('returns only presets matching the given category', () => {
    const daily = getPresetsByCategory('daily');
    expect(Object.keys(daily).length).toBeGreaterThan(0);
    for (const preset of Object.values(daily)) {
      expect(preset.category).toBe('daily');
    }
  });

  it('returns empty object for unknown category', () => {
    const result = getPresetsByCategory('nonexistent');
    expect(result).toEqual({});
  });

  it('returns frequent presets', () => {
    const frequent = getPresetsByCategory('frequent');
    expect(frequent).toHaveProperty('everyMinute');
    expect(frequent).toHaveProperty('everyFiveMinutes');
  });
});

describe('findPresetByExpression', () => {
  it('finds a preset by exact expression', () => {
    const result = findPresetByExpression('0 * * * *');
    expect(result).not.toBeNull();
    expect(result.key).toBe('hourly');
    expect(result.label).toBe('Hourly');
  });

  it('returns null for unknown expression', () => {
    const result = findPresetByExpression('1 2 3 4 5');
    expect(result).toBeNull();
  });

  it('includes the key in the returned object', () => {
    const result = findPresetByExpression('0 0 * * *');
    expect(result).toHaveProperty('key', 'daily');
    expect(result).toHaveProperty('expression', '0 0 * * *');
  });
});
