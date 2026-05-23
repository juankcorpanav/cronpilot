# convert

Convert cron expressions between different formats and scheduling platforms.

## Supported Formats

| Format | Fields | Example |
|---|---|---|
| Standard (Unix) | 5 | `30 9 * * MON-FRI` |
| Quartz | 6–7 | `0 30 9 * * MON-FRI [year]` |
| AWS EventBridge | 6 (wrapped) | `cron(30 9 * * ? *)` |

## API

### `detectFormat(expression)`

Returns `'standard'`, `'quartz'`, or `'unknown'` based on field count.

```js
detectFormat('0 9 * * 1');       // 'standard'
detectFormat('0 0 9 * * 1');    // 'quartz'
```

### `fromQuartz(expression)`

Converts a Quartz 6- or 7-field expression to standard 5-field.
Returns `{ expression, warnings }`. Warnings are issued when the seconds
or year field carry meaningful values that cannot be represented in standard cron.

```js
const { expression, warnings } = fromQuartz('0 30 9 * * MON-FRI');
// expression => '30 9 * * MON-FRI'
// warnings   => []
```

### `toQuartz(expression, options?)`

Converts a standard 5-field expression to Quartz format by prepending a `0` seconds field.

| Option | Type | Default | Description |
|---|---|---|---|
| `includeYear` | boolean | `false` | Append a wildcard year field |

```js
toQuartz('30 9 * * MON-FRI');                   // '0 30 9 * * MON-FRI'
toQuartz('30 9 * * MON-FRI', { includeYear: true }); // '0 30 9 * * MON-FRI *'
```

### `toAwsEventBridge(expression)`

Wraps a standard 5-field expression in AWS EventBridge `cron()` syntax,
automatically appending a wildcard year field.

```js
toAwsEventBridge('0 12 * * ?'); // 'cron(0 12 * * ? *)'
```

### `fromAwsEventBridge(awsExpression)`

Parses an AWS EventBridge `cron(...)` string back to a standard 5-field expression.
The year field is dropped.

```js
fromAwsEventBridge('cron(0 12 * * ? *)'); // '0 12 * * ?'
```

## Notes

- The `?` wildcard used in Quartz for day-of-month and day-of-week is mapped to `*` during conversion to standard format.
- Standard cron does not support seconds or year fields; data loss warnings are surfaced via the `warnings` array in `fromQuartz`.
