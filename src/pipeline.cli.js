#!/usr/bin/env node
/**
 * pipeline.cli.js — CLI for running a cron pipeline
 * Usage: node pipeline.cli.js <expression> [step1,step2,...]
 */

const { runPipeline, fullReport, listSteps } = require('./pipeline');

function printUsage() {
  console.log('Usage: pipeline.cli.js <expression> [steps]');
  console.log('  steps: comma-separated list (default: all)');
  console.log('  Available steps: ' + listSteps().join(', '));
}

function run(args) {
  if (!args.length || args[0] === '--help') {
    printUsage();
    return;
  }

  const expression = args[0];
  const steps = args[1] ? args[1].split(',').map(s => s.trim()) : null;

  const result = steps
    ? runPipeline(expression, steps)
    : fullReport(expression);

  console.log(`\nExpression: ${result.expression}\n`);

  if (Object.keys(result.errors).length) {
    console.log('Errors:');
    for (const [step, msg] of Object.entries(result.errors)) {
      console.log(`  [${step}] ${msg}`);
    }
  }

  console.log('Results:');
  for (const [key, value] of Object.entries(result.results)) {
    const display = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
    console.log(`  ${key}: ${display}`);
  }
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { printUsage, run };
