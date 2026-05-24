#!/usr/bin/env node
/**
 * group.cli.js — CLI interface for cron expression groups
 * Usage:
 *   node group.cli.js add <groupName> <expr1> [expr2 ...]
 *   node group.cli.js get <groupName>
 *   node group.cli.js list
 *   node group.cli.js remove <groupName> <expr>
 *   node group.cli.js delete <groupName>
 *   node group.cli.js find <expr>
 *   node group.cli.js merge <groupA> <groupB> <targetName>
 */

const { addToGroup, getGroup, listGroups, removeFromGroup, deleteGroup, findGroupsByExpression, mergeGroups } = require('./group');

function printUsage() {
  console.log(`Usage:
  group add <name> <expr> [expr2 ...]  Add expressions to a group
  group get <name>                     Show group contents
  group list                           List all group names
  group remove <name> <expr>           Remove an expression from a group
  group delete <name>                  Delete a group entirely
  group find <expr>                    Find groups containing an expression
  group merge <a> <b> <target>         Merge two groups into a new one
`);
}

function run(argv = process.argv.slice(2)) {
  const [cmd, ...args] = argv;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printUsage();
    return;
  }

  switch (cmd) {
    case 'add': {
      const [name, ...expressions] = args;
      if (!name || expressions.length === 0) { console.error('Usage: group add <name> <expr> [expr2 ...]'); return; }
      const g = addToGroup(name, expressions);
      console.log(`Group "${g.name}" now has ${g.expressions.length} expression(s):`);
      g.expressions.forEach(e => console.log(`  ${e}`));
      break;
    }
    case 'get': {
      const [name] = args;
      if (!name) { console.error('Usage: group get <name>'); return; }
      const g = getGroup(name);
      if (!g) { console.log(`Group "${name}" not found.`); return; }
      console.log(`Group: ${g.name} (${g.expressions.length} expression(s))`);
      g.expressions.forEach(e => console.log(`  ${e}`));
      break;
    }
    case 'list': {
      const groups = listGroups();
      if (groups.length === 0) { console.log('No groups defined.'); return; }
      console.log('Groups:');
      groups.forEach(n => console.log(`  ${n}`));
      break;
    }
    case 'remove': {
      const [name, expr] = args;
      if (!name || !expr) { console.error('Usage: group remove <name> <expr>'); return; }
      const ok = removeFromGroup(name, expr);
      console.log(ok ? `Removed "${expr}" from group "${name}".` : `Expression not found in group "${name}".`);
      break;
    }
    case 'delete': {
      const [name] = args;
      if (!name) { console.error('Usage: group delete <name>'); return; }
      const ok = deleteGroup(name);
      console.log(ok ? `Deleted group "${name}".` : `Group "${name}" not found.`);
      break;
    }
    case 'find': {
      const [expr] = args;
      if (!expr) { console.error('Usage: group find <expr>'); return; }
      const groups = findGroupsByExpression(expr);
      if (groups.length === 0) { console.log(`No groups contain "${expr}".`); return; }
      console.log(`Groups containing "${expr}":`);
      groups.forEach(n => console.log(`  ${n}`));
      break;
    }
    case 'merge': {
      const [a, b, target] = args;
      if (!a || !b || !target) { console.error('Usage: group merge <a> <b> <target>'); return; }
      const g = mergeGroups(a, b, target);
      console.log(`Merged into "${g.name}" (${g.expressions.length} expression(s)):`);
      g.expressions.forEach(e => console.log(`  ${e}`));
      break;
    }
    default:
      console.error(`Unknown command: ${cmd}`);
      printUsage();
  }
}

if (require.main === module) run();

module.exports = { printUsage, run };
