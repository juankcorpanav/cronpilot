/**
 * export.js — Export cron expressions to various formats
 */

import { parseCron } from './parser.js';
import { humanize } from './humanizer.js';

const SUPPORTED_FORMATS = ['json', 'yaml', 'crontab', 'markdown'];

/**
 * Export a cron expression to a structured object
 * @param {string} expression - Cron expression
 * @param {object} meta - Optional metadata (label, timezone, description)
 * @returns {object}
 */
export function toJson(expression, meta = {}) {
  const parsed = parseCron(expression);
  return {
    expression,
    fields: {
      minute: parsed[0],
      hour: parsed[1],
      dayOfMonth: parsed[2],
      month: parsed[3],
      dayOfWeek: parsed[4],
    },
    human: humanize(expression),
    timezone: meta.timezone || 'UTC',
    label: meta.label || null,
    description: meta.description || null,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Export a cron expression to YAML-like string
 * @param {string} expression
 * @param {object} meta
 * @returns {string}
 */
export function toYaml(expression, meta = {}) {
  const data = toJson(expression, meta);
  const lines = [
    `expression: "${data.expression}"`,
    `human: "${data.human}"`,
    `timezone: ${data.timezone}`,
  ];
  if (data.label) lines.push(`label: "${data.label}"`);
  if (data.description) lines.push(`description: "${data.description}"`);
  lines.push(`exported_at: ${data.exportedAt}`);
  return lines.join('\n');
}

/**
 * Export to crontab line format
 * @param {string} expression
 * @param {string} command - Shell command to attach
 * @param {object} meta
 * @returns {string}
 */
export function toCrontab(expression, command = 'your-command', meta = {}) {
  const comment = meta.label ? `# ${meta.label}` : `# ${humanize(expression)}`;
  const tz = meta.timezone ? `CRON_TZ=${meta.timezone} ` : '';
  return `${comment}\n${tz}${expression} ${command}`;
}

/**
 * Export to a Markdown snippet
 * @param {string} expression
 * @param {object} meta
 * @returns {string}
 */
export function toMarkdown(expression, meta = {}) {
  const human = humanize(expression);
  const tz = meta.timezone || 'UTC';
  const label = meta.label ? `**${meta.label}**\n\n` : '';
  return `${label}\`${expression}\`\n\n> ${human} (${tz})`;
}

/**
 * Generic export dispatcher
 * @param {string} expression
 * @param {string} format - 'json' | 'yaml' | 'crontab' | 'markdown'
 * @param {object} options
 * @returns {string|object}
 */
export function exportExpression(expression, format = 'json', options = {}) {
  if (!SUPPORTED_FORMATS.includes(format)) {
    throw new Error(`Unsupported format "${format}". Choose from: ${SUPPORTED_FORMATS.join(', ')}`);
  }
  switch (format) {
    case 'json': return toJson(expression, options);
    case 'yaml': return toYaml(expression, options);
    case 'crontab': return toCrontab(expression, options.command, options);
    case 'markdown': return toMarkdown(expression, options);
  }
}

export { SUPPORTED_FORMATS };
