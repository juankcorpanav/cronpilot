#!/usr/bin/env node
/**
 * watch.cli.js — CLI for managing cron expression watchers
 * Usage: node watch.cli.js <command> [args]
 */

const { watch, update, unwatch, getWatcher, listWatchers, clearWatchers } = require('./watch');

function printUsage() {
  console.log(`
cronpilot watch CLI

Commands:
  watch <name> <expression>   Register a watcher (logs changes to stdout)
  update <name> <expression>  Update expression for a watcher
  unwatch <name>              Remove a watcher
  get <name>                  Show watcher details
  list                        List all active watchers
  clear                       Remove all watchers
  help                        Show this help
`.trim());
}

function run(argv) {
  const [,, cmd, ...args] = argv;

  switch (cmd) {
    case 'watch': {
      const [name, expr] = args;
      if (!name || !expr) return console.error('Usage: watch <name> <expression>');
      const result = watch(name, expr, (n, o, id) => {
        console.log(`[${id}] changed: "${o}" → "${n}"`);
      });
      console.log(`Watching "${result.id}" with expression: ${result.expression}`);
      break;
    }
    case 'update': {
      const [name, expr] = args;
      if (!name || !expr) return console.error('Usage: update <name> <expression>');
      try {
        const changed = update(name, expr);
        console.log(changed ? `Updated "${name}" to: ${expr}` : `No change for "${name}"`);
      } catch (e) {
        console.error(e.message);
      }
      break;
    }
    case 'unwatch': {
      const [name] = args;
      if (!name) return console.error('Usage: unwatch <name>');
      const removed = unwatch(name);
      console.log(removed ? `Removed watcher "${name}"` : `Watcher "${name}" not found`);
      break;
    }
    case 'get': {
      const [name] = args;
      if (!name) return console.error('Usage: get <name>');
      const w = getWatcher(name);
      if (!w) return console.log(`No watcher found: ${name}`);
      console.log(JSON.stringify(w, null, 2));
      break;
    }
    case 'list': {
      const list = listWatchers();
      if (!list.length) return console.log('No active watchers.');
      list.forEach(w => console.log(`  ${w.id}: ${w.expression}`));
      break;
    }
    case 'clear':
      clearWatchers();
      console.log('All watchers cleared.');
      break;
    case 'help':
    default:
      printUsage();
  }
}

if (require.main === module) run(process.argv);

module.exports = { printUsage, run };
