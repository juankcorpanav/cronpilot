import { describe, it, expect } from 'vitest';
import {
  toJson,
  toYaml,
  toCrontab,
  toMarkdown,
  exportExpression,
  SUPPORTED_FORMATS,
} from './export.js';

const EXPR = '0 9 * * 1-5';
const META = { label: 'Weekday Morning', timezone: 'America/New_York' };

describe('toJson', () => {
  it('returns an object with expression and fields', () => {
    const result = toJson(EXPR);
    expect(result.expression).toBe(EXPR);
    expect(result.fields).toHaveProperty('minute');
    expect(result.fields).toHaveProperty('hour');
    expect(result.timezone).toBe('UTC');
  });

  it('includes metadata when provided', () => {
    const result = toJson(EXPR, META);
    expect(result.label).toBe('Weekday Morning');
    expect(result.timezone).toBe('America/New_York');
  });

  it('includes human-readable description', () => {
    const result = toJson(EXPR);
    expect(typeof result.human).toBe('string');
    expect(result.human.length).toBeGreaterThan(0);
  });
});

describe('toYaml', () => {
  it('returns a string', () => {
    expect(typeof toYaml(EXPR)).toBe('string');
  });

  it('contains the expression', () => {
    expect(toYaml(EXPR)).toContain(EXPR);
  });

  it('includes label when provided', () => {
    expect(toYaml(EXPR, META)).toContain('Weekday Morning');
  });

  it('includes timezone', () => {
    expect(toYaml(EXPR, META)).toContain('America/New_York');
  });
});

describe('toCrontab', () => {
  it('returns a crontab-style string', () => {
    const result = toCrontab(EXPR, 'backup.sh');
    expect(result).toContain(EXPR);
    expect(result).toContain('backup.sh');
  });

  it('prepends CRON_TZ when timezone provided', () => {
    const result = toCrontab(EXPR, 'run.sh', META);
    expect(result).toContain('CRON_TZ=America/New_York');
  });

  it('uses label as comment when available', () => {
    const result = toCrontab(EXPR, 'run.sh', META);
    expect(result).toContain('# Weekday Morning');
  });
});

describe('toMarkdown', () => {
  it('wraps expression in backticks', () => {
    expect(toMarkdown(EXPR)).toContain(`\`${EXPR}\``);
  });

  it('includes timezone', () => {
    expect(toMarkdown(EXPR, META)).toContain('America/New_York');
  });

  it('includes label in bold when provided', () => {
    expect(toMarkdown(EXPR, META)).toContain('**Weekday Morning**');
  });
});

describe('exportExpression', () => {
  it('dispatches to toJson by default', () => {
    const result = exportExpression(EXPR);
    expect(typeof result).toBe('object');
    expect(result.expression).toBe(EXPR);
  });

  it('dispatches to yaml format', () => {
    const result = exportExpression(EXPR, 'yaml');
    expect(typeof result).toBe('string');
  });

  it('throws on unsupported format', () => {
    expect(() => exportExpression(EXPR, 'xml')).toThrow('Unsupported format');
  });

  it('SUPPORTED_FORMATS lists known formats', () => {
    expect(SUPPORTED_FORMATS).toContain('json');
    expect(SUPPORTED_FORMATS).toContain('yaml');
    expect(SUPPORTED_FORMATS).toContain('crontab');
    expect(SUPPORTED_FORMATS).toContain('markdown');
  });
});
