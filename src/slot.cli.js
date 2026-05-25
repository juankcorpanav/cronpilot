#!/usr/bin/env node
/**
 * slot.cli.js — CLI interface for named time slot management
 */

const { saveSlot, getSlot, listSlots, removeSlot, updateSlot } = require('./slot');

function printUsage() {
  console.log(`
Usage: slot <command> [args]

Commands:
  save <name> <expression> [description] [timezone]   Save a named slot
  get <name>                                           Get a slot by name
  list                                                 List all slots
  remove <name>                                        Remove a slot
  update <name> <field> <value>                        Update a slot field
`.trim());
}

function run(argv = process.argv.slice(2)) {
  const [cmd, ...args] = argv;
  if (!cmd || cmd === '--help') return printUsage();

  if (cmd === 'save') {
    const [name, expression, description = '', timezone = 'UTC'] = args;
    if (!name || !expression) return console.error('Error: name and expression are required');
    const slot = saveSlot(name, expression, { description, timezone });
    console.log(`Saved slot "${slot.name}": ${slot.expression} (${slot.timezone})`);
    return slot;
  }

  if (cmd === 'get') {
    const [name] = args;
    const slot = getSlot(name);
    if (!slot) return console.log(`No slot found: ${name}`);
    console.log(JSON.stringify(slot, null, 2));
    return slot;
  }

  if (cmd === 'list') {
    const slots = listSlots();
    if (!slots.length) return console.log('No slots saved.');
    slots.forEach(s => console.log(`  ${s.name.padEnd(20)} ${s.expression.padEnd(15)} ${s.timezone}`));
    return slots;
  }

  if (cmd === 'remove') {
    const [name] = args;
    const ok = removeSlot(name);
    console.log(ok ? `Removed slot: ${name}` : `Slot not found: ${name}`);
    return ok;
  }

  if (cmd === 'update') {
    const [name, field, value] = args;
    if (!name || !field || value === undefined) return console.error('Error: name, field, and value are required');
    const updated = updateSlot(name, { [field]: value });
    if (!updated) return console.log(`Slot not found: ${name}`);
    console.log(`Updated slot "${name}": ${field} = ${value}`);
    return updated;
  }

  console.error(`Unknown command: ${cmd}`);
  printUsage();
}

if (require.main === module) run();

module.exports = { printUsage, run };
