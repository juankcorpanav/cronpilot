/**
 * suggest.js — Cron expression suggestions based on natural language input
 */

const { getPresets } = require('./presets');

const KEYWORD_MAP = [
  { keywords: ['every minute', 'each minute', 'minutely'], expression: '* * * * *' },
  { keywords: ['every hour', 'each hour', 'hourly'], expression: '0 * * * *' },
  { keywords: ['every day', 'daily', 'once a day', 'each day'], expression: '0 0 * * *' },
  { keywords: ['every week', 'weekly', 'once a week'], expression: '0 0 * * 0' },
  { keywords: ['every month', 'monthly', 'once a month'], expression: '0 0 1 * *' },
  { keywords: ['every year', 'yearly', 'annually', 'once a year'], expression: '0 0 1 1 *' },
  { keywords: ['midnight'], expression: '0 0 * * *' },
  { keywords: ['noon', 'midday'], expression: '0 12 * * *' },
  { keywords: ['weekday', 'weekdays', 'monday to friday', 'mon-fri'], expression: '0 9 * * 1-5' },
  { keywords: ['weekend', 'weekends', 'saturday', 'sunday'], expression: '0 10 * * 6,0' },
  { keywords: ['every 5 minutes', 'every five minutes'], expression: '*/5 * * * *' },
  { keywords: ['every 15 minutes', 'every fifteen minutes', 'quarter hour'], expression: '*/15 * * * *' },
  { keywords: ['every 30 minutes', 'every thirty minutes', 'half hour'], expression: '*/30 * * * *' },
  { keywords: ['twice a day', 'twice daily'], expression: '0 0,12 * * *' },
];

/**
 * Suggest cron expressions based on a natural language query.
 * @param {string} query
 * @returns {Array<{ expression: string, description: string, score: number }>}
 */
function suggest(query) {
  if (!query || typeof query !== 'string') return [];

  const normalized = query.toLowerCase().trim();
  const results = [];
  const seen = new Set();

  for (const entry of KEYWORD_MAP) {
    for (const keyword of entry.keywords) {
      if (normalized.includes(keyword)) {
        if (!seen.has(entry.expression)) {
          seen.add(entry.expression);
          results.push({
            expression: entry.expression,
            score: keyword.length / normalized.length,
          });
        }
        break;
      }
    }
  }

  const presets = getPresets();
  for (const preset of presets) {
    if (seen.has(preset.expression)) continue;
    const label = preset.label.toLowerCase();
    const desc = (preset.description || '').toLowerCase();
    if (label.includes(normalized) || normalized.includes(label) || desc.includes(normalized)) {
      seen.add(preset.expression);
      results.push({
        expression: preset.expression,
        score: label === normalized ? 1 : 0.5,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5).map(({ expression, score }) => ({ expression, score }));
}

/**
 * Return top suggestion or null.
 * @param {string} query
 * @returns {{ expression: string, score: number } | null}
 */
function topSuggestion(query) {
  const results = suggest(query);
  return results.length > 0 ? results[0] : null;
}

module.exports = { suggest, topSuggestion };
