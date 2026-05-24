# audit

Track changes and usage events for cron expressions across the cronpilot session.

## API

### `addAuditEvent(expression, eventType, meta?)`

Record an event for a cron expression.

- `expression` — the cron string (e.g. `"0 * * * *"`)
- `eventType` — one of `created | updated | deleted | validated | fired | exported`
- `meta` — optional object with extra context

Returns the audit entry object `{ id, expression, eventType, timestamp, meta }`.

```js
const { addAuditEvent } = require('./audit');
addAuditEvent('0 * * * *', 'created', { source: 'ui' });
```

### `getAuditLog(filters?)`

Retrieve audit entries. Optional filters:

| Filter | Type | Description |
|--------|------|-------------|
| `expression` | string | Match exact expression |
| `eventType` | string | Match event type |
| `since` | ISO string | Entries at or after this time |
| `until` | ISO string | Entries at or before this time |

### `auditSummary(expression)`

Returns a summary object for a given expression:

```json
{
  "expression": "0 * * * *",
  "total": 3,
  "counts": { "created": 1, "validated": 2, ... },
  "first": "2024-01-01T00:00:00.000Z",
  "last": "2024-01-02T00:00:00.000Z"
}
```

### `auditedExpressions()`

Returns an array of all unique expressions that have been audited.

### `clearAuditLog()`

Clears all audit entries from memory.

## CLI

```
node audit.cli.js add "0 * * * *" created
node audit.cli.js log --expression "0 * * * *" --type validated
node audit.cli.js summary "0 * * * *"
node audit.cli.js expressions
node audit.cli.js clear
```
