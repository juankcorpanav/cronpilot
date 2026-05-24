#!/usr/bin/env node
/**
 * audit.cli.js — CLI for inspecting the cron audit log
 */

const { addAuditEvent, getAuditLog, auditSummary, auditedExpressions, clearAuditLog } = require('./audit');

function printUsage() {
  console.log(`
Usage: node audit.cli.js <command> [args]

Commands:
  add <expression> <eventType> [metaJson]   Record an audit event
  log [--expression <expr>] [--type <type>] Show audit log
  summary <expression>                       Show summary for an expression
  expressions                                List all audited expressions
  clear                                      Clear the audit log
  help                                       Show this help
`.trim());
}

function run(argv) {
  const [,, cmd, ...args] = argv;

  if (!cmd || cmd === 'help') {
    printUsage();
    return;
  }

  if (cmd === 'add') {
    const [expression, eventType, metaJson] = args;
    const meta = metaJson ? JSON.parse(metaJson) : {};
    const entry = addAuditEvent(expression, eventType, meta);
    console.log('Recorded:', JSON.stringify(entry, null, 2));
    return;
  }

  if (cmd === 'log') {
    const filters = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--expression') filters.expression = args[++i];
      if (args[i] === '--type') filters.eventType = args[++i];
      if (args[i] === '--since') filters.since = args[++i];
    }
    const entries = getAuditLog(filters);
    if (entries.length === 0) {
      console.log('No audit entries found.');
    } else {
      entries.forEach(e => console.log(`[${e.timestamp}] ${e.eventType.padEnd(12)} ${e.expression}  ${JSON.stringify(e.meta)}`))
    }
    return;
  }

  if (cmd === 'summary') {
    const [expression] = args;
    if (!expression) { console.error('expression required'); process.exitCode = 1; return; }
    console.log(JSON.stringify(auditSummary(expression), null, 2));
    return;
  }

  if (cmd === 'expressions') {
    const list = auditedExpressions();
    if (list.length === 0) console.log('No expressions audited yet.');
    else list.forEach(e => console.log(e));
    return;
  }

  if (cmd === 'clear') {
    clearAuditLog();
    console.log('Audit log cleared.');
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exitCode = 1;
}

if (require.main === module) run(process.argv);

module.exports = { printUsage, run };
