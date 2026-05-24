#!/usr/bin/env node
/**
 * chain.cli.js — CLI for running a chain of cron operations
 * Usage: node chain.cli.js <expression> [--tz <timezone>] [--steps validate,describe,score,lint,next]
 */

const { chain } = require('./chain');

function printUsage() {
  console.log('Usage: node chain.cli.js <expression> [options]');
  console.log('Options:');
  console.log('  --tz <timezone>         Timezone (default: UTC)');
  console.log('  --steps <list>          Comma-separated steps: validate,describe,normalize,lint,score,next');
  console.log('  --next-count <n>        Number of next fire times (default: 3)');
  console.log('Example:');
  console.log('  node chain.cli.js "0 9 * * 1" --tz America/New_York --steps validate,describe,next');
}

function run(argv) {
  if (!argv[0] || argv[0] === '--help') {
    printUsage();
    return;
  }

  const expression = argv[0];
  const tzIdx = argv.indexOf('--tz');
  const tz = tzIdx !== -1 ? argv[tzIdx + 1] : 'UTC';
  const stepsIdx = argv.indexOf('--steps');
  const stepsRaw = stepsIdx !== -1 ? argv[stepsIdx + 1] : 'validate,describe,score';
  const steps = stepsRaw.split(',').map(s => s.trim());
  const nextCountIdx = argv.indexOf('--next-count');
  const nextCount = nextCountIdx !== -1 ? parseInt(argv[nextCountIdx + 1], 10) : 3;

  let c = chain(expression).timezone(tz);

  for (const step of steps) {
    switch (step) {
      case 'validate':  c = c.validate(); break;
      case 'describe':  c = c.describe(); break;
      case 'normalize': c = c.normalize(); break;
      case 'lint':      c = c.lint(); break;
      case 'score':     c = c.score(); break;
      case 'next':      c = c.next(nextCount); break;
      default:
        console.warn(`Unknown step: ${step}`);
    }
  }

  const result = c.result();
  console.log(`Expression : ${result.expression}`);
  console.log(`Timezone   : ${result.timezone}`);
  console.log('--- Steps ---');
  for (const s of result.steps) {
    if (s.op === 'timezone') continue;
    const val = Array.isArray(s.value) ? s.value.join(', ') : JSON.stringify(s.value);
    console.log(`[${s.op}] ${val}`);
  }
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { printUsage, run };
