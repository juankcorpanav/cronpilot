/**
 * Common cron expression presets with human-readable labels.
 * Each preset includes the cron expression, a label, and a description.
 */

const PRESETS = {
  everyMinute: {
    expression: '* * * * *',
    label: 'Every Minute',
    description: 'Runs once every minute',
    category: 'frequent',
  },
  everyFiveMinutes: {
    expression: '*/5 * * * *',
    label: 'Every 5 Minutes',
    description: 'Runs every 5 minutes',
    category: 'frequent',
  },
  everyFifteenMinutes: {
    expression: '*/15 * * * *',
    label: 'Every 15 Minutes',
    description: 'Runs every 15 minutes',
    category: 'frequent',
  },
  everyThirtyMinutes: {
    expression: '*/30 * * * *',
    label: 'Every 30 Minutes',
    description: 'Runs every 30 minutes',
    category: 'frequent',
  },
  hourly: {
    expression: '0 * * * *',
    label: 'Hourly',
    description: 'Runs at the start of every hour',
    category: 'hourly',
  },
  daily: {
    expression: '0 0 * * *',
    label: 'Daily at Midnight',
    description: 'Runs once a day at midnight',
    category: 'daily',
  },
  dailyNoon: {
    expression: '0 12 * * *',
    label: 'Daily at Noon',
    description: 'Runs once a day at noon',
    category: 'daily',
  },
  weekly: {
    expression: '0 0 * * 0',
    label: 'Weekly on Sunday',
    description: 'Runs once a week on Sunday at midnight',
    category: 'weekly',
  },
  weekdays: {
    expression: '0 9 * * 1-5',
    label: 'Weekdays at 9am',
    description: 'Runs Monday through Friday at 9:00 AM',
    category: 'weekly',
  },
  monthly: {
    expression: '0 0 1 * *',
    label: 'Monthly',
    description: 'Runs on the first day of every month at midnight',
    category: 'monthly',
  },
  yearly: {
    expression: '0 0 1 1 *',
    label: 'Yearly',
    description: 'Runs on January 1st at midnight',
    category: 'yearly',
  },
};

/**
 * Returns all available presets.
 * @returns {Object} Map of preset keys to preset objects.
 */
function getPresets() {
  return { ...PRESETS };
}

/**
 * Returns presets filtered by category.
 * @param {string} category
 * @returns {Object}
 */
function getPresetsByCategory(category) {
  return Object.fromEntries(
    Object.entries(PRESETS).filter(([, preset]) => preset.category === category)
  );
}

/**
 * Looks up a preset by its cron expression.
 * @param {string} expression
 * @returns {Object|null}
 */
function findPresetByExpression(expression) {
  const entry = Object.entries(PRESETS).find(
    ([, preset]) => preset.expression === expression
  );
  return entry ? { key: entry[0], ...entry[1] } : null;
}

module.exports = { getPresets, getPresetsByCategory, findPresetByExpression, PRESETS };
