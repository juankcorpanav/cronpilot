#!/usr/bin/env node
/**
 * throttle.cli.js — CLI for throttle analysis
 * Usage: node throttle.cli.js <expression>
 */

const { throttleReport, suggestThrottled } = require('./throttle');

const LEVEL_COLORS = {
  ok: '\x1b[32m',       // green
  warning: '\x1b[33m',  // yellow
  danger: '\x1b[31m',   // red
  critical: '\x1b[35m'  // magenta
};
const RESET = '\x1b[0m';

function printUsage() {
  console.log('Usage: node throttle.cli.js <cron-expression>');
  console.log('Example: node throttle.cli.js "*/5 * * * *"');
}

function run(args) {
  if (!args.length || args[0] === '--help') {
    printUsage();
    return;
  }

  const expression = args[0];
  let report;

  try {
    report = throttleReport(expression);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }

  const color = LEVEL_COLORS[report.level] || '';
  console.log(`Expression   : ${report.expression}`);
  console.log(`Level        : ${color}${report.level.toUpperCase()}${RESET}`);
  console.log(`Daily runs   : ~${report.dailyFrequency}`);
  console.log(`Assessment   : ${report.message}`);

  const suggestion = suggestThrottled(expression);
  if (suggestion) {
    console.log(`Suggestion   : Consider using "${suggestion}" instead`);
  }
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { printUsage, run };
