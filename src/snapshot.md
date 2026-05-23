# Snapshot

The `snapshot` module lets you save, retrieve, and manage named snapshots of cron expressions. Useful for bookmarking configurations during editing sessions or A/B testing schedules.

## API

### `saveSnapshot(name, expression, meta?)`
Save a cron expression under a given name with optional metadata.

```js
const { saveSnapshot } = require('./snapshot');
saveSnapshot('daily-report', '0 9 * * 1-5', { tz: 'America/New_York' });
```

### `getSnapshot(name)`
Retrieve a snapshot by name. Returns `null` if not found.

```js
const snap = getSnapshot('daily-report');
// { name, expression, meta, savedAt }
```

### `listSnapshots()`
Return all saved snapshots as an array.

```js
const all = listSnapshots();
```

### `removeSnapshot(name)`
Delete a snapshot by name. Returns `true` on success, `false` if not found.

### `clearSnapshots()`
Remove all snapshots from the store.

### `hasSnapshot(name)`
Check whether a named snapshot exists.

```js
if (hasSnapshot('daily-report')) { ... }
```

### `findByExpression(expression)`
Find all snapshots that match a given cron expression string.

```js
const matches = findByExpression('0 9 * * *');
```

## Snapshot Object Shape

```json
{
  "name": "daily-report",
  "expression": "0 9 * * 1-5",
  "meta": { "tz": "America/New_York" },
  "savedAt": "2024-01-15T10:30:00.000Z"
}
```

## Notes

- Snapshots are stored in-memory and are not persisted between process restarts.
- Saving a snapshot with an existing name overwrites the previous entry.
