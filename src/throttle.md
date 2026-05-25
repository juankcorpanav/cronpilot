# Throttle

Detects high-frequency cron expressions and provides throttle recommendations.

## API

### `throttleLevel(expression)`

Returns the throttle severity level for a given cron expression.

**Returns:** `'ok' | 'warning' | 'danger' | 'critical'`

| Level      | Daily Frequency      | Description                          |
|------------|----------------------|--------------------------------------|
| `ok`       | < 96 runs/day        | No concerns                          |
| `warning`  | 96–287 runs/day      | Runs more than every 15 minutes      |
| `danger`   | 288–1439 runs/day    | Runs more than every 5 minutes       |
| `critical` | 1440+ runs/day       | Runs every minute or more frequently |

```js
const { throttleLevel } = require('./throttle');
throttleLevel('* * * * *');    // 'critical'
throttleLevel('*/15 * * * *'); // 'warning'
throttleLevel('0 9 * * *');    // 'ok'
```

### `throttleReport(expression)`

Returns a full report object with level, daily frequency, and a human-readable message.

```js
const { throttleReport } = require('./throttle');
const report = throttleReport('*/2 * * * *');
// {
//   expression: '*/2 * * * *',
//   level: 'danger',
//   dailyFrequency: 720,
//   message: 'Runs approximately 720 times/day. High frequency — may cause resource strain.'
// }
```

### `suggestThrottled(expression)`

Suggests a less-frequent alternative expression, or `null` if no suggestion applies.

```js
const { suggestThrottled } = require('./throttle');
suggestThrottled('* * * * *');    // '*/5 * * * *'
suggestThrottled('*/10 * * * *'); // '*/15 * * * *'
suggestThrottled('0 9 * * *');    // null
```

## CLI

```bash
node throttle.cli.js "*/5 * * * *"
# Expression   : */5 * * * *
# Level        : DANGER
# Daily runs   : ~288
# Assessment   : Runs approximately 288 times/day. High frequency — may cause resource strain.
# Suggestion   : Consider using "*/15 * * * *" instead
```
