#!/usr/bin/env node
/**
 * snapshot.cli.js — CLI interface for snapshot management
 * Usage: node snapshot.cli.js <command> [args]
 */

const {
  saveSnapshot,
  getSnapshot,
  listSnapshots,
  removeSnapshot,
  hasSnapshot
} = require('./snapshot');

const [,, command, ...args] = process.argv;

function printUsage() {
  console.log('Usage:');
  console.log('  snapshot save <name> <expression> [metaJson]');
  console.log('  snapshot get <name>');
  console.log('  snapshot list');
  console.log('  snapshot remove <name>');
  console.log('  snapshot has <name>');
}

function run() {
  switch (command) {
    case 'save': {
      const [name, expression, metaStr] = args;
      if (!name || !expression) { console.error('Missing name or expression'); process.exit(1); }
      const meta = metaStr ? JSON.parse(metaStr) : {};
      const snap = saveSnapshot(name, expression, meta);
      console.log(JSON.stringify(snap, null, 2));
      break;
    }
    case 'get': {
      const [name] = args;
      const snap = getSnapshot(name);
      if (!snap) { console.error(`No snapshot found: ${name}`); process.exit(1); }
      console.log(JSON.stringify(snap, null, 2));
      break;
    }
    case 'list': {
      const snaps = listSnapshots();
      if (snaps.length === 0) { console.log('No snapshots saved.'); break; }
      snaps.forEach(s => console.log(`${s.name}: ${s.expression} (saved ${s.savedAt})`));
      break;
    }
    case 'remove': {
      const [name] = args;
      const ok = removeSnapshot(name);
      console.log(ok ? `Removed: ${name}` : `Not found: ${name}`);
      break;
    }
    case 'has': {
      const [name] = args;
      console.log(hasSnapshot(name) ? `exists: ${name}` : `not found: ${name}`);
      break;
    }
    default:
      printUsage();
  }
}

run();
