/**
 * pipeline.js — Chain multiple cron operations into a single workflow
 */

const { parseCron } = require('./parser');
const { humanize } = require('./humanizer');
const { normalize } = require('./normalize');
const { lint } = require('./lint');
const { scoreCron } = require('./score');
const { classify } = require('./classify');

/**
 * Built-in pipeline steps
 */
const STEPS = {
  parse:     (expr) => ({ parsed: parseCron(expr) }),
  humanize:  (expr) => ({ human: humanize(expr) }),
  normalize: (expr) => ({ normalized: normalize(expr) }),
  lint:      (expr) => ({ lint: lint(expr) }),
  score:     (expr) => ({ score: scoreCron(expr) }),
  classify:  (expr) => ({ classification: classify(expr) }),
};

/**
 * Run a pipeline of named steps against a cron expression.
 * @param {string} expression
 * @param {string[]} steps - step names to run
 * @returns {{ expression: string, results: object, errors: object }}
 */
function runPipeline(expression, steps = Object.keys(STEPS)) {
  const results = {};
  const errors = {};

  for (const step of steps) {
    if (!STEPS[step]) {
      errors[step] = `Unknown step: ${step}`;
      continue;
    }
    try {
      Object.assign(results, STEPS[step](expression));
    } catch (err) {
      errors[step] = err.message;
    }
  }

  return { expression, results, errors };
}

/**
 * Run the full default pipeline and return a combined report.
 * @param {string} expression
 * @returns {object}
 */
function fullReport(expression) {
  return runPipeline(expression, Object.keys(STEPS));
}

/**
 * List available pipeline step names.
 * @returns {string[]}
 */
function listSteps() {
  return Object.keys(STEPS);
}

module.exports = { runPipeline, fullReport, listSteps };
