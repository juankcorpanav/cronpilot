/**
 * template.js — Parameterized cron expression templates
 */

const TEMPLATES = [
  {
    id: 'every-n-minutes',
    label: 'Every N minutes',
    template: '*/{n} * * * *',
    params: [{ name: 'n', type: 'integer', min: 1, max: 59, default: 5 }],
  },
  {
    id: 'every-n-hours',
    label: 'Every N hours',
    template: '0 */{n} * * *',
    params: [{ name: 'n', type: 'integer', min: 1, max: 23, default: 2 }],
  },
  {
    id: 'daily-at-time',
    label: 'Daily at HH:MM',
    template: '{mm} {hh} * * *',
    params: [
      { name: 'hh', type: 'integer', min: 0, max: 23, default: 9 },
      { name: 'mm', type: 'integer', min: 0, max: 59, default: 0 },
    ],
  },
  {
    id: 'weekly-on-day',
    label: 'Weekly on a specific day',
    template: '0 9 * * {day}',
    params: [{ name: 'day', type: 'integer', min: 0, max: 6, default: 1 }],
  },
  {
    id: 'monthly-on-date',
    label: 'Monthly on date D at HH:MM',
    template: '{mm} {hh} {d} * *',
    params: [
      { name: 'd', type: 'integer', min: 1, max: 28, default: 1 },
      { name: 'hh', type: 'integer', min: 0, max: 23, default: 0 },
      { name: 'mm', type: 'integer', min: 0, max: 59, default: 0 },
    ],
  },
];

/**
 * List all available templates.
 * @returns {Array}
 */
function listTemplates() {
  return TEMPLATES.map(t => ({ id: t.id, label: t.label, params: t.params }));
}

/**
 * Build a cron expression from a template id and parameter values.
 * @param {string} id
 * @param {Object} values — { paramName: value }
 * @returns {{ expression: string, errors: string[] }}
 */
function buildFromTemplate(id, values = {}) {
  const tmpl = TEMPLATES.find(t => t.id === id);
  if (!tmpl) return { expression: null, errors: [`Unknown template: ${id}`] };

  const errors = [];
  const resolved = {};

  for (const param of tmpl.params) {
    const raw = values[param.name] !== undefined ? values[param.name] : param.default;
    const val = parseInt(raw, 10);
    if (isNaN(val)) {
      errors.push(`Parameter "${param.name}" must be an integer, got: ${raw}`);
    } else if (val < param.min || val > param.max) {
      errors.push(`Parameter "${param.name}" must be between ${param.min} and ${param.max}, got: ${val}`);
    } else {
      resolved[param.name] = val;
    }
  }

  if (errors.length > 0) return { expression: null, errors };

  let expression = tmpl.template;
  for (const [key, val] of Object.entries(resolved)) {
    expression = expression.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
  }

  return { expression, errors: [] };
}

module.exports = { listTemplates, buildFromTemplate };
