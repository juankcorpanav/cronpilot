#!/usr/bin/env node
/**
 * alias.cli.js — CLI interface for the alias module
 * Usage:
 *   node alias.cli.js save <name> <expression> [description]
 *   node alias.cli.js get <name>
 *   node alias.cli.js resolve <name>
 *   node alias.cli.js list
 *   node alias.cli.js remove <name>
 */

const { saveAlias, getAlias, resolveAlias, listAliases, removeAlias } = require('./alias');

function printUsage() {
  console.log('Usage:');
  console.log('  node alias.cli.js save <name> <expression> [description]');
  console.log('  node alias.cli.js get <name>');
  console.log('  node alias.cli.js resolve <name>');
  console.log('  node alias.cli.js list');
  console.log('  node alias.cli.js remove <name>');
}

function run(args) {
  const [cmd, ...rest] = args;

  switch (cmd) {
    case 'save': {
      const [name, expression, ...descParts] = rest;
      const description = descParts.join(' ');
      try {
        const alias = saveAlias(name, expression, description);
        console.log(`Saved alias "${alias.name}" => ${alias.expression}`);
      } catch (e) {
        console.error(`Error: ${e.message}`);
        process.exitCode = 1;
      }
      break;
    }
    case 'get': {
      const alias = getAlias(rest[0]);
      if (alias) {
        console.log(JSON.stringify(alias, null, 2));
      } else {
        console.log(`Alias "${rest[0]}" not found.`);
      }
      break;
    }
    case 'resolve': {
      const expr = resolveAlias(rest[0]);
      if (expr) {
        console.log(expr);
      } else {
        console.log(`Alias "${rest[0]}" not found.`);
      }
      break;
    }
    case 'list': {
      const aliases = listAliases();
      if (aliases.length === 0) {
        console.log('No aliases saved.');
      } else {
        aliases.forEach(a => console.log(`${a.name.padEnd(20)} ${a.expression}  ${a.description || ''}`));
      }
      break;
    }
    case 'remove': {
      const removed = removeAlias(rest[0]);
      console.log(removed ? `Removed alias "${rest[0]}".` : `Alias "${rest[0]}" not found.`);
      break;
    }
    default:
      printUsage();
  }
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { printUsage, run };
