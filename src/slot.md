# Slot

Named time slot management for cron expressions. Save, retrieve, update, and remove named slots with optional metadata like description and timezone.

## API

### `saveSlot(name, expression, meta?)`
Save a cron expression under a descriptive name.
```js
const { saveSlot } = require('./slot');
saveSlot('daily-report', '0 7 * * 1-5', { description: 'Weekday morning report', timezone: 'America/Chicago' });
```

### `getSlot(name)`
Retrieve a slot by name. Returns `null` if not found.
```js
const slot = getSlot('daily-report');
// { name, expression, description, timezone, createdAt, updatedAt }
```

### `listSlots()`
Return all saved slots as an array.

### `updateSlot(name, updates)`
Update fields on an existing slot. Returns the updated slot or `null`.
```js
updateSlot('daily-report', { timezone: 'Europe/Berlin' });
```

### `removeSlot(name)`
Delete a slot by name. Returns `true` if removed, `false` if not found.

### `findSlotByExpression(expression)`
Find the first slot matching a given cron expression string.

### `slotExists(name)`
Check whether a slot with the given name exists.

## CLI

```bash
node src/slot.cli.js save daily-backup "0 2 * * *" "Nightly backup" UTC
node src/slot.cli.js get daily-backup
node src/slot.cli.js list
node src/slot.cli.js update daily-backup timezone America/New_York
node src/slot.cli.js remove daily-backup
```

## Slot Object Shape

| Field        | Type   | Description                        |
|-------------|--------|------------------------------------|
| `name`      | string | Unique identifier                  |
| `expression`| string | Cron expression                    |
| `description`| string | Human-readable label              |
| `timezone`  | string | IANA timezone string               |
| `createdAt` | string | ISO timestamp of creation          |
| `updatedAt` | string | ISO timestamp of last update       |
