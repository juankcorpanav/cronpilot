/**
 * chain.js — Fluent builder for chaining cron operations
 */

const { parseCron } = require('./parser');
const { humanize } = require('./humanizer');
const { normalize, normalizeToString } = require('./normalize');
const { lint } = require('./lint');
const { scoreCron } = require('./score');
const { getNextFireTimes } = require('./timezone');

class CronChain {
  constructor(expression) {
    this._expression = expression;
    this._timezone = 'UTC';
    this._steps = [];
  }

  timezone(tz) {
    this._timezone = tz;
    this._steps.push({ op: 'timezone', value: tz });
    return this;
  }

  normalize() {
    this._expression = normalizeToString(this._expression);
    this._steps.push({ op: 'normalize', value: this._expression });
    return this;
  }

  describe() {
    const result = humanize(this._expression);
    this._steps.push({ op: 'describe', value: result });
    return this;
  }

  lint() {
    const issues = lint(this._expression);
    this._steps.push({ op: 'lint', value: issues });
    return this;
  }

  score() {
    const result = scoreCron(this._expression);
    this._steps.push({ op: 'score', value: result });
    return this;
  }

  next(count = 3) {
    const times = getNextFireTimes(this._expression, this._timezone, count);
    this._steps.push({ op: 'next', value: times });
    return this;
  }

  validate() {
    try {
      parseCron(this._expression);
      this._steps.push({ op: 'validate', value: { valid: true } });
    } catch (e) {
      this._steps.push({ op: 'validate', value: { valid: false, error: e.message } });
    }
    return this;
  }

  result() {
    return {
      expression: this._expression,
      timezone: this._timezone,
      steps: this._steps,
    };
  }

  getStep(op) {
    return this._steps.find(s => s.op === op)?.value ?? null;
  }
}

function chain(expression) {
  return new CronChain(expression);
}

module.exports = { chain, CronChain };
